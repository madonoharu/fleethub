use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::{AttackParams, AttackPowerParams, DefenseParams, HitRateParams, WarfareContext},
    ship::Ship,
    types::{
        gear_id, matches_gear_id, AttackPowerModifier, BattleDefinitions, Engagement, GearAttr,
        GearType, ShipEnvironment, ShipType,
    },
};

const ASW_POWER_CAP: f64 = 170.0;
const ASW_ACCURACY_CONSTANT: f64 = 80.0;
const ASW_CRITICAL_RATE_CONSTANT: f64 = 1.1;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, Tsify)]
pub enum AswAttackType {
    DepthCharge,
    Aircraft,
}

impl AswAttackType {
    fn type_constant(&self) -> f64 {
        match self {
            Self::DepthCharge => 13.0,
            Self::Aircraft => 8.0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum AswTime {
    Opening,
    Day,
    Night,
}

impl AswTime {
    fn is_opening(&self) -> bool {
        matches!(self, Self::Opening)
    }
}

trait AttackContext {
    fn engagement(&self) -> Engagement;
    fn formation_power_mod(&self) -> f64;
    fn formation_accuracy_mod(&self) -> f64;
    fn formation_evasion_mod(&self) -> f64;
}
