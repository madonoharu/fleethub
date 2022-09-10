use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(
    Debug, Default, Clone, Copy, PartialEq, Eq, Hash, FromPrimitive, Serialize, Deserialize, Tsify,
)]
#[serde(rename_all = "lowercase")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum ShipKey {
    #[default]
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
}

impl From<usize> for ShipKey {
    fn from(v: usize) -> Self {
        num_traits::FromPrimitive::from_usize(v).unwrap_or_default()
    }
}
