pub mod air_squadron;
pub mod analyzer;
pub mod factory;
pub mod fleet;
pub mod gear;
pub mod gear_array;
pub mod org;
pub mod ship;
pub mod sortied_fleet;

pub mod attack;
pub mod types;
pub mod utils;

use wasm_bindgen::prelude::*;

use air_squadron::AirSquadron;
use analyzer::{
    FleetCutinAnalysis, FleetCutinAnalyzer, OrgAnalyzer, WarfareAnalyzer, WarfareAnalyzerContext,
    WarfareInfo,
};
use attack::NightSituation;
use factory::Factory;
use fleet::Fleet;
use gear::Gear;
use org::Org;
use ship::Ship;
use types::{
    AirSquadronState, EBonusFn, Engagement, FleetState, Formation, GearState, MasterData, OrgState,
    ShipState,
};

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
import * as bindings from "../bindings";
export * from "../bindings";
"#;

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

    pub fn create_gear(&self, input: Option<GearState>) -> Option<Gear> {
        self.factory.create_gear(input)
    }

    pub fn create_ship(&self, input: Option<ShipState>) -> Option<Ship> {
        self.factory.create_ship(input)
    }

    pub fn create_air_squadron(&self, input: Option<AirSquadronState>) -> AirSquadron {
        self.factory.create_air_squadron(input)
    }

    pub fn create_fleet(&self, input: Option<FleetState>) -> Fleet {
        self.factory.create_fleet(input)
    }

    pub fn create_org(&self, input: Option<OrgState>) -> Option<Org> {
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
        params: WarfareAnalyzerContext,
        attacker: &Ship,
        target: &Ship,
    ) -> WarfareInfo {
        let analyzer = WarfareAnalyzer::new(&self.factory.master_data, &params, attacker, target);
        analyzer.analyze()
    }

    pub fn analyze_fleet_cutin(
        &self,
        org: &Org,
        key: &str,
        engagement: Engagement,
    ) -> FleetCutinAnalysis {
        let sf = org.get_sortied_fleet_by_key(key);
        FleetCutinAnalyzer::new(&self.factory.master_data, sf, engagement).analyze()
    }
}
