use enumset::EnumSetType;
use num_derive::{FromPrimitive, ToPrimitive};
use serde::{Deserialize, Serialize};
use strum::EnumString;
use ts_rs::TS;

#[derive(Debug, EnumSetType, FromPrimitive, ToPrimitive, Serialize, Deserialize, TS)]
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
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub enum GearFilterGroup {
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
    pub fn filter_group(&self) -> GearFilterGroup {
        use GearType::*;

        match self {
            CbFighter => GearFilterGroup::Fighter,
            CbDiveBomber | CbTorpedoBomber | JetFighterBomber | JetTorpedoBomber => {
                GearFilterGroup::Bomber
            }
            CbRecon
            | ReconSeaplane
            | SeaplaneBomber
            | SeaplaneFighter
            | LargeFlyingBoat
            | Rotorcraft
            | AntiSubPatrolAircraft => GearFilterGroup::Recon,
            SmallMainGun | MediumMainGun | LargeMainGun => GearFilterGroup::MainGun,
            SecondaryGun | AntiAirGun => GearFilterGroup::Secondary,
            Torpedo | SubmarineTorpedo | MidgetSubmarine => GearFilterGroup::Torpedo,
            Sonar | LargeSonar | DepthCharge => GearFilterGroup::AntiSub,
            SmallRadar | LargeRadar => GearFilterGroup::Radar,
            LandingCraft | AmphibiousTank | SupplyContainer => GearFilterGroup::Landing,
            LbFighter | LbAttacker | LbRecon | LargeLbAircraft => GearFilterGroup::LandBased,
            CombatRation | Supplies => GearFilterGroup::Ration,
            _ => GearFilterGroup::Misc,
        }
    }
}

impl Default for GearType {
    fn default() -> Self {
        Self::Unknown
    }
}

#[derive(Debug, EnumSetType, EnumString, Serialize, Deserialize, TS)]
pub enum GearAttr {
    /// 深海
    Abyssal,
    /// 高角砲
    HighAngleMount,
    /// 夜間戦闘機
    NightFighter,
    /// 夜間攻撃機
    NightAttacker,
    /// 重爆撃機
    HeavyBomber,
    /// 主砲
    MainGun,
    /// 電探
    Radar,
    /// 水上電探
    SurfaceRadar,
    /// 対空電探
    AirRadar,
    /// 爆雷投射機
    DepthChargeProjector,
    /// 増加爆雷
    AdditionalDepthCharge,
    /// 対潜迫撃砲
    AntiSubMortar,
    /// 対潜兵器
    AntiSubWeapon,
    /// 対潜航空機
    AntiSubAircraft,
    /// 水上機
    Seaplane,
    /// 艦上機
    CbAircraft,
    /// 陸上機
    LbAircraft,
    /// 噴式機
    JetAircraft,
    /// 戦闘機
    Fighter,
    /// 偵察機
    Recon,
    /// 水上観測機
    ObservationSeaplane,
    /// 艦上爆戦
    CbFighterBomber,
    /// 対地艦爆
    AntiInstDiveBomber,
    /// 夜間偵察機
    NightRecon,
    /// 艦上Swordfish
    CbSwordfish,
    /// 準夜間機
    SemiNightPlane,
    /// 高高度迎撃機
    HighAltitudeInterceptor,
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_gear_attr() {
        use enumset::EnumSet;
        use std::str::FromStr;

        let mut set: EnumSet<GearAttr> = GearAttr::HighAngleMount | GearAttr::JetAircraft;
        set.insert(GearAttr::MainGun);

        assert_eq!(set.len(), 3);
        assert!(set.contains(GearAttr::MainGun));

        assert_eq!(
            GearAttr::from_str("HighAngleMount").unwrap(),
            GearAttr::HighAngleMount
        );
    }
}
