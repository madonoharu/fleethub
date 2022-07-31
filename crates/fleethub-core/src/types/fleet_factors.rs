use crate::error::TryFromOrgTypeError;

use super::{OrgType, Role, ShipPosition, Side};

use Role::*;
type P = PlayerFleetType;
type E = EnemyFleetType;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub struct FleetFactors {
    pub power: u8,
    pub accuracy: u8,
}

impl FleetFactors {
    pub fn for_shelling(
        attacker: ShipPosition,
        target: ShipPosition,
    ) -> Result<Self, TryFromOrgTypeError> {
        let attacker_side = attacker.side();
        let (player_position, enemy_position) = if attacker_side.is_player() {
            (attacker, target)
        } else {
            (target, attacker)
        };

        let player = PlayerFleetType::try_from(player_position)?;
        let enemy = EnemyFleetType::try_from(enemy_position)?;
        let power = get_shelling_power_factor(player, enemy, attacker_side);
        let accuracy = get_shelling_accuracy_factor(player, enemy, attacker_side);
        Ok(Self { power, accuracy })
    }

    pub fn for_torpedo(
        attacker: ShipPosition,
        target: ShipPosition,
    ) -> Result<Self, TryFromOrgTypeError> {
        let attacker_side = attacker.side();
        let (player_position, enemy_position) = if attacker_side.is_player() {
            (attacker, target)
        } else {
            (target, attacker)
        };

        let player = PlayerFleetType::try_from(player_position)?;
        let enemy = EnemyFleetType::try_from(enemy_position)?;
        let power = get_torpedo_power_factor(player, enemy, attacker_side);
        let accuracy = get_torpedo_accuracy_factor(player, enemy, attacker_side);
        Ok(Self { power, accuracy })
    }

    #[deprecated]
    pub fn deprecated_shelling(attacker: ShipPosition, target: ShipPosition) -> (f64, f64) {
        let attacker_side = attacker.side();
        let (player_position, enemy_position) = if attacker_side.is_player() {
            (attacker, target)
        } else {
            (target, attacker)
        };

        let player = PlayerFleetType::try_from(player_position).unwrap_or_default();
        let enemy = EnemyFleetType::try_from(enemy_position).unwrap_or_default();

        let power = get_shelling_power_factor(player, enemy, attacker_side);
        let accuracy = get_shelling_accuracy_factor(player, enemy, attacker_side);

        (power as f64 - 5.0, accuracy as f64)
    }

    #[deprecated]
    pub fn deprecated_torpedo(attacker: ShipPosition, target: ShipPosition) -> (f64, f64) {
        let attacker_side = attacker.side();
        let (player_position, enemy_position) = if attacker_side.is_player() {
            (attacker, target)
        } else {
            (target, attacker)
        };

        let player = PlayerFleetType::try_from(player_position).unwrap_or_default();
        let enemy = EnemyFleetType::try_from(enemy_position).unwrap_or_default();

        let power = get_torpedo_power_factor(player, enemy, attacker_side);
        let accuracy = get_torpedo_accuracy_factor(player, enemy, attacker_side);

        (power as f64 - 5.0, accuracy as f64)
    }
}

fn get_shelling_power_factor(
    player: PlayerFleetType,
    enemy: EnemyFleetType,
    attacker_side: Side,
) -> u8 {
    let result = match (player, enemy) {
        (P::Single, E::Single) => (5, 5),
        (P::CTF(Main), E::Single) => (7, 15),
        (P::CTF(Escort), E::Single) => (15, 10),
        (P::STF(Main), E::Single) => (15, 10),
        (P::STF(Escort), E::Single) => (0, 0),
        (P::TCF(Main), E::Single) => (0, 15),
        (P::TCF(Escort), E::Single) => (15, 10),
        (P::Single, E::Combined(Main)) => (10, 15),
        (P::Single, E::Combined(Escort)) => (10, 0),
        (P::CTF(Main), E::Combined(_)) => (7, 15),
        (P::CTF(Escort), E::Combined(_)) => (0, 0),
        (P::STF(Main), E::Combined(_)) => (7, 15),
        (P::STF(Escort), E::Combined(_)) => (0, 0),
        (P::TCF(Main), E::Combined(_)) => (0, 15),
        (P::TCF(Escort), E::Combined(_)) => (0, 0),
    };

    if attacker_side.is_player() {
        result.0
    } else {
        result.1
    }
}

