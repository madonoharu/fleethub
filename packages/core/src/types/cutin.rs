use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Hash, EnumSetType, Serialize, Deserialize, TS)]
pub enum DayCutin {
    /// 主主
    MainMain,
    /// 主徹
    MainApShell,
    /// 主電
    MainRader,
    /// 主副
    MainSecond,
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

#[derive(Debug, Hash, EnumSetType, Serialize, Deserialize, TS)]
pub enum NightCutin {
    /// 主魚電
    MainTorpRadar,
    /// 魚見電
    TorpLookoutRadar,
    /// 連撃
    DoubleAttack,
    /// 主魚
    MainTorp,
    /// 魚魚
    TorpTorp,
    /// 主主副
    MainMainSecond,
    /// 主主主
    MainMainMain,
    /// 潜水魚魚
    SubmarineTorpTorp,
    /// 潜水電探
    SubmarineRadarTorp,
    /// 夜襲1.25
    AerialAttack1,
    /// 夜襲1.20
    AerialAttack2,
    /// 彗星夜襲
    SuiseiAttack,
    /// 夜襲1.18
    AerialAttack3,
}
