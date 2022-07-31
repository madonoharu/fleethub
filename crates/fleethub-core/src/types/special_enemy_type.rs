use serde::{Deserialize, Serialize};
use tsify::Tsify;

/// 特殊敵種別
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum SpecialEnemyType {
    None,
    /// ソフトスキン
    SoftSkinned,
    /// 砲台小鬼
    Pillbox,
    /// 離島棲姫
    IsolatedIsland,
    /// 集積地
    SupplyDepot,
    /// 港湾夏姫
    HarbourSummerPrincess,
    /// PT小鬼群
    PtImp,
    /// 戦艦夏姫
    BattleshipSummerPrincess,
    /// 重巡夏姫
    HeavyCruiserSummerPrincess,
}

impl SpecialEnemyType {
    pub fn is_none(&self) -> bool {
        matches!(*self, Self::None)
    }

    pub fn is_installation(&self) -> bool {
        matches!(
            *self,
            Self::SoftSkinned
                | Self::Pillbox
                | Self::IsolatedIsland
                | Self::SupplyDepot
                | Self::HarbourSummerPrincess
        )
    }
}
