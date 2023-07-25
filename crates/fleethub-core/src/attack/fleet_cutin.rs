use arrayvec::ArrayVec;

use crate::{
    fleet::Fleet,
    ship::Ship,
    types::{
        ctype, gear_id, matches_gear_id, matches_ship_id, ship_id, DamageState, Engagement,
        FleetCutin, Formation, GearAttr, GearType, ShipAttr, Time,
    },
};

#[derive(Debug, PartialEq)]
pub struct FleetCutinEffect {
    pub cutin: FleetCutin,
    pub attacks: ArrayVec<(usize, f64), 3>,
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

    Some(FleetCutinEffect {
        cutin: FleetCutin::NelsonTouch,
        attacks: [(0, v), (2, v), (4, v)].into(),
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
        attacks: [(0, s1_mod), (0, s1_mod), (1, s2_mod)].into(),
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
        matches!(ship.ctype, ctype!("長門型") | ctype!("Nelson級")) && ship.remodel_rank() >= 2
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
        attacks: [(0, s1_mod), (1, s2_mod), (2, s3_mod)].into(),
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
            matches_ship_id!(s2.ship_id, "比叡改二丙" | "榛名改二")
                || s2.ctype == ctype!("Queen Elizabeth級")
        }
        ship_id!("比叡改二丙") => {
            matches_ship_id!(s2.ship_id, "金剛改二丙" | "霧島改二")
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

    // 2022/6/8に上方修正
    let base = 2.2;

    let engagement_mod = match engagement {
        Engagement::GreenT => 1.25,
        Engagement::RedT => 0.75,
        _ => 1.0,
    };

    let v = base * engagement_mod;

    Some(FleetCutinEffect {
        cutin: FleetCutin::KongouClassCutin,
        attacks: [(0, v), (1, v)].into_iter().collect(),
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
        attacks: [(0, s1_mod), (0, s1_mod), (1, s2_mod)].into(),
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

    const HELPER_PAIRS: [(u16, u16); 8] = [
        (ship_id!("長門改二"), ship_id!("陸奥改二")),
        (ship_id!("伊勢改二"), ship_id!("日向改二")),
        (ship_id!("扶桑改二"), ship_id!("山城改二")),
        (ship_id!("金剛改二丙"), ship_id!("比叡改二丙")),
        (ship_id!("Warspite改"), ship_id!("Nelson改")),
        (ship_id!("Italia"), ship_id!("Roma改")),
        (ship_id!("Washington改"), ship_id!("South Dakota改")),
        (ship_id!("Colorado改"), ship_id!("Maryland改")),
    ];

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
        attacks: [(0, s1_mod), (1, s2_mod), (2, s3_mod)].into(),
    })
}

fn is_yamato_kai2(ship: &Ship) -> bool {
    matches_ship_id!(ship.ship_id, "大和改二" | "大和改二重")
}

fn is_musashi_kai2(ship: &Ship) -> bool {
    ship.ship_id == ship_id!("武蔵改二")
}

/// Int(2√ﾈﾙｿﾝLv+√3番艦Lv+√5番艦Lv+√ﾈﾙｿﾝ運+0.5√3番艦運+0.5√5番艦運+12)
/// https://twitter.com/Xe_UCH/status/1398930917184270337
fn calc_nelson_touch_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s3 = fleet.ships.get(2)?;
    let s5 = fleet.ships.get(4)?;

    let s1_level = s1.level as f64;
    let s3_level = s3.level as f64;
    let s5_level = s5.level as f64;
    let s1_luck = s1.luck()? as f64;
    let s3_luck = s3.luck()? as f64;
    let s5_luck = s5.luck()? as f64;

    let result = 2.0 * s1_level.sqrt()
        + s3_level.sqrt()
        + s5_level.sqrt()
        + s1_luck.sqrt()
        + 0.5 * s3_luck.sqrt()
        + 0.5 * s5_luck.sqrt()
        + 12.0;

    Some((result.floor() / 100.0).min(1.0))
}

/// (√一番艦Lv +√二番艦Lv) + 1.2*(√一番艦運 +√二番艦運)+30
/// https://twitter.com/kanprint/status/1490311067742142467
fn calc_nagato_cutin_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    let s1_level = s1.level as f64;
    let s2_level = s2.level as f64;
    let s1_luck = s1.luck()? as f64;
    let s2_luck = s2.luck()? as f64;

    let result = s1_level.sqrt() + s2_level.sqrt() + 1.2 * (s1_luck.sqrt() + s2_luck.sqrt()) + 30.0;
    Some((result / 100.0).min(1.0))
}

/// √一番艦Lv +√二番艦Lv+ √一番艦運 +√二番艦運+35+水上電探装備艦数補正10+大和旗艦補正2+大和or武蔵2番艦補正5
fn calc_yamato2_ship_cutin_rate(fleet: &Fleet) -> Option<f64> {
    let s1 = fleet.ships.get(0)?;
    let s2 = fleet.ships.get(1)?;

    let s1_level = s1.level as f64;
    let s2_level = s2.level as f64;
    let s1_luck = s1.luck()? as f64;
    let s2_luck = s2.luck()? as f64;

    let yamato_flagship_mod = if is_yamato_kai2(s1) { 2.0 } else { 0.0 };

    let yamato_class_mod = if s2.ctype == ctype!("大和型") {
        5.0
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
        + s1_luck.sqrt()
        + s2_luck.sqrt()
        + 35.0
        + yamato_flagship_mod
        + yamato_class_mod
        + surface_radar_ships_mod;

    Some((result / 100.0).min(1.0))
}

pub fn calc_fleet_cutin_rate(fleet: &Fleet, cutin: FleetCutin) -> Option<f64> {
    match cutin {
        FleetCutin::NelsonTouch => calc_nelson_touch_rate(fleet),
        FleetCutin::NagatoClassCutin => calc_nagato_cutin_rate(fleet),
        FleetCutin::Yamato2ShipCutin => calc_yamato2_ship_cutin_rate(fleet),
        _ => None,
    }
}
