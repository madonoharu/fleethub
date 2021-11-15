use std::collections::HashMap;

use counter::Counter;
use fh_macro::FhAbi;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{fleet::Fleet, types::DamageState};

#[derive(Debug, Default)]
pub struct BattleLogger {
    times: usize,
    sunk_counter: Counter<usize>,
    damage_map: HashMap<u16, Counter<DamageState>>,
}

impl BattleLogger {
    pub fn new(times: usize) -> Self {
        Self {
            times,
            ..Default::default()
        }
    }

    pub fn write(&mut self, fleet: &Fleet) {
        let sunk_count = fleet
            .ships
            .values()
            .filter(|ship| {
                let ds_counter = self
                    .damage_map
                    .entry(ship.ship_id)
                    .or_insert_with(Counter::new);

                let ds = ship.damage_state();
                ds_counter[&ds] += 1;
                ds == DamageState::Sunk
            })
            .count();

        self.sunk_counter[&sunk_count] += 1;
    }

    pub fn into_simulator_result(self) -> SimulatorResult {
        let times_f64 = self.times as f64;

        let items = self
            .damage_map
            .into_iter()
            .map(|(ship_id, counter)| {
                let damage_state_map = counter
                    .into_map()
                    .into_iter()
                    .map(|(ds, count)| (ds, count as f64 / times_f64))
                    .collect::<HashMap<_, _>>();

                SimulatorResultItem {
                    ship_id,
                    damage_state_map,
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
    pub ship_id: u16,
    pub damage_state_map: HashMap<DamageState, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FhAbi, TS)]
pub struct SimulatorResult {
    pub items: Vec<SimulatorResultItem>,
    pub sunk_vec: Vec<(usize, f64, f64)>,
}
