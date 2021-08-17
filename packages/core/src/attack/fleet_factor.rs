use crate::types::{OrgType, Role, Side};

struct FleetFactorRule {
    player: OrgType,
    enemy: OrgType,
    player_factors: (i32, i32),
    enemy_factors: (i32, i32),
}

impl FleetFactorRule {
    fn find_factor(
        &self,
        player_org_type: OrgType,
        enemy_org_type: OrgType,
        side: Side,
        role: Role,
    ) -> Option<i32> {
        (self.player == player_org_type && self.enemy == enemy_org_type).then(|| {
            let factors = if side.is_player() {
                self.player_factors
            } else {
                self.enemy_factors
            };

            if role.is_main() {
                factors.0
            } else {
                factors.1
            }
        })
    }
}

const SHELLING_POWER_RULES: [FleetFactorRule; 7] = [
    FleetFactorRule {
        player: OrgType::Single,
        enemy: OrgType::EnemyCombined,
        player_factors: (5, 5),
        enemy_factors: (10, -5),
    },
    FleetFactorRule {
        player: OrgType::CarrierTaskForce,
        enemy: OrgType::Single,
        player_factors: (2, 10),
        enemy_factors: (10, 5),
    },
    FleetFactorRule {
        player: OrgType::SurfaceTaskForce,
        enemy: OrgType::Single,
        player_factors: (10, -5),
        enemy_factors: (5, -5),
    },
    FleetFactorRule {
        player: OrgType::TransportEscort,
        enemy: OrgType::Single,
        player_factors: (-5, 10),
        enemy_factors: (10, 5),
    },
    FleetFactorRule {
        player: OrgType::CarrierTaskForce,
        enemy: OrgType::EnemyCombined,
        player_factors: (2, -5),
        enemy_factors: (10, -5),
    },
    FleetFactorRule {
        player: OrgType::SurfaceTaskForce,
        enemy: OrgType::EnemyCombined,
        player_factors: (2, -5),
        enemy_factors: (10, -5),
    },
    FleetFactorRule {
        player: OrgType::TransportEscort,
        enemy: OrgType::EnemyCombined,
        player_factors: (-5, -5),
        enemy_factors: (10, -5),
    },
];

pub fn find_shelling_power_factor(
    player_org_type: OrgType,
    enemy_org_type: OrgType,
    side: Side,
    role: Role,
) -> i32 {
    SHELLING_POWER_RULES
        .iter()
        .find_map(|rule| rule.find_factor(player_org_type, enemy_org_type, side, role))
        .unwrap_or_default()
}

pub fn find_shelling_accuracy_factor(org_type: OrgType, side: Side, role: Role) -> i32 {
    if side.is_enemy() {
        return 0;
    }

    let factors = match org_type {
        OrgType::CarrierTaskForce => (78, 43),
        OrgType::SurfaceTaskForce => (46, 70),
        OrgType::TransportEscort => (51, 46),
        _ => return 0,
    };

    if role.is_main() {
        factors.0
    } else {
        factors.1
    }
}

pub fn find_torpedo_power_factor(player_org_type: OrgType, enemy_org_type: OrgType) -> i32 {
    if enemy_org_type.is_combined() {
        15
    } else if player_org_type.is_single() {
        5
    } else {
        0
    }
}
