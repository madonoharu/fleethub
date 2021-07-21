use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS)]
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

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS)]
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

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS)]
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
    power_mod: Option<f64>,
    accuracy_mod: Option<f64>,
    evasion_mod: Option<f64>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct NormalFormationDef {
    tag: Formation,
    protection_rate: Option<f64>,
    fleet_anti_air_mod: f64,
    shelling: FormationAttackModifiers,
    torpedo: FormationAttackModifiers,
    asw: FormationAttackModifiers,
    night: FormationAttackModifiers,
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
pub enum ContactRank {
    Rank1,
    Rank2,
    Rank3,
}
