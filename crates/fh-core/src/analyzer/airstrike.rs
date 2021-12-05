use fh_macro::FhAbi;
use serde::Serialize;
use ts_rs::TS;

use crate::{
    comp::Comp,
    ship::Ship,
    types::{AirState, ContactRank, GearAttr, Side},
};

#[derive(Debug, Clone, Serialize, TS)]
pub struct AirstrikeContactChance {
    air_state: AirState,
    trigger_rate: f64,
    rank3: f64,
    rank2: f64,
    rank1: f64,
    total: f64,
}

#[derive(Debug, Clone, Serialize, FhAbi, TS)]
#[fh_abi(skip_from_abi)]
pub struct CompContactChanceInfo {
    single: Option<Vec<AirstrikeContactChance>>,
    combined: Option<Vec<AirstrikeContactChance>>,
}

fn ships_contact_chance(
    side: Side,
    air_state: AirState,
    ships: &Vec<&Ship>,
) -> Option<AirstrikeContactChance> {
    let air_state_rank = air_state.rank(side);

    let total_trigger_factor = ships
        .iter()
        .map(|ship| ship.gears_with_slot_size())
        .flatten()
        .filter(|(_, gear, _)| gear.has_attr(GearAttr::Recon))
        .map(|(_, gear, slot_size)| Some(gear.calc_contact_trigger_factor(slot_size?)))
        .sum::<Option<f64>>()?;

    let trigger_rate =
        ((total_trigger_factor + 1.0) / (70.0 - 15.0 * air_state_rank.as_f64())).min(1.0);

    let at_least_one = |rank: ContactRank| -> Option<f64> {
        let rate = 1.0
            - ships
                .iter()
                .map(|ship| ship.gears_with_slot_size())
                .flatten()
                .filter(|(_, gear, _)| {
                    gear.is_contact_selection_plane() && gear.contact_rank() == rank
                })
                .map(|(_, gear, slot_size)| {
                    let rate = if slot_size? > 0 {
                        gear.contact_selection_rate(air_state_rank)
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
    ships: Vec<&Ship>,
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
    .map(|air_state| ships_contact_chance(side, air_state, &ships))
    .collect()
}

impl CompContactChanceInfo {
    pub fn new(comp: &Comp) -> Self {
        let side = comp.side();
        let single = analyze_ships_contact_chance(side, comp.main.ships.values().collect());

        let combined = comp
            .is_combined()
            .then(|| {
                let combined_ships = comp.ships().map(|(_, _, s)| s).collect();
                analyze_ships_contact_chance(side, combined_ships)
            })
            .flatten();

        Self { single, combined }
    }
}
