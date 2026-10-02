use std::cmp::Reverse;

use hashbrown::HashMap;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    comp::Comp,
    types::{DamageState, FleetType},
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
                let ds_counter = self
                    .damage_map
                    .entry_ref(ship.id.as_str())
                    .or_insert_with_key(|id| {
                        assert!(!id.is_empty(), "Ship id is empty!");
                        Histogram::new()
                    });

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
                    .all_members()
                    .find(|member| member.ship.id == id)
                    .unwrap_or_else(|| unreachable!("id: {}", id));

                SimulatorResultItem {
                    id,
                    fleet_type: entry.position.fleet_type,
                    index: entry.position.index,
                    damage_state_map,
                }
            })
            .sorted_by_key(|item| (item.fleet_type, item.index))
            .collect::<Vec<_>>();

        let sunk_vec = self
            .sunk_counter
            .into_iter()
            .sorted_by_key(|&(n, _)| Reverse(n))
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
    pub fleet_type: FleetType,
    pub index: usize,
    pub damage_state_map: HashMap<DamageState, f64>,
}

#[derive(Debug, Clone, Serialize, Tsify)]
pub struct SimulatorResult {
    pub items: Vec<SimulatorResultItem>,
    pub sunk_vec: Vec<(usize, f64, f64)>,
}

#[cfg(test)]
mod test {
    use crate::{fleet::Fleet, ship::Ship};

    use super::*;

    fn fleet(ids: &[Option<&str>]) -> Fleet {
        Fleet {
            len: ids.len(),
            ships: ids
                .iter()
                .map(|id| {
                    id.map(|id| {
                        let mut ship = Ship::default();
                        ship.id = id.to_owned();
                        ship.current_hp = 1;
                        ship
                    })
                })
                .collect(),
            ..Default::default()
        }
    }

    fn comp() -> Comp {
        Comp {
            org_type: Default::default(),
            hq_level: 120,
            main: fleet(&[Some("z"), None, Some("a")]),
            escort: Some(fleet(&[Some("b")])),
            route_sup: None,
            boss_sup: None,
        }
    }

    #[test]
    fn repeated_writes_preserve_positions_and_accumulate_damage() {
        let mut comp = comp();
        let mut logger = BattleLogger::new(2);
        logger.write(&comp);

        comp.main.ships.get_mut(2).unwrap().current_hp = 0;
        comp.escort
            .as_mut()
            .unwrap()
            .ships
            .get_mut(0)
            .unwrap()
            .current_hp = 0;
        logger.write(&comp);

        let result = logger.create_result(&comp);
        let positions: Vec<_> = result
            .items
            .iter()
            .map(|item| (item.id.as_str(), item.fleet_type, item.index))
            .collect();
        assert_eq!(
            positions,
            [
                ("z", FleetType::Main, 0),
                ("a", FleetType::Main, 2),
                ("b", FleetType::Escort, 0),
            ]
        );
        assert_eq!(
            result.items[0].damage_state_map,
            [(DamageState::Normal, 1.0)].into()
        );
        for item in &result.items[1..] {
            assert_eq!(
                item.damage_state_map,
                [(DamageState::Normal, 0.5), (DamageState::Sunk, 0.5)].into()
            );
        }
        assert_eq!(result.sunk_vec, [(2, 0.5, 0.5), (0, 0.5, 1.0)]);
    }

    #[test]
    #[should_panic(expected = "Ship id is empty!")]
    fn rejects_empty_ship_id() {
        let mut comp = comp();
        comp.main.ships.get_mut(0).unwrap().id.clear();
        BattleLogger::new(1).write(&comp);
    }
}
