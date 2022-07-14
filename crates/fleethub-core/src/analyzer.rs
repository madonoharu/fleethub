mod airstrike;
mod anti_air;
mod asw2;
mod attack_info;
mod damage;
mod fleet_cutin_analyzer;
mod night;
mod shelling;
mod warfare_analyzer;
mod warfare_info;

pub use airstrike::*;
pub use anti_air::*;
pub use attack_info::*;
pub use damage::*;
pub use fleet_cutin_analyzer::*;
pub use night::*;
pub use shelling::*;
pub use warfare_info::*;

use wasm_bindgen::prelude::*;

use crate::{
    attack::WarfareContext,
    comp::Comp,
    ship::Ship,
    types::{BattleDefinitions, Engagement, Formation, NightConditions},
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
    pub fn analyze_anti_air(
        &self,
        comp: &Comp,
        formation: Formation,
        ship_anti_air_resist: f64,
        fleet_anti_air_resist: f64,
        aaci: Option<u8>,
    ) -> CompAntiAirInfo {
        CompAntiAirInfo::new(
            comp,
            &self.battle_defs,
            formation,
            ship_anti_air_resist,
            fleet_anti_air_resist,
            aaci,
        )
    }

    pub fn analyze_day_cutin(&self, comp: &Comp) -> CompDayCutinRateInfo {
        CompDayCutinRateInfo::new(comp, &self.battle_defs)
    }

    pub fn analyze_night_cutin(
        &self,
        comp: &Comp,
        attacker_conditions: NightConditions,
        target_conditions: NightConditions,
    ) -> FleetNightCutinRateInfo {
        FleetNightCutinRateInfo::new(
            comp,
            &self.battle_defs,
            &attacker_conditions,
            &target_conditions,
        )
    }

    pub fn analyze_contact_chance(&self, comp: &Comp) -> CompContactChanceInfo {
        CompContactChanceInfo::new(comp)
    }

    pub fn analyze_warfare(
        &self,
        params: WarfareContext,
        attacker: &Ship,
        target: &Ship,
    ) -> WarfareInfo {
        let analyzer = WarfareAnalyzer::new(&self.battle_defs, &params, attacker, target);
        analyzer.analyze()
    }

    pub fn analyze_fleet_cutin(&self, comp: &Comp, engagement: Engagement) -> FleetCutinAnalysis {
        FleetCutinAnalyzer::new(&self.battle_defs, comp, engagement).analyze()
    }
}
