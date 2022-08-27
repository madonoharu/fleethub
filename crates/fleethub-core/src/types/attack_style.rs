use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{
    AswAttackType, AttackType, DayCutin, DayCutinDef, DayCutinLike, NightAttackType, NightCutinDef,
    NightCutinLike, ShellingType, SupportShellingType, TorpedoAttackType,
};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "tag")]
pub struct ShellingStyle {
    pub attack_type: ShellingType,
    pub cutin: Option<DayCutinLike>,
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub hits: f64,
}

impl Default for ShellingStyle {
    fn default() -> Self {
        Self {
            attack_type: Default::default(),
            cutin: Default::default(),
            power_mod: 1.0,
            accuracy_mod: 1.0,
            hits: 1.0,
        }
    }
}

impl ShellingStyle {
    pub fn new(attack_type: ShellingType, cutin_def: Option<&DayCutinDef>) -> Self {
        Self {
            attack_type,
            cutin: cutin_def.as_ref().map(|def| def.tag.into()),
            power_mod: cutin_def
                .as_ref()
                .and_then(|def| def.power_mod)
                .unwrap_or(1.0),
            accuracy_mod: cutin_def
                .as_ref()
                .and_then(|def| def.accuracy_mod)
                .unwrap_or(1.0),
            hits: cutin_def.as_ref().map(|def| def.hits as f64).unwrap_or(1.0),
        }
    }

    pub fn is_cutin(&self) -> bool {
        self.cutin.is_some()
    }

