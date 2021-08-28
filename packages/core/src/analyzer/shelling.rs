use serde::Serialize;
use ts_rs::TS;

use crate::{
    attack::{
        shelling::ShellingParams, AttackPower, AttackPowerParams, DefenseParams, HitRate,
        HitRateParams, ShellingContext, WarfareContext,
    },
    fleet::Fleet,
    org::Org,
    ship::Ship,
    types::{
        AirState, DamageState, DayCutin, DayCutinDef, MasterConstants, MasterData, MoraleState,
        OrgType, Role,
    },
    utils::NumMap,
};

use super::{DamageAnalysis, DamageAnalyzer};

#[derive(Debug, Serialize, TS)]
pub struct ShellingAttackAnalysisItem {
    cutin: Option<DayCutin>,
    rate: Option<f64>,
    attack_power_params: Option<AttackPowerParams>,
    attack_power: Option<AttackPower>,
    hit_rate_params: Option<HitRateParams>,
    hit_rate: Option<HitRate>,
    damage: Option<DamageAnalysis>,
}

#[derive(Debug, Serialize, TS)]
pub struct ShellingAttackAnalysis {
    items: Vec<ShellingAttackAnalysisItem>,
    // ts_rsがうまく動かないので`Option<NumMap<DamageState, f64>>`を断念
    damage_state_map: NumMap<DamageState, f64>,
    damage_state_map_is_empty: bool,
}

pub fn analyze_ship_shelling(
    master_data: &MasterData,
    attacker: &Ship,
    target: &Ship,
    context_base: WarfareContext,
) -> ShellingAttackAnalysis {
    let WarfareContext {
        attacker: attacker_context,
        target: mut target_context,
        engagement,
        air_state,
    } = context_base;

    let is_main_flagship = attacker_context.role == Role::Main && attacker_context.ship_index == 0;

    let day_cutin_rate_analysis = DayCutinRateAnalysis::new(
        &master_data.constants.day_cutins,
        attacker,
        attacker_context.fleet_los_mod,
        is_main_flagship,
        air_state,
    );

    let overkill_protection =
        target_context.org_type.is_player() && target.morale_state() != MoraleState::Red;

    let sinkable = target_context.org_type.is_enemy();

    let items = day_cutin_rate_analysis
        .rates
        .into_iter()
        .map(|(cutin, rate)| {
            target_context.org_type = if attacker_context.org_type.is_player() {
                OrgType::EnemySingle
            } else {
                OrgType::Single
            };

            let context = ShellingContext {
                air_state: air_state,
                attacker: attacker_context.clone(),
                target: target_context.clone(),
                cutin,
                engagement,
                master_constants: &master_data.constants,
            };

            let params = ShellingParams::new(&context, attacker, target);

            let attack_power_params = params.to_attack_power_params();
            let attack_power = attack_power_params.as_ref().map(|p| p.calc());
            let hit_rate_params = params.hit_rate_params();
            let hit_rate = hit_rate_params.as_ref().map(|p| p.calc());

            let damage = || -> Option<_> {
                let defense_params = DefenseParams {
                    basic_defense_power: target.basic_defense_power(0.0)?,
                    max_hp: target.max_hp()?,
                    current_hp: target.current_hp,
                    overkill_protection,
                    sinkable,
                };

                let is_cutin = cutin.is_some();
                let hits = cutin
                    .and_then(|ci| Some(master_data.constants.get_day_cutin_def(ci)?.hits))
                    .unwrap_or(1) as usize;

                let attack_power = attack_power.as_ref()?;
                let hit_rate = hit_rate.as_ref()?;

                let damage = DamageAnalyzer {
                    attack_power,
                    hit_rate,
                    defense_params: &defense_params,
                    is_cutin,
                    hits,
                }
                .analyze();

                Some(damage)
            }();

            ShellingAttackAnalysisItem {
                cutin,
                rate,
                attack_power_params,
                attack_power,
                hit_rate_params,
                hit_rate,
                damage,
            }
        })
        .collect::<Vec<_>>();

    let damage_state_map = items
        .iter()
        .map(|data| {
            let rate = data.rate?;
            Some(data.damage.as_ref()?.damage_state_map.clone() * rate)
        })
        .sum::<Option<NumMap<DamageState, f64>>>()
        .unwrap_or_else(|| NumMap::new());

    let damage_state_map_is_empty = damage_state_map.is_empty();

    ShellingAttackAnalysis {
        items,
        damage_state_map,
        damage_state_map_is_empty,
    }
}

