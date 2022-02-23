use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::FleetCutin;

#[derive(Debug, Hash, EnumSetType, Serialize, Deserialize, TS)]
pub enum NightCutin {
    /// 主魚電
    MainTorpRadar,
    /// 魚見電
    TorpLookoutRadar,
    /// 魚水魚
    TorpTsloTorp,
    /// 魚見ド
    TorpTsloDrum,

    /// 連撃
    DoubleAttack,
    /// 魚魚主
    TorpTorpMain,
    /// 魚魚魚
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

impl Default for NightCutin {
    fn default() -> Self {
        Self::TorpTorpTorp
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, TS)]
pub enum NightSpecialAttack {
    NightCutin(NightCutin),
    FleetCutin(FleetCutin),
}

impl NightSpecialAttack {
    pub fn has_model_d_small_gun_mod(&self) -> bool {
        matches!(
            self,
            NightSpecialAttack::NightCutin(
                NightCutin::MainTorpRadar | NightCutin::TorpLookoutRadar
            )
        )
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, TS)]
pub enum NightAttackType {
    Normal,
    ArkRoyal,
    Carrier,
}
