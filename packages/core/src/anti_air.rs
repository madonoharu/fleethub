use serde::Serialize;
use ts_rs::TS;

use crate::{
    gear_id,
    org::{Org, Side},
    ship::Ship,
    types::{ShipClass, ShipType},
};

const ANTI_AIR_CUTIN_DATA: [(u8, u8, f64, u8); 39] = [
    (1, 8, 1.7, 65),
    (2, 7, 1.7, 58),
    (3, 5, 1.6, 50),
    (4, 7, 1.5, 52),
    (5, 5, 1.5, 55),
    (6, 5, 1.45, 40),
    (7, 4, 1.35, 45),
    (8, 5, 1.4, 50),
    (9, 3, 1.3, 40),
    (10, 9, 1.65, 60),
    (11, 7, 1.5, 55),
    (12, 4, 1.25, 45),
    (13, 5, 1.35, 35),
    (14, 5, 1.45, 63),
    (15, 4, 1.3, 58),
    (16, 5, 1.4, 60),
    (17, 3, 1.25, 55),
    (18, 3, 1.2, 60),
    (19, 6, 1.45, 55),
    (20, 4, 1.25, 70),
    (21, 6, 1.45, 60),
    (22, 3, 1.2, 63),
    (23, 2, 1.05, 80),
    (24, 4, 1.25, 60),
    (25, 8, 1.55, 60),
    (26, 7, 1.4, 60),
    (28, 5, 1.4, 53),
    (29, 6, 1.55, 58),
    (30, 4, 1.3, 42),
    (31, 3, 1.25, 50),
    (32, 4, 1.2, 32),
    (33, 4, 1.35, 42),
    (34, 8, 1.6, 60),
    (35, 7, 1.55, 53),
    (36, 7, 1.55, 59),
    (37, 5, 1.45, 38),
    (39, 11, 1.7, 60),
    (40, 11, 1.7, 60),
    (41, 10, 1.65, 60),
];

#[derive(Debug, Default)]
struct AntiAirCutin {
    id: u8,
    minimum_bonus: Option<u8>,
    fixed_air_defense_mod: Option<f64>,
    base_rate: Option<u8>,
}

impl AntiAirCutin {
    pub fn new(id: u8) -> Self {
        let datum = ANTI_AIR_CUTIN_DATA.iter().find(|datum| datum.0 == id);

        if let Some((_, minimum_bonus, fixed_air_defense_mod, base_rate)) = datum {
            Self {
                id,
                minimum_bonus: Some(*minimum_bonus),
                fixed_air_defense_mod: Some(*fixed_air_defense_mod),
                base_rate: Some(*base_rate),
            }
        } else {
            Self {
                id,
                ..Self::default()
            }
        }
    }

    pub fn is_special(&self) -> bool {
        matches!(self.id, 34 | 35 | 39 | 40 | 41)
    }
    pub fn rate(&self) -> Option<f64> {
        Some(self.base_rate? as f64 / 101.)
    }
}

struct ShipAntiAir<'a> {
    ship: &'a Ship,
    side: Side,
    fleet_anti_air: f64,
    combined_fleet_mod: f64,
    anti_air_cutin: Option<AntiAirCutin>,
}

impl<'a> ShipAntiAir<'a> {
    fn adjusted_anti_air(&self) -> Option<f64> {
        let total = self.ship.gears.sum_by(|g| g.adjusted_anti_air());

        if self.side.is_enemy() {
            let anti_air = self.ship.anti_air()? as f64;
            return Some(anti_air.sqrt().floor() * 2. + total);
        }

        let naked_anti_air = self.ship.naked_anti_air()? as f64;
        let pre_floor = naked_anti_air + total;

        let result = if self.ship.gears.iter().count() == 0 {
            pre_floor
        } else {
            2. * (pre_floor / 2.).floor()
        };

        Some(result)
    }

    fn calc_proportional_shotdown_rate(
        &self,
        adjusted_anti_air_resist: Option<f64>,
    ) -> Option<f64> {
        let resist = adjusted_anti_air_resist?;
        let adjusted_anti_air = self.adjusted_anti_air()?;

        let result =
            (adjusted_anti_air * resist).floor() * self.combined_fleet_mod * 0.5 * 0.25 * 0.02;
        Some(result)
    }

