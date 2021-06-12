use crate::{array::ShipArray, ship::ShipState};
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Debug, Default, Clone, Deserialize)]
pub struct FleetState {
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
    #[wasm_bindgen(skip)]
    pub ships: ShipArray,
}
