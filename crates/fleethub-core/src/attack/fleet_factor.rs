use crate::types::{OrgType, Role, Side};

use super::WarfareShipEnvironment;

use OrgType::{CarrierTaskForce as CTF, SurfaceTaskForce as STF, TransportEscort as TCF};

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
                CTF => (10, 5),
                STF => (5, -5),
                TCF => (10, 5),
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
                CTF => (2, 10),
                STF => (10, -5),
                TCF => (-5, 10),
                _ => (0, 0),
            }
        } else {
            match player.org_type {
                CTF => (2, -5),
                STF => (2, -5),
                TCF => (-5, -5),
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
pub fn get_shelling_accuracy_factor(
    player: ShipPosition,
    enemy: ShipPosition,
    attacker_side: Side,
) -> i32 {
    use OrgType::*;
    use Role::*;

    if attacker_side.is_player() {
        match ((player.org_type, player.role), (enemy.org_type, enemy.role)) {
            ((Single, _), (EnemySingle, _)) => 90,
            ((Single, _), (EnemyCombined, _)) => 80,

            ((CTF, Main), (EnemySingle, _)) => 78,
            ((CTF, Main), (EnemyCombined, _)) => 78,
            ((CTF, Escort), (EnemySingle, _)) => 45,
            ((CTF, Escort), (EnemyCombined, _)) => 67,

            ((STF, Main), (EnemySingle, _)) => 45,
            ((STF, Main), (EnemyCombined, _)) => 78,
            ((STF, Escort), (EnemySingle, _)) => 67,
            ((STF, Escort), (EnemyCombined, _)) => 67,

            ((TCF, Main), (EnemySingle, _)) => 54,
            ((TCF, Main), (EnemyCombined, _)) => 54,
            ((TCF, Escort), (EnemySingle, _)) => 45,
            ((TCF, Escort), (EnemyCombined, _)) => 67,
            _ => 90,
        }
    } else {
        match ((player.org_type, player.role), (enemy.org_type, enemy.role)) {
            ((Single, _), (EnemySingle, _)) => 90,
            ((Single, _), (EnemyCombined, Main)) => 90,
            ((Single, _), (EnemyCombined, Escort)) => 75,

            ((CTF, Main), (EnemySingle, _)) => 88,
            ((CTF, Escort), (EnemySingle, _)) => 65,
            ((STF, Main), (EnemySingle, _)) => 65,
            ((STF, Escort), (EnemySingle, _)) => 75,
            ((TCF, Main), (EnemySingle, _)) => 88,
            ((TCF, Escort), (EnemySingle, _)) => 65,

            ((_, _), (EnemyCombined, Main)) => 88,
            ((_, _), (EnemyCombined, Escort)) => 75,
            _ => 90,
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

    impl From<(OrgType, Role)> for ShipPosition {
        fn from((org_type, role): (OrgType, Role)) -> Self {
            Self { org_type, role }
        }
    }

    #[test]
    fn test_get_shelling_power_factor() {
        let table = [
            (Single, EnemySingle, (0, 0), (0, 0)),
            (CTF, EnemySingle, (2, 10), (10, 5)),
            (STF, EnemySingle, (10, -5), (5, -5)),
            (TCF, EnemySingle, (-5, 10), (10, 5)),
            (Single, EnemyCombined, (5, 5), (10, -5)),
            (CTF, EnemyCombined, (2, -5), (10, -5)),
            (STF, EnemyCombined, (2, -5), (10, -5)),
            (TCF, EnemyCombined, (-5, -5), (10, -5)),
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
                org_type: CTF,
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
            ((Single, Main), (EnemySingle, Main), 90),
            ((CTF, Main), (EnemySingle, Main), 78),
            ((CTF, Main), (EnemyCombined, Main), 78),
            ((CTF, Escort), (EnemySingle, Main), 45),
            ((CTF, Escort), (EnemyCombined, Main), 67),
            ((STF, Main), (EnemySingle, Main), 45),
            ((STF, Main), (EnemyCombined, Main), 78),
            ((STF, Escort), (EnemySingle, Main), 67),
            ((STF, Escort), (EnemyCombined, Main), 67),
            ((TCF, Main), (EnemySingle, Main), 54),
            ((TCF, Main), (EnemyCombined, Main), 54),
            ((TCF, Escort), (EnemySingle, Main), 45),
            ((TCF, Escort), (EnemyCombined, Main), 67),
            ((EnemySingle, Main), (Single, Main), 90),
            ((EnemySingle, Main), (CTF, Main), 88),
            ((EnemySingle, Main), (CTF, Escort), 65),
            ((EnemySingle, Main), (STF, Main), 65),
            ((EnemySingle, Main), (STF, Escort), 75),
            ((EnemySingle, Main), (TCF, Main), 88),
            ((EnemySingle, Main), (TCF, Escort), 65),
            ((EnemyCombined, Main), (Single, Main), 90),
            ((EnemyCombined, Main), (CTF, Main), 88),
            ((EnemyCombined, Escort), (Single, Main), 75),
            ((EnemyCombined, Escort), (CTF, Main), 75),
        ];

        table.into_iter().for_each(|arg| {
            let attacker_side = arg.0 .0.side();

            let (player, enemy) = if attacker_side.is_player() {
                (arg.0.into(), arg.1.into())
            } else {
                (arg.1.into(), arg.0.into())
            };

            assert_eq!(
                get_shelling_accuracy_factor(player, enemy, attacker_side),
                arg.2,
                "{:#?}",
                arg
            );
        });
    }
}
