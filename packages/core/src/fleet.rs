use crate::{
    array::ShipArray,
    ship::{Ship, ShipState},
};
use seq_macro::seq;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Debug, Default, Clone, Hash, Deserialize)]
pub struct FleetState {
    pub id: Option<String>,

    pub s1: Option<ShipState>,
    pub s2: Option<ShipState>,
    pub s3: Option<ShipState>,
    pub s4: Option<ShipState>,
    pub s5: Option<ShipState>,
    pub s6: Option<ShipState>,
    pub s7: Option<ShipState>,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Fleet {
    pub(crate) xxh3: u64,

    #[wasm_bindgen(skip)]
    pub id: String,

    #[wasm_bindgen(skip)]
    pub ships: ShipArray,
}

#[wasm_bindgen]
impl Fleet {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> String {
        self.id.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn xxh3(&self) -> String {
        format!("{:X}", self.xxh3)
    }

    pub fn get_ship(&self, key: &str) -> Option<Ship> {
        self.ships.get_by_ship_key(key).clone()
    }
}
