use wasm_bindgen::prelude::*;

use crate::types::ShipConditions;

#[wasm_bindgen]
pub fn parse_ship_conditions(value: ShipConditions) -> ShipConditions {
    value
}
