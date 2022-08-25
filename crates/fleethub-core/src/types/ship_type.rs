use enumset::EnumSetType;
use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Tsify)]
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

impl From<u8> for ShipType {
    fn from(stype: u8) -> Self {
        num_traits::FromPrimitive::from_u8(stype).unwrap_or_default()
    }
}

impl ShipType {
    pub fn category(self) -> ShipCategory {
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

    pub fn is_destroyer(self) -> bool {
        self.category() == ShipCategory::Destroyer
    }

    pub fn is_light_cruiser(self) -> bool {
        self.category() == ShipCategory::LightCruiser
    }

    pub fn is_aircraft_carrier(self) -> bool {
        self.category() == ShipCategory::AircraftCarrier
    }

    pub fn is_submarine(self) -> bool {
        self.category() == ShipCategory::Submarine
    }

    #[inline]
    pub fn is_surface_ship(self) -> bool {
        !self.is_submarine()
    }

    pub fn is_battleship(self) -> bool {
        self.category() == ShipCategory::Battleship
    }

    pub fn transport_point(self) -> i32 {
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
