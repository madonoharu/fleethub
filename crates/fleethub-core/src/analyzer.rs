mod action_report;
mod anti_air_analyzer;
mod attack_analyzer;
mod attack_analyzer_config;
mod attack_report;
mod comp_analyzer;
mod contact_analyzer;
mod damage_report;
mod day_cutin_analyzer;
mod fleet_cutin_analyzer;
mod night_cutin_analyzer;
mod node_attack_analyzer;
mod ship_analyzer;

use wasm_bindgen::prelude::*;

pub use action_report::*;
pub use attack_analyzer::*;
pub use attack_analyzer_config::*;
pub use attack_report::*;
pub use comp_analyzer::*;
pub use damage_report::*;
pub use fleet_cutin_analyzer::*;
pub use node_attack_analyzer::*;
pub use ship_analyzer::*;

use crate::{
    battle::BattleComp,
    comp::Comp,
    ship::Ship,
    simulator::{SimulatorResult, SupportShellingSimulator},
    types::BattleDefinitions,
};

#[wasm_bindgen]
pub struct Analyzer {
    battle_defs: BattleDefinitions,
}

impl Analyzer {
    pub fn new(battle_defs: BattleDefinitions) -> Self {
        Self { battle_defs }
    }
}

#[wasm_bindgen]
impl Analyzer {
    pub fn analyze_attack(
        &self,
        config: AttackAnalyzerConfig,
        attacker: &Ship,
        target: &Ship,
    ) -> AttackAnalysis {
        let analyzer = AttackAnalyzer {
            battle_defs: &self.battle_defs,
            config,
            attacker,
            target,
        };

        analyzer.analyze()
    }

    pub fn analyze_attack_by_ship_analyzer(
        &self,
        config: ShipAnalyzerConfig,
        left: &Ship,
        right: &Ship,
        attacker_is_left: bool,
    ) -> AttackAnalysis {
        let config = config.into_attack_analyzer_config(attacker_is_left);

        let (attacker, target) = if attacker_is_left {
            (left, right)
        } else {
            (right, left)
        };

        self.analyze_attack(config, attacker, target)
    }

    pub fn analyze_node_attack(
        &self,
        config: NodeAttackAnalyzerConfig,
        left_comp: &Comp,
        left_ship: &Ship,
        right_comp: &Comp,
        right_ship: &Ship,
    ) -> NodeAttackAnalysis {
        let analyzer = NodeAttackAnalyzer {
            battle_defs: &self.battle_defs,
            config,
            left_comp,
            left_ship,
            right_comp,
            right_ship,
        };
        analyzer.analyze()
    }

    pub fn analyze_comp(&self, comp: &Comp, config: CompAnalyzerConfig) -> CompAnalysis {
        CompAnalyzer::new(&self.battle_defs, comp, config).analyze()
    }

    pub fn simulate_support_shelling(
        &self,
        player_comp: &Comp,
        enemy_comp: &Comp,
        config: NodeAttackAnalyzerConfig,
        times: usize,
    ) -> Result<SimulatorResult, JsValue> {
        use rand::prelude::*;

        let mut rng = SmallRng::from_entropy();
        let mut player = BattleComp::new(player_comp.clone(), config.left.formation);
        let mut enemy = BattleComp::new(enemy_comp.clone(), config.right.formation);

        let mut simulator = SupportShellingSimulator::new(
            &mut rng,
            &self.battle_defs,
            &mut player,
            &mut enemy,
            config.engagement,
        );

        simulator
            .run(times)
            .map_err(|err| JsValue::from(&err.to_string()))
    }
}
