use crate::{
    array::{GearArray, ShipArray},
    fleet::{Fleet, FleetState, ShipArrayState},
    gear::{Gear, GearState},
    ship::Ship,
};
use crate::{master::MasterData, ship::ShipState};
use wasm_bindgen::prelude::*;
use web_sys::console::log_1;

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log_1(&JsValue::from(format_args!($($t)*).to_string())))
}

#[wasm_bindgen]
pub struct Factory {
    master_data: MasterData,
}

impl Factory {
    pub fn create_gear_rs(&self, state: GearState) -> Option<Gear> {
        let master = self
            .master_data
            .gears
            .iter()
            .find(|mg| mg.gear_id == state.gear_id)?;

        let attrs = self.master_data.find_gear_attrs(master);
        let ibonuses = self
            .master_data
            .get_ibonuses(master, state.stars.unwrap_or_default());

        Some(Gear::new(state, master, attrs, ibonuses))
    }

    pub fn create_ship_rs(&self, state: ShipState) -> Option<Ship> {
        let ShipState {
            g1,
            g2,
            g3,
            g4,
            g5,
            gx,
            ..
        } = &state;

        let to_gear =
            |g: &Option<GearState>| g.as_ref().and_then(|g| self.create_gear_rs(g.clone()));

        let gears = GearArray::new([
            to_gear(g1),
            to_gear(g2),
            to_gear(g3),
            to_gear(g4),
            to_gear(g5),
            to_gear(gx),
        ]);

        let master = self
            .master_data
            .ships
            .iter()
            .find(|ship| ship.ship_id == state.ship_id)?;

        let attrs = self.master_data.find_ship_attrs(&master);

        Some(Ship::new(state, master, attrs, gears))
    }

    fn create_ship_array(&self, state: ShipArrayState) -> ShipArray {
        let ShipArrayState {
            s1,
            s2,
            s3,
            s4,
            s5,
            s6,
            s7,
        } = state;

        let to_ship = |state: Option<ShipState>| state.and_then(|s| self.create_ship_rs(s));

        ShipArray::new([
            to_ship(s1),
            to_ship(s2),
            to_ship(s3),
            to_ship(s4),
            to_ship(s5),
            to_ship(s6),
            to_ship(s7),
        ])
    }
}

#[wasm_bindgen]
impl Factory {
    #[wasm_bindgen(constructor)]
    pub fn new(js: JsValue) -> Self {
        let master_data: MasterData = js.into_serde().unwrap();
        Self { master_data }
    }

    pub fn create_gear(&self, js: JsValue) -> Option<Gear> {
        let state: GearState = match js.into_serde() {
            Ok(s) => s,
            Err(e) => {
                console_log!("{:?}", e.to_string());
                return None;
            }
        };

        self.create_gear_rs(state)
    }

    pub fn create_ship(&self, js: JsValue) -> Option<Ship> {
        let state: ShipState = js.into_serde().ok()?;
        self.create_ship_rs(state)
    }

    pub fn create_fleet(&self, js: JsValue) -> Option<Fleet> {
        let state: FleetState = js.into_serde().ok()?;

        let main = self.create_ship_array(state.main);

        Some(Fleet { main })
    }

    pub fn get_all_gear_ids(&self) -> Vec<i32> {
        self.master_data.gears.iter().map(|g| g.gear_id).collect()
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_create_gear() {
        let master_data = crate::master::test::get_master_data();
        let _ = Factory { master_data };
    }
}
