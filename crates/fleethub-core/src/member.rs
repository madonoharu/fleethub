use std::ops::Deref;

use rand::prelude::*;

use crate::{
    error::CalculationError,
    gear_id,
    plane::PlaneMut,
    ship::Ship,
    types::{AntiAirCutinDef, OrgType, Role, ShipClass, ShipType, Side},
};

pub struct Member<'a> {
    pub org_type: OrgType,
    pub role: Role,
    pub index: usize,
    pub ship: &'a Ship,
}

pub struct MemberMut<'a> {
    pub org_type: OrgType,
    pub role: Role,
    pub index: usize,
    pub ship: &'a mut Ship,
}

impl<'a> Deref for Member<'a> {
    type Target = &'a Ship;

    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.ship
    }
}

pub trait MemberImpl {
    fn org_type(&self) -> OrgType;
    fn role(&self) -> Role;
    fn index(&self) -> usize;
    fn ship(&self) -> &Ship;

    fn remains(&self) -> bool {
        self.ship().current_hp > 0
    }

    #[inline]
    fn side(&self) -> Side {
        self.org_type().side()
    }

    fn is_enemy(&self) -> bool {
        self.org_type().is_enemy()
    }

    fn is_combined(&self) -> bool {
        self.org_type().is_combined()
    }

    fn is_main(&self) -> bool {
        self.role().is_main()
    }

    fn is_escort(&self) -> bool {
        self.role().is_escort()
    }

    fn adjusted_anti_air(&self) -> Option<f64> {
        let ship = self.ship();
        let total = ship.gears.sum_by(|g| g.adjusted_anti_air());

        if self.is_enemy() {
            let anti_air = ship.anti_air()? as f64;
            return Some(anti_air.sqrt().floor() * 2. + total);
        }

        let naked_anti_air = ship.naked_anti_air()? as f64;
        let pre_floor = naked_anti_air + total;

        let result = if ship.gears.iter().count() == 0 {
            pre_floor
        } else {
            2. * (pre_floor / 2.).floor()
        };

        Some(result)
    }

    fn air_defence<'a>(
        &'a self,
        fleet_anti_air: f64,
        anti_air_cutin: Option<&'a AntiAirCutinDef>,
    ) -> ShipAirDefence {
        ShipAirDefence {
            ship: self.ship(),
            role: self.role(),
            org_type: self.org_type(),
            fleet_anti_air,
            anti_air_cutin,
        }
    }
}

impl<'a> MemberImpl for Member<'a> {
    #[inline]
    fn org_type(&self) -> OrgType {
        self.org_type
    }
    #[inline]
    fn role(&self) -> Role {
        self.role
    }
    #[inline]
    fn index(&self) -> usize {
        self.index
    }
    #[inline]
    fn ship(&self) -> &Ship {
        self.ship
    }
}

impl<'a> MemberImpl for MemberMut<'a> {
    #[inline]
    fn org_type(&self) -> OrgType {
        self.org_type
    }
    #[inline]
    fn role(&self) -> Role {
        self.role
    }
    #[inline]
    fn index(&self) -> usize {
        self.index
    }
    #[inline]
    fn ship(&self) -> &Ship {
        self.ship
    }
}

pub struct ShipAirDefence<'a> {
    pub ship: &'a Ship,
    pub org_type: OrgType,
    pub role: Role,
    pub fleet_anti_air: f64,
    pub anti_air_cutin: Option<&'a AntiAirCutinDef>,
}

impl<'a> ShipAirDefence<'a> {
    pub fn combined_fleet_mod(&self) -> f64 {
        if !self.org_type.is_combined() {
            1.0
        } else if self.role.is_escort() {
            0.48
        } else {
            0.8
        }
    }
    pub fn adjusted_anti_air(&self) -> Option<f64> {
        let total = self.ship.gears.sum_by(|g| g.adjusted_anti_air());

        if self.org_type.is_enemy() {
            let anti_air = self.ship.anti_air()? as f64;
            return Some(anti_air.sqrt().floor() * 2. + total);
        }

        let naked_anti_air = self.ship.naked_anti_air()? as f64;
        let pre_floor = naked_anti_air + total;

        let result = if self.ship.gears.iter().count() == 0 {
            pre_floor
        } else {
            2. * (pre_floor / 2.).floor()
        };

        Some(result)
    }

