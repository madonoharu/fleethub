use enumset::EnumSetType;
use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use strum::{EnumString, ToString};
use ts_rs::TS;

#[derive(Debug, EnumSetType, FromPrimitive, ToString, TS)]
pub enum ShipType {
    Unknown = 0,
    DE = 1,
    DD = 2,
    CL = 3,
    CLT = 4,
    CA = 5,
    CAV = 6,
    CVL = 7,
    FBB = 8,
    BB = 9,
    BBV = 10,
    CV = 11,
    XBB = 12,
    SS = 13,
    SSV = 14,
    AP = 15,
    AV = 16,
    LHA = 17,
    CVB = 18,
    AR = 19,
    AS = 20,
    CT = 21,
    AO = 22,
}

impl Default for ShipType {
    fn default() -> Self {
        Self::Unknown
    }
}

impl ShipType {
    pub fn transport_point(&self) -> i32 {
        use ShipType::*;
        match self {
            SSV => 1,
            DD => 5,
            CL => 2,
            CAV => 4,
            BBV => 7,
            AO => 12,
            LHA => 12,
            AV => 9,
            AS => 7,
            CT => 6,
            _ => 0,
        }
    }
}

#[derive(Debug, EnumSetType, FromPrimitive, ToString, TS)]
pub enum ShipClass {
    Unknown = 0,
    AyanamiClass = 1,
    IseClass = 2,
    KagaClass = 3,
    KumaClass = 4,
    AkatsukiClass = 5,
    KongouClass = 6,
    FurutakaClass = 7,
    TakaoClass = 8,
    MogamiClass = 9,
    HatsuharuClass = 10,
    ShouhouClass = 11,
    FubukiClass = 12,
    AobaClass = 13,
    AkagiClass = 14,
    ChitoseClass = 15,
    SendaiClass = 16,
    SouryuuClass = 17,
    AsashioClass = 18,
    NagatoClass = 19,
    NagaraClass = 20,
    TenryuuClass = 21,
    ShimakazeClass = 22,
    ShiratsuyuClass = 23,
    HiyouClass = 24,
    HiryuuClass = 25,
    FusouClass = 26,
    HoushouClass = 27,
    MutsukiClass = 28,
    MyoukouClass = 29,
    KagerouClass = 30,
    ToneClass = 31,
    RyuujouClass = 32,
    ShoukakuClass = 33,
    YuubariClass = 34,
    KaidaiVIClass = 35,
    JunsenTypeBKai2 = 36,
    YamatoClass = 37,
    YuugumoClass = 38,
    JunsenTypeB = 39,
    Junsen3Class = 40,
    AganoClass = 41,
    FleetOfFog = 42,
    TaihouClass = 43,
    I400Class = 44,
    AkitsuMaruClass = 45,
    Type3SubmergenceTransportVehicle = 46,
    BismarckClass = 47,
    Z1Class = 48,
    RepairShip = 49,
    TaigeiClass = 50,
    RyuuhouClass = 51,
    OoyodoClass = 52,
    UnryuuClass = 53,
    AkizukiClass = 54,
    AdmiralHipperClass = 55,
    KatoriClass = 56,
    TypeIXCClass = 57,
    VittorioVenetoClass = 58,
    AkitsushimaClass = 59,
    RevisedKazahayaClass = 60,
    MaestraleClass = 61,
    MizuhoClass = 62,
    GrafZeppelinClass = 63,
    ZaraClass = 64,
    IowaClass = 65,
    KamikazeClass = 66,
    QueenElizabethClass = 67,
    AquilaClass = 68,
    LexingtonClass = 69,
    CommandantTesteClass = 70,
    JunsenTypeAKai2 = 71,
    KamoiClass = 72,
    GangutClass = 73,
    ShimushuClass = 74,
    KasugaMaruClass = 75,
    TaiyouClass = 76,
    EtorofuClass = 77,
    ArkRoyalClass = 78,
    RichelieuClass = 79,
    MarconiClass = 80,
    TashkentClass = 81,
    JClass = 82,
    CasablancaClass = 83,
    EssexClass = 84,
    HiburiClass = 85,
    RoSeries = 86,
    JohnCButlerClass = 87,
    NelsonClass = 88,
    GotlandClass = 89,
    NisshinClass = 90,
    FletcherClass = 91,
    DucaDegliAbruzziClass = 92,
    ColoradoClass = 93,
    MikuraClass = 94,
    NorthamptonClass = 95,
    PerthClass = 96,
    R1 = 97,
    DeRuyterClass = 98,
    AtlantaClass = 99,
    JingeiClass = 100,
    MatsuClass = 101,
    SouthDakotaClass = 102,
    JunsenTypeC = 103,
    TypeDCoastalDefenseShip = 104,
    YorktownClass = 105,
    StLouisClass = 106,
}

