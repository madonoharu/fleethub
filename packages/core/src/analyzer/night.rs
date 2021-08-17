use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    fleet::Fleet,
    gear_id,
    org::Org,
    ship::Ship,
    types::{ContactRank, DamageState, GearAttr, MasterConstants, NightCutin, NightCutinDef},
};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct NightCutinFleetState {
    contact_rank: Option<ContactRank>,
    searchlight: bool,
    starshell: bool,
}

#[derive(Debug)]
struct NightCutinTermParams<'a> {
    is_flagship: bool,
    damage_state: DamageState,
    attacker_fleet_state: &'a NightCutinFleetState,
    defender_fleet_state: &'a NightCutinFleetState,
}

fn night_cutin_term(ship: &Ship, params: NightCutinTermParams) -> Option<f64> {
    let level = ship.level as f64;
    let luck = ship.luck()? as f64;

    let mut value = if luck < 50. {
        luck + 15. + 0.75 * level.sqrt()
    } else {
        (luck - 50.).sqrt() + 65. + 0.8 * level.sqrt()
    }
    .floor();

    if params.is_flagship {
        value += 15.
    }

    if params.damage_state == DamageState::Chuuha {
        value += 18.
    }

    if ship.gears.has(gear_id!("水雷戦隊 熟練見張員")) {
        value += 9.
    } else if ship.gears.has(gear_id!("熟練見張員")) {
        value += 5.
    }

    if params.attacker_fleet_state.searchlight {
        value += 7.
    }

    if params.defender_fleet_state.searchlight {
        value += -5.
    }

    if params.attacker_fleet_state.starshell {
        value += 4.
    }

    if params.defender_fleet_state.starshell {
        value += -10.
    }

    Some(value)
}

#[derive(Debug, Default, Serialize, TS)]
pub struct NightContactChance {
    rank1: f64,
    rank2: f64,
    rank3: f64,
    total: f64,
}

impl Fleet {
    fn night_contact_chance(&self) -> NightContactChance {
        let vec = self
            .ships
            .values()
            .map(|ship| {
                ship.gears_with_slot_size()
                    .filter_map(move |(_, gear, slot_size)| {
                        if slot_size? > 0 && gear.has_attr(GearAttr::NightRecon) {
                            let rank = gear.contact_rank();
                            let rate = gear.night_contact_rate(ship.level);
                            Some((rank, rate))
                        } else {
                            None
                        }
                    })
            })
            .flatten()
            .collect::<Vec<_>>();

        let at_least_one = |rank: ContactRank| {
            1.0 - vec
                .iter()
                .filter(|(r, _)| *r == rank)
                .map(|(_, rate)| 1.0 - rate)
                .product::<f64>()
        };

        let rank3 = at_least_one(ContactRank::Rank3);
        let rank2 = (1.0 - rank3) * at_least_one(ContactRank::Rank2);
        let rank1 = (1.0 - rank3 - rank2) * at_least_one(ContactRank::Rank1);

        NightContactChance {
            rank1,
            rank2,
            rank3,
            total: rank1 + rank2 + rank3,
        }
    }
}

#[derive(Debug, Default, Serialize, TS)]
pub struct NightCutinRateAnalysis {
    cutin_term: Option<f64>,
    rates: Vec<(NightCutin, Option<f64>)>,
}

#[derive(Debug, Default, Serialize, TS)]
pub struct ShipNightCutinRateAnalysis {
    ship_id: u16,
    normal: NightCutinRateAnalysis,
    chuuha: NightCutinRateAnalysis,
}

#[derive(Debug, Default, Serialize, TS)]
pub struct OrgNightCutinRateAnalysis {
    contact_chance: NightContactChance,
    ships: Vec<ShipNightCutinRateAnalysis>,
}

pub struct NightAnalyzer<'a> {
    constants: &'a MasterConstants,
}

impl<'a> NightAnalyzer<'a> {
    pub fn new(constants: &'a MasterConstants) -> Self {
        Self { constants }
    }

    fn get_cutin_def(&self, cutin: NightCutin) -> Option<&NightCutinDef> {
        self.constants
            .night_cutins
            .iter()
            .find(|def| def.tag == cutin)
    }

    fn analyze_cutin_rates(
        &self,
        ship: &Ship,
        params: NightCutinTermParams,
    ) -> NightCutinRateAnalysis {
        let cutin_term = night_cutin_term(ship, params);

        let rates = ship
            .get_possible_night_cutin_set()
            .into_iter()
            .filter_map(|cutin| self.get_cutin_def(cutin))
            .scan(0.0, |total, def| {
                let actual_rate =
                    cutin_term
                        .and_then(|term| def.rate(term))
                        .map(|individual_rate| {
                            let actual_rate = (1. - *total) * individual_rate;

                            *total += actual_rate;

                            actual_rate
                        });

                Some((def.tag, actual_rate))
            })
            .collect::<Vec<_>>();

        NightCutinRateAnalysis { cutin_term, rates }
    }

    fn analyze_ship(
        &self,
        ship: &Ship,
        is_flagship: bool,
        attacker_fleet_state: &NightCutinFleetState,
        defender_fleet_state: &NightCutinFleetState,
    ) -> ShipNightCutinRateAnalysis {
        let normal = self.analyze_cutin_rates(
            ship,
            NightCutinTermParams {
                is_flagship,
                damage_state: DamageState::Normal,
                attacker_fleet_state,
                defender_fleet_state,
            },
        );

        let chuuha = self.analyze_cutin_rates(
            ship,
            NightCutinTermParams {
                is_flagship,
                damage_state: DamageState::Chuuha,
                attacker_fleet_state,
                defender_fleet_state,
            },
        );

        ShipNightCutinRateAnalysis {
            ship_id: ship.ship_id,
            normal,
            chuuha,
        }
    }

    pub fn analyze_org(
        &self,
        org: &Org,
        attacker_fleet_state: NightCutinFleetState,
        defender_fleet_state: NightCutinFleetState,
    ) -> OrgNightCutinRateAnalysis {
        let fleet = org.night_fleet();
        let contact_chance = fleet.night_contact_chance();

        let ships = fleet
            .ships
            .iter()
            .map(|(index, ship)| {
                let is_flagship = index == 0;

                self.analyze_ship(
                    ship,
                    is_flagship,
                    &attacker_fleet_state,
                    &defender_fleet_state,
                )
            })
            .collect();

        OrgNightCutinRateAnalysis {
            contact_chance,
            ships,
        }
    }
}
