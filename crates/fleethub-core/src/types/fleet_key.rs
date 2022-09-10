use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(
    Debug, Default, Clone, Copy, PartialEq, Eq, Hash, FromPrimitive, Serialize, Deserialize, Tsify,
)]
#[serde(rename_all = "lowercase")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum FleetKey {
    #[default]
    F1,
    F2,
    F3,
    F4,
}

use FleetKey::*;

impl FleetKey {
    pub fn iter() -> std::array::IntoIter<FleetKey, 4> {
        [F1, F2, F3, F4].into_iter()
    }

    pub fn next(self) -> Self {
        num_traits::FromPrimitive::from_i8((self as i8 + 1).rem_euclid(4)).unwrap()
    }

    pub fn next_back(self) -> Self {
        num_traits::FromPrimitive::from_i8((self as i8 - 1).rem_euclid(4)).unwrap()
    }
}
