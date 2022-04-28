pub mod air_squadron;
pub mod analyzer;
pub mod attack;
pub mod comp;
pub mod console;
pub mod error;
pub mod estimation;
pub mod factory;
pub mod fleet;
pub mod gear;
pub mod gear_array;
pub mod master_data;
pub mod member;
pub mod org;
pub mod plane;
pub mod ship;
pub mod simulator;
pub mod types;
pub mod utils;

use comp::Comp;
use simulator::{ShellingSupportSimulatorParams, SimulatorResult};
use wasm_bindgen::{prelude::*, JsCast};

use air_squadron::AirSquadron;
use analyzer::Analyzer;
use factory::Factory;
use fleet::Fleet;
use gear::Gear;
use master_data::MasterData;
use org::Org;
use ship::Ship;
use types::{AirSquadronState, FleetState, GearState, OrgState, ShipState};

#[wasm_bindgen]
pub struct FhCore {
    factory: Factory,
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "Ship[]")]
    pub type AllShips;
}

#[wasm_bindgen]
impl FhCore {
    #[wasm_bindgen(constructor)]
    pub fn new(js_master: <MasterData as tsify::Tsify>::JsType) -> Result<FhCore, JsValue> {
        let master_data = js_master
            .into_serde::<MasterData>()
            .map_err(|err| JsValue::from(err.to_string()))?
            .init();

        let factory = Factory { master_data };

        Ok(Self { factory })
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

    pub fn create_all_ships(&self) -> AllShips {
        let js = self
            .factory
            .master_data
            .ships
            .iter()
            .filter_map(|ship| self.factory.create_ship_by_id(ship.ship_id))
            .map(JsValue::from)
            .collect::<js_sys::Array>();

        js.unchecked_into()
    }

    pub fn create_comp_by_map_enemy(&self, main: Vec<u16>, escort: Option<Vec<u16>>) -> Comp {
        self.factory.create_comp_by_map_enemy(main, escort)
    }

    pub fn create_default_ship(&self) -> Ship {
        Ship::default()
    }

    pub fn create_analyzer(&self) -> Analyzer {
        Analyzer::new(self.factory.master_data.battle_config())
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
        let config = self.factory.master_data.battle_config();
        let mut sim = ShellingSupportSimulator::new(&mut rng, &config, player, enemy, params);

        sim.run(times)
            .map_err(|err| JsValue::from(&err.to_string()))
    }
}
