use std::ops::Not;

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
pub enum Side {
    #[default]
    Player,
    Enemy,
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
pub enum Align {
    Left,
    Right,
}

impl Align {
    pub fn is_left(self) -> bool {
        matches!(self, Self::Left)
    }
}

impl Not for Align {
    type Output = Self;

    fn not(self) -> Self::Output {
        match self {
            Self::Left => Self::Right,
            Self::Right => Self::Left,
        }
    }
}
