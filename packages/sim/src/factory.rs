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
        let mut gears = GearArray::default();

        let ShipState {
            g1,
            g2,
            g3,
            g4,
            g5,
            gx,
            ..
        } = &state;

        [g1, g2, g3, g4, g5, gx]
            .iter()
            .map(|g| g.as_ref().and_then(|g| self.create_gear_rs(g.clone())))
            .enumerate()
            .for_each(|(i, g)| {
                if let Some(gear) = g {
                    gears.put(i, gear)
                }
            });

        let master = self
            .master_data
            .ships
            .iter()
            .find(|ship| ship.ship_id == state.ship_id)?;

        let attrs = self.master_data.find_ship_attrs(&master);

        Some(Ship::new(state, master, attrs, gears))
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
