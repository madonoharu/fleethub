use serde::Serialize;
use ts_rs::TS;

use crate::{
    fleet::Fleet,
    org::Org,
    ship::Ship,
    types::{AirState, DayCutin, DayCutinDef, MasterConstants, Role},
};

#[derive(Debug, Default, Serialize, TS)]
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
        Self {
            ship_id: ship.ship_id,
            air_supremacy: DayCutinRateInfo::new(
                day_cutin_defs,
                ship,
                fleet_los_mod,
                is_main_flagship,
                AirState::AirSupremacy,
            ),
            air_superiority: DayCutinRateInfo::new(
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

#[derive(Debug, Default, Serialize, TS)]
pub struct OrgDayCutinRateInfo {
    main: FleetDayCutinRateInfo,
    escort: FleetDayCutinRateInfo,
}

pub struct OrgShellingAnalyzer<'a> {
    master_constants: &'a MasterConstants,
}

impl<'a> OrgShellingAnalyzer<'a> {
    pub fn new(master_constants: &'a MasterConstants) -> Self {
        Self { master_constants }
    }

    pub fn analyze_org(&self, org: &Org) -> OrgDayCutinRateInfo {
        let day_cutin_defs = &self.master_constants.day_cutins;

        OrgDayCutinRateInfo {
            main: FleetDayCutinRateInfo::new(day_cutin_defs, org.main(), Role::Main),
            escort: FleetDayCutinRateInfo::new(day_cutin_defs, org.escort(), Role::Escort),
        }
    }
}
