use std::{
    collections::BTreeMap,
    ops::{Deref, DerefMut},
};

use enumset::EnumSet;
use rand::prelude::*;

use crate::{
    comp::Comp,
    member::{BattleMemberMut, BattleMemberRef},
    types::{FleetType, Formation, OrgType, Participant, ShipPosition},
};

pub struct BattleComp {
    pub comp: Comp,
    pub formation: Formation,
}

impl Deref for BattleComp {
    type Target = Comp;
    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.comp
    }
}

impl DerefMut for BattleComp {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.comp
    }
}

impl BattleComp {
    pub fn new(comp: Comp, formation: Formation) -> Self {
        Self { comp, formation }
    }

    #[inline]
    pub fn org_type(&self) -> OrgType {
        self.comp.org_type
    }

    pub fn members_by(
        &self,
        query: impl Into<EnumSet<FleetType>>,
    ) -> impl Iterator<Item = BattleMemberRef> {
        let formation = self.formation;

        self.comp.members_by(query).map(move |ship| {
            let amagiri_index = self.get_amagiri_index(ship.position.fleet_type);

            BattleMemberRef {
                ship,
                formation,
                amagiri_index,
            }
        })
    }

    pub fn members(&self, participant: Participant) -> impl Iterator<Item = BattleMemberRef> {
        let formation = self.formation;
        let is_combined = self.comp.is_combined();

        self.comp
            .members_by(FleetType::Main | FleetType::Escort)
            .filter_map(move |ship| {
                let is_main = ship.position.is_main();
                let amagiri_index = self.get_amagiri_index(ship.position.fleet_type);

                match participant {
                    Participant::Main => is_main,
                    Participant::Escort => {
                        if is_combined {
                            !is_main
                        } else {
                            is_main
                        }
                    }
                    Participant::Both => true,
                }
                .then(|| BattleMemberRef {
                    ship,
                    formation,
                    amagiri_index,
                })
            })
    }

    pub fn get_ship(&self, position: ShipPosition) -> Option<BattleMemberRef> {
        self.comp.get_battle_member(self.formation, position)
    }

    pub fn get_ship_mut(&mut self, position: ShipPosition) -> Option<BattleMemberMut> {
        self.comp.get_battle_member_mut(self.formation, position)
    }

    pub fn fleet_los_mod(&self, ft: FleetType) -> f64 {
        self.get_fleet(ft)
            .and_then(|f| f.fleet_los_mod())
            .unwrap_or_default()
    }

    pub fn has_installation(&self, participant: Participant) -> bool {
        self.members(participant).any(|ship| ship.is_installation())
    }

    pub fn order_by_range<R: Rng + ?Sized>(
        &self,
        rng: &mut R,
        participant: Participant,
        anti_inst: bool,
    ) -> impl Iterator<Item = ShipPosition> {
        let mut group = self
            .members(participant)
            .filter(|ship| ship.participates_in_day_combat(anti_inst))
            .fold(BTreeMap::<u8, Vec<ShipPosition>>::new(), |mut acc, ship| {
                let position = ship.position;
                let range = ship.range().unwrap_or_default();
                acc.entry(range).or_default().push(position);
                acc
            });

        group.values_mut().for_each(|vec| vec.shuffle(rng));

        group.into_values().rev().flatten()
    }
}
