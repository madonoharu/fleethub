use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::FleetType;

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct ShipMeta {
    pub id: String,
    pub ship_id: u16,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct FleetMeta {
    pub id: String,
    pub len: usize,
    pub ships: Vec<(String, Option<ShipMeta>)>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct CompMeta {
    pub fleets: HashMap<FleetType, FleetMeta>,
}
