pub mod air_squadron;
pub mod analyzer;
pub mod comp;
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
    CompAntiAirInfo, CompContactChanceInfo, CompDayCutinRateInfo, FleetCutinAnalysis,
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

    pub fn analyze_anti_air(
        &self,
        comp: &Comp,
        formation: Formation,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> CompAntiAirInfo {
        CompAntiAirInfo::new(
            comp,
            &self.factory.master_data.config,
            formation,
            adjusted_anti_air_resist,
            fleet_anti_air_resist,
        )
    }

    pub fn analyze_day_cutin(&self, comp: &Comp) -> CompDayCutinRateInfo {
        CompDayCutinRateInfo::new(comp, &self.factory.master_data.config)
    }

    pub fn analyze_night_cutin(
        &self,
        comp: &Comp,
        attacker_situation: NightSituation,
        target_situation: NightSituation,
    ) -> FleetNightCutinRateInfo {
        FleetNightCutinRateInfo::new(
            comp,
            &self.factory.master_data.config,
            &attacker_situation,
            &target_situation,
        )
    }

    pub fn analyze_contact_chance(&self, comp: &Comp) -> CompContactChanceInfo {
        CompContactChanceInfo::new(comp)
    }

    pub fn analyze_warfare(
        &self,
        params: WarfareAnalyzerContext,
        attacker: &Ship,
        target: &Ship,
    ) -> WarfareInfo {
        let analyzer =
            WarfareAnalyzer::new(&self.factory.master_data.config, &params, attacker, target);
        analyzer.analyze()
    }

    pub fn analyze_fleet_cutin(&self, comp: &Comp, engagement: Engagement) -> FleetCutinAnalysis {
        FleetCutinAnalyzer::new(&self.factory.master_data.config, comp, engagement).analyze()
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
