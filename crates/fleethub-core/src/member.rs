mod battle_member;
mod comp_member;

use rand::prelude::*;

use crate::{
    error::CalculationError,
    plane::PlaneMut,
    ship::Ship,
    types::{ctype, gear_id, AntiAirCutinDef, OrgType, Role, ShipType},
};

pub use battle_member::*;
pub use comp_member::*;

const AIR_COMBAT_CONSTANT: f64 = 0.25;

pub struct ShipAirDefense<'a> {
    pub ship: &'a Ship,
    pub org_type: OrgType,
    pub role: Role,
    pub fleet_adjusted_anti_air: f64,
    pub anti_air_cutin: Option<&'a AntiAirCutinDef>,
}

impl<'a> ShipAirDefense<'a> {
    pub fn combined_fleet_mod(&self) -> f64 {
        if !self.org_type.is_combined() {
            1.0
        } else if self.role.is_escort() {
            0.48
        } else {
            0.8
        }
    }

    pub fn ship_adjusted_anti_air(&self) -> Option<f64> {
        self.ship.ship_adjusted_anti_air(self.org_type.side())
    }

    pub fn proportional_shotdown_rate(&self, ship_anti_air_resist: f64) -> Option<f64> {
        let ship_adjusted_anti_air = self.ship_adjusted_anti_air()?;
        let ship_aa = (ship_adjusted_anti_air * ship_anti_air_resist).floor();

        let result = 0.02 * AIR_COMBAT_CONSTANT * self.combined_fleet_mod() * ship_aa;
        Some(result)
    }

    pub fn fixed_shotdown_number(
        &self,
        ship_anti_air_resist: f64,
        fleet_anti_air_resist: f64,
    ) -> Option<i32> {
        let ship_adjusted_anti_air = self.ship_adjusted_anti_air()?;

        let side_mod = if self.org_type.is_enemy() { 0.75 } else { 0.8 };

        let ship_aa = (ship_adjusted_anti_air * ship_anti_air_resist).floor();
        let fleet_aa = (self.fleet_adjusted_anti_air * fleet_anti_air_resist).floor();
        let mut pre_floor =
            AIR_COMBAT_CONSTANT * self.combined_fleet_mod() * side_mod * (ship_aa + fleet_aa);

        if let Some(cutin) = self.anti_air_cutin {
            pre_floor *= cutin.multiplier?;
        }

        Some(pre_floor.floor() as i32)
    }

    pub fn guaranteed(&self) -> Option<i32> {
        if let Some(cutin) = self.anti_air_cutin {
            cutin.guaranteed.map(|v| v as i32)
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

        let ship_adjusted_anti_air = self.ship_adjusted_anti_air()?;
        let count = self.ship.gears.count(gear_id!("12cm30連装噴進砲改二"));

        if count == 0 {
            return Some(0.);
        }

        let luck = self.ship.luck()? as f64;

        let ship_class_bonus = if self.ship.ctype == ctype!("伊勢型") {
            0.25
        } else {
            0.0
        };

        let rate = (ship_adjusted_anti_air * 2.0 + 0.9 * luck) / 281.0
            + (count as f64 - 1.0) * 0.15
            + ship_class_bonus;

        Some(rate.min(1.0))
    }

    pub fn try_intercept<R: Rng + ?Sized>(
        &self,
        rng: &mut R,
        plane: &mut PlaneMut,
    ) -> Result<(), CalculationError> {
        let current = plane.slot_size.ok_or(CalculationError::UnknownValue)?;

        let ship_aa_resist = plane.gear.ship_anti_air_resist;
        let fleet_aa_resist = plane.gear.fleet_anti_air_resist;

        let proportional_shotdown_rate = if rng.gen_bool(0.5) {
            self.proportional_shotdown_rate(ship_aa_resist)
                .ok_or(CalculationError::UnknownValue)?
        } else {
            0.0
        };

        let fixed_shotdown = if rng.gen_bool(0.5) {
            self.fixed_shotdown_number(ship_aa_resist, fleet_aa_resist)
                .ok_or(CalculationError::UnknownValue)?
        } else {
            0
        };

        let minimum = self.guaranteed().ok_or(CalculationError::UnknownValue)?;

        let proportional_shotdown = (proportional_shotdown_rate * current as f64) as u8;

        plane.sub_slot_size(proportional_shotdown + fixed_shotdown as u8 + minimum as u8);

        Ok(())
    }
}
