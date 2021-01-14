use crate::{
    gear::{Gear, GearState},
    gear_array::GearArray,
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

    pub fn create_ship(
        &self,
        state: JsValue,
        g1: Option<Gear>,
        g2: Option<Gear>,
        g3: Option<Gear>,
        g4: Option<Gear>,
        g5: Option<Gear>,
        gx: Option<Gear>,
    ) -> Option<Ship> {
        let gears = GearArray([g1, g2, g3, g4, g5, gx]);
        let state: ShipState = state.into_serde().ok()?;

        let master = self
            .master_data
            .ships
            .iter()
            .find(|ship| ship.ship_id == state.ship_id)?;

        let attrs = self.master_data.find_ship_attrs(&master);

        Some(Ship::new(state, master, attrs, gears))
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
        let master_data = crate::master::get_master_data();
        let _ = Factory { master_data };
    }
}
