use serde::Deserialize;
use tsify::Tsify;

use crate::gear::IBonuses;

use super::{compiled_evaler::CompiledEvaler, master_gear::MasterGear};

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterIBonusRule {
    pub expr: CompiledEvaler,
    pub formula: CompiledEvaler,
}

impl MasterIBonusRule {
    fn eval(&self, gear: &MasterGear, stars: u8) -> Option<f64> {
        if self.expr.eval(&mut gear.ns()).unwrap_or_default() == 1.0 {
            let mut ns = |name: &str, args: Vec<f64>| match name {
                "x" => Some(stars as f64),
                "sqrt" => args.first().map(|v| v.sqrt()),
                _ => None,
            };

            self.formula.eval(&mut ns).ok()
        } else {
            None
        }
    }
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterIBonuses {
    shelling_power: Vec<MasterIBonusRule>,
    carrier_shelling_power: Vec<MasterIBonusRule>,
    shelling_accuracy: Vec<MasterIBonusRule>,
    torpedo_power: Vec<MasterIBonusRule>,
    torpedo_accuracy: Vec<MasterIBonusRule>,
    torpedo_evasion: Vec<MasterIBonusRule>,
    asw_power: Vec<MasterIBonusRule>,
    asw_accuracy: Vec<MasterIBonusRule>,
    night_power: Vec<MasterIBonusRule>,
    night_accuracy: Vec<MasterIBonusRule>,
    defense_power: Vec<MasterIBonusRule>,
    contact_selection: Vec<MasterIBonusRule>,
    fighter_power: Vec<MasterIBonusRule>,
    ship_anti_air: Vec<MasterIBonusRule>,
    fleet_anti_air: Vec<MasterIBonusRule>,
    elos: Vec<MasterIBonusRule>,
}

impl MasterIBonuses {
    pub fn eval(&self, gear: &MasterGear, stars: u8) -> IBonuses {
        let calc = |rules: &Vec<MasterIBonusRule>| {
            rules
                .iter()
                .find_map(|rule| rule.eval(gear, stars))
                .unwrap_or_default()
        };

        IBonuses {
            shelling_power: calc(&self.shelling_power),
            carrier_shelling_power: calc(&self.carrier_shelling_power),
            shelling_accuracy: calc(&self.shelling_accuracy),
            torpedo_power: calc(&self.torpedo_power),
            torpedo_accuracy: calc(&self.torpedo_accuracy),
            torpedo_evasion: calc(&self.torpedo_evasion),
            asw_power: calc(&self.asw_power),
            asw_accuracy: calc(&self.asw_accuracy),
            night_power: calc(&self.night_power),
            night_accuracy: calc(&self.night_accuracy),
            defense_power: calc(&self.defense_power),
            contact_selection: calc(&self.contact_selection),
            fighter_power: calc(&self.fighter_power),
            ship_anti_air: calc(&self.ship_anti_air),
            fleet_anti_air: calc(&self.fleet_anti_air),
            elos: calc(&self.elos),
        }
    }
}
