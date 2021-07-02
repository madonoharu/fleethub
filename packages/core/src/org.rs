use serde::{Deserialize, Serialize};
use ts_rs::TS;
use wasm_bindgen::prelude::*;

use crate::{
    air_squadron::{AirSquadron, AirSquadronState},
    array::ShipArray,
    attack::ShellingAttackType,
    constants::AirState,
    fleet::{Fleet, FleetState},
    ship::Ship,
    utils::NumMap,
};

#[derive(Debug, Clone, Copy, PartialEq, Hash, Deserialize, TS)]
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
}

impl Org {
    pub fn main(&self) -> &Fleet {
        &self.f1
    }

    pub fn escort(&self) -> &Fleet {
        &self.f2
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

    pub fn is_combined_fleet(&self) -> bool {
        self.org_type != OrgType::Single
    }

    #[wasm_bindgen(getter)]
    pub fn fleet_los(&self) -> Option<i32> {
        let mut base = self.main().ships.sum_by(|s| s.fleet_los_factor())?;

        if self.is_combined_fleet() {
            base += self.escort().ships.sum_by(|s| s.fleet_los_factor())?;
        };

        let base = base as f64;

        Some((base.sqrt() + 0.1 * base).floor() as i32)
    }

    fn analyze_rs(&self) -> Option<ShellingAttackOrgAnalysis> {
        let ships = self.main().ships.values();

        let fleet_los_mod = self.fleet_los()? as f64;
        let air_state = AirState::AirSupremacy;

        let data: Vec<ShellingAttackShipAnalysis> = ships
            .filter_map(|ship| {
                let is_main_flagship = true;
                let observation_term = ship
                    .calc_observation_term(fleet_los_mod, air_state, is_main_flagship)
                    .map(|v| v as f64);

                let attack_types = ship.get_possible_shelling_attack_type_set();

                let mut total_rate = 0.0;
                let mut rates: NumMap<ShellingAttackType, f64> = NumMap::new();

                if let Some(observation_term) = observation_term {
                    attack_types
                        .iter()
                        .filter(|attack_type| attack_type != &ShellingAttackType::Normal)
                        .try_for_each(|attack_type| {
                            let def = attack_type.get_attack_def();
                            let base_rate = (observation_term / def.denominator? as f64).min(1.0);
                            let actual_rate = (1.0 - total_rate) * base_rate;

                            total_rate += actual_rate;
                            rates.insert(attack_type, actual_rate);

                            Some(())
                        });
                }

                Some(ShellingAttackShipAnalysis {
                    name: ship.name(),
                    banner: ship.banner(),
                    observation_term,
                    cutin_rate: total_rate,
                    rates: rates.into_vec(),
                })
            })
            .collect();

        Some(ShellingAttackOrgAnalysis {
            fleet_los_mod: Some(fleet_los_mod),
            ships: data,
        })
    }

    pub fn analyze(&self) -> JsValue {
        if let Some(value) = self.analyze_rs() {
            JsValue::from_serde(&value).unwrap()
        } else {
            JsValue::UNDEFINED
        }
    }
}

#[derive(Debug, Default, Serialize, TS)]
pub struct ShellingAttackShipAnalysis {
    name: String,
    banner: Option<String>,
    observation_term: Option<f64>,
    cutin_rate: f64,
    rates: Vec<(ShellingAttackType, f64)>,
}

#[derive(Debug, Default, Serialize, TS)]
pub struct ShellingAttackOrgAnalysis {
    fleet_los_mod: Option<f64>,
    ships: Vec<ShellingAttackShipAnalysis>,
}
