use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS)]
pub enum Engagement {
    /// 同航戦
    Parallel,
    /// 反航戦
    HeadOn,
    /// T有利
    GreenT,
    /// T不利
    RedT,
}

impl Engagement {
    pub fn modifier(&self) -> f64 {
        match *self {
            Self::Parallel => 1.0,
            Self::HeadOn => 0.8,
            Self::GreenT => 1.2,
            Self::RedT => 0.6,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
pub enum SingleFormation {
    /// 単縦陣
    LineAhead,
    /// 複縦陣
    DoubleLine,
    /// 輪形陣
    Diamond,
    /// 梯形陣
    Echelon,
    /// 単横陣
    LineAbreast,
    /// 警戒陣
    Vanguard,
}

impl Default for SingleFormation {
    fn default() -> Self {
        Self::LineAhead
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
pub enum CombinedFormation {
    /// 第一警戒航行序列
    Cruising1,
    /// 第二警戒航行序列
    Cruising2,
    /// 第三警戒航行序列
    Cruising3,
    /// 第四警戒航行序列
    Cruising4,
}

impl Default for CombinedFormation {
    fn default() -> Self {
        Self::Cruising4
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[serde(untagged)]
pub enum Formation {
    Single(SingleFormation),
    Combined(CombinedFormation),
}

impl Default for Formation {
    fn default() -> Self {
        Self::Single(Default::default())
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct FormationAttackModifiers {
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
    pub evasion_mod: Option<f64>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct NormalFormationDef {
    pub tag: Formation,
    pub protection_rate: Option<f64>,
    pub fleet_anti_air_mod: f64,
    pub shelling: FormationAttackModifiers,
    pub torpedo: FormationAttackModifiers,
    pub asw: FormationAttackModifiers,
    pub night: FormationAttackModifiers,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(untagged)]
pub enum FormationDef {
    Normal(NormalFormationDef),
    Vanguard {
        top_half: NormalFormationDef,
        bottom_half: NormalFormationDef,
    },
}

impl Default for FormationDef {
    fn default() -> Self {
        Self::Normal(Default::default())
    }
}

impl FormationDef {
    pub fn tag(&self) -> Formation {
        match self {
            Self::Normal(normal) => normal.tag,
            Self::Vanguard { top_half, .. } => top_half.tag,
        }
    }

    pub fn get_normal_def(&self, ship_index: usize, fleet_size: usize) -> &NormalFormationDef {
        match self {
            Self::Normal(normal) => normal,
            Self::Vanguard {
                top_half,
                bottom_half,
            } => {
                if ship_index * 2 <= fleet_size {
                    top_half
                } else {
                    bottom_half
                }
            }
        }
    }
}

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS)]
pub enum AirState {
    /// 制空確保
    AirSupremacy,
    /// 制空優勢
    AirSuperiority,
    /// 制空均衡
    AirParity,
    /// 制空劣勢
    AirDenial,
    /// 制空喪失
    AirIncapability,
}

impl AirState {
    pub fn contact_mod(self) -> f64 {
        match self {
            AirState::AirSupremacy => 3.0,
            AirState::AirSuperiority => 2.0,
            AirState::AirDenial => 1.0,
            _ => 0.0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
pub enum ContactRank {
    Rank1,
    Rank2,
    Rank3,
}

pub struct NightContactModifiers {
    power_mod: f64,
    accuracy_mod: f64,
    critical_rate_mod: f64,
}

impl ContactRank {
    pub fn airstrike_power_mod(self) -> f64 {
        match self {
            Self::Rank1 => 1.2,
            Self::Rank2 => 1.17,
            Self::Rank3 => 1.12,
        }
    }

    pub fn night_mods(self) -> NightContactModifiers {
        match self {
            Self::Rank1 => NightContactModifiers {
                power_mod: 9.0,
                accuracy_mod: 1.2,
                critical_rate_mod: 1.7,
            },
            Self::Rank2 => NightContactModifiers {
                power_mod: 7.0,
                accuracy_mod: 1.1,
                critical_rate_mod: 1.64,
            },
            Self::Rank3 => NightContactModifiers {
                power_mod: 5.0,
                accuracy_mod: 1.15,
                critical_rate_mod: 1.57,
            },
        }
    }
}
