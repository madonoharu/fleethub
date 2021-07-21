mod anti_air;
mod night;
mod shelling;
mod airstrike;

use crate::{org::Org, types::MasterData};

pub use anti_air::*;
pub use night::*;
pub use shelling::*;

pub struct Analyzer<'a> {
    master_data: &'a MasterData,
}

impl<'a> Analyzer<'a> {
    pub fn new(master_data: &'a MasterData) -> Self {
        Self { master_data }
    }

    pub fn analyze_anti_air(
        &self,
        org: &Org,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> OrgAntiAirAnalysis {
        let aa_analyzer = AntiAirAnalyzer::new(&self.master_data.constants.anti_air_cutins);

        aa_analyzer.analyze_org(org, adjusted_anti_air_resist, fleet_anti_air_resist)
    }

    pub fn analyze_day_cutin(&self, org: &Org) -> OrgDayCutinRateAnalysis {
        let s_analyzer = OrgShellingAnalyzer::new(&self.master_data.constants);

        s_analyzer.analyze_org(org)
    }

    pub fn analyze_night_cutin(
        &self,
        org: &Org,
        attacker_fleet_state: NightCutinFleetState,
        defender_fleet_state: NightCutinFleetState,
    ) -> OrgNightCutinRateAnalysis {
        let n_analyzer = NightAnalyzer::new(&self.master_data.constants);
        n_analyzer.analyze_org(org, attacker_fleet_state, defender_fleet_state)
    }
}
