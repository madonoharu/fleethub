use serde::Serialize;
use tsify::Tsify;

use crate::{
    comp::Comp,
    fleet::Fleet,
    plane::PlaneImpl,
    ship::Ship,
    types::{
        gear_id, BattleDefinitions, ContactRank, DamageState, GearType, NightConditions,
        NightCutin, NightCutinDef,
    },
};

#[derive(Debug)]
struct NightCutinTermParams<'a> {
    is_flagship: bool,
    damage_state: DamageState,
    attacker_conditions: &'a NightConditions,
    target_conditions: &'a NightConditions,
}

fn night_cutin_term(ship: &Ship, params: NightCutinTermParams) -> Option<f64> {
    let level = ship.level as f64;
    let luck = ship.luck()? as f64;

    let mut value = if luck < 50. {
        luck + 15.0 + 0.75 * level.sqrt()
    } else {
        (luck - 50.0).sqrt() + 65.0 + 0.8 * level.sqrt()
    }
    .floor();

    if params.is_flagship {
        value += 15.0
    }

    if params.damage_state == DamageState::Chuuha {
        value += 18.0
    }

    // https://twitter.com/Divinity__123/status/1479343022974324739
    if ship.gears.has(gear_id!("水雷戦隊 熟練見張員"))
        && (ship.ship_type.is_destroyer() || ship.ship_type.is_light_cruiser())
    {
        value += 9.0
    } else if ship.gears.has_type(GearType::ShipPersonnel) {
        value += 5.0
    }

    if params.attacker_conditions.searchlight() {
        value += 7.0
    }

    if params.target_conditions.searchlight() {
        value += -5.0
    }

    if params.attacker_conditions.starshell() {
        value += 4.0
    }

    if params.target_conditions.starshell() {
        value += -10.0
    }

    Some(value)
}

#[derive(Debug, Default, Serialize, Tsify)]
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
                ship.planes().filter_map(|plane| {
                    let slot_size = plane.slot_size.clone()?;
                    if slot_size > 0 && plane.is_night_recon() {
                        let rank = plane.contact_rank();
                        let rate = plane.night_contact_rate(ship.level);
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

#[derive(Debug, Default, Serialize, Tsify)]
pub struct NightCutinRateInfo {
    pub cutin_term: Option<f64>,
    pub rates: Vec<(Option<NightCutin>, Option<f64>)>,
}

#[derive(Debug, Default, Serialize, Tsify)]
pub struct ShipNightCutinRateInfo {
    ship_id: u16,
    normal: NightCutinRateInfo,
    chuuha: NightCutinRateInfo,
}

#[derive(Debug, Default, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct FleetNightCutinRateInfo {
    night_contact_chance: NightContactChance,
    ships: Vec<ShipNightCutinRateInfo>,
}

impl FleetNightCutinRateInfo {
    pub fn new(
        comp: &Comp,
        config: &BattleDefinitions,
        attacker_conditions: &NightConditions,
        target_conditions: &NightConditions,
    ) -> Self {
        NightCutinRateAnalyzer::new(config).analyze(comp, attacker_conditions, target_conditions)
    }
}

pub struct NightCutinRateAnalyzer<'a> {
    battle_defs: &'a BattleDefinitions,
}

impl<'a> NightCutinRateAnalyzer<'a> {
    pub fn new(battle_defs: &'a BattleDefinitions) -> Self {
        Self { battle_defs }
    }

    fn get_cutin_def(&self, cutin: NightCutin) -> Option<&NightCutinDef> {
        self.battle_defs.night_cutin.get(&cutin)
    }

    fn analyze_cutin_rates_with_damage_state(
        &self,
        ship: &Ship,
        is_flagship: bool,
        attacker_conditions: &NightConditions,
        target_conditions: &NightConditions,
        anti_inst: bool,
        damage_state: DamageState,
    ) -> NightCutinRateInfo {
        let params = NightCutinTermParams {
            is_flagship,
            damage_state,
            attacker_conditions,
            target_conditions,
        };
        let cutin_term = night_cutin_term(ship, params);

        let cutins = ship
            .get_possible_night_cutin_set(anti_inst)
            .into_iter()
            .filter_map(|cutin| self.get_cutin_def(cutin));

        let mut rates = cutins
            .scan(0.0, |total, def| {
                let actual_rate =
                    cutin_term
                        .and_then(|term| def.rate(term))
                        .map(|individual_rate| {
                            let actual_rate = (1.0 - *total) * individual_rate;

                            *total += actual_rate;

                            actual_rate
                        });

                Some((Some(def.tag), actual_rate))
            })
            .collect::<Vec<_>>();

        let total_cutin_rate = rates
            .iter()
            .map(|(_, rate)| rate.as_ref())
            .sum::<Option<f64>>();

        let normal_attack_rate = total_cutin_rate.map(|r| 1.0 - r);

        rates.insert(0, (None, normal_attack_rate));

        NightCutinRateInfo { cutin_term, rates }
    }

    pub fn analyze_cutin_rates(
        &self,
        ship: &Ship,
        is_flagship: bool,
        attacker_conditions: &NightConditions,
        target_conditions: &NightConditions,
        anti_inst: bool,
    ) -> NightCutinRateInfo {
        self.analyze_cutin_rates_with_damage_state(
            ship,
            is_flagship,
            attacker_conditions,
            target_conditions,
            anti_inst,
            ship.damage_state(),
        )
    }

    fn analyze_ship(
        &self,
        ship: &Ship,
        is_flagship: bool,
        attacker_conditions: &NightConditions,
        target_conditions: &NightConditions,
        anti_inst: bool,
    ) -> ShipNightCutinRateInfo {
        let normal = self.analyze_cutin_rates_with_damage_state(
            ship,
            is_flagship,
            attacker_conditions,
            target_conditions,
            anti_inst,
            DamageState::Normal,
        );

        let chuuha = self.analyze_cutin_rates_with_damage_state(
            ship,
            is_flagship,
            attacker_conditions,
            target_conditions,
            anti_inst,
            DamageState::Chuuha,
        );

        ShipNightCutinRateInfo {
            ship_id: ship.ship_id,
            normal,
            chuuha,
        }
    }

    pub fn analyze(
        &self,
        comp: &Comp,
        attacker_conditions: &NightConditions,
        target_conditions: &NightConditions,
    ) -> FleetNightCutinRateInfo {
        let fleet = comp.night_fleet();

        let night_contact_chance = fleet.night_contact_chance();

        let ships = fleet
            .ships
            .iter()
            .map(|(index, ship)| {
                let is_flagship = index == 0;

                self.analyze_ship(
                    ship,
                    is_flagship,
                    attacker_conditions,
                    target_conditions,
                    false,
                )
            })
            .collect::<Vec<_>>();

        FleetNightCutinRateInfo {
            night_contact_chance,
            ships,
        }
    }
}
