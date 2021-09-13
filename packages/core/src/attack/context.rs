use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::types::{AirState, Engagement, Formation, OrgType, Role};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct WarfareShipEnvironment {
    pub org_type: OrgType,
    pub role: Role,
    pub ship_index: usize,
    pub fleet_len: usize,
    pub formation: Formation,
    pub fleet_los_mod: Option<f64>,
}

impl WarfareShipEnvironment {
    pub fn is_flagship(&self) -> bool {
        self.ship_index == 0
    }

    pub fn is_main_flagship(&self) -> bool {
        self.is_flagship() && self.role.is_main()
    }
}

#[derive(Debug, Clone, Deserialize, TS)]
pub struct WarfareContext {
    pub attacker_env: WarfareShipEnvironment,
    pub target_env: WarfareShipEnvironment,
    pub engagement: Engagement,
    pub air_state: AirState,
}
