use serde::Serialize;
use tsify::Tsify;

use crate::{
    attack::{
        calc_fleet_cutin_rate, get_possible_fleet_cutin_effect_vec, NightAttackContext,
        ShellingAttackContext, ShellingAttackType, WarfareContext,
    },
    comp::Comp,
    ship::Ship,
    types::{
        AirState, BattleDefinitions, Engagement, FleetCutin, Formation, NightAttackType,
        NightSpecialAttack, ShellingSpecialAttack, ShipEnvironment, SpecialAttackDef,
    },
};

use super::AttackStats;

#[derive(Debug, Serialize, Tsify)]
pub struct FleetCutinInfoItem {
    ship_id: u16,
    cutin: FleetCutin,
    fleet_cutin_mod: f64,
    stats: AttackStats,
}

#[derive(Debug, Serialize, Tsify)]
pub struct FleetCutinInfo {
    cutin: FleetCutin,
    rate: Option<f64>,
    formation: Formation,
    items: Vec<FleetCutinInfoItem>,
}

#[derive(Debug, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct FleetCutinAnalysis {
    shelling: Vec<FleetCutinInfo>,
    night: Vec<FleetCutinInfo>,
}

pub struct FleetCutinAnalyzer<'a> {
    battle_defs: &'a BattleDefinitions,
    comp: &'a Comp,
    engagement: Engagement,
    air_state: AirState,
    enemy: Ship,
    enemy_env: ShipEnvironment,
}

impl<'a> FleetCutinAnalyzer<'a> {
    pub fn new(battle_defs: &'a BattleDefinitions, comp: &'a Comp, engagement: Engagement) -> Self {
        Self {
            battle_defs,
            comp,
            engagement,
            air_state: Default::default(),
            enemy: Default::default(),
            enemy_env: Default::default(),
        }
    }

    fn create_warfare_context(
        &self,
        ship: &Ship,
        formation: Formation,
        engagement: Engagement,
    ) -> WarfareContext {
        let attacker_env = self
            .comp
            .create_warfare_ship_environment(ship, Some(formation));
        let target_env = self.enemy_env.clone();

        WarfareContext {
            attacker_env,
            target_env,
            engagement,
            air_state: self.air_state,
        }
    }

    fn analyze_shelling(
        &self,
        ship: &Ship,
        formation: Formation,
        cutin: FleetCutin,
        fleet_cutin_mod: f64,
    ) -> FleetCutinInfoItem {
        let engagement = self.engagement;
        let warfare_context = self.create_warfare_context(ship, formation, engagement);

        let sp_def = SpecialAttackDef {
            kind: ShellingSpecialAttack::FleetCutin(cutin),
            power_mod: fleet_cutin_mod,
            accuracy_mod: 1.0,
            hits: 1.0,
        };

        let attack_ctx = ShellingAttackContext::new(
            self.battle_defs,
            &warfare_context,
            ShellingAttackType::Normal,
            Some(sp_def),
        );

        let stats = attack_ctx.attack_params(ship, &self.enemy).into_stats();

        FleetCutinInfoItem {
            ship_id: ship.ship_id,
            cutin,
            fleet_cutin_mod,
            stats,
        }
    }

    fn analyze_night(
        &self,
        ship: &Ship,
        formation: Formation,
        cutin: FleetCutin,
        fleet_cutin_mod: f64,
    ) -> FleetCutinInfoItem {
        let engagement = self.engagement;
        let warfare_context = self.create_warfare_context(ship, formation, engagement);

        let sp_def = SpecialAttackDef {
            kind: NightSpecialAttack::FleetCutin(cutin),
            power_mod: fleet_cutin_mod,
            accuracy_mod: 1.0,
            hits: 1.0,
        };

        let attack_ctx = NightAttackContext::new(
            self.battle_defs,
            &warfare_context,
            NightAttackType::Normal,
            Some(sp_def),
        );

        let stats = attack_ctx.attack_params(ship, &self.enemy).into_stats();

        FleetCutinInfoItem {
            ship_id: ship.ship_id,
            cutin,
            fleet_cutin_mod,
            stats,
        }
    }

    fn analyze_impl(&self, is_night: bool) -> Vec<FleetCutinInfo> {
        let fleet = if is_night {
            self.comp.night_fleet()
        } else {
            &self.comp.main
        };

        let engagement = self.engagement;

        Formation::iter()
            .flat_map(|formation| {
                let effect_vec =
                    get_possible_fleet_cutin_effect_vec(fleet, formation, engagement, is_night);

                effect_vec.into_iter().map(move |effect| {
                    let cutin = effect.cutin;
                    let rate = calc_fleet_cutin_rate(fleet, cutin);

                    let items = effect
                        .attacks
                        .into_iter()
                        .map(|(ship_index, fleet_cutin_mod)| {
                            let attacker = fleet
                                .ships
                                .get(ship_index)
                                .unwrap_or_else(|| unreachable!());

                            if is_night {
                                self.analyze_night(attacker, formation, cutin, fleet_cutin_mod)
                            } else {
                                self.analyze_shelling(attacker, formation, cutin, fleet_cutin_mod)
                            }
                        })
                        .collect::<Vec<_>>();

                    FleetCutinInfo {
                        cutin,
                        rate,
                        formation,
                        items,
                    }
                })
            })
            .collect()
    }

    pub fn analyze(&self) -> FleetCutinAnalysis {
        let shelling = self.analyze_impl(false);
        let night = self.analyze_impl(true);

        FleetCutinAnalysis { shelling, night }
    }
}
