use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use strum::EnumIter;
use tsify::Tsify;

use super::OrgType;

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct GearState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,

    pub gear_id: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exp: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stars: Option<u8>,
}

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
pub struct ShipOverrides {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub naked_max_hp: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub naked_luck: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub naked_evasion: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub naked_asw: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub naked_los: Option<u16>,
}

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct ShipState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub ship_id: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub level: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current_hp: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub morale: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ammo: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fuel: Option<u16>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_hp_mod: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub firepower_mod: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub torpedo_mod: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub armor_mod: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub anti_air_mod: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub evasion_mod: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub asw_mod: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub los_mod: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub luck_mod: Option<i16>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub g1: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g2: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g3: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g4: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g5: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gx: Option<GearState>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss1: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss2: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss3: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss4: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss5: Option<u8>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub overrides: Option<ShipOverrides>,
}

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
    pub fn is_air_defense(&self) -> bool {
        matches!(*self, Self::AirDefense)
    }
}

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct AirSquadronState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub mode: Option<AirSquadronMode>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub g1: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g2: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g3: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g4: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g5: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gx: Option<GearState>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss1: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss2: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss3: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss4: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ss5: Option<u8>,
}

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
    pub sortie: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub route_sup: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub boss_sup: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, EnumIter, Serialize, Deserialize, Tsify)]
#[serde(rename_all = "lowercase")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum ShipKey {
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[serde(transparent)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct ShipStateMap {
    map: HashMap<ShipKey, ShipState>,
}
