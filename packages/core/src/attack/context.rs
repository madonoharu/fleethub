use serde::Deserialize;
use ts_rs::TS;

use crate::types::{
    AirState, DayCutin, DayCutinDef, Engagement, Formation, FormationAttackModifiers,
    MasterConstants, OrgType, Role,
};

#[derive(Debug, Clone, Deserialize, TS)]
pub struct WarfareSideState {
    pub org_type: OrgType,
    pub role: Role,
    pub ship_index: usize,
    pub fleet_len: usize,
    pub formation: Formation,

    pub fleet_los_mod: Option<f64>,
}

#[derive(Debug, Clone, Deserialize, TS)]
pub struct WarfareContext {
    pub attacker: WarfareSideState,
    pub target: WarfareSideState,
    pub engagement: Engagement,
    pub air_state: AirState,
}

pub struct ShellingContext<'a> {
    pub master_constants: &'a MasterConstants,
    pub attacker: WarfareSideState,
    pub target: WarfareSideState,
    pub engagement: Engagement,
    pub air_state: AirState,
    pub cutin: Option<DayCutin>,
}

impl<'a> ShellingContext<'a> {
    pub fn attacker_formation_mods(&self) -> Option<FormationAttackModifiers> {
        let WarfareSideState {
            formation,
            ship_index,
            fleet_len,
            ..
        } = self.attacker;

        self.master_constants
            .get_formation_def(formation, ship_index, fleet_len)
            .map(|def| def.shelling.clone())
    }

    pub fn target_formation_mods(&self) -> Option<FormationAttackModifiers> {
        let WarfareSideState {
            formation,
            ship_index,
            fleet_len,
            ..
        } = self.target;

        self.master_constants
            .get_formation_def(formation, ship_index, fleet_len)
            .map(|def| def.shelling.clone())
    }

    pub fn cutin_def(&self) -> Option<&DayCutinDef> {
        self.master_constants.get_day_cutin_def(self.cutin?)
    }
}
