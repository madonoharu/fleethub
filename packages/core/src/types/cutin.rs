use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct AntiAirCutinDef {
    pub id: u8,
    pub chance_numer: Option<u8>,
    pub multiplier: Option<f64>,
    pub minimum_bonus: Option<u8>,
    pub sequential: Option<bool>,
}

impl AntiAirCutinDef {
    pub fn rate(&self) -> Option<f64> {
        Some(self.chance_numer? as f64 / 101.)
    }

    pub fn is_sequential(&self) -> bool {
        crate::log!("{} {:?}", self.id, self.sequential);
        self.sequential.unwrap_or_default()
    }
}

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

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct DayCutinDef {
    pub tag: DayCutin,
    pub hits: u8,
    pub chance_denom: Option<u8>,
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
}

#[derive(Debug, Hash, EnumSetType, Serialize, Deserialize, TS)]
pub enum NightCutin {
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

    /// 主魚電
    MainTorpRadar,
    /// 魚見電
    TorpLookoutRadar,
    /// 魚水魚
    TorpTsloTorp,
    /// 魚見ド
    TorpTsloDrum,

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

pub struct CutinModifiers {
    pub power_mod: f64,
    pub accuracy_mod: f64,
}

impl Default for CutinModifiers {
    fn default() -> Self {
        Self {
            power_mod: 1.0,
            accuracy_mod: 1.0,
        }
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct NightCutinDef {
    pub tag: NightCutin,
    pub hits: f64,
    pub chance_denom: Option<u8>,
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
}

impl NightCutinDef {
    pub fn to_modifiers(&self) -> CutinModifiers {
        CutinModifiers {
            power_mod: self.power_mod.unwrap_or(1.0),
            accuracy_mod: self.accuracy_mod.unwrap_or(1.0),
        }
    }

    pub fn rate(&self, cutin_term: f64) -> Option<f64> {
        let rate = if self.tag == NightCutin::DoubleAttack {
            109. / 110.
        } else {
            (cutin_term.ceil() / self.chance_denom? as f64).min(1.)
        };

        Some(rate)
    }
}
