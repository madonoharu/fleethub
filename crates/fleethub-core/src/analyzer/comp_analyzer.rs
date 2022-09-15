use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    comp::Comp,
    ship::Ship,
    types::{
        BattleDefinitions, Engagement, Formation, NightAttackStyle, NightConditions,
        NightFleetConditions, ShellingStyle, Side,
    },
};

use super::{
    anti_air_analyzer::{AntiAirAnalyzer, CompAntiAirAnalysis},
    contact_analyzer::ContactAnalysis,
    day_cutin_analyzer::{CompDayCutinAnalysis, DayCutinAnalyzer},
    night_cutin_analyzer::{CompNightCutinAnalysis, NightCutinAnalyzer},
    FleetCutinAnalyzer, FleetCutinReport,
};

#[derive(Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct CompAnalysis {
    pub day: CompDayAnalysis,
    pub night: CompNightAnalysis,
    pub contact: ContactAnalysis,
    pub anti_air: CompAntiAirAnalysis,
}

#[derive(Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct CompDayAnalysis {
    pub day_cutin: CompDayCutinAnalysis,
    pub fleet_cutin: Vec<FleetCutinReport<ShellingStyle>>,
}

#[derive(Serialize, Tsify)]
pub struct CompNightAnalysis {
    pub night_cutin: CompNightCutinAnalysis,
    pub fleet_cutin: Vec<FleetCutinReport<NightAttackStyle>>,
}

#[derive(Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
pub struct CompAnalyzerConfig {
    pub engagement: Engagement,
    pub formation: Formation,
    pub anti_air_cutin: Option<u8>,
    pub ship_anti_air_resist: f64,
    pub fleet_anti_air_resist: f64,
    pub left_night_fleet_conditions: NightFleetConditions,
    pub right_night_fleet_conditions: NightFleetConditions,
}
impl Default for CompAnalyzerConfig {
    fn default() -> Self {
        Self {
            engagement: Default::default(),
            formation: Default::default(),
            anti_air_cutin: None,
            ship_anti_air_resist: 1.0,
            fleet_anti_air_resist: 1.0,
            left_night_fleet_conditions: Default::default(),
            right_night_fleet_conditions: Default::default(),
        }
    }
}

impl CompAnalyzerConfig {
    pub fn night_conditions(&self, left_side: Side) -> NightConditions {
        if left_side.is_player() {
            NightConditions {
                player: self.left_night_fleet_conditions.clone(),
                enemy: self.right_night_fleet_conditions.clone(),
            }
        } else {
            NightConditions {
                player: self.right_night_fleet_conditions.clone(),
                enemy: self.left_night_fleet_conditions.clone(),
            }
        }
    }
}

pub struct CompAnalyzer<'a> {
    battle_defs: &'a BattleDefinitions,
    comp: &'a Comp,
    dummy: Ship,
    config: CompAnalyzerConfig,
}

impl<'a> CompAnalyzer<'a> {
    pub fn new(
        battle_defs: &'a BattleDefinitions,
        comp: &'a Comp,
        config: CompAnalyzerConfig,
    ) -> Self {
        Self {
            battle_defs,
            comp,
            config,
            dummy: Default::default(),
        }
    }

    pub fn analyze(&self) -> CompAnalysis {
        CompAnalysis {
            day: self.analyze_day(),
            night: self.analyze_night(),
            contact: self.analyze_contact(),
            anti_air: self.analyze_anti_air(),
        }
    }

    fn analyze_day(&self) -> CompDayAnalysis {
        let day_cutin_analyzer = DayCutinAnalyzer {
            battle_defs: self.battle_defs,
            comp: self.comp,
            dummy: &self.dummy,
            engagement: self.config.engagement,
            formation: self.config.formation,
        };

        let fleet_cutin = FleetCutinAnalyzer::new(
            self.battle_defs,
            self.comp,
            self.config.engagement,
            &self.dummy,
        )
        .analyze_shelling_attacks();

        CompDayAnalysis {
            day_cutin: day_cutin_analyzer.analyze(),
            fleet_cutin,
        }
    }

    fn analyze_night(&self) -> CompNightAnalysis {
        let night_cutin = NightCutinAnalyzer {
            battle_defs: self.battle_defs,
            comp: self.comp,
            dummy: &self.dummy,
            config: &self.config,
        }
        .analyze();

        let fleet_cutin = FleetCutinAnalyzer::new(
            self.battle_defs,
            self.comp,
            self.config.engagement,
            &self.dummy,
        )
        .analyze_night_attacks(&self.config.night_conditions(self.comp.side()));

        CompNightAnalysis {
            night_cutin,
            fleet_cutin,
        }
    }

    fn analyze_anti_air(&self) -> CompAntiAirAnalysis {
        AntiAirAnalyzer {
            battle_defs: self.battle_defs,
            comp: self.comp,
            formation: self.config.formation,
            aaci: self.config.anti_air_cutin,
            ship_anti_air_resist: self.config.ship_anti_air_resist,
            fleet_anti_air_resist: self.config.fleet_anti_air_resist,
        }
        .analyze()
    }

    fn analyze_contact(&self) -> ContactAnalysis {
        ContactAnalysis::new(self.comp)
    }
}
