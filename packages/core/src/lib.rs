pub mod air_squadron;
pub mod analyzer;
pub mod array;
pub mod factory;
pub mod fleet;
pub mod gear;
pub mod org;
pub mod ship;

pub mod attack;
pub mod damage;
pub mod types;
pub mod utils;

use air_squadron::AirSquadron;
use analyzer::Analyzer;
use factory::Factory;
use fleet::Fleet;
use gear::Gear;
use org::Org;
use ship::Ship;

use types::MasterData;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
import * as bindings from "../bindings";
import {
  AirSquadronParams,
  FleetParams,
  GearParams,
  OrgParams,
  ShipParams,
} from "../types";

export * from "../types";
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "GearParams")]
    pub type GearParams;
    #[wasm_bindgen(typescript_type = "ShipParams")]
    pub type ShipParams;
    #[wasm_bindgen(typescript_type = "FleetParams")]
    pub type FleetParams;
    #[wasm_bindgen(typescript_type = "AirSquadronParams")]
    pub type AirSquadronParams;
    #[wasm_bindgen(typescript_type = "OrgParams")]
    pub type OrgParams;

    #[wasm_bindgen(typescript_type = "bindings.ShipAttr")]
    pub type JsShipAttr;

    #[wasm_bindgen(typescript_type = "bindings.NightCutinFleetState")]
    pub type JsNightCutinFleetState;
}

#[wasm_bindgen]
pub struct FhCore {
    factory: Factory,
}

#[wasm_bindgen]
impl FhCore {
    #[wasm_bindgen(constructor)]
    pub fn new(js: JsValue) -> Option<FhCore> {
        let master_data: MasterData = js.into_serde().ok()?;

        Some(Self {
            factory: Factory { master_data },
        })
    }

    pub fn create_gear(&self, js: GearParams) -> Option<Gear> {
        let input = js.into_serde().ok();
        self.factory.create_gear(input)
    }

    pub fn create_ship(&self, js: ShipParams) -> Option<Ship> {
        let input = js.into_serde().ok();
        self.factory.create_ship(input)
    }

    pub fn create_air_squadron(&self, js: AirSquadronParams) -> AirSquadron {
        let input = js.into_serde().ok();
        self.factory.create_air_squadron(input)
    }

    pub fn create_fleet(&self, js: FleetParams) -> Fleet {
        let input = js.into_serde().ok();
        self.factory.create_fleet(input)
    }

    pub fn create_org(&self, js: OrgParams) -> Option<Org> {
        let input = js.into_serde().ok();
        self.factory.create_org(input)
    }

    pub fn get_gear_ids(&self) -> Vec<u16> {
        self.factory
            .master_data
            .gears
            .iter()
            .map(|g| g.gear_id)
            .collect()
    }

    pub fn find_gear_gear_type_name(&self, id: i32) -> String {
        self.factory
            .master_data
            .gear_types
            .iter()
            .find_map(|c| (c.id == id).then(|| c.name.clone()))
            .unwrap_or_else(|| format!("gear_type {}", id))
    }

    pub fn analyze_anti_air(
        &self,
        org: &Org,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> JsValue {
        let analyzer = Analyzer::new(&self.factory.master_data);

        let result =
            analyzer.analyze_anti_air(org, adjusted_anti_air_resist, fleet_anti_air_resist);

        JsValue::from_serde(&result).unwrap()
    }

    pub fn analyze_day_cutin(&self, org: &Org) -> JsValue {
        let analyzer = Analyzer::new(&self.factory.master_data);
        let result = analyzer.analyze_day_cutin(org);

        JsValue::from_serde(&result).unwrap()
    }

    pub fn analyze_night_cutin(
        &self,
        org: &Org,
        attacker_fleet_state: JsNightCutinFleetState,
        defender_fleet_state: JsNightCutinFleetState,
    ) -> JsValue {
        let attacker_fleet_state = attacker_fleet_state.into_serde().unwrap();
        let defender_fleet_state = defender_fleet_state.into_serde().unwrap();
        let analyzer = Analyzer::new(&self.factory.master_data);
        let result = analyzer.analyze_night_cutin(org, attacker_fleet_state, defender_fleet_state);

        JsValue::from_serde(&result).unwrap()
    }

    pub fn analyze_airstrike(&self, org: &Org) -> JsValue {
        let analyzer = Analyzer::new(&self.factory.master_data);
        let result = analyzer.analyze_airstrike(org);

        JsValue::from_serde(&result).unwrap()
    }
}
