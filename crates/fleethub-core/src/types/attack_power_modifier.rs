use std::fmt;
use std::hash::Hash;

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Clone, Copy, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct AttackPowerModifier {
    pub a: f64,
    pub b: f64,
}

impl fmt::Debug for AttackPowerModifier {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "(a: {}, b: {})", self.a, self.b)
    }
}

impl Default for AttackPowerModifier {
    fn default() -> Self {
        Self { a: 1.0, b: 0.0 }
    }
}

#[allow(clippy::derive_hash_xor_eq)]
impl Hash for AttackPowerModifier {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        use ordered_float::OrderedFloat;
        OrderedFloat::<f64>::hash(&self.a.into(), state);
        OrderedFloat::<f64>::hash(&self.b.into(), state);
    }
}

impl From<(f64, f64)> for AttackPowerModifier {
    #[inline]
    fn from((a, b): (f64, f64)) -> Self {
        Self { a, b }
    }
}

impl AttackPowerModifier {
    pub fn new(a: f64, b: f64) -> Self {
        Self { a, b }
    }

    pub fn set(&mut self, a: f64, b: f64) {
        self.a = a;
        self.b = b;
    }

    pub fn compose(&self, other: Self) -> Self {
        Self {
            a: self.a * other.a,
            b: self.b + other.b,
        }
    }

    pub fn merge(&mut self, a: f64, b: f64) {
        self.a *= a;
        self.b += b;
    }

    #[inline]
    pub fn apply(self, v: f64) -> f64 {
        self.a * v + self.b
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
pub struct SpecialEnemyModifiers {
    pub precap_general_mod: AttackPowerModifier,
    pub stype_mod: AttackPowerModifier,
    pub landing_craft_synergy_mod: AttackPowerModifier,
    pub toku_daihatsu_tank_mod: AttackPowerModifier,
    pub m4a1dd_mod: AttackPowerModifier,
    pub honi_mod: AttackPowerModifier,
    pub postcap_general_mod: AttackPowerModifier,
    pub pt_mod: AttackPowerModifier,
}

impl SpecialEnemyModifiers {
    pub fn new() -> Self {
        Self::default()
    }
}

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi)]
#[serde(default)]
pub struct CustomPowerModifiers {
    pub precap_mod: AttackPowerModifier,
    pub postcap_mod: AttackPowerModifier,
    pub basic_power_mod: AttackPowerModifier,
}
