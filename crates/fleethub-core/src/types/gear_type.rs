use enumset::EnumSetType;
use num_derive::{FromPrimitive, ToPrimitive};
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, EnumSetType, FromPrimitive, ToPrimitive, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum GearType {
    Unknown = 0,
    /// 小口径主砲
    SmallMainGun = 1,
    /// 中口径主砲
    MediumMainGun = 2,
    /// 大口径主砲
    LargeMainGun = 3,
    /// 副砲
    SecondaryGun = 4,
    /// 魚雷
    Torpedo = 5,
    /// 艦上戦闘機
    CbFighter = 6,
    /// 艦上爆撃機
    CbDiveBomber = 7,
    /// 艦上攻撃機
    CbTorpedoBomber = 8,
    /// 艦上偵察機
    CbRecon = 9,
    /// 水上偵察機
    ReconSeaplane = 10,
    /// 水上爆撃機
    SeaplaneBomber = 11,
    /// 小型電探
    SmallRadar = 12,
    /// 大型電探
    LargeRadar = 13,
    /// ソナー
    Sonar = 14,
    /// 爆雷
    DepthCharge = 15,
    /// 追加装甲
    ExtraArmor = 16,
    /// 機関部強化
    Engine = 17,
    /// 対空強化弾
    AntiAirShell = 18,
    /// 対艦強化弾
    ApShell = 19,
    /// VT信管
    VtFuze = 20,
    /// 対空機銃
    AntiAirGun = 21,
    /// 特殊潜航艇
    MidgetSubmarine = 22,
    /// 応急修理要員
    EmergencyRepair = 23,
    /// 上陸用舟艇
    LandingCraft = 24,
    /// オートジャイロ
    Rotorcraft = 25,
    /// 対潜哨戒機
    AntiSubPatrolAircraft = 26,
    /// 追加装甲(中型)
    MediumArmor = 27,
    /// 追加装甲(大型)
    LargeArmor = 28,
    /// 探照灯
    Searchlight = 29,
    /// 簡易輸送部材
    SupplyContainer = 30,
    /// 艦艇修理施設
    ShipRepairFacility = 31,
    /// 潜水艦魚雷
    SubmarineTorpedo = 32,
    /// 照明弾
    Starshell = 33,
    /// 司令部施設
    CommandFacility = 34,
    /// 航空要員
    AviationPersonnel = 35,
    /// 高射装置
    AntiAirFireDirector = 36,
    /// 対地装備
    AntiGroundEquipment = 37,
    /// 大口径主砲（II）
    LargeMainGun2 = 38,
    /// 水上艦要員
    ShipPersonnel = 39,
    /// 大型ソナー
    LargeSonar = 40,
    /// 大型飛行艇
    LargeFlyingBoat = 41,
    /// 大型探照灯
    LargeSearchlight = 42,
    /// 戦闘糧食
    CombatRation = 43,
    /// 補給物資
    Supplies = 44,
    /// 水上戦闘機
    SeaplaneFighter = 45,
    /// 特型内火艇
    AmphibiousTank = 46,
    /// 陸上攻撃機
    LbAttacker = 47,
    /// 局地戦闘機
    LbFighter = 48,
    /// 陸上偵察機
    LbRecon = 49,
    /// 輸送機材
    TransportationMaterial = 50,
    /// 潜水艦装備
    SubmarineEquipment = 51,
    /// 大型陸上機
    LargeLbAircraft = 53,
    /// 噴式戦闘機
    JetFighter = 56,
    /// 噴式戦闘爆撃機
    JetFighterBomber = 57,
    /// 噴式攻撃機
    JetTorpedoBomber = 58,
    /// 噴式偵察機
    JetRecon = 59,
    /// 大型電探（II）
    LargeRadar2 = 93,
    /// 艦上偵察機（II）
    CbRecon2 = 94,
    /// 副砲（II）
    SecondaryGun2 = 95,
}

impl Default for GearType {
    fn default() -> Self {
        Self::Unknown
    }
}

#[derive(Debug, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum GearCategory {
    Fighter,
    Bomber,
    Recon,
    MainGun,
    Secondary,
    Torpedo,
    AntiSub,
    Radar,
    Landing,
    Ration,
    LandBased,
    Misc,
}

impl GearType {
    pub fn category(&self) -> GearCategory {
        use GearType::*;

        match self {
            CbFighter => GearCategory::Fighter,
            CbDiveBomber | CbTorpedoBomber | JetFighterBomber | JetTorpedoBomber => {
                GearCategory::Bomber
            }
            CbRecon
            | ReconSeaplane
            | SeaplaneBomber
            | SeaplaneFighter
            | LargeFlyingBoat
            | Rotorcraft
            | AntiSubPatrolAircraft => GearCategory::Recon,
            SmallMainGun | MediumMainGun | LargeMainGun => GearCategory::MainGun,
            SecondaryGun | AntiAirGun => GearCategory::Secondary,
            Torpedo | SubmarineTorpedo | MidgetSubmarine => GearCategory::Torpedo,
            Sonar | LargeSonar | DepthCharge => GearCategory::AntiSub,
            SmallRadar | LargeRadar => GearCategory::Radar,
            LandingCraft | AmphibiousTank | SupplyContainer => GearCategory::Landing,
            LbFighter | LbAttacker | LbRecon | LargeLbAircraft => GearCategory::LandBased,
            CombatRation | Supplies => GearCategory::Ration,
            _ => GearCategory::Misc,
        }
    }
}
