use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    comp::Comp,
    ship::Ship,
    types::{AirState, BattleDefinitions, Engagement, Formation, NightFleetConditions},
};

use super::{AttackAnalysis, AttackAnalyzer, AttackAnalyzerConfig, AttackAnalyzerShipConfig};

#[derive(Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct NodeAttackAnalysis {
    pub left: AttackAnalysis,
    pub right: AttackAnalysis,
}

pub struct NodeAttackAnalyzer<'a> {
    pub battle_defs: &'a BattleDefinitions,
    pub config: NodeAttackAnalyzerConfig,
    pub left_comp: &'a Comp,
    pub left_ship: &'a Ship,
    pub right_comp: &'a Comp,
    pub right_ship: &'a Ship,
}

impl NodeAttackAnalyzer<'_> {
    fn get_attack_analyzer_ship_config_and_ship(
        &self,
        side: ColumnSide,
    ) -> (AttackAnalyzerShipConfig, &Ship) {
        let (comp, ship, config) = match side {
            ColumnSide::Left => {
                let comp = self.left_comp;
                let ship = self.left_ship;
                let config = &self.config.left;
                (comp, ship, config)
            }
            ColumnSide::Right => {
                let comp = self.right_comp;
                let ship = self.right_ship;
                let config = &self.config.right;
                (comp, ship, config)
            }
        };

        let conditions = comp.get_ship_conditions(ship, Some(config.formation));
        let fleet_los_mod = comp
            .get_fleet(conditions.position.role)
            .and_then(|fleet| fleet.fleet_los_mod());

        let attack_analyzer_ship_config = AttackAnalyzerShipConfig {
            conditions,
            fleet_los_mod,
            night_fleet_conditions: config.night_fleet_conditions.clone(),
        };

        (attack_analyzer_ship_config, ship)
    }

    fn analyze_attack(&self, attacker_is_left: bool) -> AttackAnalysis {
        let (attacker_side, target_side) = if attacker_is_left {
            (ColumnSide::Left, ColumnSide::Right)
        } else {
            (ColumnSide::Right, ColumnSide::Left)
        };

        let (attacker_config, attacker_ship) =
            self.get_attack_analyzer_ship_config_and_ship(attacker_side);
        let (target_config, target_ship) =
            self.get_attack_analyzer_ship_config_and_ship(target_side);

        let config = AttackAnalyzerConfig {
            air_state: self.config.air_state,
            engagement: self.config.engagement,
            attacker: attacker_config,
            target: target_config,
        };

        AttackAnalyzer {
            battle_defs: self.battle_defs,
            config,
            attacker: attacker_ship,
            target: target_ship,
        }
        .analyze()
    }

    pub fn analyze(&self) -> NodeAttackAnalysis {
        let left = self.analyze_attack(true);
        let right = self.analyze_attack(false);

        NodeAttackAnalysis { left, right }
    }
}

#[derive(Default, Serialize, Deserialize, Tsify)]
#[serde(default)]
#[tsify(from_wasm_abi)]
pub struct NodeAttackAnalyzerConfig {
    pub air_state: AirState,
    pub engagement: Engagement,
    pub left: NodeAttackAnalyzerShipConfig,
    pub right: NodeAttackAnalyzerShipConfig,
}

#[derive(Default, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct NodeAttackAnalyzerShipConfig {
    pub formation: Formation,
    #[serde(flatten)]
    pub night_fleet_conditions: NightFleetConditions,
}

enum ColumnSide {
    Left,
    Right,
}
