use serde::{Deserialize, Serialize};
use strum_macros::ToString;
use ts_rs::TS;
use wasm_bindgen::prelude::*;

use crate::{
    air_squadron::{AirSquadron, AirSquadronState},
    anti_air::OrgAntiAirAnalysis,
    array::ShipArray,
    fleet::{Fleet, FleetState},
    ship::Ship,
    types::{AirState, DayCutin},
};

#[derive(Debug, Clone, Copy, PartialEq, Hash, ToString, Deserialize, TS)]
pub enum OrgType {
    Single,
    CarrierTaskForce,
    SurfaceTaskForce,
    TransportEscort,
    EnemyCombined,
}

impl Default for OrgType {
    fn default() -> Self {
        OrgType::Single
    }
}

impl OrgType {
    pub fn is_combined(&self) -> bool {
        matches!(
            *self,
            Self::CarrierTaskForce
                | Self::SurfaceTaskForce
                | Self::TransportEscort
                | Self::EnemyCombined,
        )
    }
}

#[derive(Debug, PartialEq)]
pub enum Role {
    Main,
    Escort,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, TS)]
pub enum Side {
    Player,
    Enemy,
}

impl Default for Side {
    fn default() -> Self {
        Self::Player
    }
}

impl Side {
    pub fn is_player(&self) -> bool {
        *self == Self::Player
    }

    pub fn is_enemy(&self) -> bool {
        !self.is_player()
    }
}

pub struct MainAndEscortShips<'a> {
    count: usize,
    is_combined: bool,
    main_ships: &'a ShipArray,
    escort_ships: &'a ShipArray,
}

impl<'a> Iterator for MainAndEscortShips<'a> {
    type Item = (Role, usize, &'a Ship);

    fn next(&mut self) -> Option<Self::Item> {
        let count = self.count;
        self.count += 1;

        let (role, index, ships) = if count < ShipArray::CAPACITY {
            (Role::Main, count, self.main_ships)
        } else if self.is_combined && count < ShipArray::CAPACITY * 2 {
            (Role::Escort, count - ShipArray::CAPACITY, self.escort_ships)
        } else {
            return None;
        };

        if let Some(ship) = ships.get(index) {
            Some((role, index, ship))
        } else {
            self.next()
        }
    }
}

#[derive(Debug, Default, Clone, Hash, Deserialize, TS)]
pub struct OrgState {
    pub id: Option<String>,

    pub f1: Option<FleetState>,
    pub f2: Option<FleetState>,
    pub f3: Option<FleetState>,
    pub f4: Option<FleetState>,

    pub a1: Option<AirSquadronState>,
    pub a2: Option<AirSquadronState>,
    pub a3: Option<AirSquadronState>,

    pub hq_level: Option<i32>,
    pub org_type: Option<OrgType>,
    pub side: Option<Side>,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Org {
    #[wasm_bindgen(skip)]
    pub xxh3: u64,

    #[wasm_bindgen(skip)]
    pub id: String,

    #[wasm_bindgen(skip)]
    pub f1: Fleet,
    #[wasm_bindgen(skip)]
    pub f2: Fleet,
    #[wasm_bindgen(skip)]
    pub f3: Fleet,
    #[wasm_bindgen(skip)]
    pub f4: Fleet,

    #[wasm_bindgen(skip)]
    pub a1: AirSquadron,
    #[wasm_bindgen(skip)]
    pub a2: AirSquadron,
    #[wasm_bindgen(skip)]
    pub a3: AirSquadron,

    pub hq_level: i32,

    #[wasm_bindgen(skip)]
    pub org_type: OrgType,

    #[wasm_bindgen(skip)]
    pub side: Side,
}

impl Org {
    pub fn main(&self) -> &Fleet {
        &self.f1
    }

    pub fn escort(&self) -> &Fleet {
        &self.f2
    }

    pub fn main_and_escort_ships(&self) -> MainAndEscortShips {
        MainAndEscortShips {
            count: 0,
            is_combined: self.is_combined(),
            main_ships: &self.main().ships,
            escort_ships: &self.escort().ships,
        }
    }
}

#[wasm_bindgen]
impl Org {
    #[wasm_bindgen(getter)]
    pub fn xxh3(&self) -> String {
        format!("{:X}", self.xxh3)
    }

