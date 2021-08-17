use enumset::EnumSetType;
use num_derive::{FromPrimitive, ToPrimitive};
use strum_macros::{EnumString, ToString};
use ts_rs::TS;

#[derive(Debug, EnumSetType, FromPrimitive, ToPrimitive, ToString, TS)]
pub enum GearType {
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

impl Default for GearType {
    fn default() -> Self {
        Self::Unknown
    }
}

#[derive(Debug, EnumSetType, FromPrimitive, EnumString, TS)]
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
