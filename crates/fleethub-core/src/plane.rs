use itertools::Itertools;
use rand::{distributions::uniform::SampleRange, prelude::*};

use crate::{
    error::CalculationError,
    gear::Gear,
    types::{AirState, AirStateRank, AirWaveType, ContactRank, GearAttr, GearType, Side},
};

pub enum AirstrikeType {
    JetBomber,
    DiveBomber,
    TorpedoBomber,
}

pub trait PlaneImpl {
    fn gear_as_ref(&self) -> &Gear;
    fn slot_size(&self) -> Option<u8>;

    #[inline]
    fn gear_type(&self) -> GearType {
        self.gear_as_ref().gear_type
    }

    fn remains(&self) -> bool {
        self.slot_size().unwrap_or_default() > 0
    }

    fn is_fighter(&self) -> bool {
        matches!(
            self.gear_type(),
            GearType::CbFighter
                | GearType::SeaplaneFighter
                | GearType::LbFighter
                | GearType::JetFighter
        )
    }

    fn is_dive_bomber(&self) -> bool {
        matches!(
            self.gear_type(),
            GearType::CbDiveBomber | GearType::SeaplaneBomber | GearType::JetFighterBomber
        )
    }

    fn is_torpedo_bomber(&self) -> bool {
        matches!(
            self.gear_type(),
            GearType::CbTorpedoBomber | GearType::JetTorpedoBomber
        )
    }

    fn is_attacker(&self) -> bool {
        self.is_dive_bomber()
            | self.is_torpedo_bomber()
            | matches!(
                self.gear_type(),
                GearType::LbAttacker | GearType::LargeLbAircraft
            )
    }

    fn is_recon(&self) -> bool {
        matches!(
            self.gear_type(),
            GearType::CbRecon
                | GearType::ReconSeaplane
                | GearType::LargeFlyingBoat
                | GearType::LbRecon
                | GearType::JetRecon
        )
    }

    fn is_jet_plane(&self) -> bool {
        matches!(
            self.gear_type(),
            GearType::JetFighter | GearType::JetFighterBomber | GearType::JetTorpedoBomber
        )
    }

    fn is_lb_plane(&self) -> bool {
        matches!(
            self.gear_type(),
            GearType::LbAttacker
                | GearType::LbFighter
                | GearType::LbRecon
                | GearType::LargeLbAircraft
        )
    }

    fn is_contact_selection_plane(&self) -> bool {
        self.is_recon() || self.gear_type() == GearType::CbTorpedoBomber
    }

    fn is_night_recon(&self) -> bool {
        self.gear_as_ref().has_attr(GearAttr::NightRecon)
    }

    fn contact_rank(&self) -> ContactRank {
        let accuracy = self.gear_as_ref().accuracy;

        if accuracy <= 1 {
            ContactRank::Rank1
        } else if accuracy == 2 {
            ContactRank::Rank2
        } else {
            ContactRank::Rank3
        }
    }

    fn participates_in_fighter_combat(&self, air_type: AirWaveType) -> bool {
        if self.slot_size() == Some(0) {
            false
        } else {
            match air_type {
                AirWaveType::Jet => self.is_jet_plane(),
                AirWaveType::LandBase => self.is_fighter() || self.is_attacker() || self.is_recon(),
                AirWaveType::Carrier => {
                    !self.is_lb_plane() && (self.is_fighter() || self.is_attacker())
                }
            }
        }
    }

    fn fighter_power(&self) -> Option<i32> {
        Some(self.gear_as_ref().calc_fighter_power(self.slot_size()?))
    }

    fn interception_power(&self) -> Option<i32> {
        Some(
            self.gear_as_ref()
                .calc_interception_power(self.slot_size()?),
        )
    }

    fn contact_trigger_factor(&self) -> Option<f64> {
        let slot_size = self.slot_size()?;
        Some(self.gear_as_ref().calc_contact_trigger_factor(slot_size))
    }

    fn contact_selection_rate(&self, rank: AirStateRank) -> f64 {
        self.gear_as_ref().contact_selection_rate(rank)
    }

    fn night_contact_rate(&self, level: u16) -> f64 {
        self.gear_as_ref().night_contact_rate(level)
    }

    fn airstrike_type(&self) -> AirstrikeType {
        if self.gear_type() == GearType::JetFighterBomber {
            AirstrikeType::JetBomber
        } else if self.is_dive_bomber() {
            AirstrikeType::DiveBomber
        } else if self.is_torpedo_bomber() {
            AirstrikeType::TorpedoBomber
        } else {
            unreachable!()
        }
    }
}

