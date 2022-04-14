use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum Role {
    Main,
    Escort,
}

impl Default for Role {
    fn default() -> Self {
        Self::Main
    }
}

impl Role {
    pub fn is_main(&self) -> bool {
        matches!(*self, Self::Main)
    }

    pub fn is_escort(&self) -> bool {
        matches!(*self, Self::Escort)
    }
}
