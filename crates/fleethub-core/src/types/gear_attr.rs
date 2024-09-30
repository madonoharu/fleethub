use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use strum::EnumString;
use tsify::Tsify;

#[derive(Debug, EnumSetType, EnumString, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum GearAttr {Unknown,
/// 高角砲
HighAngleMount,
/// 夜間戦闘機
NightFighter,
/// 夜間攻撃機
NightAttacker,
/// 重爆撃機
HeavyBomber,
/// 夜間偵察機
NightRecon,
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
/// シナジー爆雷
SynergisticDepthCharge,
/// 対潜迫撃砲
AntiSubMortar,
/// 対潜兵器
AntiSubWeapon,
/// 装甲貫通爆雷
ApDepthCharge,
/// 対潜航空機
AntiSubAircraft,
/// 後期型艦首魚雷
LateModelBowTorpedo,
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
/// 艦上Swordfish
CbSwordfish,
/// 準夜間機
SemiNightPlane,
/// 高高度迎撃機
HighAltitudeInterceptor}



impl Default for GearAttr {
    #[inline]
    fn default() -> Self {
        Self::Unknown
    }
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
