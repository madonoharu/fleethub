use enumset::EnumSet;

use crate::{
    fleet::Fleet,
    ship::Ship,
    types::{
        ctype, gear_id, matches_gear_id, matches_ship_id, ship_id, DamageState, Engagement,
        FleetCutin, Formation, GearAttr, GearType, ShipAttr, SingleFormation,
    },
};

fn is_big7(ship: &Ship) -> bool {
    // なぜか未改造はビッグセブン補正が適応されない
    matches!(ship.ctype, ctype!("長門型") | ctype!("Nelson級")) && ship.remodel_rank() >= 2
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

pub fn calc_fleet_cutin_rate(fleet: &Fleet, cutin: FleetCutin) -> Option<f64> {
    match cutin {
        FleetCutin::NelsonTouch => calc_nelson_touch_rate(fleet),
        FleetCutin::NagatoCutin => calc_nagato_cutin_rate(fleet),
        _ => None,
    }
}

pub fn get_fleet_cutin_mod(
    attack_type: FleetCutin,
    engagement: Engagement,
    shots: usize,
    fleet: &Fleet,
    attacker: &Ship,
) -> f64 {
    match attack_type {
        FleetCutin::NelsonTouch => {
            let base = 2.0;

            let engagement_mod = if engagement == Engagement::RedT {
                1.25
            } else {
                1.0
            };

            base * engagement_mod
        }

        FleetCutin::NagatoCutin => {
            let base = if shots <= 2 { 1.4 } else { 1.2 };

            let flagship = fleet.ships.get(0).unwrap_or_else(|| unreachable!());
            let second_ship = fleet.ships.get(1).unwrap_or_else(|| unreachable!());

            let second_ship_mod = match second_ship.ctype {
                ctype!("長門型") => {
                    if second_ship.has_attr(ShipAttr::Kai2) {
                        if shots <= 2 {
                            1.2
                        } else {
                            1.4
                        }
                    } else {
                        if shots <= 2 {
                            1.15
                        } else {
                            1.35
                        }
                    }
                }
                ctype!("Nelson級") => {
                    if flagship.ship_id == ship_id!("長門改二") {
                        if shots <= 2 {
                            1.1
                        } else {
                            1.25
                        }
                    } else {
                        1.0
                    }
                }
                _ => 1.0,
            };

            let equipment_mod = {
                let mut v = 1.0;
                if attacker.gears.has_type(GearType::ApShell) {
                    v *= 1.35
                }
                if attacker.gears.has_attr(GearAttr::SurfaceRadar) {
                    v *= 1.15
                }
                v
            };

            base * second_ship_mod * equipment_mod
        }

        FleetCutin::ColoradoCutin => {
            let base = if shots == 1 { 1.5 } else { 1.3 };

            let second_ship = fleet.ships.get(1).unwrap_or_else(|| unreachable!());
            let third_ship = fleet.ships.get(2).unwrap_or_else(|| unreachable!());

            let companion_ship_mod = {
                let mut v = 1.0;
                // 2番艦ビッグセブン補正
                if shots == 2 && is_big7(second_ship) {
                    v *= 1.15
                }
                // 3番艦ビッグセブン補正
                if shots == 3 && is_big7(third_ship) {
                    v *= 1.17
                }
                v
            };

            let equipment_mod = {
                let mut v = 1.0;
                if attacker.gears.has_type(GearType::ApShell) {
                    v *= 1.35
                }
                if attacker.gears.has_attr(GearAttr::SurfaceRadar) {
                    v *= 1.15
                }
                if attacker.gears.has(gear_id!("SG レーダー(後期型)")) {
                    v *= 1.15;
                }
                v
            };

            base * companion_ship_mod * equipment_mod
        }

        FleetCutin::KongouCutin => {
            // 2022/6/8に上方修正
            let base = 2.2;

            let engagement_mod = match engagement {
                Engagement::GreenT => 1.25,
                Engagement::RedT => 0.75,
                _ => 1.0,
            };

            base * engagement_mod
        }

        FleetCutin::Yamato2ShipCutin => {
            let s1 = fleet.ships.get(0).unwrap_or_else(|| unreachable!());
            let s2 = fleet.ships.get(1).unwrap_or_else(|| unreachable!());

            let s1_is_musashi_kai2 = is_musashi_kai2(s1);
            let includes_musashi_kai2 = s1_is_musashi_kai2 || is_musashi_kai2(s2);

            let base = if includes_musashi_kai2 {
                if shots <= 2 {
                    1.4 * 1.1
                } else {
                    1.55 * if s1_is_musashi_kai2 { 1.25 } else { 1.2 }
                }
            } else {
                if shots <= 2 {
                    1.4
                } else {
                    1.55
                }
            };

            let mut v = 1.0;
            if attacker.gears.has_type(GearType::ApShell) {
                v *= 1.35;
            }
            if attacker.gears.has_attr(GearAttr::SurfaceRadar) {
                v *= 1.15;
            }
            if attacker.gears.has_by(|gear| {
                matches_gear_id!(
                    gear.gear_id,
                    "15m二重測距儀+21号電探改二" | "15m二重測距儀改+21号電探改二+熟練射撃指揮所"
                )
            }) {
                v *= 1.1;
            }

            base * v
        }

        FleetCutin::Yamato3ShipCutin => {
            let s2 = fleet.ships.get(1).unwrap_or_else(|| unreachable!());

            let base = if is_musashi_kai2(s2) {
                if shots == 2 {
                    1.8
                } else {
                    1.65
                }
            } else if matches_ship_id!(s2.ship_id, "長門改二" | "陸奥改二") {
                1.65
            } else if matches_ship_id!(s2.ship_id, "伊勢改二" | "日向改二") {
                if shots == 2 {
                    1.575
                } else {
                    1.65
                }
            } else {
                if shots == 3 {
                    1.65
                } else {
                    1.5
                }
            };

            let mut v = 1.0;

            if attacker.gears.has_type(GearType::ApShell) {
                v *= 1.35;
            }
            if attacker.gears.has_attr(GearAttr::SurfaceRadar) {
                v *= 1.15;
            }
            if shots <= 2
                && attacker.gears.has_by(|gear| {
                    matches_gear_id!(
                        gear.gear_id,
                        "15m二重測距儀+21号電探改二"
                            | "15m二重測距儀改+21号電探改二+熟練射撃指揮所"
                    )
                })
            {
                v *= 1.1;
            }

            base * v
        }
    }
}

fn can_do_nelson_touch(fleet: &Fleet, formation: Formation) -> Option<()> {
    let flagship = fleet.ships.get(0)?;

    if !(flagship.ctype == ctype!("Nelson級") && flagship.damage_state() <= DamageState::Shouha) {
        return None;
    }

    if !matches!(
        formation,
        Formation::Single(SingleFormation::DoubleLine) | Formation::CRUISING2
    ) {
        return None;
    }

    if fleet.ships.count_by(|ship| !ship.ship_type.is_submarine()) < 6 {
        return None;
    }

    let third = fleet.ships.get(2)?;
    let fifth = fleet.ships.get(4)?;

    if !third.ship_type.is_submarine()
        && !third.ship_type.is_aircraft_carrier()
        && !fifth.ship_type.is_submarine()
        && !fifth.ship_type.is_aircraft_carrier()
    {
        Some(())
    } else {
        None
    }
}

fn can_do_nagato_cutin(fleet: &Fleet, formation: Formation) -> Option<()> {
    let flagship = fleet.ships.get(0)?;

    if !(flagship.ctype == ctype!("長門型")
        && flagship.has_attr(ShipAttr::Kai2)
        && flagship.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    if !matches!(formation, Formation::ECHELON | Formation::CRUISING2) {
        return None;
    }

    if fleet.ships.count_by(|ship| !ship.ship_type.is_submarine()) < 6 {
        return None;
    }

    let second = fleet.ships.get(1)?;

    if second.ship_type.is_battleship() && second.damage_state() <= DamageState::Chuuha {
        Some(())
    } else {
        None
    }
}

fn can_do_colorado_cutin(fleet: &Fleet, formation: Formation) -> Option<()> {
    let flagship = fleet.ships.get(0)?;

    if !(flagship.ctype == ctype!("Colorado級") && flagship.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    if !matches!(formation, Formation::ECHELON | Formation::CRUISING2) {
        return None;
    }

    if fleet
        .ships
        .count_by(|ship| ship.ship_type.is_surface_ship())
        < 6
    {
        return None;
    }

    let second = fleet.ships.get(1)?;
    let third = fleet.ships.get(2)?;

    if second.damage_state() <= DamageState::Chuuha
        && second.ship_type.is_battleship()
        && third.damage_state() <= DamageState::Chuuha
        && third.ship_type.is_battleship()
    {
        Some(())
    } else {
        None
    }
}

fn can_do_kongou_cutin(fleet: &Fleet, formation: Formation) -> Option<()> {
    let flagship = fleet.ships.get(0)?;
    let second = fleet.ships.get(1)?;

    let is_kongou_fleet = match flagship.ship_id {
        ship_id!("金剛改二丙") => {
            matches!(
                second.ship_id,
                ship_id!("比叡改二丙") | ship_id!("榛名改二")
            ) || second.ctype == ctype!("Queen Elizabeth級")
        }
        ship_id!("比叡改二丙") => {
            matches!(
                second.ship_id,
                ship_id!("金剛改二丙") | ship_id!("霧島改二")
            )
        }
        _ => false,
    };

    if !is_kongou_fleet {
        return None;
    }

    if !matches!(
        formation,
        Formation::LINE_AHEAD | Formation::ECHELON | Formation::CRUISING2 | Formation::CRUISING4
    ) {
        return None;
    }

    if fleet.ships.count_by(|ship| !ship.ship_type.is_submarine()) < 5 {
        return None;
    }

    if flagship.damage_state() <= DamageState::Shouha
        && second.damage_state() <= DamageState::Shouha
    {
        Some(())
    } else {
        None
    }
}

fn is_yamato_kai2(ship: &Ship) -> bool {
    matches_ship_id!(ship.ship_id, "大和改二" | "大和改二重")
}

fn is_musashi_kai2(ship: &Ship) -> bool {
    ship.ship_id == ship_id!("武蔵改二")
}

fn can_do_yamato_2ship_cutin(fleet: &Fleet, formation: Formation) -> Option<()> {
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

    let includes_musashi_kai2 = is_musashi_kai2(s1) || is_musashi_kai2(s2);

    if includes_musashi_kai2 {
        Some(())
    } else if matches_ship_id!(s2.ship_id, "Bismarck drei" | "Iowa改" | "Richelieu改") {
        Some(())
    } else {
        None
    }
}

fn can_do_yamato_3ship_cutin(fleet: &Fleet, formation: Formation) -> Option<()> {
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

    const HELPER_PAIRS: [(u16, u16); 7] = [
        (ship_id!("長門改二"), ship_id!("陸奥改二")),
        (ship_id!("伊勢改二"), ship_id!("日向改二")),
        (ship_id!("扶桑改二"), ship_id!("山城改二")),
        (ship_id!("金剛改二丙"), ship_id!("比叡改二丙")),
        (ship_id!("Warspite改"), ship_id!("Nelson改")),
        (ship_id!("Italia"), ship_id!("Roma改")),
        (ship_id!("Washington改"), ship_id!("South Dakota改")),
    ];

    if HELPER_PAIRS
        .iter()
        .any(|(p1, p2)| pair.contains(p1) && pair.contains(p2))
        || (pair[0] == ship_id!("武蔵改二") && matches_ship_id!(pair[1], "長門改二" | "陸奥改二"))
    {
        Some(())
    } else {
        None
    }
}

pub fn get_possible_fleet_cutin_set(
    fleet: &Fleet,
    formation: Formation,
    is_night: bool,
) -> EnumSet<FleetCutin> {
    let mut set = EnumSet::new();

    if can_do_nelson_touch(fleet, formation).is_some() {
        set.insert(FleetCutin::NelsonTouch);
    }
    if can_do_nagato_cutin(fleet, formation).is_some() {
        set.insert(FleetCutin::NagatoCutin);
    }
    if can_do_colorado_cutin(fleet, formation).is_some() {
        set.insert(FleetCutin::ColoradoCutin);
    }
    if is_night && can_do_kongou_cutin(fleet, formation).is_some() {
        set.insert(FleetCutin::KongouCutin);
    }
    if can_do_yamato_2ship_cutin(fleet, formation).is_some() {
        set.insert(FleetCutin::Yamato2ShipCutin);
    }
    if can_do_yamato_3ship_cutin(fleet, formation).is_some() {
        set.insert(FleetCutin::Yamato3ShipCutin);
    }

    set
}
