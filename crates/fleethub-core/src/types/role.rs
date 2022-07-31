use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(
    Debug, Default, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum Role {
    /// 主力艦隊
    #[default]
    Main,
    /// 護衛艦隊
    Escort,
}

impl Role {
    #[inline]
    pub fn is_main(self) -> bool {
        matches!(self, Self::Main)
    }

    #[inline]
    pub fn is_escort(self) -> bool {
        matches!(self, Self::Escort)
    }
}
