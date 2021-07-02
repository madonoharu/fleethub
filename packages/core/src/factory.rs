use wasm_bindgen::prelude::*;
use web_sys::console::log_1;

use crate::{
    air_squadron::{AirSquadron, AirSquadronState},
    array::{GearArray, ShipArray},
    fleet::{Fleet, FleetState},
    gear::{Gear, GearState},
    master::MasterData,
    org::{Org, OrgState},
    ship::Ship,
    ship::ShipState,
    utils::xxh3,
};

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log_1(&JsValue::from(format_args!($($t)*).to_string())))
}

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
import { NullToOptional } from "../null_to_optional";
import {
  AirSquadronState,
  FleetState,
  GearState,
  OrgState,
  ShipState,
} from "./types";

export type GearParams = NullToOptional<GearState>;
export type ShipParams = NullToOptional<ShipState>;
export type FleetParams = NullToOptional<FleetState>;
export type AirSquadronParams = NullToOptional<AirSquadronState>;
export type OrgParams = NullToOptional<OrgState>;

export * from "./types";
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "GearParams")]
    pub type GearParams;
    #[wasm_bindgen(typescript_type = "ShipParams")]
    pub type ShipParams;
    #[wasm_bindgen(typescript_type = "FleetParams")]
    pub type FleetParams;
    #[wasm_bindgen(typescript_type = "AirSquadronParams")]
    pub type AirSquadronParams;
    #[wasm_bindgen(typescript_type = "OrgParams")]
    pub type OrgParams;
}

#[wasm_bindgen]
pub struct Factory {
    master_data: MasterData,
}

impl Factory {
    pub fn create_gear_rs(&self, input: Option<GearState>) -> Option<Gear> {
        let state = input?;

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

    pub fn create_ship_rs(&self, input: Option<ShipState>) -> Option<Ship> {
        let state = input?;

        let ShipState {
            g1,
            g2,
            g3,
            g4,
            g5,
            gx,
            ..
        } = &state;

        let create_gear = |g: &Option<GearState>| self.create_gear_rs(g.clone());

        let gears = GearArray::new([
            create_gear(g1),
            create_gear(g2),
            create_gear(g3),
            create_gear(g4),
            create_gear(g5),
            create_gear(gx),
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

    fn create_fleet_rs(&self, input: Option<FleetState>) -> Fleet {
        let state = input.unwrap_or_default();
        let xxh3 = xxh3(&state);

        let FleetState {
            id,
            s1,
            s2,
            s3,
            s4,
            s5,
            s6,
            s7,
        } = state;

        let ships = ShipArray::new([
            self.create_ship_rs(s1),
            self.create_ship_rs(s2),
            self.create_ship_rs(s3),
            self.create_ship_rs(s4),
            self.create_ship_rs(s5),
            self.create_ship_rs(s6),
            self.create_ship_rs(s7),
        ]);

        Fleet {
            id: id.unwrap_or_default(),
            xxh3,
            ships,
        }
    }

    fn create_air_squadron_rs(&self, input: Option<AirSquadronState>) -> AirSquadron {
        let state = input.unwrap_or_default();
        let xxh3 = xxh3(&state);

        let AirSquadronState {
            id,
            g1,
            g2,
            g3,
            g4,
            ss1,
            ss2,
            ss3,
            ss4,
        } = state;

        let create_gear = |g: Option<GearState>| self.create_gear_rs(g);

        let gears = GearArray::new([
            create_gear(g1),
            create_gear(g2),
            create_gear(g3),
            create_gear(g4),
            None,
            None,
        ]);

        let slots = [ss1, ss2, ss3, ss4]
            .iter()
            .cloned()
            .map(|ss| ss.or(Some(18)))
            .collect();

        AirSquadron {
            id: id.unwrap_or_default(),
            xxh3,
            gears,
            slots,
        }
    }
}

#[wasm_bindgen]
impl Factory {
    #[wasm_bindgen(constructor)]
    pub fn new(js: JsValue) -> Self {
        let master_data: MasterData = js.into_serde().unwrap();
        Self { master_data }
    }

    pub fn create_gear(&self, js: GearParams) -> Option<Gear> {
        let state = js.into_serde().ok();
        self.create_gear_rs(state)
    }

    pub fn create_ship(&self, js: ShipParams) -> Option<Ship> {
        let state = js.into_serde().ok();
        self.create_ship_rs(state)
    }

    pub fn create_air_squadron(&self, js: AirSquadronParams) -> Option<AirSquadron> {
        let state = js.into_serde().ok();

        Some(self.create_air_squadron_rs(state))
    }

    pub fn create_fleet(&self, js: FleetParams) -> Option<Fleet> {
        let state: FleetState = js.into_serde().ok()?;

        Some(self.create_fleet_rs(Some(state)))
    }

    pub fn create_org(&self, js: OrgParams) -> Option<Org> {
        let state: OrgState = js.into_serde().ok()?;

        let xxh3 = xxh3(&state);

        let OrgState {
            id,
            f1,
            f2,
            f3,
            f4,
            a1,
            a2,
            a3,
            hq_level,
            org_type,
        } = state;

        Some(Org {
            xxh3,
            id: id.unwrap_or_default(),

            f1: self.create_fleet_rs(f1),
            f2: self.create_fleet_rs(f2),
            f3: self.create_fleet_rs(f3),
            f4: self.create_fleet_rs(f4),

            a1: self.create_air_squadron_rs(a1),
            a2: self.create_air_squadron_rs(a2),
            a3: self.create_air_squadron_rs(a3),

            hq_level: hq_level.unwrap_or(120),
            org_type: org_type.unwrap_or_default(),
        })
    }

    pub fn get_gear_ids(&self) -> Vec<i32> {
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
