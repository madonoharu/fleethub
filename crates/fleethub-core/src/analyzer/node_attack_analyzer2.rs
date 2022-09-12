use serde::Serialize;
use tsify::Tsify;

use crate::{
    comp::Comp,
    ship::Ship,
    types::{Align, BattleDefinitions, FleetType},
};

use super::{
    AttackAnalysis, AttackAnalyzer, AttackAnalyzerConfig, AttackAnalyzerShipConfig,
    NodeAttackAnalyzerConfig,
};

#[derive(Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct NodeAttackAnalysis2 {
    pub data: Vec<AttackAnalysis>,
}

pub struct NodeAttackAnalyzer<'a> {
    pub battle_defs: &'a BattleDefinitions,
    pub config: NodeAttackAnalyzerConfig,
    pub left_comp: &'a Comp,
    pub right_comp: &'a Comp,
}

impl NodeAttackAnalyzer<'_> {
    fn get_ship_config(&self, align: Align, ship: &Ship) -> AttackAnalyzerShipConfig {
        let (comp, config) = match align {
            Align::Left => (self.left_comp, &self.config.left),
            Align::Right => (self.right_comp, &self.config.right),
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

        attack_analyzer_ship_config
    }

    fn find_ship(&self, id: String) -> Option<(Align, &Ship)> {
        self.left_comp
            .ships()
            .find_map(|ship| (ship.id == id).then(|| (Align::Left, ship)))
            .or_else(|| {
                self.right_comp
                    .ships()
                    .find_map(|ship| (ship.id == id).then(|| (Align::Right, ship)))
            })
    }

    pub fn analyze(&self, id: String) -> Option<NodeAttackAnalysis2> {
        let (attacker_align, attacker) = self.find_ship(id)?;
        let attacker_config = self.get_ship_config(attacker_align, attacker);

        let target_align = !attacker_align;

        let target_comp = match target_align {
            Align::Left => self.left_comp,
            Align::Right => self.right_comp,
        };

        let data = target_comp
            .members_by(FleetType::Main | FleetType::Escort)
            .map(|ref target| {
                let target_config = self.get_ship_config(target_align, target);

                let config = AttackAnalyzerConfig {
                    air_state: self.config.air_state,
                    engagement: self.config.engagement,
                    attacker: attacker_config.clone(),
                    target: target_config,
                };

                AttackAnalyzer {
                    battle_defs: self.battle_defs,
                    config,
                    attacker,
                    target,
                }
                .analyze()
            })
            .collect();

        Some(NodeAttackAnalysis2 { data })
    }
}
