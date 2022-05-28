use crate::types::{OrgType, Role, Side};

use super::WarfareShipEnvironment;

#[derive(Debug, Clone, Copy)]
pub struct ShipPosition {
    org_type: OrgType,
    role: Role,
}

impl From<&WarfareShipEnvironment> for ShipPosition {
    fn from(env: &WarfareShipEnvironment) -> Self {
        Self {
            org_type: env.org_type,
            role: env.role,
        }
    }
}

pub fn get_shelling_power_factor(player: ShipPosition, enemy: ShipPosition, side: Side) -> i32 {
    use OrgType::*;

    if side.is_enemy() {
        let role = enemy.role;

        let factors = if enemy.org_type.is_combined() {
            (10, -5)
        } else {
            match player.org_type {
                CarrierTaskForce => (10, 5),
                SurfaceTaskForce => (5, -5),
                TransportEscort => (10, 5),
                _ => (0, 0),
            }
        };

        if role.is_main() {
            factors.0
        } else {
            factors.1
        }
    } else {
        let role = player.role;

        let factors = if enemy.org_type.is_single() {
            match player.org_type {
                Single => (0, 0),
                CarrierTaskForce => (2, 10),
                SurfaceTaskForce => (10, -5),
                TransportEscort => (-5, 10),
                _ => (0, 0),
            }
        } else {
            match player.org_type {
                CarrierTaskForce => (2, -5),
                SurfaceTaskForce => (2, -5),
                TransportEscort => (-5, -5),
                _ => (5, 5),
            }
        };

        if role.is_main() {
            factors.0
        } else {
            factors.1
        }
    }
}

// https://docs.google.com/spreadsheets/d/1sABE9Cc-QXTWaiqIdpYt19dFTWKUi0SDAtaWSWyyAXg
pub fn get_shelling_accuracy_factor(player: ShipPosition, enemy: ShipPosition) -> i32 {
    use OrgType::*;
    use Role::*;

    if enemy.org_type.is_single() {
        match (player.org_type, player.role) {
            (CarrierTaskForce, Main) => 78,
            (CarrierTaskForce, Escort) => 45,
            (SurfaceTaskForce, Main) => 45,
            (SurfaceTaskForce, Escort) => 67,
            (TransportEscort, Main) => 54,
            (TransportEscort, Escort) => 45,
            _ => 90,
        }
    } else {
        match (player.org_type, player.role) {
            (CarrierTaskForce, Main) => 78,
            (CarrierTaskForce, Escort) => 67,
            (SurfaceTaskForce, Main) => 78,
            (SurfaceTaskForce, Escort) => 67,
            (TransportEscort, Main) => 54,
            (TransportEscort, Escort) => 67,
            _ => 80,
        }
    }
}

pub fn find_torpedo_power_factor(attacker_org_type: OrgType, target_org_type: OrgType) -> i32 {
    let (player, enemy) = if attacker_org_type.is_player() {
        (attacker_org_type, target_org_type)
    } else {
        (target_org_type, attacker_org_type)
    };

    if enemy.is_combined() {
        15
    } else if player.is_single() {
        5
    } else {
        0
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use OrgType::*;
    use Role::*;

    #[test]
    fn test_get_shelling_power_factor() {
        let table = [
            (Single, EnemySingle, (0, 0), (0, 0)),
            (CarrierTaskForce, EnemySingle, (2, 10), (10, 5)),
            (SurfaceTaskForce, EnemySingle, (10, -5), (5, -5)),
            (TransportEscort, EnemySingle, (-5, 10), (10, 5)),
            (Single, EnemyCombined, (5, 5), (10, -5)),
            (CarrierTaskForce, EnemyCombined, (2, -5), (10, -5)),
            (SurfaceTaskForce, EnemyCombined, (2, -5), (10, -5)),
            (TransportEscort, EnemyCombined, (-5, -5), (10, -5)),
        ];

        table
            .into_iter()
            .for_each(|(player, enemy, expected_player, expected_enemy)| {
                assert_eq!(
                    get_shelling_power_factor(
                        ShipPosition {
                            org_type: player,
                            role: Main,
                        },
                        ShipPosition {
                            org_type: enemy,
                            role: Main,
                        },
                        Side::Player,
                    ),
                    expected_player.0
                );

                assert_eq!(
                    get_shelling_power_factor(
                        ShipPosition {
                            org_type: player,
                            role: Escort,
                        },
                        ShipPosition {
                            org_type: enemy,
                            role: Main,
                        },
                        Side::Player,
                    ),
                    expected_player.1
                );

                assert_eq!(
                    get_shelling_power_factor(
                        ShipPosition {
                            org_type: player,
                            role: Main,
                        },
                        ShipPosition {
                            org_type: enemy,
                            role: Main,
                        },
                        Side::Enemy,
                    ),
                    expected_enemy.0
                );

                assert_eq!(
                    get_shelling_power_factor(
                        ShipPosition {
                            org_type: player,
                            role: Escort,
                        },
                        ShipPosition {
                            org_type: enemy,
                            role: Escort,
                        },
                        Side::Enemy,
                    ),
                    expected_enemy.1
                );
            });

        let value = get_shelling_power_factor(
            ShipPosition {
                org_type: CarrierTaskForce,
                role: Main,
            },
            ShipPosition {
                org_type: EnemySingle,
                role: Main,
            },
            Side::Player,
        );

        assert_eq!(value, 2)
    }

    #[test]
    fn test_get_shelling_accuracy_factor() {
        let table = [
            (Single, EnemySingle, 90, 90),
            (CarrierTaskForce, EnemySingle, 78, 45),
            (SurfaceTaskForce, EnemySingle, 45, 67),
            (TransportEscort, EnemySingle, 54, 45),
            (Single, EnemyCombined, 80, 80),
            (CarrierTaskForce, EnemyCombined, 78, 67),
            (SurfaceTaskForce, EnemyCombined, 78, 67),
            (TransportEscort, EnemyCombined, 54, 67),
        ];

        table
            .into_iter()
            .for_each(|(player, enemy, expected_main, expected_escort)| {
                assert_eq!(
                    get_shelling_accuracy_factor(
                        ShipPosition {
                            org_type: player,
                            role: Main,
                        },
                        ShipPosition {
                            org_type: enemy,
                            role: Main,
                        },
                    ),
                    expected_main
                );

                assert_eq!(
                    get_shelling_accuracy_factor(
                        ShipPosition {
                            org_type: player,
                            role: Escort,
                        },
                        ShipPosition {
                            org_type: enemy,
                            role: Main,
                        },
                    ),
                    expected_escort
                );
            });
    }
}
