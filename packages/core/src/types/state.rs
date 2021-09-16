use serde::{Deserialize, Serialize};
use strum::{AsRefStr, EnumString, ToString};
use ts_rs::TS;
use wasm_bindgen::prelude::*;

use super::{CombinedFormation, Formation, SingleFormation};

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, TS)]
pub struct GearState {
    pub id: Option<String>,

    pub gear_id: u16,
    pub exp: Option<u8>,
    pub stars: Option<u8>,
}

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, TS)]
pub struct ShipState {
    pub id: Option<String>,
    pub ship_id: u16,
    pub level: Option<u16>,
    pub current_hp: Option<u16>,
    pub morale: Option<u8>,
    pub ammo: Option<u16>,
    pub fuel: Option<u16>,

    pub max_hp_mod: Option<i16>,
    pub firepower_mod: Option<i16>,
    pub torpedo_mod: Option<i16>,
    pub armor_mod: Option<i16>,
    pub anti_air_mod: Option<i16>,
    pub evasion_mod: Option<i16>,
    pub asw_mod: Option<i16>,
    pub los_mod: Option<i16>,
    pub luck_mod: Option<i16>,

    pub g1: Option<GearState>,
    pub g2: Option<GearState>,
    pub g3: Option<GearState>,
    pub g4: Option<GearState>,
    pub g5: Option<GearState>,
    pub gx: Option<GearState>,

    pub ss1: Option<u8>,
    pub ss2: Option<u8>,
    pub ss3: Option<u8>,
    pub ss4: Option<u8>,
    pub ss5: Option<u8>,
}

#[derive(Debug, Default, Clone, Hash, Deserialize, TS)]
pub struct FleetState {
    pub id: Option<String>,
    pub len: Option<usize>,

    pub s1: Option<ShipState>,
    pub s2: Option<ShipState>,
    pub s3: Option<ShipState>,
    pub s4: Option<ShipState>,
    pub s5: Option<ShipState>,
    pub s6: Option<ShipState>,
    pub s7: Option<ShipState>,
}

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS)]
pub enum AirSquadronMode {
    Sortie,
    AirDefense,
}

impl Default for AirSquadronMode {
    fn default() -> Self {
        Self::Sortie
    }
}

impl AirSquadronMode {
    pub fn is_air_defense(&self) -> bool {
        matches!(*self, Self::AirDefense)
    }
}

#[derive(Debug, Default, Clone, Hash, Deserialize, TS)]
pub struct AirSquadronState {
    pub id: Option<String>,

    pub mode: Option<AirSquadronMode>,

    pub g1: Option<GearState>,
    pub g2: Option<GearState>,
    pub g3: Option<GearState>,
    pub g4: Option<GearState>,
    pub g5: Option<GearState>,
    pub gx: Option<GearState>,

    pub ss1: Option<u8>,
    pub ss2: Option<u8>,
    pub ss3: Option<u8>,
    pub ss4: Option<u8>,
    pub ss5: Option<u8>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, ToString, Serialize, Deserialize, TS)]
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

#[derive(Debug, Clone, Copy, PartialEq, Hash, EnumString, AsRefStr, Serialize, Deserialize, TS)]
pub enum OrgType {
    /// 通常艦隊
    Single,
    /// 空母機動部隊
    CarrierTaskForce,
    /// 水上打撃部隊
    SurfaceTaskForce,
    /// 輸送護衛部隊
    TransportEscort,
    /// 敵通常
    EnemySingle,
    /// 敵連合
    EnemyCombined,
}

impl Default for OrgType {
    fn default() -> Self {
        OrgType::Single
    }
}

impl OrgType {
    pub fn is_single(&self) -> bool {
        matches!(*self, Self::Single | Self::EnemySingle)
    }

    pub fn is_combined(&self) -> bool {
        !self.is_single()
    }

    pub fn default_formation(&self) -> Formation {
        if self.is_combined() {
            Formation::Combined(CombinedFormation::default())
        } else {
            Formation::Single(SingleFormation::default())
        }
    }

    pub fn is_enemy(&self) -> bool {
        matches!(*self, Self::EnemySingle | Self::EnemyCombined)
    }

    pub fn is_player(&self) -> bool {
        !self.is_enemy()
    }

    pub fn side(&self) -> Side {
        if self.is_player() {
            Side::Player
        } else {
            Side::Enemy
        }
    }
}

#[wasm_bindgen]
pub fn org_type_is_single(org_type: OrgType) -> bool {
    org_type.is_single()
}

#[wasm_bindgen]
pub fn org_type_default_formation(org_type: OrgType) -> Formation {
    org_type.default_formation()
}

#[wasm_bindgen]
pub fn org_type_is_player(org_type: OrgType) -> bool {
    org_type.is_player()
}

#[wasm_bindgen]
pub fn org_type_side(org_type: OrgType) -> Side {
    org_type.side()
}

#[derive(Debug, Clone, Copy, PartialEq, EnumString, AsRefStr, Serialize, Deserialize, TS)]
pub enum Role {
    Main,
    Escort,
    RouteSup,
    BossSup,
}

impl Default for Role {
    fn default() -> Self {
        Self::Main
    }
}

impl Role {
    pub fn is_main(&self) -> bool {
        matches!(*self, Self::Main)
    }

    pub fn is_escort(&self) -> bool {
        matches!(*self, Self::Escort)
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
}
