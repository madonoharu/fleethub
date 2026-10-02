use tsify::{Ts, Tsify};
use wasm_bindgen::prelude::*;

use crate::types::ShipConditions;

pub fn parse_ship_conditions(value: ShipConditions) -> ShipConditions {
    value
}

#[wasm_bindgen(js_name = parse_ship_conditions)]
pub fn parse_ship_conditions_js(value: Ts<ShipConditions>) -> Result<Ts<ShipConditions>, JsError> {
    Ok(parse_ship_conditions(value.to_rust()?).into_ts()?)
}
