use std::collections::BTreeMap;

use rand::prelude::*;

use crate::{
    comp::Comp,
    fleet::Fleet,
    member::{BattleMemberMut, BattleMemberRef, CompMemberMut, CompMemberRef},
    types::{Formation, OrgType, Participant, Role, ShipPosition},
};

pub struct BattleComp {
    pub comp: Comp,
    pub formation: Formation,
}

impl BattleComp {
    #[inline]
    pub fn org_type(&self) -> OrgType {
        self.comp.org_type
    }

    pub fn members(&self, participant: Participant) -> impl Iterator<Item = BattleMemberRef> {
        let formation = self.formation;
        let is_combined = self.comp.is_combined();

        self.comp.members().filter_map(move |ship| {
            let is_main = ship.position.is_main();
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
            .then(|| BattleMemberRef { ship, formation })
        })
    }

    pub fn get_fleet(&self, role: Role) -> Option<&Fleet> {
        match role {
            Role::Main => Some(&self.comp.main),
            Role::Escort => self.comp.escort.as_ref(),
        }
    }

    pub fn get_fleet_mut(&mut self, role: Role) -> Option<&mut Fleet> {
        match role {
            Role::Main => Some(&mut self.comp.main),
            Role::Escort => self.comp.escort.as_mut(),
        }
    }

    pub fn get_ship(&self, position: ShipPosition) -> Option<BattleMemberRef> {
        let ShipPosition { role, index, .. } = position;

        let org_type = self.org_type();
        let formation = self.formation;
        let fleet = self.get_fleet(role)?;
        let ship = fleet.ships.get(index)?;
        let fleet_len = fleet.len;

        let position = ShipPosition {
            org_type,
            role,
            fleet_len,
            index,
        };

        Some(BattleMemberRef {
            ship: CompMemberRef { ship, position },
            formation,
        })
    }

    pub fn get_ship_mut(&mut self, position: ShipPosition) -> Option<BattleMemberMut> {
        let ShipPosition { role, index, .. } = position;

        let org_type = self.org_type();
        let formation = self.formation;
        let fleet = self.get_fleet_mut(role)?;
        let ship = fleet.ships.get_mut(index)?;
        let fleet_len = fleet.len;

        let position = ShipPosition {
            org_type,
            role,
            fleet_len,
            index,
        };

        Some(BattleMemberMut {
            ship: CompMemberMut { ship, position },
            formation,
        })
    }

    pub fn fleet_los_mod(&self, role: Role) -> f64 {
        self.get_fleet(role)
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
