use std::str::FromStr;

use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, EnumSetType, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum ShipAttr {Unknown,
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
/// 新集積地
NewSupplyDepot,
/// PT小鬼群
PtImp,
/// 戦艦夏姫
BattleshipSummerPrincess,
/// 重巡夏姫
HeavyCruiserSummerPrincess,
/// 泊地水鬼 バカンスmode
AnchorageWaterDemonVacationMode,
/// 戦艦仏棲姫
FrenchBattleshipPrincess,
/// 船渠棲姫
DockPrincess}


impl Default for ShipAttr {
    #[inline]
    fn default() -> Self {
        Self::Unknown
    }
}

impl FromStr for ShipAttr {
    type Err = serde_json::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let json = format!("\"{s}\"");
        serde_json::from_str(&json)
    }
}
