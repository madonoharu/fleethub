use serde::Serialize;
use tsify::Tsify;

use crate::{
    comp::Comp,
    ship::Ship,
    types::{AntiAirCutinDef, BattleDefinitions, Formation},
};

#[derive(Debug, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct AntiAirReport {
    ship_id: u16,
    adjusted_anti_air: Option<f64>,
    proportional_shotdown_rate: Option<f64>,
    fixed_shotdown_number: Option<i32>,
    guaranteed: Option<i32>,
    anti_air_cutin_chance: Vec<(u8, f64)>,
    anti_air_propellant_barrage_chance: Option<f64>,
}

#[derive(Debug, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct CompAntiAirAnalysis {
    fleet_adjusted_anti_air: f64,
    ships: Vec<AntiAirReport>,
    anti_air_cutin_chance: Vec<(u8, f64)>,
}

pub struct AntiAirAnalyzer<'a> {
    pub battle_defs: &'a BattleDefinitions,
    pub comp: &'a Comp,
    pub formation: Formation,
    pub ship_anti_air_resist: f64,
    pub fleet_anti_air_resist: f64,
    pub aaci: Option<u8>,
}

impl AntiAirAnalyzer<'_> {
    pub fn analyze(&self) -> CompAntiAirAnalysis {
        let &Self {
            comp,
            formation,
            ship_anti_air_resist,
            fleet_anti_air_resist,
            aaci,
            ..
        } = self;

        let formation_mod = self.battle_defs.get_formation_fleet_anti_air_mod(formation);

        let fleet_adjusted_anti_air = comp.adjusted_anti_air(formation_mod);
        let anti_air_cutin = aaci.and_then(|id| self.get_anti_air_cutin_def(id));

        let ships = comp
            .members()
            .map(|member| {
                let air_defense = member.air_defense(fleet_adjusted_anti_air, anti_air_cutin);

                AntiAirReport {
                    ship_id: member.ship.ship_id,
                    adjusted_anti_air: air_defense.ship_adjusted_anti_air(),
                    proportional_shotdown_rate: air_defense
                        .proportional_shotdown_rate(ship_anti_air_resist),
                    fixed_shotdown_number: air_defense
                        .fixed_shotdown_number(ship_anti_air_resist, fleet_anti_air_resist),
                    guaranteed: air_defense.guaranteed(),
                    anti_air_cutin_chance: self.calc_ship_anti_air_cutin_chance(&member),
                    anti_air_propellant_barrage_chance: air_defense
                        .anti_air_propellant_barrage_chance(),
                }
            })
            .collect::<Vec<_>>();

        let aaci_id_set: std::collections::BTreeSet<u8> = ships
            .iter()
            .flat_map(|s| s.anti_air_cutin_chance.iter())
            .map(|r| r.0)
            .collect();

        let anti_air_cutin_chance = aaci_id_set
            .into_iter()
            .rev()
            .scan(0.0, |state, current_id| {
                let complement_of_ge_current_id = ships
                    .iter()
                    .map(|s| {
                        1.0 - s
                            .anti_air_cutin_chance
                            .iter()
                            .filter(|r| r.0 >= current_id)
                            .map(|r| r.1)
                            .sum::<f64>()
                    })
                    .product::<f64>();

                let actual = 1.0 - (*state + complement_of_ge_current_id);
                *state += actual;
                Some((current_id, actual))
            })
            .collect::<Vec<_>>();

        CompAntiAirAnalysis {
            fleet_adjusted_anti_air,
            ships,
            anti_air_cutin_chance,
        }
    }

    fn get_anti_air_cutin_def(&self, id: u8) -> Option<&AntiAirCutinDef> {
        self.battle_defs.anti_air_cutin.get(&id)
    }

    fn calc_ship_anti_air_cutin_chance(&self, ship: &Ship) -> Vec<(u8, f64)> {
        let (sequential_cis, normal_cis) = ship
            .get_possible_anti_air_cutin_ids()
            .into_iter()
            .filter_map(|id| self.get_anti_air_cutin_def(id))
            .partition::<Vec<_>, _>(|aaci| aaci.is_sequential());

        let mut total_sequential_rate = 0.0;

        #[allow(clippy::needless_collect)]
        let sequential_ci_vec = sequential_cis
            .into_iter()
            .filter_map(|aaci| {
                let current = aaci.rate()?;
                let actual = ((1.0 - total_sequential_rate) * current).min(1.0);
                total_sequential_rate += actual;

                Some((aaci.id, actual))
            })
            .collect::<Vec<_>>();

        let normal_ci_iter = normal_cis.into_iter().scan(0.0, |prev, aaci| {
            let current = aaci.rate()?;

            if current < *prev {
                return Some((aaci.id, 0.0));
            }

            let mut actual = current - *prev;

            if total_sequential_rate > 0.0 {
                actual *= 1.0 - total_sequential_rate;
            }

            *prev = current;
            Some((aaci.id, actual))
        });

        sequential_ci_vec
            .into_iter()
            .chain(normal_ci_iter)
            .collect::<Vec<_>>()
    }
}
