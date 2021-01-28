use crate::{array::ShipArray, ship::ShipState};
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Debug, Default, Clone, Deserialize)]
pub struct ShipArrayState {
    pub s1: Option<ShipState>,
    pub s2: Option<ShipState>,
    pub s3: Option<ShipState>,
    pub s4: Option<ShipState>,
    pub s5: Option<ShipState>,
    pub s6: Option<ShipState>,
    pub s7: Option<ShipState>,
}

#[derive(Debug, Default, Clone, Deserialize)]
pub struct FleetState {
    pub main: Option<ShipArrayState>,
    pub escort: Option<ShipArrayState>,
    pub route_sup: Option<ShipArrayState>,
    pub boss_sup: Option<ShipArrayState>,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Fleet {
    #[wasm_bindgen(skip)]
    pub main: ShipArray,
    #[wasm_bindgen(skip)]
    pub escort: ShipArray,
    #[wasm_bindgen(skip)]
    pub route_sup: ShipArray,
    #[wasm_bindgen(skip)]
    pub boss_sup: ShipArray,
}
