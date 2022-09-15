use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    comp::Comp,
    ship::Ship,
    types::{
        AirState, BattleDefinitions, Engagement, Formation, NightAttackStyle, NightConditions,
        NightFleetConditions, ShellingStyle, Side,
    },
};

use super::{
    AttackAnalysis, AttackAnalyzer, AttackAnalyzerConfig, AttackAnalyzerShipConfig,
    FleetCutinAnalyzer, FleetCutinReport,
};

#[derive(Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct NodeAttackAnalysis {
    pub left: AttackAnalysis,
    pub right: AttackAnalysis,

    pub shelling_fleet_cutin: Vec<FleetCutinReport<ShellingStyle>>,
    pub night_fleet_cutin: Vec<FleetCutinReport<NightAttackStyle>>,
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
    pub fn analyze(&self) -> NodeAttackAnalysis {
        let left = self.analyze_attack(true);
        let right = self.analyze_attack(false);

        let (target_config, target_ship) =
            self.get_attack_analyzer_ship_config_and_ship(Align::Right);

        let fleet_cutin_analyzer = FleetCutinAnalyzer {
            battle_defs: self.battle_defs,
            engagement: self.config.engagement,
            comp: self.left_comp,
            target_ship,
            target_conditions: target_config.conditions,
        };

        let formation = self.config.left.formation;
        let night_conditions = self.config.get_night_conditions(self.left_comp.side());

        NodeAttackAnalysis {
            left,
            right,
            shelling_fleet_cutin: fleet_cutin_analyzer
                .analyze_shelling_attacks_by_formation(formation),
            night_fleet_cutin: fleet_cutin_analyzer
                .analyze_night_attacks_by_formation(formation, &night_conditions),
        }
    }

    fn get_attack_analyzer_ship_config_and_ship(
        &self,
        align: Align,
    ) -> (AttackAnalyzerShipConfig, &Ship) {
        let (comp, ship, config) = match align {
            Align::Left => {
                let comp = self.left_comp;
                let ship = self.left_ship;
                let config = &self.config.left;
                (comp, ship, config)
            }
            Align::Right => {
                let comp = self.right_comp;
                let ship = self.right_ship;
                let config = &self.config.right;
                (comp, ship, config)
            }
        };

        let conditions = comp.get_ship_conditions(ship, Some(config.formation));
        let fleet_los_mod = comp
            .get_fleet(conditions.position.fleet_type)
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
            (Align::Left, Align::Right)
        } else {
            (Align::Right, Align::Left)
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

impl NodeAttackAnalyzerConfig {
    pub(crate) fn get_night_conditions(&self, left_side: Side) -> NightConditions {
        if left_side.is_player() {
            NightConditions {
                player: self.left.night_fleet_conditions.clone(),
                enemy: self.right.night_fleet_conditions.clone(),
            }
        } else {
            NightConditions {
                player: self.right.night_fleet_conditions.clone(),
                enemy: self.left.night_fleet_conditions.clone(),
            }
        }
    }
}

#[derive(Default, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct NodeAttackAnalyzerShipConfig {
    pub formation: Formation,
    #[serde(flatten)]
    pub night_fleet_conditions: NightFleetConditions,
}

enum Align {
    Left,
    Right,
}
