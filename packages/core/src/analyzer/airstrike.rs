use serde::Serialize;
use ts_rs::TS;

use crate::{
    org::Org,
    ship::Ship,
    types::{AirState, ContactRank, GearAttr},
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

#[derive(Debug, Clone, Serialize, TS)]
pub struct OrgContactChanceAnalysis {
    single: Option<Vec<AirstrikeContactChance>>,
    combined: Option<Vec<AirstrikeContactChance>>,
}

#[derive(Debug, Clone, Serialize, TS)]
pub struct OrgAirstrikeAnalysis {
    contact_chance: OrgContactChanceAnalysis,
}

fn ships_contact_chance(ships: &Vec<&Ship>, air_state: AirState) -> Option<AirstrikeContactChance> {
    let total_trigger_factor = ships
        .iter()
        .map(|ship| ship.gears_with_slot_size())
        .flatten()
        .filter(|(gear, _)| gear.has_attr(GearAttr::Recon))
        .map(|(gear, slot_size)| Some(gear.calc_contact_trigger_factor(slot_size?)))
        .sum::<Option<f64>>()?;

    let trigger_rate =
        ((total_trigger_factor + 1.0) / (70.0 - 15.0 * air_state.contact_mod())).min(1.0);

    let at_least_one = |rank: ContactRank| -> Option<f64> {
        let rate = 1.0
            - ships
                .iter()
                .map(|ship| ship.gears_with_slot_size())
                .flatten()
                .filter(|(gear, _)| {
                    gear.is_contact_selection_plane() && gear.contact_rank() == rank
                })
                .map(|(gear, slot_size)| {
                    let rate = if slot_size? > 0 {
                        gear.contact_selection_rate(air_state.contact_mod())
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

fn analyze_ships_contact_chance(ships: Vec<&Ship>) -> Option<Vec<AirstrikeContactChance>> {
    let air_supremacy = ships_contact_chance(&ships, AirState::AirSupremacy)?;
    let air_superiority = ships_contact_chance(&ships, AirState::AirSuperiority)?;
    let air_denial = ships_contact_chance(&ships, AirState::AirDenial)?;

    Some(vec![air_supremacy, air_superiority, air_denial])
}

fn analyze_org_contact_chance(org: &Org) -> OrgContactChanceAnalysis {
    let main_ships = org.main().ships.values().collect();
    let single = analyze_ships_contact_chance(main_ships);

    let combined = if org.org_type.is_combined() {
        let combined_ships = org
            .main_and_escort_ships()
            .map(|(_, _, ship)| ship)
            .collect();
        analyze_ships_contact_chance(combined_ships)
    } else {
        None
    };

    OrgContactChanceAnalysis { single, combined }
}

pub fn analyze_org(org: &Org) -> OrgAirstrikeAnalysis {
    let contact_chance = analyze_org_contact_chance(org);
    OrgAirstrikeAnalysis { contact_chance }
}