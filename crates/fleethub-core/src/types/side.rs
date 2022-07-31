use std::ops::Not;

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum Side {
    Player,
    Enemy,
}

impl Default for Side {
    fn default() -> Self {
        Self::Player
    }
}
impl Not for Side {
    type Output = Self;

    fn not(self) -> Self::Output {
        match self {
            Self::Player => Self::Enemy,
            Self::Enemy => Self::Player,
        }
    }
}

impl Side {
    #[inline]
    pub fn is_player(self) -> bool {
        self == Self::Player
    }

    #[inline]
    pub fn is_enemy(self) -> bool {
        !self.is_player()
    }
}
