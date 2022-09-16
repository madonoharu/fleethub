use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::types::{
    AirState, Engagement, NightConditions, NightFleetConditions, NodeState, OrgType,
    ShipConditions, ShipPosition, Side,
};

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct AttackAnalyzerShipConfig {
    #[serde(flatten)]
    pub conditions: ShipConditions,
    pub fleet_los_mod: Option<f64>,
    #[serde(flatten)]
    pub night_fleet_conditions: NightFleetConditions,
}

impl AttackAnalyzerShipConfig {
    pub fn dummy_enemy() -> Self {
        Self {
            conditions: ShipConditions {
                position: ShipPosition {
                    org_type: OrgType::EnemySingle,
                    ..Default::default()
                },
                ..Default::default()
            },
            ..Default::default()
        }
    }

    pub fn side(&self) -> Side {
        self.conditions.side()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct AttackAnalyzerConfig {
    pub air_state: AirState,
    pub engagement: Engagement,
    pub node_state: NodeState,
    pub attacker: AttackAnalyzerShipConfig,
    pub target: AttackAnalyzerShipConfig,
}

impl Default for AttackAnalyzerConfig {
    fn default() -> Self {
        let attacker = AttackAnalyzerShipConfig::default();
        let mut target = AttackAnalyzerShipConfig::default();

        let attacker_side = attacker.side();
        if attacker_side == target.side() {
            target.conditions.position.org_type = if attacker_side.is_player() {
                OrgType::EnemySingle
            } else {
                OrgType::Single
            };
        }

        Self {
            air_state: Default::default(),
            engagement: Default::default(),
            node_state: Default::default(),
            attacker,
            target,
        }
    }
}

impl AttackAnalyzerConfig {
    fn get_ship_config_by_side(&self, side: Side) -> &AttackAnalyzerShipConfig {
        if self.attacker.side() == side {
            &self.attacker
        } else {
            &self.target
        }
    }

    pub fn night_conditions(&self) -> NightConditions {
        NightConditions {
            player: self
                .get_ship_config_by_side(Side::Player)
                .night_fleet_conditions
                .clone(),
            enemy: self
                .get_ship_config_by_side(Side::Enemy)
                .night_fleet_conditions
                .clone(),
        }
    }
}
