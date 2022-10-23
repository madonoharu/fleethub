use serde::{Deserialize, Serialize};
use strum::{EnumIter, IntoEnumIterator};
use tsify::Tsify;

#[derive(
    Debug, Default, Clone, Copy, PartialEq, Eq, Hash, EnumIter, Serialize, Deserialize, Tsify,
)]
pub enum SingleFormation {
    /// 単縦陣
    #[default]
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

#[derive(
    Debug, Default, Clone, Copy, PartialEq, Eq, Hash, EnumIter, Serialize, Deserialize, Tsify,
)]
pub enum CombinedFormation {
    /// 第一警戒航行序列
    Cruising1,
    /// 第二警戒航行序列
    Cruising2,
    /// 第三警戒航行序列
    Cruising3,
    /// 第四警戒航行序列
    #[default]
    Cruising4,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(untagged)]
pub enum Formation {
    Single(SingleFormation),
    Combined(CombinedFormation),
}

impl From<SingleFormation> for Formation {
    #[inline]
    fn from(inner: SingleFormation) -> Self {
        Self::Single(inner)
    }
}

impl From<CombinedFormation> for Formation {
    #[inline]
    fn from(inner: CombinedFormation) -> Self {
        Self::Combined(inner)
    }
}

impl Formation {
    /// 単縦陣
    pub const LINE_AHEAD: Self = Self::Single(SingleFormation::LineAhead);
    /// 複縦陣
    pub const DOUBLE_LINE: Self = Self::Single(SingleFormation::DoubleLine);
    /// 輪形陣
    pub const DIAMOND: Self = Self::Single(SingleFormation::Diamond);
    /// 梯形陣
    pub const ECHELON: Self = Self::Single(SingleFormation::Echelon);
    /// 単横陣
    pub const LINE_ABREAST: Self = Self::Single(SingleFormation::LineAbreast);
    /// 警戒陣
    pub const VANGUARD: Self = Self::Single(SingleFormation::Vanguard);
    /// 第一警戒航行序列
    pub const CRUISING1: Self = Self::Combined(CombinedFormation::Cruising1);
    /// 第二警戒航行序列
    pub const CRUISING2: Self = Self::Combined(CombinedFormation::Cruising2);
    /// 第三警戒航行序列
    pub const CRUISING3: Self = Self::Combined(CombinedFormation::Cruising3);
    /// 第四警戒航行序列
    pub const CRUISING4: Self = Self::Combined(CombinedFormation::Cruising4);

    pub fn is_combined(self) -> bool {
        matches!(self, Self::Combined(_))
    }

    pub fn iter() -> impl Iterator<Item = Self> {
        SingleFormation::iter()
            .map(Self::Single)
            .chain(CombinedFormation::iter().map(Self::Combined))
    }
}

impl Default for Formation {
    fn default() -> Self {
        Self::Single(Default::default())
    }
}