impl Default for ShipClass {
    fn default() -> Self {
        Self::Unknown
    }
}

#[derive(Debug, EnumSetType, FromPrimitive, EnumString, Serialize, Deserialize, TS)]
pub enum ShipAttr {
    Abyssal,
    NightCarrier,
    Installation,
    RoyalNavy,
    Kai2,
    TurbineSpeedBonus,
    Pillbox,
    IsolatedIsland,
    HarbourSummerPrincess,
    SupplyDepot,
    PtImp,
    BattleshipSummerPrincess,
    HeavyCruiserSummerPrincess,
}

#[derive(Debug, Clone, Copy, PartialEq, Deserialize, TS)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, TS)]
pub enum DamageState {
    /// 轟沈
    Sunk,
    /// 大破
    Taiha,
    /// 中破
    Chuuha,
    /// 小破
    Shouha,
    /// 小破未満
    Normal,
}

impl Default for DamageState {
    fn default() -> Self {
        Self::Normal
    }
}

impl DamageState {
    pub fn from_hp(max_hp: u16, current_hp: u16) -> Self {
        let value = current_hp * 4;

        if value == 0 {
            Self::Sunk
        } else if value <= max_hp {
            Self::Taiha
        } else if value <= max_hp * 2 {
            Self::Chuuha
        } else if value <= max_hp * 3 {
            Self::Shouha
        } else {
            Self::Normal
        }
    }

    pub fn common_power_mod(&self) -> f64 {
        match *self {
            Self::Normal | Self::Shouha => 1.0,
            Self::Chuuha => 0.7,
            Self::Taiha => 0.4,
            _ => 0.0,
        }
    }

    pub fn torpedo_power_mod(&self) -> f64 {
        match *self {
            Self::Normal | Self::Shouha => 1.0,
            Self::Chuuha => 0.8,
            _ => 0.0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, TS)]
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

    pub fn common_accuracy_mod(&self) -> f64 {
        match *self {
            Self::Sparkle => 1.2,
            Self::Normal => 1.0,
            Self::Orange => 0.8,
            Self::Red => 0.5,
        }
    }

    pub fn torpedo_accuracy_mod(&self) -> f64 {
        match *self {
            Self::Sparkle => 1.3,
            Self::Normal => 1.0,
            Self::Orange => 0.7,
            Self::Red => 0.35,
        }
    }

    pub fn evasion_mod(&self) -> f64 {
        match *self {
            Self::Sparkle => 0.7,
            Self::Normal => 1.0,
            Self::Orange => 1.2,
            Self::Red => 1.4,
        }
    }
}

/// 特殊敵種別
#[derive(Debug, Clone, Copy, PartialEq, Eq, TS)]
pub enum SpecialEnemyType {
    None,
    /// 砲台小鬼
    Pillbox,
    /// 離島棲姫
    IsolatedIsland,
    /// ソフトスキン
    SoftSkinned,
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

impl SpecialEnemyType {
    pub fn is_none(&self) -> bool {
        matches!(*self, Self::None)
    }
}

#[cfg(test)]
mod test {

    use super::*;

    #[test]
    fn test_damage_state() {
        use DamageState::*;

        let mut vec: Vec<DamageState> = vec![Normal, Chuuha, Shouha, Sunk, Taiha];
        vec.sort();
        assert_eq!(vec, vec![Sunk, Taiha, Chuuha, Shouha, Normal]);

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
            assert_eq!(DamageState::from_hp(max_hp, current_hp), expected);
        }
    }
}
