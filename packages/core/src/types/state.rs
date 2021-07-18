use serde::Deserialize;
use strum_macros::ToString;
use ts_rs::TS;

#[derive(Debug, Default, Clone, Hash, Deserialize, TS)]
pub struct GearState {
    pub id: Option<String>,

    pub gear_id: i32,
    pub exp: Option<i32>,
    pub stars: Option<i32>,
}

#[derive(Debug, Default, Clone, Hash, Deserialize, TS)]
pub struct ShipState {
    pub id: Option<String>,
    pub ship_id: i32,
    pub level: Option<i32>,
    pub current_hp: Option<i32>,

    pub max_hp_mod: Option<i32>,
    pub firepower_mod: Option<i32>,
    pub torpedo_mod: Option<i32>,
    pub armor_mod: Option<i32>,
    pub anti_air_mod: Option<i32>,
    pub evasion_mod: Option<i32>,
    pub asw_mod: Option<i32>,
    pub los_mod: Option<i32>,
    pub luck_mod: Option<i32>,

    pub g1: Option<GearState>,
    pub g2: Option<GearState>,
    pub g3: Option<GearState>,
    pub g4: Option<GearState>,
    pub g5: Option<GearState>,
    pub gx: Option<GearState>,

    pub ss1: Option<i32>,
    pub ss2: Option<i32>,
    pub ss3: Option<i32>,
    pub ss4: Option<i32>,
    pub ss5: Option<i32>,
}

#[derive(Debug, Default, Clone, Hash, Deserialize, TS)]
pub struct FleetState {
    pub id: Option<String>,

    pub s1: Option<ShipState>,
    pub s2: Option<ShipState>,
    pub s3: Option<ShipState>,
    pub s4: Option<ShipState>,
    pub s5: Option<ShipState>,
    pub s6: Option<ShipState>,
    pub s7: Option<ShipState>,
}

#[derive(Debug, Default, Clone, Hash, Deserialize, TS)]
pub struct AirSquadronState {
    pub id: Option<String>,

    pub g1: Option<GearState>,
    pub g2: Option<GearState>,
    pub g3: Option<GearState>,
    pub g4: Option<GearState>,

    pub ss1: Option<i32>,
    pub ss2: Option<i32>,
    pub ss3: Option<i32>,
    pub ss4: Option<i32>,
}

#[derive(Debug, Clone, Copy, PartialEq, Hash, ToString, Deserialize, TS)]
pub enum OrgType {
    Single,
    CarrierTaskForce,
    SurfaceTaskForce,
    TransportEscort,
    EnemyCombined,
}

impl Default for OrgType {
    fn default() -> Self {
        OrgType::Single
    }
}

impl OrgType {
    pub fn is_combined(&self) -> bool {
        matches!(
            *self,
            Self::CarrierTaskForce
                | Self::SurfaceTaskForce
                | Self::TransportEscort
                | Self::EnemyCombined,
        )
    }
}

#[derive(Debug, PartialEq)]
pub enum Role {
    Main,
    Escort,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, TS)]
pub enum Side {
    Player,
    Enemy,
}

impl Default for Side {
    fn default() -> Self {
        Self::Player
    }
}

impl Side {
    pub fn is_player(&self) -> bool {
        *self == Self::Player
    }

    pub fn is_enemy(&self) -> bool {
        !self.is_player()
    }
}

#[derive(Debug, Default, Clone, Hash, Deserialize, TS)]
pub struct OrgState {
    pub id: Option<String>,

    pub f1: Option<FleetState>,
    pub f2: Option<FleetState>,
    pub f3: Option<FleetState>,
    pub f4: Option<FleetState>,

    pub a1: Option<AirSquadronState>,
    pub a2: Option<AirSquadronState>,
    pub a3: Option<AirSquadronState>,

    pub hq_level: Option<i32>,
    pub org_type: Option<OrgType>,
    pub side: Option<Side>,
}
