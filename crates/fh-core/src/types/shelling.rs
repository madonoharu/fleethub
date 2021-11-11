use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::FleetCutin;

#[derive(Debug, Hash, EnumSetType, Serialize, Deserialize, TS)]
pub enum DayCutin {
    /// 主主
    MainMain,
    /// 主徹
    MainAp,
    /// 主電
    MainRader,
    /// 主副
    MainSec,
    /// 連撃
    DoubleAttack,
    /// 戦爆連合 戦爆攻
    FBA,
    /// 戦爆連合 爆爆攻
    BBA,
    /// 戦爆連合 爆攻
    BA,
    /// 瑞雲立体攻撃
    Zuiun,
    /// 海空立体攻撃
    AirSea,
}

impl Default for DayCutin {
    fn default() -> Self {
        Self::MainMain
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, TS)]
pub enum ShellingSpecialAttack {
    DayCutin(DayCutin),
    FleetCutin(FleetCutin),
}
