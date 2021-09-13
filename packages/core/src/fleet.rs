use wasm_bindgen::prelude::*;

use crate::{ship::Ship, utils::OptionalArray};

pub type ShipArray = OptionalArray<Ship, 7>;

impl ShipArray {
    pub fn get_by_ship_key(&self, key: &str) -> Option<&Ship> {
        match key {
            "s1" => self.get(0),
            "s2" => self.get(1),
            "s3" => self.get(2),
            "s4" => self.get(3),
            "s5" => self.get(4),
            "s6" => self.get(5),
            "s7" => self.get(6),
            _ => None,
        }
    }
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Fleet {
    pub(crate) xxh3: u64,

    #[wasm_bindgen(getter_with_clone)]
    pub id: String,

    #[wasm_bindgen(readonly)]
    pub len: usize,

    #[wasm_bindgen(skip)]
    pub ships: ShipArray,
}

#[wasm_bindgen]
impl Fleet {
    #[wasm_bindgen(getter)]
    pub fn xxh3(&self) -> String {
        format!("{:X}", self.xxh3)
    }

    pub fn ship_keys(&self) -> JsValue {
        let keys = (0..self.len)
            .map(|i| format!("s{}", i + 1))
            .collect::<Vec<String>>();

        JsValue::from_serde(&keys).unwrap()
    }

    pub fn count_ships(&self) -> usize {
        self.ships.values().count()
    }

    pub fn get_ship(&self, key: &str) -> Option<Ship> {
        self.ships.get_by_ship_key(key).cloned()
    }

    #[wasm_bindgen(getter)]
    pub fn fleet_los_mod(&self) -> Option<f64> {
        self.ships
            .values()
            .map(|ship| ship.fleet_los_factor())
            .sum::<Option<f64>>()
            .map(|base| (base.sqrt() + 0.1 * base).floor())
    }

    pub fn fighter_power(&self, anti_lbas: bool) -> Option<i32> {
        self.ships
            .values()
            .map(|ship| ship.fighter_power(anti_lbas))
            .sum()
    }
}
