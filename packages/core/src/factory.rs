use crate::{
    air_squadron::{AirSquadron, AirSquadronState},
    array::{GearArray, ShipArray},
    fleet::{Fleet, FleetState},
    gear::{Gear, GearState},
    plan::{Plan, PlanState},
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
        let ibonuses = self.master_data.get_ibonuses(master, state.stars);

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

        let equippable = self.master_data.create_ship_equippable(&master);

        let banner = self
            .master_data
            .ship_banners
            .get(&state.ship_id.to_string())
            .cloned();

        Some(Ship::new(state, master, attrs, equippable, banner, gears))
    }

    fn create_fleet_rs(&self, state: Option<FleetState>) -> Fleet {
        let FleetState {
            s1,
            s2,
            s3,
            s4,
            s5,
            s6,
            s7,
        } = state.unwrap_or_default();

        let to_ship = |state: Option<ShipState>| state.and_then(|s| self.create_ship_rs(s));

        let ships = ShipArray::new([
            to_ship(s1),
            to_ship(s2),
            to_ship(s3),
            to_ship(s4),
            to_ship(s5),
            to_ship(s6),
            to_ship(s7),
        ]);

        Fleet { ships }
    }

    fn create_air_squadron_rs(&self, state: AirSquadronState) -> AirSquadron {
        let AirSquadronState {
            g1,
            g2,
            g3,
            g4,
            ss1,
            ss2,
            ss3,
            ss4,
        } = state;

        let to_gear = |g: Option<GearState>| g.and_then(|g| self.create_gear_rs(g));

        let gears = GearArray::new([
            to_gear(g1),
            to_gear(g2),
            to_gear(g3),
            to_gear(g4),
            None,
            None,
        ]);

        let slots = [ss1, ss2, ss3, ss4]
            .iter()
            .cloned()
            .map(|ss| ss.or(Some(18)))
            .collect();

        AirSquadron { gears, slots }
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

    pub fn create_air_squadron(&self, js: JsValue) -> Option<AirSquadron> {
        let state: AirSquadronState = js.into_serde().ok()?;

        Some(self.create_air_squadron_rs(state))
    }

    pub fn create_fleet(&self, js: JsValue) -> Option<Fleet> {
        let state: FleetState = js.into_serde().ok()?;

        Some(self.create_fleet_rs(Some(state)))
    }

    pub fn create_plan(&self, js: JsValue) -> Option<Plan> {
        let state: PlanState = js.into_serde().ok()?;

        let PlanState {
            main,
            escort,
            route_sup,
            boss_sup,
            hq_level,
        } = state;

        Some(Plan {
            main: self.create_fleet_rs(main),
            escort: self.create_fleet_rs(escort),
            route_sup: self.create_fleet_rs(route_sup),
            boss_sup: self.create_fleet_rs(boss_sup),

            hq_level: hq_level.unwrap_or(120),
        })
    }

    pub fn get_gear_ids(&self, _ship: &Ship) -> Vec<i32> {
        self.master_data.gears.iter().map(|g| g.gear_id).collect()
    }

    pub fn find_gear_category_name(&self, id: i32) -> String {
        self.master_data
            .gear_categories
            .iter()
            .find_map(|c| (c.id == id).then(|| c.name.clone()))
            .unwrap_or_else(|| format!("category {}", id))
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