pub struct Plane<'a> {
    pub index: usize,
    pub gear: &'a Gear,
    pub slot_size: Option<u8>,
}

impl<'a> PlaneImpl for Plane<'a> {
    #[inline]
    fn gear_as_ref(&self) -> &Gear {
        self.gear
    }

    #[inline]
    fn slot_size(&self) -> Option<u8> {
        self.slot_size
    }
}

pub struct PlaneMut<'a> {
    pub index: usize,
    pub gear: &'a mut Gear,
    pub slot_size: &'a mut Option<u8>,
}

impl<'a> PlaneImpl for PlaneMut<'a> {
    #[inline]
    fn gear_as_ref(&self) -> &Gear {
        self.gear
    }

    #[inline]
    fn slot_size(&self) -> Option<u8> {
        *self.slot_size
    }
}

impl<'a> PlaneMut<'a> {
    pub fn sub_slot_size(&mut self, loss: u8) {
        if let Some(slot_size) = self.slot_size {
            *slot_size = slot_size.saturating_sub(loss)
        }
    }

    pub fn suffer_in_fighter_combat<R: Rng + ?Sized>(
        &mut self,
        rng: &mut R,
        air_state: AirState,
        side: Side,
    ) {
        let constant = air_state.constant();

        let random_value = match side {
            Side::Player => {
                let min = constant as f64 / 4.0;
                let high = constant * 100 / 3;

                min + rng.gen_range(0..=high) as f64 / 100.0
            }
            Side::Enemy => {
                let high = 11 - constant;

                0.35 * (0..=high).sample_single(rng) as f64
                    + 0.65 * (0..=high).sample_single(rng) as f64
            }
        };

        let resist = if self.gear.has_attr(GearAttr::JetAircraft) {
            0.6
        } else {
            1.0
        };

        let slot_size = self.slot_size().unwrap_or_default();
        let proportional = random_value / 10.0;
        let loss = (slot_size as f64 * proportional * resist) as u8;
        self.sub_slot_size(loss);
    }
}

pub struct PlaneVec<T: PlaneImpl> {
    vec: Vec<T>,
}

impl<T: PlaneImpl> FromIterator<T> for PlaneVec<T> {
    fn from_iter<I: IntoIterator<Item = T>>(iter: I) -> Self {
        Self {
            vec: iter.into_iter().collect(),
        }
    }
}

impl<T: PlaneImpl> PlaneVec<T> {
    pub fn iter(&self) -> std::slice::Iter<T> {
        self.vec.iter()
    }

    pub fn iter_mut(&mut self) -> std::slice::IterMut<T> {
        self.vec.iter_mut()
    }

    pub fn fighter_power(&self, air_type: AirWaveType) -> Result<i32, CalculationError> {
        self.iter()
            .filter(|p| p.participates_in_fighter_combat(air_type))
            .map(|plane| plane.fighter_power())
            .sum::<Option<i32>>()
            .ok_or(CalculationError::UnknownValue)
    }

    pub fn trigger_rate(&self, air_state_rank: AirStateRank) -> Option<f64> {
        let total_trigger_factor = self
            .iter()
            .filter(|plane| plane.is_recon())
            .map(|plane| plane.contact_trigger_factor())
            .sum::<Option<f64>>()?;

        let trigger_rate =
            ((total_trigger_factor + 1.0) / (70.0 - 15.0 * air_state_rank.as_f64())).min(1.0);

        Some(trigger_rate)
    }

    pub fn try_contact<R: Rng + ?Sized>(
        &self,
        rng: &mut R,
        air_state_rank: AirStateRank,
    ) -> Result<Option<ContactRank>, CalculationError> {
        let trigger_rate = self
            .trigger_rate(air_state_rank)
            .ok_or(CalculationError::UnknownValue)?;

        if rng.gen_bool(trigger_rate) {
            for plane in self
                .iter()
                .filter(|plane| plane.is_contact_selection_plane() && plane.remains())
                .sorted_by(|a, b| a.contact_rank().cmp(&b.contact_rank()).reverse())
            {
                let selection_rate = plane.contact_selection_rate(air_state_rank);

                if rng.gen_bool(selection_rate) {
                    return Ok(Some(plane.contact_rank()));
                }
            }
        }

        Ok(None)
    }
}
