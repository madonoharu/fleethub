mod airstrike;
mod anti_air;
mod asw;
mod attack_info;
mod damage;
mod fleet_cutin_analyzer;
mod night;
mod shelling;
mod warfare_info;

pub use airstrike::*;
pub use anti_air::*;
pub use asw::*;
pub use attack_info::*;
pub use damage::*;
pub use fleet_cutin_analyzer::*;
pub use night::*;
pub use shelling::*;
pub use warfare_info::*;

use wasm_bindgen::prelude::*;

use crate::{
    attack::NightSituation,
    comp::Comp,
    ship::Ship,
    types::{BattleConfig, Engagement, Formation},
};

#[wasm_bindgen]
pub struct Analyzer {
    config: BattleConfig,
}

impl Analyzer {
    pub fn new(config: BattleConfig) -> Self {
        Self { config }
    }
}

#[wasm_bindgen]
impl Analyzer {
    pub fn analyze_anti_air(
        &self,
        comp: &Comp,
        formation: Formation,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
        aaci: Option<u8>,
    ) -> CompAntiAirInfo {
        CompAntiAirInfo::new(
            comp,
            &self.config,
            formation,
            adjusted_anti_air_resist,
            fleet_anti_air_resist,
            aaci,
        )
    }

    pub fn analyze_day_cutin(&self, comp: &Comp) -> CompDayCutinRateInfo {
        CompDayCutinRateInfo::new(comp, &self.config)
    }

    pub fn analyze_night_cutin(
        &self,
        comp: &Comp,
        attacker_situation: NightSituation,
        target_situation: NightSituation,
    ) -> FleetNightCutinRateInfo {
        FleetNightCutinRateInfo::new(comp, &self.config, &attacker_situation, &target_situation)
    }

    pub fn analyze_contact_chance(&self, comp: &Comp) -> CompContactChanceInfo {
        CompContactChanceInfo::new(comp)
    }

    pub fn analyze_warfare(
        &self,
        params: WarfareAnalyzerContext,
        attacker: &Ship,
        target: &Ship,
    ) -> WarfareInfo {
        let analyzer = WarfareAnalyzer::new(&self.config, &params, attacker, target);
        analyzer.analyze()
    }

    pub fn analyze_fleet_cutin(&self, comp: &Comp, engagement: Engagement) -> FleetCutinAnalysis {
        FleetCutinAnalyzer::new(&self.config, comp, engagement).analyze()
    }
}
