use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(
    Debug, Default, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum MoraleState {
    Sparkle,
    #[default]
    Normal,
    Orange,
    Red,
}

impl MoraleState {
    pub fn new(value: u8) -> Self {
        if value > 49 {
            Self::Sparkle
        } else if value > 29 {
            Self::Normal
        } else if value > 19 {
            Self::Orange
        } else {
            Self::Red
        }
    }

    /// 雷撃戦以外の命中補正
    pub fn common_accuracy_mod(&self) -> f64 {
        match self {
            Self::Sparkle => 1.2,
            Self::Normal => 1.0,
            Self::Orange => 0.8,
            Self::Red => 0.5,
        }
    }

    pub fn torpedo_accuracy_mod(&self) -> f64 {
        match self {
            Self::Sparkle => 1.3,
            Self::Normal => 1.0,
            Self::Orange => 0.7,
            Self::Red => 0.35,
        }
    }

    pub fn hit_rate_mod(&self) -> f64 {
        match self {
            Self::Sparkle => 0.7,
            Self::Normal => 1.0,
            Self::Orange => 1.2,
            Self::Red => 1.4,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_morale_state() {
        use MoraleState::*;

        let mut vec = vec![Orange, Red, Normal, Sparkle];
        vec.sort();
        assert_eq!(vec, vec![Sparkle, Normal, Orange, Red]);

        let table = [
            (50, Sparkle),
            (49, Normal),
            (30, Normal),
            (29, Orange),
            (20, Orange),
            (19, Red),
            (0, Red),
        ];

        for (value, expected) in table.into_iter() {
            assert_eq!(MoraleState::new(value), expected);
        }
    }
}
