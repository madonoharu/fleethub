use serde::Serialize;
use ts_rs::TS;

use crate::{
    gear_id,
    org::Org,
    ship::Ship,
    types::{AntiAirCutinDef, Formation, MasterConstants, ShipClass, ShipType, Side},
};

struct ShipAntiAir<'a> {
    ship: &'a Ship,
    side: Side,
    fleet_anti_air: f64,
    combined_fleet_mod: f64,
    anti_air_cutin: Option<&'a AntiAirCutinDef>,
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

        if let Some(cutin) = self.anti_air_cutin {
            pre_floor *= cutin.multiplier?;
        }

        Some(pre_floor.floor() as i32)
    }

    fn minimum_bonus(&self) -> Option<i32> {
        if let Some(cutin) = self.anti_air_cutin {
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
}

pub struct AntiAirAnalyzer<'a> {
    master_constants: &'a MasterConstants,
}

impl<'a> AntiAirAnalyzer<'a> {
    pub fn new(master_constants: &'a MasterConstants) -> Self {
        Self { master_constants }
    }

    fn find_aaci(&self, id: u8) -> Option<&AntiAirCutinDef> {
        self.master_constants
            .anti_air_cutins
            .iter()
            .find(|def| def.id == id)
    }

    pub fn ship_anti_air_cutin_chance(&self, ship: &Ship) -> Vec<(u8, f64)> {
        let (sequential_cis, normal_cis) = ship
            .get_possible_anti_air_cutin_ids()
            .into_iter()
            .filter_map(|id| self.find_aaci(id))
            .partition::<Vec<_>, _>(|aaci| aaci.is_sequential());

        let mut total_sequential_rate = 0.0;

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
                actual = (1.0 - total_sequential_rate) * actual;
            }

            *prev = current;
            Some((aaci.id, actual))
        });

        sequential_ci_vec
            .into_iter()
            .chain(normal_ci_iter)
            .collect::<Vec<_>>()
    }

    fn analyze_ship(
        &self,
        ship: &Ship,
        side: Side,
        combined_fleet_mod: f64,
        fleet_anti_air: f64,
        anti_air_cutin: Option<&AntiAirCutinDef>,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> ShipAntiAirInfo {
        let ship_anti_air = ShipAntiAir {
            ship,
            side,
            combined_fleet_mod,
            fleet_anti_air,
            anti_air_cutin,
        };

        ShipAntiAirInfo {
            ship_id: ship.ship_id,
            adjusted_anti_air: ship_anti_air.adjusted_anti_air(),
            proportional_shotdown_rate: ship_anti_air
                .calc_proportional_shotdown_rate(adjusted_anti_air_resist),
            fixed_shotdown_number: ship_anti_air
                .calc_fixed_shotdown_number(adjusted_anti_air_resist, fleet_anti_air_resist),
            minimum_bonus: ship_anti_air.minimum_bonus(),
            anti_air_cutin_chance: self.ship_anti_air_cutin_chance(ship),
            anti_air_propellant_barrage_chance: ship_anti_air.anti_air_propellant_barrage_chance(),
        }
    }

    pub fn analyze_org(
        &self,
        org: &Org,
        key: &str,
        formation: Formation,
        adjusted_anti_air_resist: Option<f64>,
        fleet_anti_air_resist: Option<f64>,
    ) -> OrgAntiAirInfo {
        let formation_mod = self
            .master_constants
            .get_formation_fleet_anti_air_mod(formation);

        let fleet_anti_air = org.fleet_anti_air(formation_mod);
        let side = org.side();
        let anti_air_cutin = None;

        let main_and_escort_fleet = org.get_main_and_escort_fleet_by_key(key);
        let is_combined = main_and_escort_fleet.is_combined();

        let ships = main_and_escort_fleet
            .ships()
            .map(|(role, _, ship)| {
                let combined_fleet_mod = if !is_combined {
                    1.0
                } else if role.is_escort() {
                    0.48
                } else {
                    0.8
                };

                self.analyze_ship(
                    ship,
                    side,
                    combined_fleet_mod,
                    fleet_anti_air,
                    anti_air_cutin,
                    adjusted_anti_air_resist,
                    fleet_anti_air_resist,
                )
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

        OrgAntiAirInfo {
            fleet_anti_air,
            ships,
            anti_air_cutin_chance,
        }
    }
}

#[derive(Debug, Serialize, TS)]
pub struct ShipAntiAirInfo {
    ship_id: u16,
    adjusted_anti_air: Option<f64>,
    proportional_shotdown_rate: Option<f64>,
    fixed_shotdown_number: Option<i32>,
    minimum_bonus: Option<i32>,
    anti_air_cutin_chance: Vec<(u8, f64)>,
    anti_air_propellant_barrage_chance: Option<f64>,
}

#[derive(Debug, Serialize, TS)]
pub struct OrgAntiAirInfo {
    fleet_anti_air: f64,
    ships: Vec<ShipAntiAirInfo>,
    anti_air_cutin_chance: Vec<(u8, f64)>,
}
