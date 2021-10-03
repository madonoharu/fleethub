use std::str::FromStr;

use serde::{Deserialize, Serialize};
use strum::AsRefStr;
use ts_rs::TS;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, AsRefStr, Serialize, Deserialize, TS)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, AsRefStr, Serialize, Deserialize, TS)]
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

impl Formation {
    /// 陣形相性
    ///
    /// 砲撃戦と対潜戦では攻撃側と防御側は以下の陣形条件を満たすなら命中補正は1.0となる
    /// - 複縦 → 単横
    /// - 単横 → 梯形
    /// - 梯形 → 単縦
    pub fn is_ineffective(&self, other: Self) -> bool {
        match (*self, other) {
            (Self::Single(a), Self::Single(b)) => {
                matches!(
                    (a, b),
                    (SingleFormation::DoubleLine, SingleFormation::LineAbreast)
                        | (SingleFormation::LineAbreast, SingleFormation::Echelon)
                        | (SingleFormation::Echelon, SingleFormation::LineAhead)
                )
            }
            _ => false,
        }
    }
}

impl AsRef<str> for Formation {
    fn as_ref(&self) -> &str {
        match self {
            Self::Single(v) => v.as_ref(),
            Self::Combined(v) => v.as_ref(),
        }
    }
}

impl FromStr for Formation {
    type Err = serde_json::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let json = ["\"", s, "\""].concat();
        serde_json::from_str(&json)
    }
}

impl Default for Formation {
    fn default() -> Self {
        Self::Single(Default::default())
    }
}

pub struct FormationWarfareModifiers {
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub evasion_mod: f64,
}

impl Default for FormationWarfareModifiers {
    fn default() -> Self {
        Self {
            power_mod: 1.0,
            accuracy_mod: 1.0,
            evasion_mod: 1.0,
        }
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct FormationWarfareDef {
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
    pub evasion_mod: Option<f64>,
}

impl FormationWarfareDef {
    pub fn to_modifiers(&self) -> FormationWarfareModifiers {
        FormationWarfareModifiers {
            power_mod: self.power_mod.unwrap_or(1.0),
            accuracy_mod: self.accuracy_mod.unwrap_or(1.0),
            evasion_mod: self.evasion_mod.unwrap_or(1.0),
        }
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct NormalFormationDef {
    pub tag: Formation,
    pub protection_rate: Option<f64>,
    pub fleet_anti_air_mod: f64,
    pub shelling: FormationWarfareDef,
    pub torpedo: FormationWarfareDef,
    pub asw: FormationWarfareDef,
    pub night: FormationWarfareDef,
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

    pub fn get_normal_def(&self, ship_index: usize, fleet_len: usize) -> &NormalFormationDef {
        match self {
            Self::Normal(normal) => normal,
            Self::Vanguard {
                top_half,
                bottom_half,
            } => {
                if ship_index < fleet_len / 2 {
                    top_half
                } else {
                    bottom_half
                }
            }
        }
    }
}