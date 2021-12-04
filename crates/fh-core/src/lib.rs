pub mod air_squadron;
pub mod analyzer;
pub mod comp;
pub mod console;
pub mod factory;
pub mod fleet;
pub mod gear;
pub mod gear_array;
pub mod org;
pub mod ship;

pub mod attack;
pub mod simulator;
pub mod types;
pub mod utils;

use comp::Comp;
use simulator::{ShellingSupportSimulatorParams, SimulatorResult};
use wasm_bindgen::prelude::*;

use air_squadron::AirSquadron;
use analyzer::{
    Analyzer, CompAntiAirInfo, CompContactChanceInfo, CompDayCutinRateInfo, FleetCutinAnalysis,
    FleetCutinAnalyzer, FleetNightCutinRateInfo, WarfareAnalyzer, WarfareAnalyzerContext,
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

    pub fn create_comp_by_map_enemy(&self, main: Vec<u16>, escort: Option<Vec<u16>>) -> Comp {
        self.factory.create_comp_by_map_enemy(main, escort)
    }

    pub fn create_default_ship(&self) -> Ship {
        Ship::default()
    }

    pub fn create_analyzer(&self) -> Analyzer {
        Analyzer::new(self.factory.master_data.config.clone())
    }

    pub fn simulate_shelling_support(
        &self,
        player: &mut Comp,
        enemy: &mut Comp,
        params: ShellingSupportSimulatorParams,
        times: usize,
    ) -> Result<SimulatorResult, JsValue> {
        use rand::prelude::*;
        use simulator::ShellingSupportSimulator;

        let mut rng = SmallRng::from_entropy();
        let config = &self.factory.master_data.config;
        let mut sim = ShellingSupportSimulator::new(&mut rng, config, player, enemy, params);

        sim.run(times)
            .map_err(|err| JsValue::from(&err.to_string()))
    }
}
