mod airstrike;
mod anti_air;
mod asw;
mod attack_info;
mod damage;
mod night;
mod shelling;
mod warfare_info;

use crate::{attack::NightSituation, org::Org, ship::Ship, types::MasterData};

pub use airstrike::*;
pub use anti_air::*;
pub use asw::*;
pub use attack_info::*;
pub use damage::*;
pub use night::*;
pub use shelling::*;
pub use warfare_info::*;

pub struct Analyzer<'a> {
    master_data: &'a MasterData,
}

impl<'a> Analyzer<'a> {
    pub fn new(master_data: &'a MasterData) -> Self {
        Self { master_data }
    }

    pub fn analyze_airstrike(&self, org: &Org) -> OrgAirstrikeInfo {
        airstrike::analyze_org(org)
    }

    pub fn analyze_anti_air(
        &self,
        org: &Org,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> OrgAntiAirInfo {
        let aa_analyzer = AntiAirAnalyzer::new(&self.master_data.constants.anti_air_cutins);

        aa_analyzer.analyze_org(org, adjusted_anti_air_resist, fleet_anti_air_resist)
    }

    pub fn analyze_day_cutin(&self, org: &Org) -> OrgDayCutinRateInfo {
        let s_analyzer = OrgShellingAnalyzer::new(&self.master_data.constants);

        s_analyzer.analyze_org(org)
    }

    pub fn analyze_night_cutin(
        &self,
        org: &Org,
        attacker_situation: NightSituation,
        defender_situation: NightSituation,
    ) -> OrgNightCutinRateInfo {
        let n_analyzer = NightAnalyzer::new(&self.master_data.constants);
        n_analyzer.analyze_org(org, attacker_situation, defender_situation)
    }

    pub fn analyze_warfare(
        &self,
        params: WarfareAnalysisParams,
        attacker: &Ship,
        target: &Ship,
    ) -> WarfareInfo {
        analyze_warfare(self.master_data, &params, attacker, target)
    }
}
