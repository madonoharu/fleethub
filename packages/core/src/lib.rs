pub mod air_squadron;
pub mod array;
pub mod factory;
pub mod fleet;
pub mod gear;
pub mod org;
pub mod ship;

pub mod anti_air;
pub mod attack;
pub mod damage;
pub mod types;
pub mod utils;

use air_squadron::AirSquadron;
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

    pub fn get_gear_ids(&self) -> Vec<i32> {
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
}
