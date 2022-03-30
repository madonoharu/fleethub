use serde::Serialize;
use tsify::Tsify;

use crate::{
    comp::Comp,
    fleet::Fleet,
    ship::Ship,
    types::{AirStateRank, BattleConfig, DayCutin, DayCutinDef, Role},
};

#[derive(Debug, Default, Serialize, Tsify)]
pub struct DayCutinRateInfo {
    pub observation_term: Option<f64>,
    pub rates: Vec<(Option<DayCutin>, Option<f64>)>,
    pub total_cutin_rate: Option<f64>,
}

impl DayCutinRateInfo {
    pub fn new(
        day_cutin_defs: &Vec<DayCutinDef>,
        ship: &Ship,
        fleet_los_mod: Option<f64>,
        is_main_flagship: bool,
        air_state_rank: AirStateRank,
        anti_inst: bool,
    ) -> Self {
        let observation_term = fleet_los_mod
            .and_then(|v| ship.calc_observation_term(v, is_main_flagship, air_state_rank));

        let mut total_cutin_rate = Some(0.0);

        let cutin_set = ship.get_possible_day_cutin_set(anti_inst);

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

#[derive(Debug, Default, Serialize, Tsify)]
pub struct ShipDayCutinRateInfo {
    ship_id: u16,
    air_supremacy: DayCutinRateInfo,
    air_superiority: DayCutinRateInfo,
}

impl ShipDayCutinRateInfo {
    fn new(
        day_cutin_defs: &Vec<DayCutinDef>,
        ship: &Ship,
        fleet_los_mod: Option<f64>,
        is_main_flagship: bool,
    ) -> Self {
        let anti_inst = false;

        Self {
            ship_id: ship.ship_id,
            air_supremacy: DayCutinRateInfo::new(
                day_cutin_defs,
                ship,
                fleet_los_mod,
                is_main_flagship,
                AirStateRank::Rank3,
                anti_inst,
            ),
            air_superiority: DayCutinRateInfo::new(
                day_cutin_defs,
                ship,
                fleet_los_mod,
                is_main_flagship,
                AirStateRank::Rank2,
                anti_inst,
            ),
        }
    }

    fn non_empty(&self) -> bool {
        !self.air_supremacy.rates.is_empty()
    }
}

#[derive(Debug, Default, Serialize, Tsify)]
pub struct FleetDayCutinRateInfo {
    fleet_los_mod: Option<f64>,
    ships: Vec<ShipDayCutinRateInfo>,
}

impl FleetDayCutinRateInfo {
    pub fn new(day_cutin_defs: &Vec<DayCutinDef>, fleet: &Fleet, role: Role) -> Self {
        let fleet_los_mod = fleet.fleet_los_mod();

        let ships = fleet
            .ships
            .iter()
            .map(|(index, ship)| {
                let is_main_flagship = role == Role::Main && index == 0;
                ShipDayCutinRateInfo::new(day_cutin_defs, ship, fleet_los_mod, is_main_flagship)
            })
            .filter(|info| info.non_empty())
            .collect();

        Self {
            fleet_los_mod,
            ships,
        }
    }
}

#[derive(Debug, Default, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct CompDayCutinRateInfo {
    main: FleetDayCutinRateInfo,
    escort: Option<FleetDayCutinRateInfo>,
}

impl CompDayCutinRateInfo {
    pub fn new(comp: &Comp, config: &BattleConfig) -> Self {
        let day_cutin_defs = &config.day_cutin;

        Self {
            main: FleetDayCutinRateInfo::new(day_cutin_defs, &comp.main, Role::Main),
            escort: comp
                .escort
                .as_ref()
                .map(|fleet| FleetDayCutinRateInfo::new(day_cutin_defs, fleet, Role::Escort)),
        }
    }
}
