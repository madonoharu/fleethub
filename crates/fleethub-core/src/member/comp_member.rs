use std::ops::{Deref, DerefMut};

use crate::{
    ship::Ship,
    types::{AntiAirCutinDef, DamageState, ShipPosition, Side},
};

use super::ShipAirDefense;

pub type CompMemberRef<'a> = CompMember<&'a Ship>;
pub type CompMemberMut<'a> = CompMember<&'a mut Ship>;

pub struct CompMember<S>
where
    S: Deref<Target = Ship>,
{
    pub ship: S,
    pub position: ShipPosition,
}

impl<S> Deref for CompMember<S>
where
    S: Deref<Target = Ship>,
{
    type Target = S;

    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.ship
    }
}

impl<S> DerefMut for CompMember<S>
where
    S: DerefMut<Target = Ship>,
{
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.ship
    }
}

impl<S> CompMember<S>
where
    S: Deref<Target = Ship>,
{
    pub fn new(ship: S, position: ShipPosition) -> Self {
        Self { ship, position }
    }

    pub fn side(&self) -> Side {
        self.position.side()
    }

    pub fn is_flagship(&self) -> bool {
        self.position.is_flagship()
    }

    pub fn is_protector(&self) -> bool {
        self.damage_state() < DamageState::Shouha && !self.is_flagship() && !self.is_installation()
    }

    pub fn remains(&self) -> bool {
        self.current_hp > 0
    }

    pub fn air_defense<'a>(
        &'a self,
        fleet_adjusted_anti_air: f64,
        anti_air_cutin: Option<&'a AntiAirCutinDef>,
    ) -> ShipAirDefense {
        let ShipPosition {
            org_type,
            fleet_type,
            ..
        } = self.position;

        ShipAirDefense {
            ship: self,
            org_type,
            role: fleet_type.into(),
            fleet_adjusted_anti_air,
            anti_air_cutin,
        }
    }

    pub fn as_ref(&self) -> CompMember<&S::Target> {
        CompMember {
            ship: self,
            position: self.position,
        }
    }

    pub fn as_mut(&mut self) -> CompMember<&mut S::Target>
    where
        S: DerefMut<Target = Ship>,
    {
        let position = self.position;
        CompMember {
            ship: self,
            position,
        }
    }
}
