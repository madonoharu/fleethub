use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::attack::WarfareShipEnvironment;

use super::{DayCutin, Formation, NightCutin, NightSpecialAttack, ShellingSpecialAttack};

pub struct FormationWarfareModifiers {
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub evasion_mod: f64,
}

impl Default for FormationWarfareModifiers {
    fn default() -> Self {
        Self {
            power_mod: 1.0,
            accuracy_mod: 1.0,
            evasion_mod: 1.0,
        }
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct FormationWarfareDef {
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
    pub evasion_mod: Option<f64>,
}

impl FormationWarfareDef {
    pub fn to_modifiers(&self) -> FormationWarfareModifiers {
        FormationWarfareModifiers {
            power_mod: self.power_mod.unwrap_or(1.0),
            accuracy_mod: self.accuracy_mod.unwrap_or(1.0),
            evasion_mod: self.evasion_mod.unwrap_or(1.0),
        }
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct FormationDef {
    pub tag: Formation,
    pub protection_rate: Option<f64>,
    pub fleet_anti_air_mod: f64,
    pub shelling: FormationWarfareDef,
    pub torpedo: FormationWarfareDef,
    pub asw: FormationWarfareDef,
    pub night: FormationWarfareDef,
    pub shelling_support: FormationWarfareDef,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(untagged)]
pub enum NestedFormationDef {
    Normal(FormationDef),
    Vanguard {
        top_half: FormationDef,
        bottom_half: FormationDef,
    },
}

impl Default for NestedFormationDef {
    fn default() -> Self {
        Self::Normal(Default::default())
    }
}

impl NestedFormationDef {
    pub fn tag(&self) -> Formation {
        match self {
            Self::Normal(normal) => normal.tag,
            Self::Vanguard { top_half, .. } => top_half.tag,
        }
    }

    pub fn get_def(&self, fleet_len: usize, ship_index: usize) -> &FormationDef {
        match self {
            Self::Normal(normal) => normal,
            Self::Vanguard {
                top_half,
                bottom_half,
            } => {
                if ship_index < fleet_len / 2 {
                    top_half
                } else {
                    bottom_half
                }
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct AntiAirCutinDef {
    pub id: u8,
    pub chance_numer: Option<u8>,
    pub multiplier: Option<f64>,
    pub minimum_bonus: Option<u8>,
    pub sequential: Option<bool>,
}

impl AntiAirCutinDef {
    pub fn rate(&self) -> Option<f64> {
        Some(self.chance_numer? as f64 / 101.)
    }

    pub fn is_sequential(&self) -> bool {
        crate::log!("{} {:?}", self.id, self.sequential);
        self.sequential.unwrap_or_default()
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct DayCutinDef {
    pub tag: DayCutin,
    pub hits: u8,
    pub chance_denom: Option<u8>,
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
}

pub struct CutinModifiers {
    pub power_mod: f64,
    pub accuracy_mod: f64,
}

impl Default for CutinModifiers {
    fn default() -> Self {
        Self {
            power_mod: 1.0,
            accuracy_mod: 1.0,
        }
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct NightCutinDef {
    pub tag: NightCutin,
    pub hits: f64,
    pub chance_denom: Option<u8>,
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
}

impl NightCutinDef {
    pub fn to_modifiers(&self) -> CutinModifiers {
        CutinModifiers {
            power_mod: self.power_mod.unwrap_or(1.0),
            accuracy_mod: self.accuracy_mod.unwrap_or(1.0),
        }
    }

    pub fn rate(&self, cutin_term: f64) -> Option<f64> {
        let rate = if self.tag == NightCutin::DoubleAttack {
            109.0 / 110.0
        } else {
            (cutin_term.ceil() / self.chance_denom? as f64).min(1.)
        };

        Some(rate)
    }
}

#[derive(Debug, Default, Clone)]
pub struct SpecialAttackDef<T> {
    pub kind: T,
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub hits: f64,
}

impl From<&DayCutinDef> for SpecialAttackDef<ShellingSpecialAttack> {
    fn from(def: &DayCutinDef) -> Self {
        Self {
            kind: ShellingSpecialAttack::DayCutin(def.tag),
            power_mod: def.power_mod.unwrap_or(1.0),
            accuracy_mod: def.accuracy_mod.unwrap_or(1.0),
            hits: def.hits.into(),
        }
    }
}

impl From<&NightCutinDef> for SpecialAttackDef<NightSpecialAttack> {
    fn from(def: &NightCutinDef) -> Self {
        Self {
            kind: NightSpecialAttack::NightCutin(def.tag),
            power_mod: def.power_mod.unwrap_or(1.0),
            accuracy_mod: def.accuracy_mod.unwrap_or(1.0),
            hits: def.hits,
        }
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct BattleConfig {
    pub formation: Vec<NestedFormationDef>,
    pub anti_air_cutin: Vec<AntiAirCutinDef>,
    pub day_cutin: Vec<DayCutinDef>,
    pub night_cutin: Vec<NightCutinDef>,
}

impl BattleConfig {
    pub fn get_formation_def(
        &self,
        formation: Formation,
        fleet_len: usize,
        ship_index: usize,
    ) -> Option<&FormationDef> {
        let nfd = self.formation.iter().find(|nfd| formation == nfd.tag())?;
        Some(nfd.get_def(fleet_len, ship_index))
    }

    pub fn get_formation_def_by_env(&self, env: &WarfareShipEnvironment) -> Option<&FormationDef> {
        self.get_formation_def(env.formation, env.fleet_len, env.ship_index)
    }

    pub fn get_formation_fleet_anti_air_mod(&self, formation: Formation) -> f64 {
        let found = self.formation.iter().find(|nfd| formation == nfd.tag());

        if let Some(nfd) = found {
            nfd.get_def(0, 6).fleet_anti_air_mod
        } else {
            1.0
        }
    }

    pub fn get_day_cutin_def(&self, cutin: DayCutin) -> Option<&DayCutinDef> {
        self.day_cutin.iter().find(|def| def.tag == cutin)
    }

    pub fn get_night_cutin_def(&self, cutin: NightCutin) -> Option<&NightCutinDef> {
        self.night_cutin.iter().find(|def| def.tag == cutin)
    }
}
