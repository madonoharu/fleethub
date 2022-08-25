use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(
    Debug, Default, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum DamageState {
    /// 小破未満
    #[default]
    Normal,
    /// 小破
    Shouha,
    /// 中破
    Chuuha,
    /// 大破
    Taiha,
    /// 轟沈
    Sunk,
}

impl DamageState {
    pub fn new(max_hp: u16, current_hp: u16) -> Self {
        if current_hp == 0 {
            Self::Sunk
        } else if current_hp <= Self::Taiha.bound(max_hp) {
            Self::Taiha
        } else if current_hp <= Self::Chuuha.bound(max_hp) {
            Self::Chuuha
        } else if current_hp <= Self::Shouha.bound(max_hp) {
            Self::Shouha
        } else {
            Self::Normal
        }
    }

    pub fn bound(self, max_hp: u16) -> u16 {
        match self {
            Self::Normal => max_hp,
            Self::Shouha => (max_hp * 3) / 4,
            Self::Chuuha => max_hp / 2,
            Self::Taiha => max_hp / 4,
            Self::Sunk => 0,
        }
    }

    pub fn common_power_mod(&self) -> f64 {
        match self {
            Self::Normal | Self::Shouha => 1.0,
            Self::Chuuha => 0.7,
            Self::Taiha => 0.4,
            _ => 0.0,
        }
    }

    pub fn torpedo_power_mod(&self) -> f64 {
        match self {
            Self::Normal | Self::Shouha => 1.0,
            Self::Chuuha => 0.8,
            _ => 0.0,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_damage_state() {
        use DamageState::*;

        let mut vec: Vec<DamageState> = vec![Normal, Shouha, Chuuha, Sunk, Taiha];
        vec.sort();
        assert_eq!(vec, vec![Normal, Shouha, Chuuha, Taiha, Sunk]);

        let table = [
            (99, 0, Sunk),
            (99, 24, Taiha),
            (99, 25, Chuuha),
            (99, 49, Chuuha),
            (99, 50, Shouha),
            (99, 74, Shouha),
            (99, 75, Normal),
            (99, 99, Normal),
            (12, 0, Sunk),
            (12, 3, Taiha),
            (12, 4, Chuuha),
            (12, 6, Chuuha),
            (12, 7, Shouha),
            (12, 9, Shouha),
            (12, 10, Normal),
            (12, 12, Normal),
        ];

        for (max_hp, current_hp, expected) in table.into_iter() {
            assert_eq!(DamageState::new(max_hp, current_hp), expected);
        }
    }
}