    fn calc_fixed_shotdown_number(
        &self,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> Option<i32> {
        let adjusted_anti_air = self.adjusted_anti_air()?;

        let side_mod = if self.side.is_enemy() { 0.75 } else { 0.8 };

        let base = (adjusted_anti_air * adjusted_anti_air_resist?).floor()
            + (self.fleet_anti_air * fleet_anti_air_resist?).floor();

        let mut pre_floor = base * 0.5 * 0.25 * side_mod * self.combined_fleet_mod;

        if let Some(cutin) = &self.anti_air_cutin {
            pre_floor *= cutin.fixed_air_defense_mod?;
        }

        Some(pre_floor.floor() as i32)
    }

    fn minimum_bonus(&self) -> Option<i32> {
        if let Some(cutin) = &self.anti_air_cutin {
            cutin.minimum_bonus.map(|v| v as i32)
        } else if self.side.is_player() {
            Some(1)
        } else {
            Some(0)
        }
    }

    fn anti_air_propellant_barrage_chance(&self) -> Option<f64> {
        if !matches!(
            self.ship.ship_type,
            ShipType::CVL
                | ShipType::CV
                | ShipType::CVB
                | ShipType::CAV
                | ShipType::BBV
                | ShipType::AV
        ) {
            return Some(0.);
        }

        let adjusted_anti_air = self.adjusted_anti_air()?;
        let count = self.ship.gears.count(gear_id!("12cm30連装噴進砲改二"));

        if count == 0 {
            return Some(0.);
        }

        let luck = self.ship.luck()? as f64;
        let ship_class_bonus = if self.ship.ship_class == ShipClass::IseClass {
            0.25
        } else {
            0.
        };

        let rate =
            (adjusted_anti_air + 0.9 * luck) / 281. + (count as f64 - 1.) * 0.15 + ship_class_bonus;

        Some(rate.min(1.))
    }

    fn analyze(
        &self,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> ShipAntiAirAnalysis {
        ShipAntiAirAnalysis {
            ship_id: self.ship.ship_id,
            adjusted_anti_air: self.adjusted_anti_air(),
            proportional_shotdown_rate: self
                .calc_proportional_shotdown_rate(adjusted_anti_air_resist),
            fixed_shotdown_number: self
                .calc_fixed_shotdown_number(adjusted_anti_air_resist, fleet_anti_air_resist),
            minimum_bonus: self.minimum_bonus(),
            anti_air_cutin_chance: ship_anti_air_cutin_chance(self.ship),
            anti_air_propellant_barrage_chance: self.anti_air_propellant_barrage_chance(),
        }
    }
}

fn ship_anti_air_cutin_chance(ship: &Ship) -> Vec<(u8, f64)> {
    let ids = ship.get_possible_anti_air_cutin_ids();
    let (special_cis, normal_cis) = ids
        .into_iter()
        .map(AntiAirCutin::new)
        .partition::<Vec<_>, _>(|aaci| aaci.is_special());

    let mut total_special_rate = 0.;

    let special_ci_vec = special_cis
        .into_iter()
        .filter_map(|aaci| {
            let current = aaci.rate()?;
            let actual = ((1. - total_special_rate) * current).min(1.);
            total_special_rate += actual;

            Some((aaci.id, actual))
        })
        .collect::<Vec<_>>();

    let normal_ci_iter = normal_cis.into_iter().scan(0., |prev, aaci| {
        let current = aaci.rate()?;

        if current < *prev {
            return Some((aaci.id, 0.));
        }

        let mut actual = current - *prev;

        if total_special_rate > 0. {
            actual = (1. - total_special_rate) * actual;
        }

        *prev = current;
        Some((aaci.id, actual))
    });

    special_ci_vec
        .into_iter()
        .chain(normal_ci_iter)
        .collect::<Vec<_>>()
}

#[derive(Debug, Serialize, TS)]
pub struct ShipAntiAirAnalysis {
    ship_id: i32,
    adjusted_anti_air: Option<f64>,
    proportional_shotdown_rate: Option<f64>,
    fixed_shotdown_number: Option<i32>,
    minimum_bonus: Option<i32>,
    anti_air_cutin_chance: Vec<(u8, f64)>,
    anti_air_propellant_barrage_chance: Option<f64>,
}

#[derive(Debug, Serialize, TS)]
pub struct OrgAntiAirAnalysis {
    fleet_anti_air: f64,
    ships: Vec<ShipAntiAirAnalysis>,
    anti_air_cutin_chance: Vec<(u8, f64)>,
}

impl OrgAntiAirAnalysis {
    pub fn new(
        org: &Org,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> Self {
        let formation_mod = 1.0;
        let combined_fleet_mod = 1.0;
        let fleet_anti_air = org.fleet_anti_air(formation_mod);
        let side = org.side;

        let ships = org
            .main_and_escort_ships()
            .map(|(_, _, ship)| {
                ShipAntiAir {
                    ship,
                    side,
                    combined_fleet_mod,
                    fleet_anti_air,
                    anti_air_cutin: None,
                }
                .analyze(adjusted_anti_air_resist, fleet_anti_air_resist)
            })
            .collect::<Vec<_>>();

        let aaci_id_set: std::collections::BTreeSet<u8> = ships
            .iter()
            .map(|s| s.anti_air_cutin_chance.iter())
            .flatten()
            .map(|r| r.0)
            .collect();

        let anti_air_cutin_chance = aaci_id_set
            .into_iter()
            .rev()
            .scan(0., |total, target| {
                let at_least_one = 1.
                    - ships
                        .iter()
                        .map(|s| {
                            s.anti_air_cutin_chance
                                .iter()
                                .filter(|r| r.0 == target)
                                .map(|r| r.1)
                                .sum::<f64>()
                        })
                        .map(|r| 1. - r)
                        .product::<f64>();

                let actual = (1. - *total) * at_least_one;
                *total += actual;
                Some((target, actual))
            })
            .collect::<Vec<_>>();

        Self {
            fleet_anti_air,
            ships,
            anti_air_cutin_chance,
        }
    }
}
