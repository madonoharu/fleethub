#![allow(non_snake_case)]

pub mod air_squadron;
pub mod analyzer;
pub mod attack;
pub mod battle;
pub mod builder;
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
mod result;
pub mod ship;
pub mod simulator;
pub mod types;
pub mod utils;

use tsify::{Ts, Tsify};
use wasm_bindgen::{JsCast, prelude::*};

use air_squadron::AirSquadron;
use analyzer::Analyzer;
use comp::Comp;
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

impl FhCore {
    pub fn from_master_data(master_data: MasterData) -> Self {
        Self {
            factory: Factory::new(master_data),
        }
    }

    pub fn master_data(&self) -> &MasterData {
        &self.factory.master_data
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

    pub fn create_ship_state_by_id(&self, ship_id: u16) -> Option<ShipState> {
        self.factory.create_ship_state_by_id(ship_id)
    }
}

#[wasm_bindgen]
impl FhCore {
    #[wasm_bindgen(constructor)]
    pub fn new(js_master: <MasterData as tsify::Tsify>::JsType) -> Result<FhCore, JsValue> {
        let master_data =
            MasterData::from_js(js_master).map_err(|err| JsValue::from(err.to_string()))?;

        let factory = Factory::new(master_data);

        Ok(Self { factory })
    }

    #[wasm_bindgen(js_name = create_gear)]
    pub fn create_gear_js(&self, input: Option<Ts<GearState>>) -> Result<Option<Gear>, JsError> {
        Ok(self.create_gear(input.as_ref().map(Ts::to_rust).transpose()?))
    }

    #[wasm_bindgen(js_name = create_ship)]
    pub fn create_ship_js(&self, input: Option<Ts<ShipState>>) -> Result<Option<Ship>, JsError> {
        Ok(self.create_ship(input.as_ref().map(Ts::to_rust).transpose()?))
    }

    #[wasm_bindgen(js_name = create_air_squadron)]
    pub fn create_air_squadron_js(
        &self,
        input: Option<Ts<AirSquadronState>>,
    ) -> Result<AirSquadron, JsError> {
        Ok(self.create_air_squadron(input.as_ref().map(Ts::to_rust).transpose()?))
    }

    #[wasm_bindgen(js_name = create_fleet)]
    pub fn create_fleet_js(&self, input: Option<Ts<FleetState>>) -> Result<Fleet, JsError> {
        Ok(self.create_fleet(input.as_ref().map(Ts::to_rust).transpose()?))
    }

    #[wasm_bindgen(js_name = create_org)]
    pub fn create_org_js(&self, input: Option<Ts<OrgState>>) -> Result<Option<Org>, JsError> {
        Ok(self.create_org(input.as_ref().map(Ts::to_rust).transpose()?))
    }

    #[wasm_bindgen(js_name = create_ship_state_by_id)]
    pub fn create_ship_state_by_id_js(
        &self,
        ship_id: u16,
    ) -> Result<Option<Ts<ShipState>>, JsError> {
        Ok(self
            .create_ship_state_by_id(ship_id)
            .as_ref()
            .map(Tsify::into_ts)
            .transpose()?)
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
        Analyzer::new(self.factory.master_data.battle_definitions())
    }
}

#[cfg(test)]
pub mod test {
    use rand::prelude::*;

    pub fn rng(seed: u64) -> impl Rng {
        SmallRng::seed_from_u64(seed)
    }
}
