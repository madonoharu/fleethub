use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{AirSquadronState, FleetState, OrgType};

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct OrgState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub f1: Option<FleetState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub f2: Option<FleetState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub f3: Option<FleetState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub f4: Option<FleetState>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub a1: Option<AirSquadronState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub a2: Option<AirSquadronState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub a3: Option<AirSquadronState>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub hq_level: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub org_type: Option<OrgType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sortie: Option<FleetKey>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub route_sup: Option<FleetKey>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub boss_sup: Option<FleetKey>,
}

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
    pub fn iter() -> std::array::IntoIter<Self, 4> {
        [F1, F2, F3, F4].into_iter()
    }

    pub fn next(self) -> Self {
        num_traits::FromPrimitive::from_i8((self as i8 + 1).rem_euclid(4)).unwrap()
    }

    pub fn next_back(self) -> Self {
        num_traits::FromPrimitive::from_i8((self as i8 - 1).rem_euclid(4)).unwrap()
    }
}
