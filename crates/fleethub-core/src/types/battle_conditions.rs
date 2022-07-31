use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{ContactRank, Formation, NightContactModifiers, OrgType, Role, Side};

#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct BattleConditions {
    pub org_type: OrgType,
    pub role: Role,
    pub ship_index: usize,
    pub fleet_len: usize,
    pub formation: Formation,
    pub fleet_los_mod: Option<f64>,
    pub night_conditions: NightFleetConditions,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct NightConditions {
    pub player: NightFleetConditions,
    pub enemy: NightFleetConditions,
}

impl NightConditions {
    pub fn night_fleet_conditions(&self, side: Side) -> &NightFleetConditions {
        if side.is_player() {
            &self.player
        } else {
            &self.enemy
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(default)]
pub struct NightFleetConditions {
    pub night_contact_rank: Option<ContactRank>,
    pub starshell_index: Option<usize>,
    pub searchlight_index: Option<usize>,
    pub activates_large_searchlight: bool,
}

impl NightFleetConditions {
    pub fn activates_starshell(&self) -> bool {
        self.starshell_index.is_some()
    }

    pub fn activates_searchlight(&self) -> bool {
        self.searchlight_index.is_some()
    }

    pub fn starshell_accuracy_mod(&self) -> f64 {
        if self.starshell_index.is_some() {
            5.0
        } else {
            0.0
        }
    }

    pub fn searchlight_accuracy_mod(&self) -> f64 {
        if self.searchlight_index.is_some() {
            7.0
        } else {
            0.0
        }
    }

    pub fn night_contact_mods(&self) -> NightContactModifiers {
        self.night_contact_rank
            .map(|rank| rank.night_mods())
            .unwrap_or_default()
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(default)]
pub struct ShipEnvironment {
    pub org_type: OrgType,
    pub role: Role,
    pub index: usize,
    pub fleet_len: usize,
    pub formation: Formation,
    pub fleet_los_mod: Option<f64>,
    pub night_conditions: NightFleetConditions,
}

impl ShipEnvironment {
    pub fn is_flagship(&self) -> bool {
        self.index == 0
    }

    pub fn is_main_flagship(&self) -> bool {
        self.role.is_main() && self.is_flagship()
    }

    pub fn as_night_conditions(&self) -> &NightFleetConditions {
        &self.night_conditions
    }
}
