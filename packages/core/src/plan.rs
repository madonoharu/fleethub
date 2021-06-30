use crate::{
    air_squadron::{AirSquadron, AirSquadronState},
    fleet::{Fleet, FleetState},
};
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, PartialEq, Hash, Deserialize)]
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

#[derive(Debug, Default, Clone, Hash, Deserialize)]
pub struct PlanState {
    #[serde(default)]
    pub id: String,

    pub main: Option<FleetState>,
    pub escort: Option<FleetState>,
    pub route_sup: Option<FleetState>,
    pub boss_sup: Option<FleetState>,

    pub a1: Option<AirSquadronState>,
    pub a2: Option<AirSquadronState>,
    pub a3: Option<AirSquadronState>,

    pub hq_level: Option<i32>,

    #[serde(default)]
    pub org_type: OrgType,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Plan {
    #[wasm_bindgen(skip)]
    pub xxh3: u64,

    #[wasm_bindgen(skip)]
    pub id: String,

    #[wasm_bindgen(skip)]
    pub main: Fleet,
    #[wasm_bindgen(skip)]
    pub escort: Fleet,
    #[wasm_bindgen(skip)]
    pub route_sup: Fleet,
    #[wasm_bindgen(skip)]
    pub boss_sup: Fleet,

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

#[wasm_bindgen]
impl Plan {
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
            "main" => &self.main,
            "escort" => &self.escort,
            "route_sup" => &self.route_sup,
            "boss_sup" => &self.boss_sup,
            _ => {
                return Err(JsValue::from_str(
                    r#"get_fleet() argument must be "main", "escort", "route_sup" or "boss_sup""#,
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
        let mut base = self.main.ships.sum_by(|s| s.fleet_los_factor())?;

        if self.is_combined_fleet() {
            base += self.escort.ships.sum_by(|s| s.fleet_los_factor())?;
        };

        let base = base as f64;

        Some((base.sqrt() + 0.1 * base).floor() as i32)
    }
}