    pub fn proportional_shotdown_rate(&self, adjusted_anti_air_resist: f64) -> Option<f64> {
        let adjusted_anti_air = self.adjusted_anti_air()?;

        let result = (adjusted_anti_air * adjusted_anti_air_resist).floor()
            * self.combined_fleet_mod()
            * 0.5
            * 0.25
            * 0.02;
        Some(result)
    }

    pub fn fixed_shotdown_number(
        &self,
        adjusted_anti_air_resist: f64,
        fleet_anti_air_resist: f64,
    ) -> Option<i32> {
        let adjusted_anti_air = self.adjusted_anti_air()?;

        let side_mod = if self.org_type.is_enemy() { 0.75 } else { 0.8 };

        let base = (adjusted_anti_air * adjusted_anti_air_resist).floor()
            + (self.fleet_anti_air * fleet_anti_air_resist).floor();

        let mut pre_floor = base * 0.5 * 0.25 * side_mod * self.combined_fleet_mod();

        if let Some(cutin) = self.anti_air_cutin {
            pre_floor *= cutin.multiplier?;
        }

        Some(pre_floor.floor() as i32)
    }

    pub fn minimum_bonus(&self) -> Option<i32> {
        if let Some(cutin) = self.anti_air_cutin {
            cutin.minimum_bonus.map(|v| v as i32)
        } else if self.org_type.is_player() {
            Some(1)
        } else {
            Some(0)
        }
    }

    pub fn anti_air_propellant_barrage_chance(&self) -> Option<f64> {
        if !matches!(
            self.ship.ship_type,
            ShipType::CVL
                | ShipType::CV
                | ShipType::CVB
                | ShipType::CAV
                | ShipType::BBV
                | ShipType::AV
        ) {
            return Some(0.);
        }

        let adjusted_anti_air = self.adjusted_anti_air()?;
        let count = self.ship.gears.count(gear_id!("12cm30連装噴進砲改二"));

        if count == 0 {
            return Some(0.);
        }

        let luck = self.ship.luck()? as f64;
        let ship_class_bonus = if self.ship.ship_class == ShipClass::IseClass {
            0.25
        } else {
            0.
        };

        let rate =
            (adjusted_anti_air + 0.9 * luck) / 281. + (count as f64 - 1.) * 0.15 + ship_class_bonus;

        Some(rate.min(1.))
    }

    pub fn try_intercept<R: Rng + ?Sized>(
        &self,
        rng: &mut R,
        plane: &mut PlaneMut,
    ) -> Result<(), CalculationError> {
        let current = plane.slot_size.ok_or(CalculationError::UnknownValue)?;

        let adjusted_aa_resist = plane.gear.adjusted_anti_air_resistance;
        let fleet_aa_resist = plane.gear.fleet_anti_air_resistance;

        let proportional_shotdown_rate = if rng.gen_bool(0.5) {
            self.proportional_shotdown_rate(adjusted_aa_resist)
                .ok_or(CalculationError::UnknownValue)?
        } else {
            0.0
        };

        let fixed_shotdown = if rng.gen_bool(0.5) {
            self.fixed_shotdown_number(adjusted_aa_resist, fleet_aa_resist)
                .ok_or(CalculationError::UnknownValue)?
        } else {
            0
        };

        let minimum = self.minimum_bonus().ok_or(CalculationError::UnknownValue)?;

        let proportional_shotdown = (proportional_shotdown_rate * current as f64) as u8;

        plane.sub_slot_size(proportional_shotdown + fixed_shotdown as u8 + minimum as u8);

        Ok(())
    }
}
