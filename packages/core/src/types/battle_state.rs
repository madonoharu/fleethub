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

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS)]
pub enum Formation {
    Single(SingleFormation),
    Combined(CombinedFormation),
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