    #[wasm_bindgen(getter)]
    pub fn id(&self) -> String {
        self.id.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn org_type(&self) -> String {
        self.org_type.to_string()
    }

    pub fn get_fleet(&self, key: &str) -> Result<Fleet, JsValue> {
        let fleet = match key {
            "f1" => &self.f1,
            "f2" => &self.f2,
            "f3" => &self.f3,
            "f4" => &self.f4,
            _ => {
                return Err(JsValue::from_str(
                    r#"get_fleet() argument must be "f1", "f2", "f3" or "f4""#,
                ))
            }
        };

        Ok(fleet.clone())
    }

    pub fn get_air_squadron(&self, key: &str) -> Result<AirSquadron, JsValue> {
        let air_squadron = match key {
            "a1" => &self.a1,
            "a2" => &self.a2,
            "a3" => &self.a3,
            _ => {
                return Err(JsValue::from_str(
                    r#"get_air_squadron() argument must be "a1", "a2" or "a3""#,
                ))
            }
        };

        Ok(air_squadron.clone())
    }

    pub fn is_combined(&self) -> bool {
        self.org_type.is_combined()
    }

    pub fn fleet_anti_air(&self, formation_mod: f64) -> f64 {
        let total = self
            .main_and_escort_ships()
            .map(|(_, _, ship)| ship.fleet_anti_air())
            .sum::<i32>() as f64;

        let post_floor = (total * formation_mod).floor() * 2.;

        if self.side.is_player() {
            post_floor / 1.3
        } else {
            post_floor
        }
    }

    pub fn analyze_day_cutin_rate(&self) -> JsValue {
        let main = FleetDayCutinRateAnalysis::new(self.main(), Role::Main);
        let escort = FleetDayCutinRateAnalysis::new(self.escort(), Role::Escort);

        let analysis = OrgDayCutinRateAnalysis { main, escort };

        JsValue::from_serde(&analysis).unwrap()
    }

    pub fn analyze_anti_air(
        &self,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> JsValue {
        let analysis =
            OrgAntiAirAnalysis::new(&self, adjusted_anti_air_resist, fleet_anti_air_resist);

        JsValue::from_serde(&analysis).unwrap()
    }
}

#[derive(Debug, Default, Serialize, TS)]
pub struct DayCutinRateAnalysis {
    observation_term: Option<f64>,
    rates: Vec<(DayCutin, Option<f64>)>,
    total_cutin_rate: Option<f64>,
}

impl DayCutinRateAnalysis {
    fn new(
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
            .map(|attack_type| {
                let def = attack_type.to_attack_def();

                let actual_rate = if let (Some(o), Some(d), Some(t)) =
                    (observation_term, def.denom, total_cutin_rate)
                {
                    let base_rate = (o / d as f64).min(1.0);
                    let actual_rate = (1.0 - t) * base_rate;

                    total_cutin_rate = Some(t + actual_rate);
                    Some(actual_rate)
                } else {
                    total_cutin_rate = None;
                    None
                };

                (attack_type, actual_rate)
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
    name: String,
    banner: Option<String>,
    air_supremacy: DayCutinRateAnalysis,
    air_superiority: DayCutinRateAnalysis,
}

impl ShipDayCutinRateAnalysis {
    fn new(ship: &Ship, fleet_los_mod: Option<f64>, is_main_flagship: bool) -> Self {
        Self {
            name: ship.name(),
            banner: ship.banner(),
            air_supremacy: DayCutinRateAnalysis::new(
                ship,
                fleet_los_mod,
                is_main_flagship,
                AirState::AirSupremacy,
            ),
            air_superiority: DayCutinRateAnalysis::new(
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
    fn new(fleet: &Fleet, role: Role) -> Self {
        let fleet_los_mod = fleet.fleet_los_mod();

        let ships = fleet
            .ships
            .iter()
            .map(|(index, ship)| {
                let is_main_flagship = role == Role::Main && index == 0;
                ShipDayCutinRateAnalysis::new(ship, fleet_los_mod, is_main_flagship)
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
