use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::types::{AirState, Engagement};

use super::{AttackAnalyzerConfig, AttackAnalyzerShipConfig};

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[serde(default)]
#[tsify(from_wasm_abi)]
pub struct ShipAnalyzerConfig {
    pub air_state: AirState,
    pub engagement: Engagement,
    pub left: AttackAnalyzerShipConfig,
    pub right: AttackAnalyzerShipConfig,
}

impl ShipAnalyzerConfig {
    pub fn into_attack_analyzer_config(self, attacker_is_left: bool) -> AttackAnalyzerConfig {
        let Self {
            air_state,
            engagement,
            left,
            right,
        } = self;

        let (attacker, target) = if attacker_is_left {
            (left, right)
        } else {
            (right, left)
        };

        AttackAnalyzerConfig {
            air_state,
            engagement,
            attacker,
            target,
        }
    }
}
