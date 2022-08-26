use enumset::{EnumSet, EnumSetType};
use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::Role;

#[allow(clippy::derive_hash_xor_eq)]
#[derive(Debug, Default, EnumSetType, Hash, PartialOrd, Ord, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum FleetType {
    #[default]
    Main,
    Escort,
    RouteSup,
    BossSup,
}

impl From<Role> for FleetType {
    fn from(role: Role) -> Self {
        if role.is_main() {
            Self::Main
        } else {
            Self::Escort
        }
    }
}

impl From<Role> for EnumSet<FleetType> {
    fn from(role: Role) -> Self {
        EnumSet::only(FleetType::from(role))
    }
}

impl From<FleetType> for Role {
    #[inline]
    fn from(t: FleetType) -> Self {
        if t == FleetType::Escort {
            Role::Escort
        } else {
            Role::Main
        }
    }
}
