use enumset::EnumSetType;
use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};
use tsify::Tsify;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]

pub enum ShipCategory {
    Battleship,
    AircraftCarrier,
    HeavyCruiser,
    LightCruiser,
    Destroyer,
    CoastalDefenseShip,
    Submarine,
    AuxiliaryShip,
}

#[derive(Debug, EnumSetType, FromPrimitive, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum ShipType {
    Unknown = 0,
    /// 海防艦
    DE = 1,
    /// 駆逐艦
    DD = 2,
    /// 軽巡洋艦
    CL = 3,
    /// 重雷装巡洋艦
    CLT = 4,
    /// 重巡洋艦
    CA = 5,
    /// 航空巡洋艦
    CAV = 6,
    /// 軽空母
    CVL = 7,
    /// 戦艦
    FBB = 8,
    /// 戦艦
    BB = 9,
    /// 航空戦艦
    BBV = 10,
    /// 正規空母
    CV = 11,
    /// 超弩級戦艦
    XBB = 12,
    /// 潜水艦
    SS = 13,
    /// 潜水空母
    SSV = 14,
    /// 補給艦
    AP = 15,
    /// 水上機母艦
    AV = 16,
    /// 揚陸艦
    LHA = 17,
    /// 装甲空母
    CVB = 18,
    /// 工作艦
    AR = 19,
    /// 潜水母艦
    AS = 20,
    /// 練習巡洋艦
    CT = 21,
    /// 補給艦
    AO = 22,
}

impl Default for ShipType {
    fn default() -> Self {
        Self::Unknown
    }
}

impl ShipType {
    pub fn category(&self) -> ShipCategory {
        use ShipCategory::*;
        use ShipType::*;

        match self {
            FBB | BB | BBV | XBB => Battleship,
            CVL | CV | CVB => AircraftCarrier,
            CA | CAV => HeavyCruiser,
            CL | CLT | CT => LightCruiser,
            DD => Destroyer,
            DE => CoastalDefenseShip,
            SS | SSV => Submarine,
            _ => AuxiliaryShip,
        }
    }

    pub fn is_destroyer(&self) -> bool {
        self.category() == ShipCategory::Destroyer
    }

    pub fn is_light_cruiser(&self) -> bool {
        self.category() == ShipCategory::LightCruiser
    }

    pub fn is_aircraft_carrier(&self) -> bool {
        self.category() == ShipCategory::AircraftCarrier
    }

    pub fn is_submarine(&self) -> bool {
        self.category() == ShipCategory::Submarine
    }

    pub fn is_battleship(&self) -> bool {
        self.category() == ShipCategory::Battleship
    }

    pub fn transport_point(&self) -> i32 {
        use ShipType::*;
        match self {
            SSV => 1,
            DD => 5,
            CL => 2,
            CAV => 4,
            BBV => 7,
            AO => 15,
            LHA => 12,
            AV => 9,
            AS => 7,
            CT => 6,
            _ => 0,
        }
    }
}

#[derive(Debug, EnumSetType, FromPrimitive, EnumString, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum ShipAttr {
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

#[derive(Debug, Clone, Copy, PartialEq, Deserialize, Tsify)]
pub enum SpeedGroup {
    A,
    B1,
    B2,
    C,
}

impl Default for SpeedGroup {
    fn default() -> Self {
        SpeedGroup::B2
    }
}

#[derive(
    Debug, Display, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum DamageState {
    /// 小破未満
    Normal,
    /// 小破
    Shouha,
    /// 中破
    Chuuha,
    /// 大破
    Taiha,
    /// 轟沈
    Sunk,
}

impl Default for DamageState {
    fn default() -> Self {
        Self::Normal
    }
}

impl DamageState {
    pub fn new(max_hp: u16, current_hp: u16) -> Self {
        if current_hp == 0 {
            Self::Sunk
        } else if current_hp <= Self::Taiha.bound(max_hp) {
            Self::Taiha
        } else if current_hp <= Self::Chuuha.bound(max_hp) {
            Self::Chuuha
        } else if current_hp <= Self::Shouha.bound(max_hp) {
            Self::Shouha
        } else {
            Self::Normal
        }
    }

    pub fn bound(self, max_hp: u16) -> u16 {
        match self {
            Self::Normal => max_hp,
            Self::Shouha => (max_hp * 3) / 4,
            Self::Chuuha => max_hp / 2,
            Self::Taiha => max_hp / 4,
            Self::Sunk => 0,
        }
    }

    pub fn common_power_mod(&self) -> f64 {
        match self {
            Self::Normal | Self::Shouha => 1.0,
            Self::Chuuha => 0.7,
            Self::Taiha => 0.4,
            _ => 0.0,
        }
    }

    pub fn torpedo_power_mod(&self) -> f64 {
        match self {
            Self::Normal | Self::Shouha => 1.0,
            Self::Chuuha => 0.8,
            _ => 0.0,
        }
    }
}

#[derive(
    Debug, Display, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum MoraleState {
    Sparkle,
    Normal,
    Orange,
    Red,
}

impl Default for MoraleState {
    fn default() -> Self {
        Self::Normal
    }
}

impl MoraleState {
    pub fn new(value: u8) -> Self {
        if value > 49 {
            Self::Sparkle
        } else if value > 29 {
            Self::Normal
        } else if value > 19 {
            Self::Orange
        } else {
            Self::Red
        }
    }

    /// 雷撃戦以外の命中補正
    pub fn common_accuracy_mod(&self) -> f64 {
        match self {
            Self::Sparkle => 1.2,
            Self::Normal => 1.0,
            Self::Orange => 0.8,
            Self::Red => 0.5,
        }
    }

    pub fn torpedo_accuracy_mod(&self) -> f64 {
        match self {
            Self::Sparkle => 1.3,
            Self::Normal => 1.0,
            Self::Orange => 0.7,
            Self::Red => 0.35,
        }
    }

    pub fn hit_rate_mod(&self) -> f64 {
        match self {
            Self::Sparkle => 0.7,
            Self::Normal => 1.0,
            Self::Orange => 1.2,
            Self::Red => 1.4,
        }
    }
}

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

#[cfg(test)]
mod test {

    use super::*;

    #[test]
    fn test_damage_state() {
        use DamageState::*;

        let mut vec: Vec<DamageState> = vec![Normal, Shouha, Chuuha, Sunk, Taiha];
        vec.sort();
        assert_eq!(vec, vec![Normal, Shouha, Chuuha, Taiha, Sunk]);

        let table = [
            (99, 0, Sunk),
            (99, 24, Taiha),
            (99, 25, Chuuha),
            (99, 49, Chuuha),
            (99, 50, Shouha),
            (99, 74, Shouha),
            (99, 75, Normal),
            (99, 99, Normal),
            (12, 0, Sunk),
            (12, 3, Taiha),
            (12, 4, Chuuha),
            (12, 6, Chuuha),
            (12, 7, Shouha),
            (12, 9, Shouha),
            (12, 10, Normal),
            (12, 12, Normal),
        ];

        for &(max_hp, current_hp, expected) in table.iter() {
            assert_eq!(DamageState::new(max_hp, current_hp), expected);
        }
    }
}
