use crate::{
    fleet::Fleet,
    ship::Ship,
    ship_id,
    types::{
        CombinedFormation, DamageState, Engagement, FleetCutin, Formation, GearAttr, GearType,
        ShipAttr, ShipClass, SingleFormation,
    },
};

fn is_big7(ship: &Ship) -> bool {
    matches!(
        ship.ship_class,
        ShipClass::NagatoClass | ShipClass::NelsonClass
    )
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

            let second_ship_mod = match second_ship.ship_class {
                ShipClass::NagatoClass => {
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
                ShipClass::NelsonClass => {
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
            let base = if shots == 1 { 1.3 } else { 1.15 };

            let second_ship = fleet.ships.get(1).unwrap_or_else(|| unreachable!());
            let third_ship = fleet.ships.get(2).unwrap_or_else(|| unreachable!());

            let companion_ship_mod = {
                let mut v = 1.0;
                if shots == 2 && is_big7(second_ship) {
                    v *= 1.1
                }
                if shots == 3 && is_big7(third_ship) {
                    v *= 1.15
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
                v
            };

            base * companion_ship_mod * equipment_mod
        }

        FleetCutin::KongouCutin => {
            let base = 1.9;

            let engagement_mod = match engagement {
                Engagement::GreenT => 1.25,
                Engagement::RedT => 0.75,
                _ => 1.0,
            };

            base * engagement_mod
        }
    }
}

fn can_do_nelson_touch(fleet: &Fleet, formation: Formation) -> Option<()> {
    let flagship = fleet.ships.get(0)?;

    if !(flagship.ship_class == ShipClass::NelsonClass
        && flagship.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    if !matches!(
        formation,
        Formation::Single(SingleFormation::DoubleLine)
            | Formation::Combined(CombinedFormation::Cruising2)
    ) {
        return None;
    }

    if fleet.ships.count_by(|ship| !ship.ship_type.is_submarine()) < 6 {
        return None;
    }

    let third = fleet.ships.get(2)?;
    let fifth = fleet.ships.get(4)?;

    if !third.ship_type.is_aircraft_carrier() && !fifth.ship_type.is_aircraft_carrier() {
        Some(())
    } else {
        None
    }
}

fn can_do_nagato_cutin(fleet: &Fleet, formation: Formation) -> Option<()> {
    let flagship = fleet.ships.get(0)?;

    if !(flagship.ship_class == ShipClass::NagatoClass
        && flagship.has_attr(ShipAttr::Kai2)
        && flagship.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    if !matches!(
        formation,
        Formation::Single(SingleFormation::Echelon)
            | Formation::Combined(CombinedFormation::Cruising2)
    ) {
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

    if !(flagship.ship_class == ShipClass::ColoradoClass
        && flagship.damage_state() <= DamageState::Shouha)
    {
        return None;
    }

    if !matches!(
        formation,
        Formation::Single(SingleFormation::Echelon)
            | Formation::Combined(CombinedFormation::Cruising2)
    ) {
        return None;
    }

    if fleet.ships.count_by(|ship| !ship.ship_type.is_submarine()) < 6 {
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
            ) || second.ship_class == ShipClass::QueenElizabethClass
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
        Formation::Single(SingleFormation::LineAhead | SingleFormation::Echelon)
            | Formation::Combined(CombinedFormation::Cruising2 | CombinedFormation::Cruising4)
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

pub fn get_fleet_cutin(fleet: &Fleet, formation: Formation, is_night: bool) -> Option<FleetCutin> {
    if can_do_nelson_touch(fleet, formation).is_some() {
        Some(FleetCutin::NelsonTouch)
    } else if can_do_nagato_cutin(fleet, formation).is_some() {
        Some(FleetCutin::NagatoCutin)
    } else if can_do_colorado_cutin(fleet, formation).is_some() {
        Some(FleetCutin::ColoradoCutin)
    } else if is_night && can_do_kongou_cutin(fleet, formation).is_some() {
        Some(FleetCutin::KongouCutin)
    } else {
        None
    }
}
