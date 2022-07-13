use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::types::{AirState, Engagement, ShipEnvironment};

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
pub struct WarfareContext {
    pub attacker_env: ShipEnvironment,
    pub target_env: ShipEnvironment,
    pub engagement: Engagement,
    pub air_state: AirState,
}
