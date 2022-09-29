use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{GearVecState, SlotSizeVecState};

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum AirSquadronMode {
    Sortie,
    AirDefense,
}

impl Default for AirSquadronMode {
    fn default() -> Self {
        Self::Sortie
    }
}

impl AirSquadronMode {
    pub fn is_air_defense(self) -> bool {
        matches!(self, Self::AirDefense)
    }
}

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct AirSquadronState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub mode: Option<AirSquadronMode>,

    #[serde(flatten)]
    pub gears: GearVecState,
    #[serde(flatten)]
    pub slots: SlotSizeVecState,
}
