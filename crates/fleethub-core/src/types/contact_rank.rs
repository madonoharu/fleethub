use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Tsify)]
pub enum ContactRank {
    Rank1,
    Rank2,
    Rank3,
}

impl ContactRank {
    pub fn from_accuracy(accuracy: i16) -> Self {
        if accuracy <= 1 {
            Self::Rank1
        } else if accuracy == 2 {
            Self::Rank2
        } else {
            Self::Rank3
        }
    }

    pub fn airstrike_power_mod(self) -> f64 {
        match self {
            Self::Rank1 => 1.12,
            Self::Rank2 => 1.17,
            Self::Rank3 => 1.2,
        }
    }

    pub fn night_mods(self) -> NightContactModifiers {
        match self {
            Self::Rank1 => NightContactModifiers {
                power_mod: 5.0,
                accuracy_mod: 1.1,
                critical_rate_constant: 1.57,
            },
            Self::Rank2 => NightContactModifiers {
                power_mod: 7.0,
                accuracy_mod: 1.15,
                critical_rate_constant: 1.64,
            },
            Self::Rank3 => NightContactModifiers {
                power_mod: 9.0,
                accuracy_mod: 1.2,
                critical_rate_constant: 1.7,
            },
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct NightContactModifiers {
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub critical_rate_constant: f64,
}

impl Default for NightContactModifiers {
    fn default() -> Self {
        const NIGHT_CRITICAL_RATE_CONSTANT: f64 = 1.5;

        Self {
            power_mod: 0.0,
            accuracy_mod: 1.0,
            critical_rate_constant: NIGHT_CRITICAL_RATE_CONSTANT,
        }
    }
}
