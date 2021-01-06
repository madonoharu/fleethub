use std::collections::HashMap;

use crate::{
    constants::*,
    gear::Gear,
    master::{MasterShip, StatInterval},
};
use js_sys::JsString;
use num_traits::FromPrimitive;
use paste::paste;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use web_sys::console;

#[derive(Debug, Default, Clone)]
struct ShipState {
    max_hp: Option<i32>,
}

#[derive(Debug, Default, Clone)]
struct EBonuses {
    firepower: i32,
    torpedo: i32,
    anti_air: i32,
    armor: i32,
    evasion: i32,
    asw: i32,
    los: i32,
    bombing: i32,
    accuracy: i32,
    range: i32,
    speed: i32,
    effective_los: i32,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Ship {
    pub ship_id: i32,
    pub level: i32,
    pub current_hp: i32,

    slots: Vec<i32>,

    max_hp_mod: i32,
    firepower_mod: i32,
    torpedo_mod: i32,
    armor_mod: i32,
    anti_air_mod: i32,
    evasion_mod: i32,
    asw_mod: i32,
    los_mod: i32,
    luck_mod: i32,

    #[wasm_bindgen(skip)]
    pub name: String,
    #[wasm_bindgen(skip)]
    pub types: [i32; 5],
    #[wasm_bindgen(skip)]
    pub attrs: Vec<GearAttr>,
    #[wasm_bindgen(skip)]
    pub gears: HashMap<String, Gear>,

    master: MasterShip,
    ebonuses: EBonuses,
}

fn get_marriage_bonus(left: i32) -> i32 {
    match left {
        0..=29 => 4,
        30..=39 => 5,
        40..=49 => 6,
        50..=69 => 7,
        70..=89 => 8,
        _ => 9,
    }
}

macro_rules! impl_naked_stats {
    ($($key:ident),*) => {
        paste! {
            #[wasm_bindgen]
            impl Ship {
                $(
                    pub fn [<naked_ $key>](&self) -> Option<i32> {
                        self.master.$key.1.map(|v| v + self.[<$key _mod>])
                    }
                )*
            }
        }
    };
}

macro_rules! impl_naked_stats_with_level {
    ($($key:ident),*) => {
        paste! {
            #[wasm_bindgen]
            impl Ship {
                $(
                    pub fn [<naked_ $key>](&self) -> Option<i32> {
                        match &self.master.$key {
                            StatInterval(Some(at1), Some(at99)) => Some(((at99 - at1) * self.level) / 99 + at1),
                            _ => None,
                        }
                    }
                )*
            }
        }
    };
}

macro_rules! impl_stats {
    ($($key:ident),*) => {
        #[wasm_bindgen]
        impl Ship {
            $(
                pub fn $key(&self) -> Option<i32> {
                    paste! {
                        self.[<naked_ $key>]().map(|naked| {
                            naked + self.ebonuses.$key + self.gears.values().map(|g| g.$key).sum::<i32>()
                        })
                    }
                }
            )*
        }
    };
}

impl_naked_stats!(firepower, torpedo, armor, anti_air);

impl_naked_stats_with_level!(evasion, asw, los);

impl_stats!(firepower, torpedo, armor, anti_air, evasion, asw, los);

#[wasm_bindgen]
impl Ship {
    pub fn max_hp(&self) -> Option<i32> {
        self.master.max_hp.0.map(|left| {
            if self.level >= 100 {
                left + self.max_hp_mod + get_marriage_bonus(left)
            } else {
                left + self.max_hp_mod
            }
        })
    }

    pub fn naked_range(&self) -> Option<i32> {
        self.master.range
    }

    pub fn naked_speed(&self) -> i32 {
        self.master.speed
    }

    pub fn luck(&self) -> Option<i32> {
        Some(self.master.luck.0? + self.luck_mod)
    }

    pub fn range(&self) -> Option<i32> {
        let max = self.gears.values().map(|g| g.range).max();

        match (max, self.naked_range()) {
            (Some(m), Some(naked)) => Some(m.max(naked)),
            (Some(m), _) => Some(m),
            (_, Some(naked)) => Some(naked),
            _ => None,
        }
        .map(|range| range + self.ebonuses.range)
    }

