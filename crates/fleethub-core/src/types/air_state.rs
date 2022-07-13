use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::Side;

#[derive(Debug, Default, Clone, Copy, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum AirState {
    /// 制空確保
    AirSupremacy,
    /// 制空優勢
    AirSuperiority,
    /// 制空均衡
    #[default]
    AirParity,
    /// 制空劣勢
    AirDenial,
    /// 制空喪失
    AirIncapability,
}

impl AirState {
    pub fn new(player: i32, enemy: i32) -> Self {
        if player >= enemy * 3 {
            Self::AirSupremacy
        } else if player * 2 >= enemy * 3 {
            Self::AirSuperiority
        } else if player * 3 > enemy * 2 {
            Self::AirParity
        } else if player * 3 > enemy {
            Self::AirDenial
        } else {
            Self::AirIncapability
        }
    }

    /// 制空定数
    pub fn constant(self) -> u32 {
        match self {
            AirState::AirSupremacy => 1,
            AirState::AirSuperiority => 3,
            AirState::AirParity => 5,
            AirState::AirDenial => 7,
            AirState::AirIncapability => 10,
        }
    }

    pub fn contact_mod(self) -> f64 {
        match self {
            AirState::AirSupremacy => 3.0,
            AirState::AirSuperiority => 2.0,
            AirState::AirDenial => 1.0,
            _ => 0.0,
        }
    }

    pub fn rank(self, side: Side) -> AirStateRank {
        if side.is_player() {
            match self {
                Self::AirSupremacy => AirStateRank::Rank3,
                Self::AirSuperiority => AirStateRank::Rank2,
                Self::AirDenial => AirStateRank::Rank1,
                Self::AirIncapability | Self::AirParity => AirStateRank::Rank0,
            }
        } else {
            match self {
                Self::AirIncapability => AirStateRank::Rank3,
                Self::AirDenial => AirStateRank::Rank2,
                Self::AirSuperiority => AirStateRank::Rank1,
                Self::AirSupremacy | Self::AirParity => AirStateRank::Rank0,
            }
        }
    }
}

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum AirStateRank {
    /// 喪失時の味方 | 確保時の敵 | 均衡
    Rank0,
    /// 劣勢時の味方 | 優勢時の敵
    Rank1,
    /// 優勢時の味方 | 劣勢時の敵
    Rank2,
    /// 制空時の味方 | 喪失時の敵
    Rank3,
}

impl AirStateRank {
    pub fn as_f64(&self) -> f64 {
        match self {
            Self::Rank0 => 0.0,
            Self::Rank1 => 1.0,
            Self::Rank2 => 2.0,
            Self::Rank3 => 3.0,
        }
    }
}
