use num_derive::FromPrimitive;
use ordered_float::OrderedFloat;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{CustomPowerModifiers, GearVecState};

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct SlotSizeVecState {
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

impl IntoIterator for SlotSizeVecState {
    type Item = Option<u8>;
    type IntoIter = std::array::IntoIter<Self::Item, 5>;

    fn into_iter(self) -> Self::IntoIter {
        [self.ss1, self.ss2, self.ss3, self.ss4, self.ss5].into_iter()
    }
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

    #[serde(flatten)]
    pub gears: GearVecState,
    #[serde(flatten)]
    pub slots: SlotSizeVecState,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[tsify(type = "number")]
    pub day_gunfit_accuracy: Option<OrderedFloat<f64>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[tsify(type = "number")]
    pub night_gunfit_accuracy: Option<OrderedFloat<f64>>,

    #[serde(default)]
    pub custom_power_mods: CustomPowerModifiers,
}

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
