use crate::{array::GearArray, gear::GearState};
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Debug, Default, Clone, Deserialize)]
pub struct AirbaseState {
    pub g1: Option<GearState>,
    pub g2: Option<GearState>,
    pub g3: Option<GearState>,
    pub g4: Option<GearState>,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Airbase {
    #[wasm_bindgen(skip)]
    pub gears: GearArray,
}
