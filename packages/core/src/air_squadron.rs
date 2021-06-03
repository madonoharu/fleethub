use crate::{
    array::{GearArray, SlotSizeArray},
    gear::GearState,
};
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Debug, Default, Clone, Deserialize)]
pub struct AirSquadronState {
    pub g1: Option<GearState>,
    pub g2: Option<GearState>,
    pub g3: Option<GearState>,
    pub g4: Option<GearState>,

    pub ss1: Option<i32>,
    pub ss2: Option<i32>,
    pub ss3: Option<i32>,
    pub ss4: Option<i32>,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct AirSquadron {
    #[wasm_bindgen(skip)]
    pub gears: GearArray,
    #[wasm_bindgen(skip)]
    pub slots: SlotSizeArray,
}
