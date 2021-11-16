use crate::{
    attack::NightSituation,
    org::Org,
    types::{BattleConfig, Formation},
};

use super::{
    airstrike, AntiAirAnalyzer, FleetNightCutinRateInfo, NightCutinRateAnalyzer, OrgAntiAirInfo,
    OrgContactChanceInfo, OrgDayCutinRateInfo, OrgShellingAnalyzer,
};

pub struct OrgAnalyzer<'a> {
    config: &'a BattleConfig,
}

impl<'a> OrgAnalyzer<'a> {
    pub fn new(config: &'a BattleConfig) -> Self {
        Self { config }
    }

    pub fn analyze_contact_chance(&self, org: &Org, key: &str) -> OrgContactChanceInfo {
        airstrike::analyze_org_contact_chance(org, key)
    }

    pub fn analyze_anti_air(
        &self,
        org: &Org,
        key: &str,
        formation: Formation,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> OrgAntiAirInfo {
        AntiAirAnalyzer::new(&self.config).analyze_org(
            org,
            key,
            formation,
            adjusted_anti_air_resist,
            fleet_anti_air_resist,
        )
    }

    pub fn analyze_day_cutin(&self, org: &Org, key: &str) -> OrgDayCutinRateInfo {
        OrgShellingAnalyzer::new(&self.config).analyze_org(org, key)
    }

    pub fn analyze_night_cutin(
        &self,
        org: &Org,
        key: &str,
        attacker_situation: NightSituation,
        defender_situation: NightSituation,
    ) -> FleetNightCutinRateInfo {
        let fleet = org.get_fleet_by_key(key);
        NightCutinRateAnalyzer::new(&self.config).analyze_fleet(
            fleet,
            &attacker_situation,
            &defender_situation,
        )
    }
}
