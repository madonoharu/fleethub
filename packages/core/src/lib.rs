pub mod air_squadron;
pub mod analyzer;
pub mod factory;
pub mod fleet;
pub mod gear;
pub mod gear_array;
pub mod org;
pub mod ship;

pub mod attack;
pub mod types;
pub mod utils;
pub mod wasm_abi;

use attack::NightSituation;
use wasm_abi::{AirSquadronParams, FleetParams, GearParams, OrgParams, ShipParams};
use wasm_bindgen::prelude::*;

use air_squadron::AirSquadron;
use analyzer::{analyze_warfare, OrgAnalyzer, WarfareAnalysisParams, WarfareInfo};
use factory::Factory;
use fleet::Fleet;
use gear::Gear;
use org::Org;
use ship::Ship;
use types::{EBonusFn, Formation, MasterData};

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct FhCore {
    factory: Factory,
}

#[wasm_bindgen]
impl FhCore {
    #[wasm_bindgen(constructor)]
    pub fn new(js_master: JsValue, js_fn: js_sys::Function) -> Result<FhCore, JsValue> {
        let result = MasterData::new(js_master);

        result
            .map(|master_data| Self {
                factory: Factory {
                    master_data,
                    ebonus_fn: EBonusFn::new(js_fn),
                },
            })
            .map_err(|err| JsValue::from(err.to_string()))
    }

    #[cfg(feature = "console_error_panic_hook")]
    pub fn init_console_panic(&self) {
        console_error_panic_hook::set_once();
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

    pub fn create_ship_by_id(&self, ship_id: u16) -> Option<Ship> {
        self.factory.create_ship_by_id(ship_id)
    }

    pub fn create_default_ship(&self) -> Ship {
        Ship::default()
    }

    pub fn get_gear_ids(&self) -> Vec<u16> {
        self.factory
            .master_data
            .gears
            .iter()
            .map(|g| g.gear_id)
            .collect()
    }

    fn org_analyzer(&self) -> OrgAnalyzer {
        OrgAnalyzer::new(&self.factory.master_data.constants)
    }

    pub fn analyze_anti_air(
        &self,
        org: &Org,
        key: &str,
        formation: Formation,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> JsValue {
        let result = self.org_analyzer().analyze_anti_air(
            org,
            key,
            formation,
            adjusted_anti_air_resist,
            fleet_anti_air_resist,
        );

        JsValue::from_serde(&result).unwrap()
    }

    pub fn analyze_day_cutin(&self, org: &Org, key: &str) -> JsValue {
        let result = self.org_analyzer().analyze_day_cutin(org, key);

        JsValue::from_serde(&result).unwrap()
    }

    pub fn analyze_night_cutin(
        &self,
        org: &Org,
        key: &str,
        attacker_situation: NightSituation,
        defender_situation: NightSituation,
    ) -> JsValue {
        let result = self.org_analyzer().analyze_night_cutin(
            org,
            key,
            attacker_situation,
            defender_situation,
        );

        JsValue::from_serde(&result).unwrap()
    }

    pub fn analyze_contact_chance(&self, org: &Org, key: &str) -> JsValue {
        let result = self.org_analyzer().analyze_contact_chance(org, key);
        JsValue::from_serde(&result).unwrap()
    }

    pub fn analyze_warfare(
        &self,
        params: WarfareAnalysisParams,
        attacker: &Ship,
        target: &Ship,
    ) -> WarfareInfo {
        analyze_warfare(&self.factory.master_data, &params, attacker, target)
    }
}
