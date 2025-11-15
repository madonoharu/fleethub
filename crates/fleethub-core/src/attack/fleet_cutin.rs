use arrayvec::ArrayVec;

use crate::{
    fleet::Fleet,
    ship::Ship,
    types::{
        DamageState, Engagement, FleetCutin, Formation, GearAttr, GearType, ShipAttr, Time, ctype,
        gear_id, matches_gear_id, matches_ship_id, ship_id,
    },
};

#[derive(Debug, PartialEq)]
pub struct FleetCutinAttackParams {
    pub index: usize,
    pub power_mod: f64,
    pub accuracy_mod: f64,
}

impl FleetCutinAttackParams {
    pub fn new(index: usize, power_mod: f64, accuracy_mod: f64) -> Self {
        Self {
            index,
            power_mod,
            accuracy_mod,
        }
    }
}

#[derive(Debug, PartialEq)]
pub struct FleetCutinEffect {
    pub cutin: FleetCutin,
    pub attacks: ArrayVec<FleetCutinAttackParams, 3>,
}

pub fn get_possible_fleet_cutin_effect_vec(
    fleet: &Fleet,
    formation: Formation,
    engagement: Engagement,
    time: Time,
) -> Vec<FleetCutinEffect> {
    [
        get_nelson_touch_mod(fleet, formation, engagement),
        get_nagato_class_cutin(fleet, formation),
        get_colorado_class_cutin(fleet, formation),
        get_yamato_2ship_cutin(fleet, formation),
        get_yamato_3ship_cutin(fleet, formation),
        get_Queen_Elizabeth_class_cutin(fleet, formation),
        get_Richelieu_class_cutin(fleet, formation),
        time.is_night()
            .then(|| get_kongou_class_cutin(fleet, formation, engagement))
            .flatten(),
    ]
    .into_iter()
    .flatten()
    .collect()
}

