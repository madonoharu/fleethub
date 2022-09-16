use serde::Deserialize;
use tsify::Tsify;

use crate::types::{
    AntiAirCutinDef, BattleDefinitions, DayCutinDef, HistoricalBonusDef, NestedFormationDef,
    NightCutinDef,
};

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterBattleDefinitions {
    pub formation: Vec<NestedFormationDef>,
    pub anti_air_cutin: Vec<AntiAirCutinDef>,
    pub day_cutin: Vec<DayCutinDef>,
    pub night_cutin: Vec<NightCutinDef>,
    #[serde(default)]
    pub historical_bonuses: Vec<HistoricalBonusDef>,
}

impl MasterBattleDefinitions {
    pub fn battle_definitions(&self) -> BattleDefinitions {
        let formation = self
            .formation
            .iter()
            .map(|def| (def.tag(), def.clone()))
            .collect();

        let anti_air_cutin = self
            .anti_air_cutin
            .iter()
            .map(|def| (def.id, def.clone()))
            .collect();

        let day_cutin = self
            .day_cutin
            .iter()
            .map(|def| (def.tag, def.clone()))
            .collect();

        let night_cutin = self
            .night_cutin
            .iter()
            .map(|def| (def.tag, def.clone()))
            .collect();

        BattleDefinitions {
            formation,
            anti_air_cutin,
            day_cutin,
            night_cutin,
            historical_bonuses: self.historical_bonuses.clone(),
        }
    }
}
