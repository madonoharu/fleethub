use enumset::EnumSetType;
use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use strum::EnumString;
use tsify::Tsify;

#[derive(Debug, EnumSetType, FromPrimitive, EnumString, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum ShipAttr {
    Unknown,
    /// 深海
    Abyssal,
    /// 夜戦空母
    NightCarrier,
    /// 陸上型
    Installation,
    /// イギリス海軍
    RoyalNavy,
    /// 改二
    Kai2,
    /// タービン速力補正
    TurbineSpeedBonus,
    /// 砲台小鬼
    Pillbox,
    /// 離島棲姫
    IsolatedIsland,
    /// 港湾夏姫
    HarbourSummerPrincess,
    /// 集積地
    SupplyDepot,
    /// PT小鬼群
    PtImp,
    /// 戦艦夏姫
    BattleshipSummerPrincess,
    /// 重巡夏姫
    HeavyCruiserSummerPrincess,
}

impl Default for ShipAttr {
    #[inline]
    fn default() -> Self {
        Self::Unknown
    }
}
