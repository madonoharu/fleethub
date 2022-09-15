use std::ops::{Deref, DerefMut};

use crate::{
    ship::Ship,
    types::{Formation, ShipConditions, ShipPosition},
};

use super::comp_member::CompMember;

pub struct BattleMember<S>
where
    S: Deref<Target = Ship>,
{
    pub ship: CompMember<S>,
    pub formation: Formation,
    pub amagiri_index: Option<usize>,
}

impl<S> Deref for BattleMember<S>
where
    S: Deref<Target = Ship>,
{
    type Target = CompMember<S>;

    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.ship
    }
}

impl<S> DerefMut for BattleMember<S>
where
    S: DerefMut<Target = Ship>,
{
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.ship
    }
}

impl<S> BattleMember<S>
where
    S: Deref<Target = Ship>,
{
    pub fn new(
        ship: S,
        position: ShipPosition,
        formation: Formation,
        amagiri_index: Option<usize>,
    ) -> Self {
        Self {
            ship: CompMember::new(ship, position),
            formation,
            amagiri_index,
        }
    }

    pub fn conditions(&self) -> ShipConditions {
        ShipConditions {
            position: self.position,
            formation: self.formation,
            amagiri_index: self.amagiri_index,
        }
    }

    pub fn as_ref(&self) -> BattleMember<&S::Target> {
        BattleMember {
            ship: self.ship.as_ref(),
            formation: self.formation,
            amagiri_index: self.amagiri_index,
        }
    }

    pub fn as_mut(&mut self) -> BattleMember<&mut S::Target>
    where
        S: DerefMut<Target = Ship>,
    {
        let formation = self.formation;
        BattleMember {
            ship: self.ship.as_mut(),
            formation,
            amagiri_index: self.amagiri_index,
        }
    }
}

pub type BattleMemberRef<'a> = BattleMember<&'a Ship>;
pub type BattleMemberMut<'a> = BattleMember<&'a mut Ship>;
