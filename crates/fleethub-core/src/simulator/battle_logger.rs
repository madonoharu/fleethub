use std::collections::HashMap;

use counter::Counter;
use fleethub_macro::FhAbi;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    comp::Comp,
    types::{DamageState, Role},
};

#[derive(Debug, Default)]
pub struct BattleLogger {
    times: usize,
    sunk_counter: Counter<usize>,
    damage_map: HashMap<String, Counter<DamageState>>,
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
            .filter(|(_, _, ship)| {
                let ds_counter = match self.damage_map.get_mut(&ship.id) {
                    Some(c) => c,
                    None => {
                        assert!(!ship.id.is_empty(), "Ship id is empty!");

                        self.damage_map
                            .entry(ship.id.clone())
                            .or_insert_with(Counter::new)
                    }
                };

                let ds = ship.damage_state();
                ds_counter[&ds] += 1;
                ds == DamageState::Sunk
            })
            .count();

        self.sunk_counter[&sunk_count] += 1;
    }

    pub fn create_result(self, comp: &Comp) -> SimulatorResult {
        let times_f64 = self.times as f64;

        let items = self
            .damage_map
            .into_iter()
            .map(|(id, counter)| {
                let damage_state_map = counter
                    .into_map()
                    .into_iter()
                    .map(|(ds, count)| (ds, count as f64 / times_f64))
                    .collect::<HashMap<_, _>>();

                let (role, index, _) = comp
                    .ships()
                    .find(|(_, _, ship)| ship.id == id)
                    .unwrap_or_else(|| unreachable!());

                SimulatorResultItem {
                    id,
                    role,
                    index,
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
            .into_map()
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

#[derive(Debug, Clone, Serialize, Deserialize, FhAbi, TS)]
pub struct SimulatorResultItem {
    pub id: String,
    pub role: Role,
    pub index: usize,
    pub damage_state_map: HashMap<DamageState, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FhAbi, TS)]
pub struct SimulatorResult {
    pub items: Vec<SimulatorResultItem>,
    pub sunk_vec: Vec<(usize, f64, f64)>,
}
