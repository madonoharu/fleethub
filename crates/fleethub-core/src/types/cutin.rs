#![allow(non_snake_case)]

use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Default, Hash, EnumSetType, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum DayCutin {
    /// 瑞雲立体攻撃
    Zuiun,
    /// 海空立体攻撃
    AirSea,
    /// 主主
    #[default]
    MainMain,
    /// 主徹
    MainAp,
    /// 主電
    MainRadar,
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
}

#[derive(Debug, Default, Hash, EnumSetType, Serialize, Deserialize, Tsify)]
pub enum NightCutin {
    /// 主魚電
    MainTorpRadar,
    /// 魚見電
    TorpLookoutRadar,
    /// 魚水魚
    TorpTsloTorp,
    /// 魚見ド
    TorpTsloDrum,

    /// 夜間瑞雲2電探CI
    NightZuiun2Radar,
    /// 夜間瑞雲2CI
    NightZuiun2,
    /// 夜間瑞雲電探CI
    NightZuiunRadar,
    /// 夜間瑞雲CI
    NightZuiun,

    /// 連撃
    DoubleAttack,
    /// 魚魚主
    TorpTorpMain,
    /// 魚魚魚
    #[default]
    TorpTorpTorp,
    /// 主主副
    MainMainSec,
    /// 主主主
    MainMainMain,

    /// 潜水魚魚
    SubTorpTorp,
    /// 潜水電探
    SubRadarTorp,

    /// 夜襲1.25
    Cvci1_25,
    /// 夜襲1.20
    Cvci1_20,
    /// 夜襲1.18
    Cvci1_18,
    /// 光電管彗星夜襲
    Photobomber,
}

#[derive(Debug, EnumSetType, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum FleetCutin {
    NelsonTouch,
    NagatoClassCutin,
    ColoradoClassCutin,
    KongouClassCutin,
    Yamato2ShipCutin,
    Yamato3ShipCutin,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(untagged)]
pub enum DayCutinLike {
    DayCutin(DayCutin),
    FleetCutin(FleetCutin),
}

impl DayCutinLike {
    pub fn as_day_cutin(self) -> Option<DayCutin> {
        match self {
            Self::DayCutin(cutin) => Some(cutin),
            _ => None,
        }
    }
}

impl From<DayCutin> for DayCutinLike {
    fn from(value: DayCutin) -> Self {
        Self::DayCutin(value)
    }
}

impl From<FleetCutin> for DayCutinLike {
    fn from(value: FleetCutin) -> Self {
        Self::FleetCutin(value)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Tsify)]
#[serde(untagged)]
pub enum NightCutinLike {
    NightCutin(NightCutin),
    FleetCutin(FleetCutin),
}

impl NightCutinLike {
    pub fn has_model_d_small_gun_mod(&self) -> bool {
        matches!(
            self,
            NightCutinLike::NightCutin(NightCutin::MainTorpRadar | NightCutin::TorpLookoutRadar)
        )
    }
}

impl From<NightCutin> for NightCutinLike {
    fn from(value: NightCutin) -> Self {
        Self::NightCutin(value)
    }
}

impl From<FleetCutin> for NightCutinLike {
    fn from(value: FleetCutin) -> Self {
        Self::FleetCutin(value)
    }
}
