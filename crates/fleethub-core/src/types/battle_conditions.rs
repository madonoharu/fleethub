use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{ContactRank, Formation, OrgType, Role};

#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct BattleConditions {
    pub org_type: OrgType,
    pub role: Role,
    pub ship_index: usize,
    pub fleet_len: usize,
    pub formation: Formation,
    pub fleet_los_mod: Option<f64>,
    pub night_conditions: NightConditions,
}

pub struct ShipConditions {
    pub org_type: OrgType,
    pub role: Role,
    pub ship_index: usize,
    pub fleet_len: usize,
    pub formation: Formation,
    pub fleet_los_mod: Option<f64>,
    pub night_conditions: Option<NightConditions>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(default)]
pub struct NightConditions {
    pub night_contact_rank: Option<ContactRank>,
    pub starshell_index: Option<usize>,
    pub searchlight_index: Option<usize>,
}

impl NightConditions {
    pub fn starshell(&self) -> bool {
        self.searchlight_index.is_some()
    }

    pub fn searchlight(&self) -> bool {
        self.searchlight_index.is_some()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(default)]
pub struct ShipEnvironment {
    pub org_type: OrgType,
    pub role: Role,
    pub index: usize,
    pub fleet_len: usize,
    pub formation: Formation,
    pub fleet_los_mod: Option<f64>,
    pub night_conditions: NightConditions,
}

impl Default for ShipEnvironment {
    fn default() -> Self {
        Self {
            org_type: Default::default(),
            role: Default::default(),
            index: Default::default(),
            fleet_len: Default::default(),
            formation: Default::default(),
            fleet_los_mod: Default::default(),
            night_conditions: Default::default(),
        }
    }
}

impl ShipEnvironment {
    pub fn is_flagship(&self) -> bool {
        self.index == 0
    }

    pub fn is_main_flagship(&self) -> bool {
        self.role.is_main() && self.is_flagship()
    }

    pub fn as_night_conditions(&self) -> &NightConditions {
        &self.night_conditions
    }
}