fn get_nelson_touch_mod(
    fleet: &Fleet,
    formation: Formation,
    engagement: Engagement,
) -> Option<FleetCutinEffect> {
    if !matches!(formation, Formation::DOUBLE_LINE | Formation::CRUISING2) {
        return None;
    }

    let s1 = fleet.ships.get(0)?;
    let s3 = fleet.ships.get(2)?;
    let s5 = fleet.ships.get(4)?;

    if !(s1.ctype == ctype!("Nelson級") && s1.damage_state() <= DamageState::Shouha) {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 6
    {
        return None;
    }

    if s3.ship_type.is_submarine()
        || s3.ship_type.is_aircraft_carrier()
        || s5.ship_type.is_submarine()
        || s5.ship_type.is_aircraft_carrier()
    {
        return None;
    }

    let base = 2.0;

    let engagement_mod = if engagement == Engagement::RedT {
        1.25
    } else {
        1.0
    };

    let v = base * engagement_mod;

    let (s1_mod, s3_mod, s5_mod) = if s3.ctype == ctype!("Nelson級") {
        (1.15, 1.2, 1.0)
    } else if s5.ctype == ctype!("Nelson級") {
        (1.15, 1.0, 1.2)
    } else {
        (1.0, 1.0, 1.0)
    };

    Some(FleetCutinEffect {
        cutin: FleetCutin::NelsonTouch,
        attacks: [
            FleetCutinAttackParams::new(0, v * s1_mod, 1.05),
            FleetCutinAttackParams::new(2, v * s3_mod, 1.05),
            FleetCutinAttackParams::new(4, v * s5_mod, 1.05),
        ]
        .into(),
    })
}

fn get_nagato_class_cutin(fleet: &Fleet, formation: Formation) -> Option<FleetCutinEffect> {
    if !matches!(formation, Formation::ECHELON | Formation::CRUISING2) {
        return None;
    }

    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    if !(s1.ctype == ctype!("長門型")
        && s1.has_attr(ShipAttr::Kai2)
        && s1.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 6
    {
        return None;
    }

    if !(s2.ship_type.is_battleship() && s2.damage_state() <= DamageState::Chuuha) {
        return None;
    }

    let base = (1.4, 1.2);

    let partner_mod = match s2.ctype {
        ctype!("長門型") => {
            if s2.has_attr(ShipAttr::Kai2) {
                (1.2, 1.4)
            } else {
                (1.15, 1.32)
            }
        }
        ctype!("Nelson級") => {
            if s1.ship_id == ship_id!("長門改二") {
                (1.1, 1.25)
            } else {
                (1.0, 1.0)
            }
        }
        _ => (1.0, 1.0),
    };

    fn get_equipment_mod(ship: &Ship) -> f64 {
        let mut v = 1.0;
        if ship.gears.has_type(GearType::ApShell) {
            v *= 1.35
        }
        if ship.gears.has_attr(GearAttr::SurfaceRadar) {
            v *= 1.15
        }
        v
    }

    let s1_equipment_mod = get_equipment_mod(s1);
    let s2_equipment_mod = get_equipment_mod(s2);

    let s1_mod = base.0 * partner_mod.0 * s1_equipment_mod;
    let s2_mod = base.1 * partner_mod.1 * s2_equipment_mod;

    Some(FleetCutinEffect {
        cutin: FleetCutin::NagatoClassCutin,
        attacks: [
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(1, s2_mod, 1.0),
        ]
        .into(),
    })
}

fn get_colorado_class_cutin(fleet: &Fleet, formation: Formation) -> Option<FleetCutinEffect> {
    if !matches!(formation, Formation::ECHELON | Formation::CRUISING2) {
        return None;
    }

    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;
    let s3 = fleet.ships.get(2)?;

    if !(s1.ctype == ctype!("Colorado級") && s1.damage_state() <= DamageState::Shouha) {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 6
    {
        return None;
    }

    if !(s2.damage_state() <= DamageState::Chuuha
        && s2.ship_type.is_battleship()
        && s3.damage_state() <= DamageState::Chuuha
        && s3.ship_type.is_battleship())
    {
        return None;
    }

    let base = (1.5, 1.3, 1.3);

    fn is_big7(ship: &Ship) -> bool {
        // なぜか未改造はビッグセブン補正が適応されない
        matches!(
            ship.ctype,
            ctype!("長門型") | ctype!("Nelson級") | ctype!("Colorado級")
        ) && ship.remodel_rank() >= 2
    }

    let big7_mod = (
        1.0,
        if is_big7(s2) { 1.15 } else { 1.0 },
        if is_big7(s3) { 1.17 } else { 1.0 },
    );

    fn get_equipment_mod(ship: &Ship) -> f64 {
        let mut v = 1.0;
        if ship.gears.has_type(GearType::ApShell) {
            v *= 1.35
        }
        if ship.gears.has_attr(GearAttr::SurfaceRadar) {
            v *= 1.15
        }
        if ship.gears.has(gear_id!("SG レーダー(後期型)")) {
            v *= 1.15;
        }
        v
    }

    let equipment_mod = (
        get_equipment_mod(s1),
        get_equipment_mod(s2),
        get_equipment_mod(s3),
    );

    let s1_mod = base.0 * big7_mod.0 * equipment_mod.0;
    let s2_mod = base.1 * big7_mod.1 * equipment_mod.1;
    let s3_mod = base.2 * big7_mod.2 * equipment_mod.2;

    Some(FleetCutinEffect {
        cutin: FleetCutin::ColoradoClassCutin,
        attacks: [
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(1, s2_mod, 1.0),
            FleetCutinAttackParams::new(2, s3_mod, 1.0),
        ]
        .into(),
    })
}

fn get_kongou_class_cutin(
    fleet: &Fleet,
    formation: Formation,
    engagement: Engagement,
) -> Option<FleetCutinEffect> {
    if !matches!(
        formation,
        Formation::LINE_AHEAD | Formation::ECHELON | Formation::CRUISING2 | Formation::CRUISING4
    ) {
        return None;
    }

    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    let is_kongou_fleet = match s1.ship_id {
        ship_id!("金剛改二丙") => {
            matches_ship_id!(
                s2.ship_id,
                "比叡改二丙" | "榛名改二" | "榛名改二乙" | "榛名改二丙" | "霧島改二丙"
            ) || s2.ctype == ctype!("Queen Elizabeth級")
        }
        ship_id!("比叡改二丙") => {
            matches_ship_id!(
                s2.ship_id,
                "金剛改二丙" | "榛名改二乙" | "榛名改二丙" | "霧島改二" | "霧島改二丙"
            )
        }
        ship_id!("榛名改二乙") | ship_id!("榛名改二丙") => {
            matches_ship_id!(s2.ship_id, "金剛改二丙" | "比叡改二丙" | "霧島改二丙")
        }
        ship_id!("霧島改二丙") => {
            matches_ship_id!(
                s2.ship_id,
                "金剛改二丙" | "比叡改二丙" | "榛名改二乙" | "榛名改二丙" | "South Dakota改"
            )
        }
        _ => false,
    };

    if !is_kongou_fleet {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 5
    {
        return None;
    }

    if !(s1.damage_state() <= DamageState::Shouha && s2.damage_state() <= DamageState::Shouha) {
        return None;
    }

    // 23/5/1に上方修正
    let base = 2.4;

    let engagement_mod = match engagement {
        Engagement::GreenT => 1.25,
        Engagement::RedT => 0.75,
        _ => 1.0,
    };

    let v = base * engagement_mod;

    Some(FleetCutinEffect {
        cutin: FleetCutin::KongouClassCutin,
        attacks: [
            FleetCutinAttackParams::new(0, v, 1.4),
            FleetCutinAttackParams::new(1, v, 1.4),
        ]
        .into_iter()
        .collect(),
    })
}

fn get_yamato_2ship_cutin(fleet: &Fleet, formation: Formation) -> Option<FleetCutinEffect> {
    if !matches!(formation, Formation::ECHELON | Formation::CRUISING4) {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 6
    {
        return None;
    }

    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    if !(s1.damage_state() <= DamageState::Shouha && s2.damage_state() <= DamageState::Shouha) {
        return None;
    }

    let includes_yamato_kai2 = is_yamato_kai2(s1) || is_yamato_kai2(s2);

    if !includes_yamato_kai2 {
        return None;
    }

    let s1_is_musashi_kai2 = is_musashi_kai2(s1);
    let includes_musashi_kai2 = s1_is_musashi_kai2 || is_musashi_kai2(s2);

    if !includes_musashi_kai2
        && !matches_ship_id!(s2.ship_id, "Bismarck drei" | "Iowa改" | "Richelieu改")
    {
        return None;
    }

    let mut base = (1.4, 1.55);

    if includes_musashi_kai2 {
        base.0 *= 1.1;

        let s2_is_yamato_kai2_juu = s2.ship_id == ship_id!("大和改二重");
        base.1 *= if s2_is_yamato_kai2_juu { 1.25 } else { 1.2 };
    }

    fn get_equipment_mod(ship: &Ship) -> f64 {
        let mut v = 1.0;
        if ship.gears.has_type(GearType::ApShell) {
            v *= 1.35;
        }
        if ship.gears.has_attr(GearAttr::SurfaceRadar) {
            v *= 1.15;
        }
        if ship.gears.has_by(|gear| {
            matches_gear_id!(
                gear.gear_id,
                "15m二重測距儀+21号電探改二" | "15m二重測距儀改+21号電探改二+熟練射撃指揮所"
            )
        }) {
            v *= 1.1;
        }

        v
    }

    let s1_equipment_mod = get_equipment_mod(s1);
    let s2_equipment_mod = get_equipment_mod(s2);
    let s1_mod = base.0 * s1_equipment_mod;
    let s2_mod = base.1 * s2_equipment_mod;

    Some(FleetCutinEffect {
        cutin: FleetCutin::Yamato2ShipCutin,
        attacks: [
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(1, s2_mod, 1.0),
        ]
        .into(),
    })
}

fn get_yamato_3ship_cutin(fleet: &Fleet, formation: Formation) -> Option<FleetCutinEffect> {
    if !matches!(formation, Formation::ECHELON | Formation::CRUISING4) {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 6
    {
        return None;
    }

    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;
    let s3 = fleet.ships.get(2)?;

    if !is_yamato_kai2(s1) {
        return None;
    }

    if !(s1.damage_state() <= DamageState::Shouha
        && s2.damage_state() <= DamageState::Shouha
        && s3.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    let pair = [s2.ship_id, s3.ship_id];

    const HELPER_PAIRS: [(u16, u16); 15] = [
        (ship_id!("長門改二"), ship_id!("陸奥改二")),
        (ship_id!("伊勢改二"), ship_id!("日向改二")),
        (ship_id!("扶桑改二"), ship_id!("山城改二")),
        (ship_id!("金剛改二丙"), ship_id!("比叡改二丙")),
        (ship_id!("金剛改二丙"), ship_id!("榛名改二乙")),
        (ship_id!("金剛改二丙"), ship_id!("榛名改二丙")),
        (ship_id!("金剛改二丙"), ship_id!("霧島改二丙")),
        (ship_id!("Warspite改"), ship_id!("Nelson改")),
        (ship_id!("Italia"), ship_id!("Roma改")),
        (ship_id!("Washington改"), ship_id!("South Dakota改")),
        (ship_id!("Colorado改"), ship_id!("Maryland改")),
        (ship_id!("Warspite改"), ship_id!("Valiant改")),
        (ship_id!("Nelson改"), ship_id!("Rodney改")),
        (ship_id!("Richelieu Deux"), ship_id!("Jean Bart改")),
        (ship_id!("Richelieu改"), ship_id!("Jean Bart改")),
    ];

    if !(HELPER_PAIRS
        .iter()
        .any(|(p1, p2)| pair.contains(p1) && pair.contains(p2))
        || pair[0] == ship_id!("武蔵改二") && matches_ship_id!(pair[1], "長門改二" | "陸奥改二"))
    {
        return None;
    }

    if !(HELPER_PAIRS
        .iter()
        .any(|(p1, p2)| pair.contains(p1) && pair.contains(p2))
        || pair[0] == ship_id!("武蔵改二") && matches_ship_id!(pair[1], "長門改二" | "陸奥改二"))
    {
        return None;
    }

    let base = if is_musashi_kai2(s2) {
        (1.65, 1.8, 1.65)
    } else if matches_ship_id!(s2.ship_id, "長門改二" | "陸奥改二") {
        (1.65, 1.65, 1.65)
    } else if matches_ship_id!(s2.ship_id, "伊勢改二" | "日向改二") {
        (1.65, 1.575, 1.65)
    } else {
        (1.5, 1.5, 1.65)
    };

    fn get_equipment_mod(ship: &Ship, shots: usize) -> f64 {
        let mut v = 1.0;

        if ship.gears.has_type(GearType::ApShell) {
            v *= 1.35;
        }
        if ship.gears.has_attr(GearAttr::SurfaceRadar) {
            v *= 1.15;
        }
        if shots <= 2
            && ship.gears.has_by(|gear| {
                matches_gear_id!(
                    gear.gear_id,
                    "15m二重測距儀+21号電探改二" | "15m二重測距儀改+21号電探改二+熟練射撃指揮所"
                )
            })
        {
            v *= 1.1;
        }

        v
    }

    let s1_mod = base.0 * get_equipment_mod(s1, 1);
    let s2_mod = base.1 * get_equipment_mod(s2, 2);
    let s3_mod = base.2 * get_equipment_mod(s3, 3);

    Some(FleetCutinEffect {
        cutin: FleetCutin::Yamato3ShipCutin,
        attacks: [
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(1, s2_mod, 1.0),
            FleetCutinAttackParams::new(2, s3_mod, 1.0),
        ]
        .into(),
    })
}

fn get_Queen_Elizabeth_class_cutin(
    fleet: &Fleet,
    formation: Formation,
) -> Option<FleetCutinEffect> {
    if !matches!(formation, Formation::ECHELON | Formation::CRUISING2) {
        return None;
    }

    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    if !(matches_ship_id!(s1.ship_id, "Warspite改" | "Valiant改")
        && s1.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 6
    {
        return None;
    }

    if !(matches_ship_id!(s2.ship_id, "Warspite改" | "Valiant改")
        && s2.damage_state() <= DamageState::Chuuha)
    {
        return None;
    }

    let base = (1.0, 1.0);

    let partner_mod = if s2.ship_id == ship_id!("Warspite改") {
        (1.2, 1.24)
    } else {
        (1.24, 1.24)
    };

    fn get_equipment_mod(ship: &Ship) -> f64 {
        let mut v = 1.0;
        if ship.gears.has_type(GearType::ApShell) {
            v *= 1.35
        }
        if ship.gears.has_attr(GearAttr::SurfaceRadar) {
            v *= 1.15
        }
        v
    }

    let s1_equipment_mod = get_equipment_mod(s1);
    let s2_equipment_mod = get_equipment_mod(s2);

    let s1_mod = base.0 * partner_mod.0 * s1_equipment_mod;
    let s2_mod = base.1 * partner_mod.1 * s2_equipment_mod;

    Some(FleetCutinEffect {
        cutin: FleetCutin::QueenElizabethClassCutin,
        attacks: [
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(1, s2_mod, 1.0),
        ]
        .into(),
    })
}

fn get_Richelieu_class_cutin(fleet: &Fleet, formation: Formation) -> Option<FleetCutinEffect> {
    if !matches!(formation, Formation::DOUBLE_LINE | Formation::CRUISING2) {
        return None;
    }

    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    if !(matches_ship_id!(s1.ship_id, "Richelieu改" | "Richelieu Deux" | "Jean Bart改")
        && s1.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 6
    {
        return None;
    }

    if !(matches_ship_id!(s2.ship_id, "Richelieu改" | "Richelieu Deux" | "Jean Bart改")
        && s2.damage_state() <= DamageState::Chuuha)
    {
        return None;
    }

    let base = (1.0, 1.0);

    let partner_mod = if s2.ship_id == ship_id!("Jean Bart改") {
        (1.3, 1.24)
    } else {
        (1.24, 1.24)
    };

    fn get_equipment_mod(ship: &Ship) -> f64 {
        let mut v = 1.0;
        if ship.gears.has_type(GearType::ApShell) {
            v *= 1.35
        }
        if ship.gears.has_attr(GearAttr::SurfaceRadar) {
            v *= 1.15
        }
        v
    }

    let s1_equipment_mod = get_equipment_mod(s1);
    let s2_equipment_mod = get_equipment_mod(s2);

    let s1_mod = base.0 * partner_mod.0 * s1_equipment_mod;
    let s2_mod = base.1 * partner_mod.1 * s2_equipment_mod;

    Some(FleetCutinEffect {
        cutin: FleetCutin::RichelieuClassCutin,
        attacks: [
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(0, s1_mod, 1.0),
            FleetCutinAttackParams::new(1, s2_mod, 1.0),
        ]
        .into(),
    })
}

fn is_yamato_kai2(ship: &Ship) -> bool {
    matches_ship_id!(ship.ship_id, "大和改二" | "大和改二重")
}

fn is_musashi_kai2(ship: &Ship) -> bool {
    ship.ship_id == ship_id!("武蔵改二")
}

/// Int(1.1√ﾈﾙｿﾝLv+√3番艦Lv+√5番艦Lv+1.4√ﾈﾙｿﾝ運+25)
/// https://x.com/Divinity_123/status/1820114418904002935
fn calc_nelson_touch_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s3 = fleet.ships.get(2)?;
    let s5 = fleet.ships.get(4)?;

    let s1_level = s1.level as f64;
    let s3_level = s3.level as f64;
    let s5_level = s5.level as f64;
    let s1_luck = s1.luck()? as f64;

    let result =
        1.1 * s1_level.sqrt() + s3_level.sqrt() + s5_level.sqrt() + 1.4 * s1_luck.sqrt() + 25.0;

    Some((result.floor() / 100.0).min(1.0))
}

/// (√一番艦Lv +√二番艦Lv) + 1.5*(√一番艦運 +√二番艦運)+25
/// https://x.com/Divinity_123/status/1820114420569162214
fn calc_nagato_cutin_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    let s1_level = s1.level as f64;
    let s2_level = s2.level as f64;
    let s1_luck = s1.luck()? as f64;
    let s2_luck = s2.luck()? as f64;

    let result = s1_level.sqrt() + s2_level.sqrt() + 1.5 * (s1_luck.sqrt() + s2_luck.sqrt()) + 25.0;
    Some((result / 100.0).min(1.0))
}

/// √一番艦Lv +√二番艦Lv+ 1.25√一番艦運 +1.25√二番艦運+33+水上電探装備艦数補正10+大和旗艦補正3+大和or武蔵2番艦補正4
/// https://x.com/Divinity_123/status/1820114422343376976
fn calc_yamato2_ship_cutin_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    let s1_level = s1.level as f64;
    let s2_level = s2.level as f64;
    let s1_luck = s1.luck()? as f64;
    let s2_luck = s2.luck()? as f64;

    let yamato_flagship_mod = if is_yamato_kai2(s1) { 3.0 } else { 0.0 };

    let yamato_class_mod = if s2.ctype == ctype!("大和型") {
        4.0
    } else {
        0.0
    };

    let mut surface_radar_ships_mod = 0.0;
    if s1.gears.has_attr(GearAttr::SurfaceRadar) {
        surface_radar_ships_mod += 10.0
    }
    if s2.gears.has_attr(GearAttr::SurfaceRadar) {
        surface_radar_ships_mod += 10.0
    }

    let result = s1_level.sqrt()
        + s2_level.sqrt()
        + 1.25 * s1_luck.sqrt()
        + 1.25 * s2_luck.sqrt()
        + 33.0
        + yamato_flagship_mod
        + yamato_class_mod
        + surface_radar_ships_mod;

    Some((result / 100.0).min(1.0))
}

fn calc_kongou_class_cutin_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    let s1_level = s1.level as f64;
    let s2_level = s2.level as f64;
    let s1_luck = s1.luck()? as f64;
    let s2_luck = s2.luck()? as f64;

    let equipment_mod = {
        let has_radar = s1
            .gears
            .has_by(|g| g.has_attr(GearAttr::Radar) && g.los >= 8);
        let has_large_searchlight = s1.gears.has_type(GearType::LargeSearchlight);

        match s1.ship_id {
            ship_id!("金剛改二丙") => {
                (if has_radar { 30.0 } else { 0.0 })
                    + if has_large_searchlight { 10.0 } else { 0.0 }
            }
            ship_id!("比叡改二丙") => {
                (if has_large_searchlight { 30.0 } else { 0.0 })
                    + if has_radar { 10.0 } else { 0.0 }
            }
            ship_id!("榛名改二乙") => {
                if has_radar {
                    20.0
                } else {
                    0.0
                }
            }
            ship_id!("榛名改二丙") => {
                if has_radar {
                    15.0
                } else {
                    0.0
                }
            }
            ship_id!("霧島改二丙") => {
                (if has_large_searchlight { 20.0 } else { 0.0 })
                    + if has_radar { 20.0 } else { 0.0 }
            }
            _ => 0.0,
        }
    };

    let percent = (3.5 * s1_level.sqrt()
        + 3.5 * s2_level.sqrt()
        + 1.1 * s1_luck.sqrt()
        + 1.1 * s2_luck.sqrt()
        + equipment_mod
        - 33.0)
        .floor();

    Some((percent / 100.0).min(1.0))
}

/// (√一番艦Lv +√二番艦Lv) + 1.2*(√一番艦運 +√二番艦運)+30
fn calc_queen_elizabeth_class_cutin_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    let s1_level = s1.level as f64;
    let s2_level = s2.level as f64;
    let s1_luck = s1.luck()? as f64;
    let s2_luck = s2.luck()? as f64;

    let result = s1_level.sqrt() + s2_level.sqrt() + 1.2 * (s1_luck.sqrt() + s2_luck.sqrt()) + 30.0;
    Some((result / 100.0).min(1.0))
}

/// (√一番艦Lv +√二番艦Lv) + 1.2*(√一番艦運 +√二番艦運)+Deux装備艦数補正5+30
fn calc_Richelieu_class_cutin_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    let s1_level = s1.level as f64;
    let s2_level = s2.level as f64;
    let s1_luck = s1.luck()? as f64;
    let s2_luck = s2.luck()? as f64;

    let mut deux_ships_mod = 0.0;
    if s1.gears.has(gear_id!("38cm四連装砲改 deux")) {
        deux_ships_mod += 5.0
    }
    if s2.gears.has(gear_id!("38cm四連装砲改 deux")) {
        deux_ships_mod += 5.0
    }

    let result = s1_level.sqrt()
        + s2_level.sqrt()
        + 1.2 * (s1_luck.sqrt() + s2_luck.sqrt())
        + deux_ships_mod
        + 30.0;
    Some((result / 100.0).min(1.0))
}

pub fn calc_fleet_cutin_rate(fleet: &Fleet, cutin: FleetCutin) -> Option<f64> {
    match cutin {
        FleetCutin::NelsonTouch => calc_nelson_touch_rate(fleet),
        FleetCutin::NagatoClassCutin => calc_nagato_cutin_rate(fleet),
        FleetCutin::Yamato2ShipCutin => calc_yamato2_ship_cutin_rate(fleet),
        FleetCutin::KongouClassCutin => calc_kongou_class_cutin_rate(fleet),
        FleetCutin::QueenElizabethClassCutin => calc_queen_elizabeth_class_cutin_rate(fleet),
        FleetCutin::RichelieuClassCutin => calc_Richelieu_class_cutin_rate(fleet),
        _ => None,
    }
}