fn get_shelling_accuracy_factor(
    player: PlayerFleetType,
    enemy: EnemyFleetType,
    attacker_side: Side,
) -> u8 {
    let result = match (player, enemy) {
        (P::Single, E::Single) => (90, 90),
        (P::CTF(Main), E::Single) => (78, 88),
        (P::CTF(Escort), E::Single) => (45, 65),
        (P::STF(Main), E::Single) => (45, 65),
        (P::STF(Escort), E::Single) => (67, 75),
        (P::TCF(Main), E::Single) => (54, 88),
        (P::TCF(Escort), E::Single) => (45, 65),
        (P::Single, E::Combined(Main)) => (80, 90),
        (P::Single, E::Combined(Escort)) => (80, 75),
        (P::CTF(Main), E::Combined(Main)) => (78, 88),
        (P::CTF(Main), E::Combined(Escort)) => (78, 75),
        (P::CTF(Escort), E::Combined(Main)) => (67, 88),
        (P::CTF(Escort), E::Combined(Escort)) => (67, 75),
        (P::STF(Main), E::Combined(Main)) => (78, 88),
        (P::STF(Main), E::Combined(Escort)) => (78, 75),
        (P::STF(Escort), E::Combined(Main)) => (67, 88),
        (P::STF(Escort), E::Combined(Escort)) => (67, 75),
        (P::TCF(Main), E::Combined(Main)) => (54, 88),
        (P::TCF(Main), E::Combined(Escort)) => (54, 75),
        (P::TCF(Escort), E::Combined(Main)) => (67, 88),
        (P::TCF(Escort), E::Combined(Escort)) => (67, 75),
    };

    if attacker_side.is_player() {
        result.0
    } else {
        result.1
    }
}

fn get_torpedo_power_factor(player: PlayerFleetType, enemy: EnemyFleetType, _: Side) -> u8 {
    match (player, enemy) {
        (_, E::Combined(_)) => 15,
        (P::Single, _) => 5,
        _ => 0,
    }
}

fn get_torpedo_accuracy_factor(
    player: PlayerFleetType,
    enemy: EnemyFleetType,
    attacker_side: Side,
) -> u8 {
    if attacker_side.is_player() {
        match (player, enemy) {
            (_, E::Single) => 85,
            (P::Single, E::Combined(_)) => 50,
            (P::CTF(_) | P::STF(_) | P::TCF(_), E::Combined(_)) => 46,
        }
    } else {
        85
    }
}

#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Clone, Copy, Default)]
enum PlayerFleetType {
    #[default]
    Single,
    CTF(Role),
    STF(Role),
    TCF(Role),
}

#[derive(Debug, Clone, Copy, Default)]
enum EnemyFleetType {
    #[default]
    Single,
    Combined(Role),
}

impl TryFrom<ShipPosition> for PlayerFleetType {
    type Error = TryFromOrgTypeError;

    fn try_from(value: ShipPosition) -> Result<Self, Self::Error> {
        let ShipPosition { org_type, role, .. } = value;
        (org_type, role).try_into()
    }
}

impl TryFrom<ShipPosition> for EnemyFleetType {
    type Error = TryFromOrgTypeError;

    fn try_from(value: ShipPosition) -> Result<Self, Self::Error> {
        let ShipPosition { org_type, role, .. } = value;
        (org_type, role).try_into()
    }
}

impl TryFrom<(OrgType, Role)> for PlayerFleetType {
    type Error = TryFromOrgTypeError;

