use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::types::CompiledEvaler;

use super::master_gear::MasterGear;

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

macro_rules! impl_ibonuses {
    ($($key: ident,)*) => {
        #[derive(Debug, Default, Clone, Deserialize, Tsify)]
        pub struct MasterIBonuses {
            $($key: Vec<MasterIBonusRule>,)*
        }

        #[derive(Debug, Default, Clone, Serialize, Deserialize)]
        pub struct IBonuses {
            $(pub $key: f64,)*
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
                    $($key: calc(&self.$key),)*
                }
            }
        }
    };
}

impl_ibonuses!(
    shelling_power,
    shelling_accuracy,
    shelling_aerial_power,
    torpedo_power,
    torpedo_accuracy,
    torpedo_evasion,
    asw_power,
    asw_accuracy,
    night_power,
    night_aerial_power,
    night_accuracy,
    defense_power,
    contact_selection,
    fighter_power,
    ship_anti_air,
    fleet_anti_air,
    elos,
);