    pub fn get_slot_size(&self, key: &str) -> Option<i32> {
        match key {
            "g1" => self.slots.get(0),
            "g2" => self.slots.get(1),
            "g3" => self.slots.get(2),
            "g4" => self.slots.get(3),
            "g5" => self.slots.get(4),
            _ => None,
        }
        .cloned()
    }

    pub fn fleet_los_factor(&self) -> Option<i32> {
        let total = self
            .gears
            .iter()
            .map(|(key, g)| {
                let slot_size = self.get_slot_size(&key)?;
                if g.attrs.contains(&GearAttr::ObservationSeaplane) {
                    Some(g.los * (slot_size as f64).sqrt().floor() as i32)
                } else {
                    Some(0)
                }
            })
            .sum::<Option<i32>>();

        Some(self.naked_los()? + total?)
    }

    pub fn fleet_anti_air(&self) -> i32 {
        self.gears
            .values()
            .map(|g| g.fleet_anti_air())
            .sum::<f64>()
            .floor() as i32
    }

    pub fn basic_accuracy_term(&self) -> Option<f64> {
        let luck = self.luck()? as f64;
        let level = self.level as f64;

        Some(2. * level.sqrt() + 1.5 * luck.sqrt())
    }

    pub fn basic_evasion_term(&self) -> Option<f64> {
        let evasion = self.evasion()? as f64;
        let luck = self.luck()? as f64;

        Some(evasion + (2. * luck).sqrt())
    }
}

impl Ship {
    pub fn get_ap_shell_modifiers(&self) -> (f64, f64) {
        let mut iter = self.gears.values();
        let has_main = iter.any(|g| g.attrs.contains(&GearAttr::MainGun));
        let has_ap_shell = iter.any(|g| g.category == GearCategory::ApShell);
        let has_rader = iter.any(|g| g.attrs.contains(&GearAttr::Radar));
        let has_secondary = iter.any(|g| g.category == GearCategory::SecondaryGun);

        if !has_ap_shell || !has_main {
            (1., 1.)
        } else if has_secondary && has_rader {
            (1.15, 1.3)
        } else if has_secondary {
            (1.15, 1.2)
        } else if has_rader {
            (1.1, 1.25)
        } else {
            (1.08, 1.1)
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_max_hp() {
        let mut ship = Ship {
            level: 99,
            ..Default::default()
        };

        ship.master.max_hp.0.replace(90);
        assert_eq!(ship.max_hp(), Some(90));

        ship.level = 100;

        let table = [
            (29, 29 + 4),
            (30, 30 + 5),
            (39, 39 + 5),
            (40, 40 + 6),
            (49, 49 + 6),
            (50, 50 + 7),
            (69, 69 + 7),
            (70, 70 + 8),
            (89, 89 + 8),
            (90, 90 + 9),
        ];
        for (value, expected) in table.iter().cloned() {
            ship.master.max_hp.0.replace(value);
            assert_eq!(ship.max_hp(), Some(expected));
        }
    }

    #[test]
    fn test_stats() {
        macro_rules! def_stats_test {
            ($($key:ident),*) => {
                $(
                    paste! {
                        let mut ship = Ship {
                            [<$key _mod>]: 3,
                            master: MasterShip {
                                $key: StatInterval(Some(0), Some(10)),
                                ..Default::default()
                            },
                            ..Default::default()
                        };

                        ship.gears.insert(
                            "g1".to_string(),
                            Gear {
                                $key: 5,
                                ..Default::default()
                            },
                        );

                        assert_eq!(ship.[<naked_ $key>](), Some(13));
                        assert_eq!(ship.$key(), Some(18));
                    }
                )*
            };
        }

        macro_rules! def_stats_with_level_test {
            ($($key:ident),*) => {
                $(
                    paste! {
                        let mut ship = Ship {
                            level: 15,
                            [<$key _mod>]: 3,
                            master: MasterShip {
                                $key: StatInterval(Some(1), Some(100)),
                                ..Default::default()
                            },
                            ..Default::default()
                        };

                        ship.gears.insert(
                            "g1".to_string(),
                            Gear {
                                $key: 5,
                                ..Default::default()
                            },
                        );

                        assert_eq!(ship.[<naked_ $key>](), Some(16));
                        assert_eq!(ship.$key(), Some(21));
                    }
                )*
            };
        }

        def_stats_test!(firepower, torpedo, armor, anti_air);
        def_stats_with_level_test!(evasion, los, asw);
    }
}
