use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum FleetType {
    Main,
    Escort,
    RouteSup,
    BossSup,
}
