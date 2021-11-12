use fh_macro::FhAbi;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    attack::{
        get_fleet_cutin, get_fleet_cutin_mod, NightAttackContext, NightSituation,
        ShellingAttackContext, ShellingAttackType, WarfareContext, WarfareShipEnvironment,
    },
    comp::Comp,
    fleet::Fleet,
    ship::Ship,
    types::{
        AirState, BattleConfig, Engagement, FleetCutin, Formation, NightAttackType,
        NightSpecialAttack, ShellingSpecialAttack, SpecialAttackDef,
    },
};

use super::AttackStats;

#[derive(Debug, Serialize, Deserialize, FhAbi, TS)]
pub struct FleetCutinInfoItem {
    ship_id: u16,
    cutin: FleetCutin,
    fleet_cutin_mod: f64,
    stats: AttackStats,
}

#[derive(Debug, Serialize, Deserialize, FhAbi, TS)]
pub struct FleetCutinInfo {
    cutin: FleetCutin,
    formation: Formation,
    items: Vec<FleetCutinInfoItem>,
}

#[derive(Debug, Serialize, Deserialize, FhAbi, TS)]
pub struct FleetCutinAnalysis {
    shelling: Vec<FleetCutinInfo>,
    night: Vec<FleetCutinInfo>,
}

pub struct FleetCutinAnalyzer<'a> {
    config: &'a BattleConfig,
    comp: Comp<'a>,
    engagement: Engagement,
    air_state: AirState,
    target: Ship,
    target_env: WarfareShipEnvironment,
    attacker_night_situation: NightSituation,
    target_night_situation: NightSituation,
}

impl<'a> FleetCutinAnalyzer<'a> {
    pub fn new(config: &'a BattleConfig, comp: Comp<'a>, engagement: Engagement) -> Self {
        Self {
            config,
            comp,
            engagement,
            air_state: Default::default(),
            target: Default::default(),
            target_env: Default::default(),
            attacker_night_situation: Default::default(),
            target_night_situation: Default::default(),
        }
    }

    fn get_fleet(&self, is_night: bool) -> &Fleet {
        if is_night {
            self.comp.night_fleet()
        } else {
            &self.comp.main
        }
    }

    fn create_warfare_context(
        &self,
        ship: &Ship,
        formation: Formation,
        engagement: Engagement,
    ) -> WarfareContext {
        let attacker_env = self.comp.create_warfare_ship_environment(ship, formation);

        let target_env = self.target_env.clone();
        let external_power_mods = Default::default();

        WarfareContext {
            attacker_env,
            target_env,
            engagement,
            air_state: self.air_state,
            external_power_mods,
        }
    }

    fn analyze_shelling(
        &self,
        fleet: &Fleet,
        cutin: FleetCutin,
        formation: Formation,
        engagement: Engagement,
    ) -> Vec<FleetCutinInfoItem> {
        let index_vec = cutin.ship_index_vec();

        let items = index_vec
            .into_iter()
            .enumerate()
            .map(|(count, ship_index)| {
                let shots = count + 1;
                let attacker = fleet
                    .ships
                    .get(ship_index)
                    .unwrap_or_else(|| unreachable!());

                let fleet_cutin_mod =
                    get_fleet_cutin_mod(cutin, engagement, shots, fleet, attacker);

                let warfare_context = self.create_warfare_context(attacker, formation, engagement);

                let sp_def = SpecialAttackDef {
                    kind: ShellingSpecialAttack::FleetCutin(cutin),
                    power_mod: fleet_cutin_mod,
                    accuracy_mod: 1.0,
                    hits: 1.0,
                };

                let attack_ctx = ShellingAttackContext::new(
                    self.config,
                    &warfare_context,
                    ShellingAttackType::Normal,
                    Some(sp_def),
                );

                let stats = attack_ctx
                    .attack_params(attacker, &self.target)
                    .into_stats();

                FleetCutinInfoItem {
                    ship_id: attacker.ship_id,
                    cutin,
                    fleet_cutin_mod,
                    stats,
                }
            })
            .collect::<Vec<_>>();

        items
    }

    fn analyze_night(
        &self,
        fleet: &Fleet,
        cutin: FleetCutin,
        formation: Formation,
        engagement: Engagement,
    ) -> Vec<FleetCutinInfoItem> {
        let index_vec = cutin.ship_index_vec();

        let items = index_vec
            .into_iter()
            .enumerate()
            .map(|(count, ship_index)| {
                let shots = count + 1;
                let attacker = fleet
                    .ships
                    .get(ship_index)
                    .unwrap_or_else(|| unreachable!());

                let fleet_cutin_mod =
                    get_fleet_cutin_mod(cutin, engagement, shots, fleet, attacker);

                let warfare_context = self.create_warfare_context(attacker, formation, engagement);

                let sp_def = SpecialAttackDef {
                    kind: NightSpecialAttack::FleetCutin(cutin),
                    power_mod: fleet_cutin_mod,
                    accuracy_mod: 1.0,
                    hits: 1.0,
                };

                let attack_ctx = NightAttackContext::new(
                    self.config,
                    &warfare_context,
                    &self.attacker_night_situation,
                    &self.target_night_situation,
                    NightAttackType::Normal,
                    Some(sp_def),
                );

                let stats = attack_ctx
                    .attack_params(attacker, &self.target)
                    .into_stats();

                FleetCutinInfoItem {
                    ship_id: attacker.ship_id,
                    cutin,
                    fleet_cutin_mod,
                    stats,
                }
            })
            .collect::<Vec<_>>();

        items
    }

    pub fn analyze(&self) -> FleetCutinAnalysis {
        let engagement = self.engagement;

        let shelling = Formation::iter()
            .filter_map(|formation| {
                let is_night = false;
                let fleet = self.get_fleet(is_night);
                let cutin = get_fleet_cutin(fleet, formation, is_night)?;

                let items = self.analyze_shelling(fleet, cutin, formation, engagement);

                Some(FleetCutinInfo {
                    cutin,
                    formation,
                    items,
                })
            })
            .collect::<Vec<_>>();

        let night = Formation::iter()
            .filter_map(|formation| {
                let is_night = true;
                let fleet = self.get_fleet(is_night);
                let cutin = get_fleet_cutin(fleet, formation, is_night)?;

                let items = self.analyze_night(fleet, cutin, formation, engagement);

                Some(FleetCutinInfo {
                    cutin,
                    formation,
                    items,
                })
            })
            .collect::<Vec<_>>();

        FleetCutinAnalysis { shelling, night }
    }
}