    pub fn as_day_cutin(&self) -> Option<DayCutin> {
        self.cutin.as_ref()?.as_day_cutin()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[serde(tag = "tag")]
pub struct NightAttackStyle {
    pub attack_type: NightAttackType,
    pub cutin: Option<NightCutinLike>,
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub hits: f64,
}

impl Default for NightAttackStyle {
    fn default() -> Self {
        Self {
            attack_type: Default::default(),
            cutin: Default::default(),
            power_mod: 1.0,
            accuracy_mod: 1.0,
            hits: 1.0,
        }
    }
}

impl NightAttackStyle {
    pub fn new(attack_type: NightAttackType, cutin_def: Option<&NightCutinDef>) -> Self {
        Self {
            attack_type,
            cutin: cutin_def.as_ref().map(|def| def.tag.into()),
            power_mod: cutin_def
                .as_ref()
                .and_then(|def| def.power_mod)
                .unwrap_or(1.0),
            accuracy_mod: cutin_def
                .as_ref()
                .and_then(|def| def.accuracy_mod)
                .unwrap_or(1.0),
            hits: cutin_def.as_ref().map(|def| def.hits as f64).unwrap_or(1.0),
        }
    }

    pub fn has_model_d_small_gun_mod(&self) -> bool {
        self.cutin
            .as_ref()
            .map_or(false, |cutin| cutin.has_model_d_small_gun_mod())
    }

    pub fn is_cutin(&self) -> bool {
        self.cutin.is_some()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
#[serde(tag = "tag")]
pub struct AswAttackStyle {
    pub attack_type: AswAttackType,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
#[serde(tag = "tag")]
pub struct TorpedoAttackStyle {
    pub attack_type: TorpedoAttackType,
}

impl From<TorpedoAttackType> for TorpedoAttackStyle {
    fn from(attack_type: TorpedoAttackType) -> Self {
        Self { attack_type }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(untagged)]
pub enum DayPhaseAttackStyle {
    Shelling(ShellingStyle),
    Asw(AswAttackStyle),
}

impl DayPhaseAttackStyle {
    pub fn to_attack_type(&self) -> AttackType {
        match self {
            DayPhaseAttackStyle::Asw(style) => style.attack_type.into(),
            DayPhaseAttackStyle::Shelling(style) => style.attack_type.into(),
        }
    }
}

impl From<AswAttackType> for DayPhaseAttackStyle {
    fn from(attack_type: AswAttackType) -> Self {
        Self::Asw(AswAttackStyle { attack_type })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[serde(untagged)]
pub enum NightPhaseAttackStyle {
    Night(NightAttackStyle),
    Asw(AswAttackStyle),
}

impl From<AswAttackType> for NightPhaseAttackStyle {
    fn from(attack_type: AswAttackType) -> Self {
        Self::Asw(AswAttackStyle { attack_type })
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Tsify)]
#[serde(tag = "tag")]
pub struct SupportShellingStyle {
    pub attack_type: SupportShellingType,
}

pub trait AttackStyleKey {
    fn key(&self) -> String {
        "SingleAttack".to_string()
    }
}

impl AttackStyleKey for DayPhaseAttackStyle {
    fn key(&self) -> String {
        match self {
            Self::Shelling(t) => t.key(),
            Self::Asw(t) => t.key(),
        }
    }
}

impl AttackStyleKey for NightPhaseAttackStyle {
    fn key(&self) -> String {
        match self {
            Self::Night(t) => t.key(),
            Self::Asw(t) => t.key(),
        }
    }
}

fn untagged_enum_to_string<T: ?Sized + Serialize>(value: &T) -> String {
    let mut string = serde_json::to_string(value).unwrap();
    string.pop();
    string.remove(0);
    string
}

impl AttackStyleKey for DayCutinLike {
    fn key(&self) -> String {
        untagged_enum_to_string(self)
    }
}

impl AttackStyleKey for NightCutinLike {
    fn key(&self) -> String {
        untagged_enum_to_string(self)
    }
}

impl<T: AttackStyleKey> AttackStyleKey for Option<T> {
    fn key(&self) -> String {
        match self {
            Some(v) => v.key(),
            None => "SingleAttack".to_string(),
        }
    }
}

impl AttackStyleKey for ShellingStyle {
    fn key(&self) -> String {
        self.cutin.key()
    }
}

impl AttackStyleKey for NightAttackStyle {
    fn key(&self) -> String {
        self.cutin.key()
    }
}

impl AttackStyleKey for AswAttackStyle {
    fn key(&self) -> String {
        self.attack_type.key()
    }
}

impl AttackStyleKey for ShellingType {}

impl AttackStyleKey for TorpedoAttackStyle {}

impl AttackStyleKey for AswAttackType {}

impl AttackStyleKey for SupportShellingStyle {}

#[cfg(test)]
mod test {
    use crate::types::{FleetCutin, NightCutin};

    use super::*;

    #[test]
    fn test_attack_style_key() {
        assert_eq!(
            ShellingStyle {
                attack_type: ShellingType::Normal,
                cutin: None,
                ..Default::default()
            }
            .key(),
            "SingleAttack"
        );

        assert_eq!(
            ShellingStyle {
                attack_type: ShellingType::Normal,
                cutin: Some(DayCutinLike::DayCutin(DayCutin::MainSec)),
                ..Default::default()
            }
            .key(),
            "MainSec"
        );

        assert_eq!(
            ShellingStyle {
                attack_type: ShellingType::Normal,
                cutin: Some(DayCutinLike::FleetCutin(FleetCutin::NagatoClassCutin)),
                ..Default::default()
            }
            .key(),
            "NagatoClassCutin"
        );

        assert_eq!(
            NightAttackStyle {
                attack_type: NightAttackType::Normal,
                cutin: None,
                ..Default::default()
            }
            .key(),
            "SingleAttack"
        );

        assert_eq!(
            NightAttackStyle {
                attack_type: NightAttackType::Normal,
                cutin: Some(NightCutinLike::NightCutin(NightCutin::MainTorpRadar)),
                ..Default::default()
            }
            .key(),
            "MainTorpRadar"
        );

        assert_eq!(
            NightAttackStyle {
                attack_type: NightAttackType::Normal,
                cutin: Some(NightCutinLike::FleetCutin(FleetCutin::KongouClassCutin)),
                ..Default::default()
            }
            .key(),
            "KongouClassCutin"
        );
    }
}
