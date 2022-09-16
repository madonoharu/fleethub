use serde::Serialize;
use tsify::Tsify;

use crate::{
    comp::Comp,
    fleet::Fleet,
    member::{BattleMember, BattleMemberMut, BattleMemberRef},
    plane::PlaneImpl,
    ship::Ship,
    types::{BattleDefinitions, ContactRank, DamageState, NightPhaseAttackStyle},
};

use super::{
    ActionReport, AttackAnalyzer, AttackAnalyzerConfig, AttackAnalyzerShipConfig,
    CompAnalyzerConfig,
};

#[derive(Serialize, Tsify)]
struct NightCutinActionReport {
    cutin_term: Option<f64>,
    #[serde(flatten)]
    report: ActionReport<NightPhaseAttackStyle>,
}

#[derive(Serialize, Tsify)]
struct ShipNightCutinAnalysis {
    ship_id: u16,
    index: usize,
    normal: NightCutinActionReport,
    chuuha: NightCutinActionReport,
}

#[derive(Serialize, Tsify)]
pub struct CompNightCutinAnalysis {
    night_contact_chance: NightContactChance,
    ships: Vec<ShipNightCutinAnalysis>,
}

pub struct NightCutinAnalyzer<'a> {
    pub battle_defs: &'a BattleDefinitions,
    pub comp: &'a Comp,
    pub dummy: &'a Ship,
    pub config: &'a CompAnalyzerConfig,
}

impl NightCutinAnalyzer<'_> {
    fn analyze_ship_with_damage_state(&self, ship: BattleMemberRef) -> NightCutinActionReport {
        let attack_analyzer = AttackAnalyzer {
            battle_defs: self.battle_defs,
            config: AttackAnalyzerConfig {
                air_state: Default::default(),
                engagement: self.config.engagement,
                node_state: Default::default(),
                attacker: AttackAnalyzerShipConfig {
                    conditions: ship.conditions(),
                    night_fleet_conditions: self.config.left_night_fleet_conditions.clone(),
                    fleet_los_mod: None,
                },
                target: AttackAnalyzerShipConfig {
                    night_fleet_conditions: self.config.right_night_fleet_conditions.clone(),
                    ..AttackAnalyzerShipConfig::dummy_enemy()
                },
            },
            attacker: &ship,
            target: self.dummy,
        };

        let cutin_term = attack_analyzer.calc_night_cutin_term();
        let report = attack_analyzer.analyze_night_phase_action();

        NightCutinActionReport { cutin_term, report }
    }

    fn analyze_ship(&self, mut ship: BattleMemberMut) -> ShipNightCutinAnalysis {
        ship.set_damage_state(DamageState::Normal);
        let normal = self.analyze_ship_with_damage_state(ship.as_ref());

        ship.set_damage_state(DamageState::Chuuha);
        let chuuha = self.analyze_ship_with_damage_state(ship.as_ref());

        ShipNightCutinAnalysis {
            ship_id: ship.ship_id,
            index: ship.position.index,
            normal,
            chuuha,
        }
    }

    pub fn analyze(&self) -> CompNightCutinAnalysis {
        let night_fleet_type = self.comp.night_fleet_type();
        let fleet = self.comp.night_fleet();
        let night_contact_chance = NightContactChance::new(fleet);
        let formation = self.config.formation;
        let amagiri_index = fleet.amagiri_index();

        let ships = self
            .comp
            .members_by(night_fleet_type)
            .map(|member| {
                let mut ship = member.ship.clone();
                let member =
                    BattleMember::new(&mut ship, member.position, formation, amagiri_index);
                self.analyze_ship(member)
            })
            .collect();

        CompNightCutinAnalysis {
            night_contact_chance,
            ships,
        }
    }
}

#[derive(Serialize, Tsify)]
struct NightContactChance {
    rank1: f64,
    rank2: f64,
    rank3: f64,
}

impl NightContactChance {
    fn new(fleet: &Fleet) -> Self {
        let vec = fleet
            .ships
            .values()
            .flat_map(|ship| {
                ship.planes().filter_map(|plane| {
                    let slot_size = plane.slot_size?;
                    if slot_size > 0 && plane.is_night_recon() {
                        let rank = plane.contact_rank();
                        let rate = plane.night_contact_rate(ship.level);
                        Some((rank, rate))
                    } else {
                        None
                    }
                })
            })
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

        Self {
            rank1,
            rank2,
            rank3,
        }
    }
}
