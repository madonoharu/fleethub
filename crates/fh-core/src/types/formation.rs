use std::str::FromStr;

use fh_macro::FhAbi;
use serde::{Deserialize, Serialize};
use strum::{AsRefStr, EnumIter, IntoEnumIterator};
use ts_rs::TS;

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, AsRefStr, EnumIter, Serialize, Deserialize, TS,
)]
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

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, AsRefStr, EnumIter, Serialize, Deserialize, TS,
)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS, FhAbi)]
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
        use SingleFormation::*;

        match (*self, other) {
            (Self::Single(a), Self::Single(b)) => {
                matches!(
                    (a, b),
                    (DoubleLine, LineAbreast) | (LineAbreast, Echelon) | (Echelon, LineAhead)
                )
            }
            _ => false,
        }
    }

    pub fn is_combined(&self) -> bool {
        matches!(self, Self::Combined(_))
    }

    pub fn iter() -> impl Iterator<Item = Self> {
        SingleFormation::iter()
            .map(Self::Single)
            .chain(CombinedFormation::iter().map(Self::Combined))
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

impl From<SingleFormation> for Formation {
    fn from(inner: SingleFormation) -> Self {
        Self::Single(inner)
    }
}

impl From<CombinedFormation> for Formation {
    fn from(inner: CombinedFormation) -> Self {
        Self::Combined(inner)
    }
}
