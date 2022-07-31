use enumset::{EnumSet, EnumSetType};
use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::Role;

#[allow(clippy::derive_hash_xor_eq)]
#[derive(Debug, EnumSetType, Hash, PartialOrd, Ord, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum FleetType {
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
