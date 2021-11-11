use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::{night::NightCutin, DayCutin, NightSpecialAttack, ShellingSpecialAttack};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct AntiAirCutinDef {
    pub id: u8,
    pub chance_numer: Option<u8>,
    pub multiplier: Option<f64>,
    pub minimum_bonus: Option<u8>,
    pub sequential: Option<bool>,
}

impl AntiAirCutinDef {
    pub fn rate(&self) -> Option<f64> {
        Some(self.chance_numer? as f64 / 101.)
    }

    pub fn is_sequential(&self) -> bool {
        crate::log!("{} {:?}", self.id, self.sequential);
        self.sequential.unwrap_or_default()
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct DayCutinDef {
    pub tag: DayCutin,
    pub hits: u8,
    pub chance_denom: Option<u8>,
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
}

pub struct CutinModifiers {
    pub power_mod: f64,
    pub accuracy_mod: f64,
}

impl Default for CutinModifiers {
    fn default() -> Self {
        Self {
            power_mod: 1.0,
            accuracy_mod: 1.0,
        }
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct NightCutinDef {
    pub tag: NightCutin,
    pub hits: f64,
    pub chance_denom: Option<u8>,
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
}

impl NightCutinDef {
    pub fn to_modifiers(&self) -> CutinModifiers {
        CutinModifiers {
            power_mod: self.power_mod.unwrap_or(1.0),
            accuracy_mod: self.accuracy_mod.unwrap_or(1.0),
        }
    }

    pub fn rate(&self, cutin_term: f64) -> Option<f64> {
        let rate = if self.tag == NightCutin::DoubleAttack {
            109. / 110.
        } else {
            (cutin_term.ceil() / self.chance_denom? as f64).min(1.)
        };

        Some(rate)
    }
}

#[derive(Debug, Default, Clone)]
pub struct SpecialAttackDef<T> {
    pub kind: T,
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub hits: f64,
}

impl From<&DayCutinDef> for SpecialAttackDef<ShellingSpecialAttack> {
    fn from(def: &DayCutinDef) -> Self {
        Self {
            kind: ShellingSpecialAttack::DayCutin(def.tag),
            power_mod: def.power_mod.unwrap_or(1.0),
            accuracy_mod: def.accuracy_mod.unwrap_or(1.0),
            hits: def.hits.into(),
        }
    }
}

impl From<&NightCutinDef> for SpecialAttackDef<NightSpecialAttack> {
    fn from(def: &NightCutinDef) -> Self {
        Self {
            kind: NightSpecialAttack::NightCutin(def.tag),
            power_mod: def.power_mod.unwrap_or(1.0),
            accuracy_mod: def.accuracy_mod.unwrap_or(1.0),
            hits: def.hits,
        }
    }
}
