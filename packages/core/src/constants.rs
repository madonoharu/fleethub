use num_derive::FromPrimitive;
use serde::Deserialize;
use strum_macros::EnumString;
use wasm_bindgen::prelude::*;
use wasmer_enumset::EnumSetType;

macro_rules! impl_default {
    ($enum: ident) => {
        impl Default for $enum {
            fn default() -> Self {
                Self::Unknown
            }
        }
    };
}

#[wasm_bindgen]
#[derive(Debug, EnumSetType, FromPrimitive)]
pub enum GearCategory {
    Unknown = 0,
    SmallCaliberMainGun = 1,
    MediumCaliberMainGun = 2,
    LargeCaliberMainGun = 3,
    SecondaryGun = 4,
    Torpedo = 5,
    CbFighter = 6,
    CbDiveBomber = 7,
    CbTorpedoBomber = 8,
    CbRecon = 9,
    ReconSeaplane = 10,
    SeaplaneBomber = 11,
    SmallRadar = 12,
    LargeRadar = 13,
    Sonar = 14,
    DepthCharge = 15,
    ExtraArmor = 16,
    EngineImprovement = 17,
    AntiAirShell = 18,
    ApShell = 19,
    VtFuze = 20,
    AntiAirGun = 21,
    MidgetSubmarine = 22,
    EmergencyRepairPersonnel = 23,
    LandingCraft = 24,
    Autogyro = 25,
    AntiSubPatrolAircraft = 26,
    MediumExtraArmor = 27,
    LargeExtraArmor = 28,
    Searchlight = 29,
    SupplyTransportContainer = 30,
    ShipRepairFacility = 31,
    SubmarineTorpedo = 32,
    Starshell = 33,
    CommandFacility = 34,
    AviationPersonnel = 35,
    AntiAirFireDirector = 36,
    AntiGroundEquipment = 37,
    LargeCaliberMainGun2 = 38,
    SurfaceShipPersonnel = 39,
    LargeSonar = 40,
    LargeFlyingBoat = 41,
    LargeSearchlight = 42,
    CombatRation = 43,
    Supplies = 44,
    SeaplaneFighter = 45,
    SpecialAmphibiousTank = 46,
    LbAttacker = 47,
    LbFighter = 48,
    LbRecon = 49,
    TransportationMaterial = 50,
    SubmarineEquipment = 51,
    LargeLbAircraft = 53,
    JetFighter = 56,
    JetFighterBomber = 57,
    JetTorpedoBomber = 58,
    JetRecon = 59,
    LargeRadar2 = 93,
    CbRecon2 = 94,
}

impl_default!(GearCategory);

#[wasm_bindgen]
#[derive(Debug, EnumSetType, FromPrimitive, EnumString)]
pub enum GearAttr {
    Abyssal,
    HighAngleMount,
    NightFighter,
    NightAttacker,
    HeavyBomber,
    MainGun,
    Radar,
    SurfaceRadar,
    AirRadar,
    DepthChargeProjector,
    AdditionalDepthCharge,
    AntiSubMortar,
    AntiSubWeapon,
    AntiSubAircraft,
    Seaplane,
    CbAircraft,
    LbAircraft,
    JetAircraft,
    Fighter,
    Recon,
    ObservationSeaplane,
    CbFighterBomber,
    AntiInstallationCbBomber,
    NightRecon,
    CbSwordfish,
    SemiNightPlane,
    HighAltitudeInterceptor,
}

#[wasm_bindgen]
#[derive(Debug, EnumSetType, FromPrimitive)]
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

impl_default!(ShipType);

#[wasm_bindgen]
#[derive(Debug, EnumSetType, FromPrimitive)]
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

impl_default!(ShipClass);

#[wasm_bindgen]
#[derive(Debug, EnumSetType, FromPrimitive, EnumString)]
pub enum ShipAttr {
    Abyssal,
    NightCarrier,
    Installation,
    RoyalNavy,
    Kai2,
    TurbineSpeedBonus,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Deserialize)]
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
    Sunk,
    Taiha,
    Chuuha,
    Shouha,
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

#[derive(Debug, EnumSetType)]
pub enum ShellingAttackType {
    Normal,

    MainMain,
    MainApShell,
    MainRader,
    MainSecond,
    DoubleAttack,

    FBA,
    BBA,
    BA,

    Zuiun,
    Suisei,
}

#[derive(Debug, EnumSetType)]
pub enum AirState {
    /** 制空確保 */
    AirSupremacy,
    /** 制空優勢 */
    AirSuperiority,
    /** 制空均衡 */
    AirParity,
    /** 制空劣勢 */
    AirDenial,
    /** 制空喪失 */
    AirIncapability,
}

#[cfg(test)]
mod test {

    use super::*;

    #[test]
    fn test_const_ship_id() {
        assert_eq!(crate::const_ship_id!("睦月"), 1);
    }

    #[test]
    fn test_const_gear_id() {
        assert_eq!(crate::const_gear_id!("12cm単装砲"), 1);
    }

    #[test]
    fn test_gear_attr() {
        use std::str::FromStr;
        use wasmer_enumset::EnumSet;

        let mut set: EnumSet<GearAttr> = GearAttr::HighAngleMount | GearAttr::JetAircraft;
        set.insert(GearAttr::MainGun);

        assert_eq!(set.len(), 3);
        assert!(set.contains(GearAttr::MainGun));

        assert_eq!(
            GearAttr::from_str("HighAngleMount").unwrap(),
            GearAttr::HighAngleMount
        );
    }

    #[test]
    fn test_ship_type() {
        println!("{:?}", ShipType::DD | ShipType::DE & ShipType::DD)
    }

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
