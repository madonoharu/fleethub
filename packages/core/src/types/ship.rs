use enumset::EnumSetType;
use num_derive::FromPrimitive;
use serde::Deserialize;
use strum_macros::EnumString;
use ts_rs::TS;

#[derive(Debug, EnumSetType, FromPrimitive, TS)]
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

#[derive(Debug, EnumSetType, FromPrimitive, TS)]
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

#[derive(Debug, EnumSetType, FromPrimitive, EnumString)]
pub enum ShipAttr {
    Abyssal,
    NightCarrier,
    Installation,
    RoyalNavy,
    Kai2,
    TurbineSpeedBonus,
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
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

impl DamageState {
    pub fn from_hp(max_hp: i32, current_hp: i32) -> Self {
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
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct EBonuses {
    pub firepower: i32,
    pub torpedo: i32,
    pub anti_air: i32,
    pub armor: i32,
    pub evasion: i32,
    pub asw: i32,
    pub los: i32,
    pub bombing: i32,
    pub accuracy: i32,
    pub range: i32,
    pub speed: i32,
    pub effective_los: i32,
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
