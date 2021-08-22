use serde::Serialize;
use strum::IntoEnumIterator;
use ts_rs::TS;

use crate::{
    attack::{AttackContext, AttackPower, ShipAttackContext},
    fleet::Fleet,
    org::Org,
    ship::Ship,
    types::{
        AirState, DamageState, DayCutin, DayCutinDef, Engagement, Formation,
        FormationAttackModifiers, MasterConstants, MoraleState, Role, SpecialEnemyType,
    },
};

pub fn create_attack_context<'a>(
    master_constants: &'a MasterConstants,
    attacker_ship: &'a Ship,
    target_ship: &'a Ship,
    engagement: Engagement,
    cutin: Option<DayCutin>,
    target_special_enemy_type: SpecialEnemyType,
) -> AttackContext<'a> {
    let attacker = ShipAttackContext {
        ship: attacker_ship,
        side: Default::default(),
        role: Default::default(),
        org_type: Default::default(),
        index: 0,
        fleet_len: 6,
        formation: Default::default(),
        morale_state: Default::default(),
        damage_state: Default::default(),
    };

    let target = ShipAttackContext::new(&target_ship);

    AttackContext {
        air_state: Default::default(),
        attacker,
        target,
        target_special_enemy_type,
        cutin,
        engagement,
        master_constants,
    }
}

pub struct AnalyzeShipShellingParams {
    formation: Formation,
    engagement: Engagement,
    special_enemy_type: SpecialEnemyType,
}

pub fn analyze_ship_shelling(
    master_constants: &MasterConstants,
    attacker_ship: &Ship,
    params: AnalyzeShipShellingParams,
) -> Vec<(Option<DayCutin>, AttackPower)> {
    let target_ship = Ship::default();

    let cutin_set = attacker_ship.get_possible_day_cutin_set();

    let result = cutin_set
        .iter()
        .map(Some)
        .chain([None])
        .filter_map(|cutin| {
            let ctx = create_attack_context(
                master_constants,
                attacker_ship,
                &target_ship,
                params.engagement,
                cutin,
                SpecialEnemyType::None,
            );

            let shelling_params = ctx.shelling_params();
            let attack_power = shelling_params.power.calc()?;

            Some((cutin, attack_power))
        })
        .collect::<Vec<_>>();

    result
}

struct ShellingContext {
    engagement: Engagement,
    formation: Formation,
    fleet_factor: f64,
    damage_state: DamageState,
    cutin: Option<DayCutin>,
    ship_index: usize,
    fleet_size: usize,
}

struct ShellingParamsBase {
    fleet_factors: (f64, f64),
    ap_shell_mods: Option<(f64, f64)>,
    formation_mods: FormationAttackModifiers,
    engagement: Engagement,
    damage_state: DamageState,
    morale_state: MoraleState,
    cutin_def: Option<DayCutinDef>,
    ship_index: usize,
    fleet_size: usize,

    fit_gun_bonus: Option<f64>,
}

#[derive(Debug, Default, Serialize, TS)]
pub struct DayCutinRateAnalysis {
    observation_term: Option<f64>,
    rates: Vec<(DayCutin, Option<f64>)>,
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

        let rates: Vec<(DayCutin, Option<f64>)> = cutin_set
            .iter()
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
            .collect();

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
