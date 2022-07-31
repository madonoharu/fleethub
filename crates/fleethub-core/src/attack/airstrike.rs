use rand::prelude::*;

use crate::{
    member::CompMemberRef,
    plane::{AirstrikeType, PlaneImpl},
    types::{AttackPowerModifier, ContactRank, ProficiencyModifiers},
};

use super::{AttackParams, AttackPowerParams, DefenseParams, HitRateParams};

const AIRSTRIKE_POWER_CAP: f64 = 170.0;

pub fn create_airstrike_params<P: PlaneImpl, R: Rng + ?Sized>(
    rng: &mut R,
    plane: P,
    proficiency_modifiers: &ProficiencyModifiers,
    remaining_ammo_mod: f64,
    contact_rank: Option<ContactRank>,
    target: &CompMemberRef,
) -> AttackParams {
    let attack_power_params = {
        let slot_size = plane.slot_size().unwrap_or_default() as f64;

        let (type_mod, stat) = match plane.airstrike_type() {
            AirstrikeType::TorpedoBomber => {
                let type_mod = if rng.gen_bool(0.5) { 0.8 } else { 1.2 };
                (type_mod, plane.gear_as_ref().torpedo)
            }
            AirstrikeType::DiveBomber => (1.0, plane.gear_as_ref().bombing),
            AirstrikeType::JetBomber => (1.0 / 2.0_f64.sqrt(), plane.gear_as_ref().bombing),
        };

        let basic = type_mod * (stat as f64) * slot_size.sqrt();

        let a11 = contact_rank.map_or(1.0, |rank| rank.airstrike_power_mod());

        let precap_mod = Default::default();
        let postcap_mod = AttackPowerModifier::new(a11, 0.0);

        Some(AttackPowerParams {
            basic,
            cap: AIRSTRIKE_POWER_CAP,
            precap_mod,
            postcap_mod,
            proficiency_critical_mod: Some(proficiency_modifiers.critical_power_mod),
            remaining_ammo_mod,
            ..Default::default()
        })
    };

    let hit_rate_params = {
        let evasion_term = target.evasion_term(1.0, 0.0, 1.0);

        evasion_term.map(|evasion_term| HitRateParams {
            accuracy_term: 95.0,
            evasion_term,
            target_morale_mod: target.morale_state().hit_rate_mod(),
            critical_rate_constant: 0.2,
            critical_percentage_bonus: proficiency_modifiers.critical_percentage_bonus,
            hit_percentage_bonus: proficiency_modifiers.hit_percentage_bonus,
        })
    };

    const ARMOR_PENETRATION: f64 = 0.0;
    let defense_params = DefenseParams::from_target(target, target.side(), ARMOR_PENETRATION);

    AttackParams {
        attack_power_params,
        hit_rate_params,
        defense_params,
        is_cutin: false,
        hits: 1.0,
    }
}
