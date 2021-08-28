mod airstrike;
mod anti_air;
mod damage;
mod night;
mod shelling;

use crate::{
    attack::{WarfareContext, WarfareSideState},
    org::Org,
    ship::Ship,
    types::{AirState, Engagement, Formation, MasterData, Side},
};

pub use airstrike::*;
pub use anti_air::*;
pub use damage::*;
pub use night::*;
pub use shelling::*;

pub struct Analyzer<'a> {
    master_data: &'a MasterData,
}

impl<'a> Analyzer<'a> {
    pub fn new(master_data: &'a MasterData) -> Self {
        Self { master_data }
    }

    pub fn analyze_airstrike(&self, org: &Org) -> OrgAirstrikeAnalysis {
        airstrike::analyze_org(org)
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

    pub fn analyze_warfare(
        &self,
        player_org: &Org,
        player_ship: &Ship,
        player_formation: Formation,
        enemy_org: &Org,
        enemy_ship: &Ship,
        enemy_formation: Formation,
        attacker_side: Side,
        air_state: AirState,
        engagement: Engagement,
    ) -> Option<ShellingAttackAnalysis> {
        let (attacker_context, target_context, attacker, target) = if attacker_side.is_player() {
            (
                create_ship_warfare_context(player_org, player_ship, player_formation)?,
                create_ship_warfare_context(enemy_org, enemy_ship, enemy_formation)?,
                player_ship,
                enemy_ship,
            )
        } else {
            (
                create_ship_warfare_context(enemy_org, enemy_ship, enemy_formation)?,
                create_ship_warfare_context(player_org, player_ship, player_formation)?,
                enemy_ship,
                player_ship,
            )
        };

        let context = WarfareContext {
            attacker: attacker_context,
            target: target_context,
            air_state,
            engagement,
        };

        Some(analyze_ship_shelling(
            self.master_data,
            attacker,
            target,
            context,
        ))
    }
}

fn create_ship_warfare_context(
    org: &Org,
    ship: &Ship,
    formation: Formation,
) -> Option<WarfareSideState> {
    let (role, ship_index) = org.find_role_index(ship)?;

    Some(WarfareSideState {
        org_type: org.org_type,
        fleet_len: org.fleet_len(role),
        ship_index,
        role,
        formation,
        fleet_los_mod: org.fleet_los_mod(role),
    })
}