    #[inline]
    fn try_from((org_type, role): (OrgType, Role)) -> Result<Self, Self::Error> {
        let fleet_type = match (org_type, role) {
            (OrgType::Single, _) => Self::Single,
            (OrgType::CarrierTaskForce, role) => Self::CTF(role),
            (OrgType::SurfaceTaskForce, role) => Self::STF(role),
            (OrgType::TransportEscort, role) => Self::TCF(role),
            _ => {
                return Err(TryFromOrgTypeError);
            }
        };

        Ok(fleet_type)
    }
}

impl TryFrom<(OrgType, Role)> for EnemyFleetType {
    type Error = TryFromOrgTypeError;

    #[inline]
    fn try_from((org_type, role): (OrgType, Role)) -> Result<Self, Self::Error> {
        let fleet_type = match (org_type, role) {
            (OrgType::EnemySingle, _) => Self::Single,
            (OrgType::EnemyCombined, role) => Self::Combined(role),
            _ => {
                return Err(TryFromOrgTypeError);
            }
        };

        Ok(fleet_type)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use OrgType::{CarrierTaskForce as CTF, SurfaceTaskForce as STF, TransportEscort as TCF, *};

    fn get_ship_position(value: (OrgType, Role)) -> ShipPosition {
        ShipPosition {
            org_type: value.0,
            role: value.1,
            ..Default::default()
        }
    }

    #[test]
    fn test_for_shelling() {
        let table = [
            ((Single, Main), (EnemySingle, Main), (5, 90)),
            ((CTF, Escort), (EnemySingle, Main), (15, 45)),
            ((EnemySingle, Main), (CTF, Escort), (10, 65)),
        ];

        for (attacker, target, expected) in table.into_iter() {
            let attacker = get_ship_position(attacker);
            let target = get_ship_position(target);

            let result = FleetFactors::for_shelling(attacker, target);
            let expected = Ok(FleetFactors {
                power: expected.0,
                accuracy: expected.1,
            });

            assert_eq!(result, expected, "{attacker:?} -> {target:?}");
        }
    }

    #[test]
    fn test_for_torpedo() {
        let table = [
            ((Single, Main), (EnemySingle, Main), (5, 85)),
            ((CTF, Escort), (EnemyCombined, Main), (15, 46)),
            ((EnemyCombined, Main), (CTF, Escort), (15, 85)),
        ];

        for (attacker, target, expected) in table.into_iter() {
            let attacker = get_ship_position(attacker);
            let target = get_ship_position(target);

            let result = FleetFactors::for_torpedo(attacker, target);
            let expected = Ok(FleetFactors {
                power: expected.0,
                accuracy: expected.1,
            });

            assert_eq!(result, expected, "{attacker:?} -> {target:?}");
        }
    }

    #[test]
    fn test_get_shelling_power_factor() {
        let table = [
            ((Single, Main), (EnemySingle, Main), (0, 0)),
            // Combined Fleet vs Single Fleet Modifiers
            ((CTF, Main), (EnemySingle, Main), (2, 10)),
            ((CTF, Escort), (EnemySingle, Main), (10, 5)),
            ((STF, Main), (EnemySingle, Main), (10, 5)),
            ((STF, Escort), (EnemySingle, Main), (-5, -5)),
            ((TCF, Main), (EnemySingle, Main), (-5, 10)),
            ((TCF, Escort), (EnemySingle, Main), (10, 5)),
            // Combined Fleet vs Combined Fleet Modifiers
            ((CTF, Main), (EnemyCombined, Main), (2, 10)),
            ((CTF, Main), (EnemyCombined, Escort), (2, 10)),
            ((CTF, Escort), (EnemyCombined, Main), (-5, -5)),
            ((CTF, Escort), (EnemyCombined, Escort), (-5, -5)),
            ((STF, Main), (EnemyCombined, Main), (2, 10)),
            ((STF, Main), (EnemyCombined, Escort), (2, 10)),
            ((STF, Escort), (EnemyCombined, Main), (-5, -5)),
            ((STF, Escort), (EnemyCombined, Escort), (-5, -5)),
            ((TCF, Main), (EnemyCombined, Main), (-5, 10)),
            ((TCF, Main), (EnemyCombined, Escort), (-5, 10)),
            ((TCF, Escort), (EnemyCombined, Main), (-5, -5)),
            ((TCF, Escort), (EnemyCombined, Escort), (-5, -5)),
            // Single Fleet vs Combined Fleet Modifiers
            ((Single, Main), (EnemyCombined, Main), (5, 10)),
            ((Single, Main), (EnemyCombined, Escort), (5, -5)),
        ];

        for (player, enemy, expected) in table.into_iter() {
            let player = player.try_into().unwrap();
            let enemy = enemy.try_into().unwrap();
            let expected = ((expected.0 + 5) as u8, (expected.1 + 5) as u8);

            let actual = (
                get_shelling_power_factor(player, enemy, Side::Player),
                get_shelling_power_factor(player, enemy, Side::Enemy),
            );

            assert_eq!(actual, expected, "{player:?} vs {enemy:?} -> {expected:?}");
        }
    }

    #[test]
    fn test_get_shelling_accuracy_factor() {
        let table = [
            ((Single, Main), (EnemySingle, Main), (90, 90)),
            // Combined Fleet vs Single Fleet Modifiers
            ((CTF, Main), (EnemySingle, Main), (78, 88)),
            ((CTF, Escort), (EnemySingle, Main), (45, 65)),
            ((STF, Main), (EnemySingle, Main), (45, 65)),
            ((STF, Escort), (EnemySingle, Main), (67, 75)),
            ((TCF, Main), (EnemySingle, Main), (54, 88)),
            ((TCF, Escort), (EnemySingle, Main), (45, 65)),
            // Combined Fleet vs Combined Fleet Modifiers
            ((CTF, Main), (EnemyCombined, Main), (78, 88)),
            ((CTF, Main), (EnemyCombined, Escort), (78, 75)),
            ((CTF, Escort), (EnemyCombined, Main), (67, 88)),
            ((CTF, Escort), (EnemyCombined, Escort), (67, 75)),
            ((STF, Main), (EnemyCombined, Main), (78, 88)),
            ((STF, Main), (EnemyCombined, Escort), (78, 75)),
            ((STF, Escort), (EnemyCombined, Main), (67, 88)),
            ((STF, Escort), (EnemyCombined, Escort), (67, 75)),
            ((TCF, Main), (EnemyCombined, Main), (54, 88)),
            ((TCF, Main), (EnemyCombined, Escort), (54, 75)),
            ((TCF, Escort), (EnemyCombined, Main), (67, 88)),
            ((TCF, Escort), (EnemyCombined, Escort), (67, 75)),
            // Single Fleet vs Combined Fleet Modifiers
            ((Single, Main), (EnemyCombined, Main), (80, 90)),
            ((Single, Main), (EnemyCombined, Escort), (80, 75)),
        ];

        for (player, enemy, expected) in table.into_iter() {
            let player = player.try_into().unwrap();
            let enemy = enemy.try_into().unwrap();

            let actual = (
                get_shelling_accuracy_factor(player, enemy, Side::Player),
                get_shelling_accuracy_factor(player, enemy, Side::Enemy),
            );

            assert_eq!(actual, expected, "{player:?} vs {enemy:?} -> {expected:?}");
        }
    }

    #[test]
    fn test_get_torpedo_power_factor() {
        let table = [
            ((Single, Main), (EnemySingle, Main), (0, 0)),
            // Combined Fleet vs Single Fleet Modifiers
            ((CTF, Main), (EnemySingle, Main), (-5, -5)),
            ((CTF, Escort), (EnemySingle, Main), (-5, -5)),
            ((STF, Main), (EnemySingle, Main), (-5, -5)),
            ((STF, Escort), (EnemySingle, Main), (-5, -5)),
            ((TCF, Main), (EnemySingle, Main), (-5, -5)),
            ((TCF, Escort), (EnemySingle, Main), (-5, -5)),
            // Combined Fleet vs Combined Fleet Modifiers
            ((CTF, Main), (EnemyCombined, Main), (10, 10)),
            ((CTF, Main), (EnemyCombined, Escort), (10, 10)),
            ((CTF, Escort), (EnemyCombined, Main), (10, 10)),
            ((CTF, Escort), (EnemyCombined, Escort), (10, 10)),
            ((STF, Main), (EnemyCombined, Main), (10, 10)),
            ((STF, Main), (EnemyCombined, Escort), (10, 10)),
            ((STF, Escort), (EnemyCombined, Main), (10, 10)),
            ((STF, Escort), (EnemyCombined, Escort), (10, 10)),
            ((TCF, Main), (EnemyCombined, Main), (10, 10)),
            ((TCF, Main), (EnemyCombined, Escort), (10, 10)),
            ((TCF, Escort), (EnemyCombined, Main), (10, 10)),
            ((TCF, Escort), (EnemyCombined, Escort), (10, 10)),
            // Single Fleet vs Combined Fleet Modifiers
            ((Single, Main), (EnemyCombined, Main), (10, 10)),
            ((Single, Main), (EnemyCombined, Escort), (10, 10)),
        ];

        for (player, enemy, expected) in table.into_iter() {
            let player = player.try_into().unwrap();
            let enemy = enemy.try_into().unwrap();
            let expected = ((expected.0 + 5) as u8, (expected.1 + 5) as u8);

            let actual = (
                get_torpedo_power_factor(player, enemy, Side::Player),
                get_torpedo_power_factor(player, enemy, Side::Enemy),
            );

            assert_eq!(actual, expected, "{player:?} vs {enemy:?} -> {expected:?}");
        }
    }

    #[test]
    fn test_get_torpedo_accuracy_factor() {
        let table = [
            ((Single, Main), (EnemySingle, Main), (85, 85)),
            // Combined Fleet vs Single Fleet Modifiers
            ((CTF, Main), (EnemySingle, Main), (85, 85)),
            ((CTF, Escort), (EnemySingle, Main), (85, 85)),
            ((STF, Main), (EnemySingle, Main), (85, 85)),
            ((STF, Escort), (EnemySingle, Main), (85, 85)),
            ((TCF, Main), (EnemySingle, Main), (85, 85)),
            ((TCF, Escort), (EnemySingle, Main), (85, 85)),
            // Combined Fleet vs Combined Fleet Modifiers
            ((CTF, Main), (EnemyCombined, Main), (46, 85)),
            ((CTF, Main), (EnemyCombined, Escort), (46, 85)),
            ((CTF, Escort), (EnemyCombined, Main), (46, 85)),
            ((CTF, Escort), (EnemyCombined, Escort), (46, 85)),
            ((STF, Main), (EnemyCombined, Main), (46, 85)),
            ((STF, Main), (EnemyCombined, Escort), (46, 85)),
            ((STF, Escort), (EnemyCombined, Main), (46, 85)),
            ((STF, Escort), (EnemyCombined, Escort), (46, 85)),
            ((TCF, Main), (EnemyCombined, Main), (46, 85)),
            ((TCF, Main), (EnemyCombined, Escort), (46, 85)),
            ((TCF, Escort), (EnemyCombined, Main), (46, 85)),
            ((TCF, Escort), (EnemyCombined, Escort), (46, 85)),
            // Single Fleet vs Combined Fleet Modifiers
            ((Single, Main), (EnemyCombined, Main), (50, 85)),
            ((Single, Main), (EnemyCombined, Escort), (50, 85)),
        ];

        for (player, enemy, expected) in table.into_iter() {
            let player = player.try_into().unwrap();
            let enemy = enemy.try_into().unwrap();

            let actual = (
                get_torpedo_accuracy_factor(player, enemy, Side::Player),
                get_torpedo_accuracy_factor(player, enemy, Side::Enemy),
            );

            assert_eq!(actual, expected, "{player:?} vs {enemy:?} -> {expected:?}");
        }
    }
}
