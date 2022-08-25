use hashbrown::HashMap;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    comp::Comp,
    types::{DamageState, Role},
    utils::Histogram,
};

#[derive(Debug, Default)]
pub struct BattleLogger {
    times: usize,
    sunk_counter: Histogram<usize, usize>,
    damage_map: HashMap<String, Histogram<DamageState, usize>>,
}

impl BattleLogger {
    pub fn new(times: usize) -> Self {
        Self {
            times,
            ..Default::default()
        }
    }

    pub fn write(&mut self, comp: &Comp) {
        let sunk_count = comp
            .ships()
            .filter(|ship| {
                let ds_counter = match self.damage_map.get_mut(&ship.id) {
                    Some(c) => c,
                    None => {
                        assert!(!ship.id.is_empty(), "Ship id is empty!");

                        self.damage_map
                            .entry(ship.id.clone())
                            .or_insert_with(Histogram::new)
                    }
                };

                let ds = ship.damage_state();
                *ds_counter += (ds, 1_usize);
                ds == DamageState::Sunk
            })
            .count();

        self.sunk_counter += (sunk_count, 1);
    }

    pub fn create_result(self, comp: &Comp) -> SimulatorResult {
        let times_f64 = self.times as f64;

        let items = self
            .damage_map
            .into_iter()
            .map(|(id, counter)| {
                let damage_state_map = counter
                    .into_iter()
                    .map(|(ds, count)| (ds, count as f64 / times_f64))
                    .collect::<HashMap<_, _>>();

                let entry = comp
                    .members()
                    .find(|member| member.ship.id == id)
                    .unwrap_or_else(|| unreachable!());

                SimulatorResultItem {
                    id,
                    role: entry.position.role,
                    index: entry.position.index,
                    damage_state_map,
                }
            })
            .sorted_by(|a, b| {
                let ord = a.role.cmp(&b.role);
                if ord.is_eq() {
                    a.index.cmp(&b.index)
                } else {
                    ord
                }
            })
            .collect::<Vec<_>>();

        let sunk_vec = self
            .sunk_counter
            .into_iter()
            .sorted_by(|a, b| b.0.cmp(&a.0))
            .scan(0.0, |acc, (n, count)| {
                let rate = count as f64 / times_f64;
                *acc += rate;
                Some((n, rate, *acc))
            })
            .collect();

        SimulatorResult { items, sunk_vec }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct SimulatorResultItem {
    pub id: String,
    pub role: Role,
    pub index: usize,
    pub damage_state_map: HashMap<DamageState, f64>,
}

#[derive(Debug, Clone, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct SimulatorResult {
    pub items: Vec<SimulatorResultItem>,
    pub sunk_vec: Vec<(usize, f64, f64)>,
}
