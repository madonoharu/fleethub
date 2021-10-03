use js_sys::JsString;
use wasm_bindgen::prelude::*;

use crate::{gear_id, ship::Ship, ship_id, types::GearType, utils::OptionalArray};

pub type ShipArray = OptionalArray<Ship, 7>;

impl ShipArray {
    pub fn get_by_ship_key(&self, key: &str) -> Option<&Ship> {
        match key {
            "s1" => self.get(0),
            "s2" => self.get(1),
            "s3" => self.get(2),
            "s4" => self.get(3),
            "s5" => self.get(4),
            "s6" => self.get(5),
            "s7" => self.get(6),
            _ => None,
        }
    }
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Fleet {
    pub(crate) xxh3: u64,

    #[wasm_bindgen(getter_with_clone)]
    pub id: String,

    #[wasm_bindgen(readonly)]
    pub len: usize,

    #[wasm_bindgen(skip)]
    pub ships: ShipArray,
}

#[wasm_bindgen]
impl Fleet {
    #[wasm_bindgen(getter)]
    pub fn xxh3(&self) -> String {
        format!("{:X}", self.xxh3)
    }

    pub fn ship_keys(&self) -> Vec<JsString> {
        (0..self.len)
            .map(|i| JsString::from(format!("s{}", i + 1)))
            .collect()
    }

    pub fn ship_ids(&self) -> Vec<JsString> {
        self.ships
            .values()
            .map(|ship| JsString::from(ship.id()))
            .collect()
    }

    pub fn get_gear_ids_by_improvable(&self) -> Vec<JsString> {
        self.ships
            .values()
            .flat_map(|ship| ship.gears.values())
            .filter(|gear| gear.improvable)
            .map(|gear| JsString::from(gear.id.clone()))
            .collect::<Vec<_>>()
    }

    pub fn get_gear_ids_by_proficiency(&self) -> Vec<JsString> {
        self.ships
            .values()
            .flat_map(|ship| ship.gears.values())
            .filter(|gear| gear.has_proficiency())
            .map(|gear| JsString::from(gear.id.clone()))
            .collect::<Vec<_>>()
    }

    pub fn count_ships(&self) -> usize {
        self.ships.values().count()
    }

    pub fn get_ship(&self, key: &str) -> Option<Ship> {
        self.ships.get_by_ship_key(key).cloned()
    }

    #[wasm_bindgen(getter)]
    pub fn fleet_los_mod(&self) -> Option<f64> {
        self.ships
            .values()
            .map(|ship| ship.fleet_los_factor())
            .sum::<Option<f64>>()
            .map(|base| (base.sqrt() + 0.1 * base).floor())
    }

    pub fn fighter_power(&self, anti_lbas: bool) -> Option<i32> {
        self.ships
            .values()
            .map(|ship| ship.fighter_power(anti_lbas))
            .sum()
    }

    /// マップ索敵
    pub fn elos(&self, hq_level: u8, node_divaricated_factor: u8) -> Option<f64> {
        let total = self
            .ships
            .values()
            .map(|ship| ship.elos(node_divaricated_factor))
            .sum::<Option<f64>>()?;

        Some(total - (0.4 * hq_level as f64).ceil() + 12.0)
    }

    /// 航空索敵スコア
    pub fn aviation_detection_score(&self) -> Option<f64> {
        self.ships
            .values()
            .flat_map(|ship| {
                ship.gears_with_slot_size().map(|(_, gear, slot_size)| {
                    let value = match gear.gear_type {
                        GearType::LargeFlyingBoat => {
                            let los = gear.los as f64;
                            let slot_size = slot_size? as f64;

                            los * slot_size.sqrt()
                        }
                        GearType::ReconSeaplane | GearType::SeaplaneBomber => {
                            let los = gear.los as f64;
                            let slot_size = slot_size? as f64;
                            los * slot_size.sqrt().sqrt()
                        }
                        _ => 0.0,
                    };

                    Some(value)
                })
            })
            .sum()
    }

    /// 遠征ボーナス
    pub fn expedition_bonus(&self) -> f64 {
        let mut stars = 0.0;
        let mut gear_count: usize = 0;

        let gears_bonus = self.ships.sum_by(|ship| {
            ship.gears.sum_by(|gear| {
                let bonus = gear.expedition_bonus();

                if bonus > 0.0 {
                    gear_count += 1;
                    stars += gear.stars as f64;
                }

                bonus
            })
        });

        let kinu_bonus = if self
            .ships
            .has_by(|ship| ship.ship_id == ship_id!("鬼怒改二"))
        {
            0.05
        } else {
            0.0
        };

        let bonus1 = (gears_bonus + kinu_bonus).min(0.2);

        let average = (stars / gear_count as f64).max(0.0);
        let average_stars_bonus = 0.01 * bonus1 * average;

        let synergy = {
            let daihatsu_count = self
                .ships
                .sum_by(|ship| ship.gears.count(gear_id!("大発動艇")));
            let toku_daihatsu_count = self
                .ships
                .sum_by(|ship| ship.gears.count(gear_id!("特大発動艇")));

            if toku_daihatsu_count <= 2 {
                toku_daihatsu_count as f64 * 0.02
            } else if toku_daihatsu_count == 3 {
                match daihatsu_count {
                    0 | 1 => 0.05,
                    2 => 0.052,
                    _ => 0.054,
                }
            } else {
                match daihatsu_count {
                    0 => 0.054,
                    1 => 0.056,
                    2 => 0.058,
                    3 => 0.059,
                    _ => 0.06,
                }
            }
        };

        bonus1 + average_stars_bonus + synergy
    }

    pub fn sum_ship_stat_by(&self, key: &str) -> Option<f64> {
        match key {
            "level" => Some(self.ships.sum_by(|ship| ship.level) as f64),
            "firepower" => self.ships.sum_by(|ship| ship.firepower()).map(f64::from),
            "anti_air" => self.ships.sum_by(|ship| ship.anti_air()).map(f64::from),
            "asw" => self.ships.sum_by(|ship| ship.asw()).map(f64::from),
            "los" => self.ships.sum_by(|ship| ship.los()).map(f64::from),
            _ => {
                panic!("{}: Not Implemented", key)
            }
        }
    }
}
