#![allow(dead_code, unused_variables)]

use serde::Serialize;
use tsify::Tsify;

use crate::{
    comp::Comp,
    plane::{Plane, PlaneImpl},
    types::{AirState, ContactRank, Side},
};

#[derive(Debug, Clone, Serialize, Tsify)]
pub struct AirstrikeContactChance {
    air_state: AirState,
    trigger_rate: f64,
    rank3: f64,
    rank2: f64,
    rank1: f64,
    total: f64,
}

#[derive(Debug, Clone, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct CompContactChanceInfo {
    single: Option<Vec<AirstrikeContactChance>>,
    combined: Option<Vec<AirstrikeContactChance>>,
}

fn planes_contact_chance(
    side: Side,
    air_state: AirState,
    planes: &Vec<Plane>,
) -> Option<AirstrikeContactChance> {
    let air_state_rank = air_state.rank(side);

    let total_trigger_factor = planes
        .iter()
        .filter(|plane| plane.is_recon())
        .map(|plane| plane.contact_trigger_factor())
        .sum::<Option<f64>>()?;

    let trigger_rate =
        ((total_trigger_factor + 1.0) / (70.0 - 15.0 * air_state_rank.as_f64())).min(1.0);

    let at_least_one = |rank: ContactRank| -> Option<f64> {
        let rate = 1.0
            - planes
                .iter()
                .filter(|plane| plane.is_contact_selection_plane() && plane.contact_rank() == rank)
                .map(|plane| {
                    let slot_size = plane.slot_size();
                    let rate = if slot_size? > 0 {
                        plane.contact_selection_rate(air_state_rank)
                    } else {
                        0.0
                    };
                    Some(1.0 - rate)
                })
                .product::<Option<f64>>()?;

        Some(rate)
    };

    let rank3_selection_rate = at_least_one(ContactRank::Rank3)?;
    let rank2_selection_rate = (1.0 - rank3_selection_rate) * at_least_one(ContactRank::Rank2)?;
    let rank1_selection_rate =
        (1.0 - rank3_selection_rate - rank2_selection_rate) * at_least_one(ContactRank::Rank1)?;

    let rank3 = rank3_selection_rate * trigger_rate;
    let rank2 = rank2_selection_rate * trigger_rate;
    let rank1 = rank1_selection_rate * trigger_rate;

    Some(AirstrikeContactChance {
        air_state,
        trigger_rate,
        rank3,
        rank2,
        rank1,
        total: rank3 + rank2 + rank1,
    })
}

fn analyze_ships_contact_chance(
    side: Side,
    planes: &Vec<Plane>,
) -> Option<Vec<AirstrikeContactChance>> {
    if side.is_player() {
        [
            AirState::AirSupremacy,
            AirState::AirSuperiority,
            AirState::AirDenial,
        ]
    } else {
        [
            AirState::AirIncapability,
            AirState::AirDenial,
            AirState::AirSuperiority,
        ]
    }
    .into_iter()
    .map(|air_state| planes_contact_chance(side, air_state, planes))
    .collect()
}

impl CompContactChanceInfo {
    pub fn new(comp: &Comp) -> Self {
        let side = comp.side();
        let single = analyze_ships_contact_chance(side, &comp.planes(false).collect());

        let combined = comp
            .is_combined()
            .then(|| analyze_ships_contact_chance(side, &comp.planes(true).collect()))
            .flatten();

        Self { single, combined }
    }
}

struct AirstrikeInfo {}

impl AirstrikeInfo {
    pub fn new(comp: &Comp) -> Self {
        Self {}
    }
}
