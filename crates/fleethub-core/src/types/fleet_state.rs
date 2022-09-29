use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::ShipState;

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct FleetState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub len: Option<usize>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub s1: Option<ShipState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub s2: Option<ShipState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub s3: Option<ShipState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub s4: Option<ShipState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub s5: Option<ShipState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub s6: Option<ShipState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub s7: Option<ShipState>,
}
