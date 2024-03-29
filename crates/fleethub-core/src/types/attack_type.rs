use std::ops::Deref;

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
pub enum AswAttackType {
    #[default]
    DepthCharge,
    Aerial,
}

impl AswAttackType {
    pub fn is_depth_charge(self) -> bool {
        matches!(self, Self::DepthCharge)
    }

    pub fn type_constant(self) -> f64 {
        match self {
            Self::DepthCharge => 13.0,
            Self::Aerial => 8.0,
        }
    }
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
pub enum ShellingType {
    #[default]
    Normal,
    Aerial,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize, Tsify)]
pub enum NightAttackType {
    #[default]
    Normal,
    Swordfish,
    Aerial,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize, Tsify)]
pub struct SupportShellingType(pub ShellingType);

impl Deref for SupportShellingType {
    type Target = ShellingType;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<ShellingType> for SupportShellingType {
    #[inline]
    fn from(t: ShellingType) -> Self {
        Self(t)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Tsify)]
#[serde(tag = "t", content = "c")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum AttackType {
    Asw(AswAttackType),
    Shelling(ShellingType),
    Night(NightAttackType),
    Torpedo,
    SupportShelling(SupportShellingType),
}

impl AttackType {
    pub fn is_shelling(self) -> bool {
        matches!(self, Self::Shelling(_))
    }

    pub fn is_torpedo(self) -> bool {
        matches!(self, Self::Torpedo)
    }

    pub fn is_asw(self) -> bool {
        matches!(self, Self::Asw(_))
    }

    pub fn is_night(self) -> bool {
        matches!(self, Self::Night(_))
    }

    pub fn is_support_shelling(self) -> bool {
        matches!(self, Self::SupportShelling(_))
    }
}

impl From<AswAttackType> for AttackType {
    #[inline]
    fn from(t: AswAttackType) -> Self {
        Self::Asw(t)
    }
}

impl From<ShellingType> for AttackType {
    #[inline]
    fn from(t: ShellingType) -> Self {
        Self::Shelling(t)
    }
}

impl From<NightAttackType> for AttackType {
    #[inline]
    fn from(value: NightAttackType) -> Self {
        Self::Night(value)
    }
}

impl From<DayPhaseAttackType> for AttackType {
    #[inline]
    fn from(value: DayPhaseAttackType) -> Self {
        match value {
            DayPhaseAttackType::Shelling(t) => t.into(),
            DayPhaseAttackType::Asw(t) => t.into(),
        }
    }
}

impl From<NightPhaseAttackType> for AttackType {
    #[inline]
    fn from(value: NightPhaseAttackType) -> Self {
        match value {
            NightPhaseAttackType::Night(t) => t.into(),
            NightPhaseAttackType::Asw(t) => t.into(),
        }
    }
}

impl From<TorpedoAttackType> for AttackType {
    #[inline]
    fn from(_: TorpedoAttackType) -> Self {
        Self::Torpedo
    }
}

impl From<SupportShellingType> for AttackType {
    #[inline]
    fn from(t: SupportShellingType) -> Self {
        Self::SupportShelling(t)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Tsify)]
#[serde(tag = "t", content = "c")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum DayPhaseAttackType {
    Shelling(ShellingType),
    Asw(AswAttackType),
}

impl DayPhaseAttackType {
    pub fn is_shelling(self) -> bool {
        matches!(self, Self::Shelling(_))
    }

    pub fn is_asw(self) -> bool {
        matches!(self, Self::Asw(_))
    }
}

impl From<ShellingType> for DayPhaseAttackType {
    fn from(value: ShellingType) -> Self {
        Self::Shelling(value)
    }
}

impl From<AswAttackType> for DayPhaseAttackType {
    fn from(value: AswAttackType) -> Self {
        Self::Asw(value)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Tsify)]
#[serde(tag = "t", content = "c")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum NightPhaseAttackType {
    Night(NightAttackType),
    Asw(AswAttackType),
}

impl NightPhaseAttackType {
    pub fn is_night_attack(self) -> bool {
        matches!(self, Self::Night(_))
    }

    pub fn is_asw(self) -> bool {
        matches!(self, Self::Asw(_))
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
pub struct TorpedoAttackType;
