use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{GearVecState, SlotSizeVecState};

#[derive(Debug, Default, Clone, Copy, Hash, Serialize, Deserialize, Tsify)]
pub enum AirSquadronMode {
    #[default]
    Sortie,
    AirDefense,
}

impl AirSquadronMode {
    pub fn is_air_defense(self) -> bool {
        matches!(self, Self::AirDefense)
    }
}

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
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