#[derive(Debug, Default, Serialize, TS)]
pub struct DayCutinRateAnalysis {
    observation_term: Option<f64>,
    rates: Vec<(Option<DayCutin>, Option<f64>)>,
    total_cutin_rate: Option<f64>,
}

impl DayCutinRateAnalysis {
    fn new(
        day_cutin_defs: &Vec<DayCutinDef>,
        ship: &Ship,
        fleet_los_mod: Option<f64>,
        is_main_flagship: bool,
        air_state: AirState,
    ) -> Self {
        let observation_term =
            fleet_los_mod.and_then(|v| ship.calc_observation_term(v, is_main_flagship, air_state));

        let mut total_cutin_rate = Some(0.0);

        let cutin_set = ship.get_possible_day_cutin_set();

        let mut rates = cutin_set
            .into_iter()
            .map(|ci| {
                let ci_def = day_cutin_defs.iter().find(|def| def.tag == ci).unwrap();

                let actual_rate = if let (Some(o), Some(d), Some(t)) =
                    (observation_term, ci_def.chance_denom, total_cutin_rate)
                {
                    let base_rate = (o / d as f64).min(1.0);
                    let actual_rate = (1.0 - t) * base_rate;

                    total_cutin_rate = Some(t + actual_rate);
                    Some(actual_rate)
                } else {
                    total_cutin_rate = None;
                    None
                };

                (ci, actual_rate)
            })
            .map(|(ci, rate)| (Some(ci), rate))
            .collect::<Vec<_>>();

        let normal_attack_rate = total_cutin_rate.clone().map(|r| 1.0 - r);
        rates.insert(0, (None, normal_attack_rate));

        Self {
            observation_term,
            total_cutin_rate,
            rates,
        }
    }
}

#[derive(Debug, Default, Serialize, TS)]
pub struct ShipDayCutinRateAnalysis {
    ship_id: u16,
    air_supremacy: DayCutinRateAnalysis,
    air_superiority: DayCutinRateAnalysis,
}

impl ShipDayCutinRateAnalysis {
    fn new(
        day_cutin_defs: &Vec<DayCutinDef>,
        ship: &Ship,
        fleet_los_mod: Option<f64>,
        is_main_flagship: bool,
    ) -> Self {
        Self {
            ship_id: ship.ship_id,
            air_supremacy: DayCutinRateAnalysis::new(
                day_cutin_defs,
                ship,
                fleet_los_mod,
                is_main_flagship,
                AirState::AirSupremacy,
            ),
            air_superiority: DayCutinRateAnalysis::new(
                day_cutin_defs,
                ship,
                fleet_los_mod,
                is_main_flagship,
                AirState::AirSuperiority,
            ),
        }
    }

    fn non_empty(&self) -> bool {
        !self.air_supremacy.rates.is_empty()
    }
}

#[derive(Debug, Default, Serialize, TS)]
pub struct FleetDayCutinRateAnalysis {
    fleet_los_mod: Option<f64>,
    ships: Vec<ShipDayCutinRateAnalysis>,
}

impl FleetDayCutinRateAnalysis {
    pub fn new(day_cutin_defs: &Vec<DayCutinDef>, fleet: &Fleet, role: Role) -> Self {
        let fleet_los_mod = fleet.fleet_los_mod();

        let ships = fleet
            .ships
            .iter()
            .map(|(index, ship)| {
                let is_main_flagship = role == Role::Main && index == 0;
                ShipDayCutinRateAnalysis::new(day_cutin_defs, ship, fleet_los_mod, is_main_flagship)
            })
            .filter(|analysis| analysis.non_empty())
            .collect();

        Self {
            fleet_los_mod,
            ships,
        }
    }
}

#[derive(Debug, Default, Serialize, TS)]
pub struct OrgDayCutinRateAnalysis {
    main: FleetDayCutinRateAnalysis,
    escort: FleetDayCutinRateAnalysis,
}

pub struct OrgShellingAnalyzer<'a> {
    master_constants: &'a MasterConstants,
}

impl<'a> OrgShellingAnalyzer<'a> {
    pub fn new(master_constants: &'a MasterConstants) -> Self {
        Self { master_constants }
    }

    pub fn analyze_org(&self, org: &Org) -> OrgDayCutinRateAnalysis {
        let day_cutin_defs = &self.master_constants.day_cutins;

        OrgDayCutinRateAnalysis {
            main: FleetDayCutinRateAnalysis::new(day_cutin_defs, org.main(), Role::Main),
            escort: FleetDayCutinRateAnalysis::new(day_cutin_defs, org.escort(), Role::Escort),
        }
    }
}
