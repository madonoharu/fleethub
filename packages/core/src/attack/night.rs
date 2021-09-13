use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    attack::{fit_gun_bonus::fit_gun_bonus, DefenseParams},
    ship::Ship,
    types::{ContactRank, MasterData, NightCutin, ShipType},
};

use super::{
    shelling::ProficiencyModifiers, special_enemy_mods::special_enemy_modifiers, AttackParams,
    AttackPowerParams, HitRateParams, WarfareContext, WarfareShipEnvironment,
};

const NIGHT_POWER_CAP: f64 = 360.0;
const NIGHT_ACCURACY_CONSTANT: f64 = 69.0;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct NightSituation {
    pub night_contact_rank: Option<ContactRank>,
    pub starshell: bool,
    pub searchlight: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, TS)]
pub enum NightAttackType {
    Normal,
    ArkRoyal,
    Carrier,
}

pub struct NightAttackContext<'a> {
    pub attack_type: NightAttackType,

    pub attacker_env: &'a WarfareShipEnvironment,
    pub target_env: &'a WarfareShipEnvironment,
    pub attacker_situation: &'a NightSituation,
    pub target_situation: &'a NightSituation,

    pub formation_power_mod: f64,
    pub formation_accuracy_mod: f64,
    pub formation_evasion_mod: f64,

    pub cutin: Option<NightCutin>,
    pub cutin_power_mod: f64,
    pub cutin_accuracy_mod: f64,
    pub hits: f64,
}

impl<'a> NightAttackContext<'a> {
    pub fn new(
        master_data: &MasterData,
        warfare_context: &'a WarfareContext,
        attacker_situation: &'a NightSituation,
        target_situation: &'a NightSituation,
        attack_type: NightAttackType,
        cutin: Option<NightCutin>,
    ) -> Self {
        let attacker_env = &warfare_context.attacker_env;
        let target_env = &warfare_context.target_env;

        let attacker_formation_mods = master_data
            .constants
            .get_formation_def(attacker_env)
            .map(|def| def.night.to_modifiers())
            .unwrap_or_default();

        let target_formation_mods = master_data
            .constants
            .get_formation_def(target_env)
            .map(|def| def.night.to_modifiers())
            .unwrap_or_default();

        let cutin_def = cutin.and_then(|cutin| master_data.constants.get_night_cutin_def(cutin));

        Self {
            attacker_env,
            target_env,
            attacker_situation,
            target_situation,
            attack_type,

            formation_power_mod: attacker_formation_mods.power_mod,
            formation_accuracy_mod: attacker_formation_mods.accuracy_mod,
            formation_evasion_mod: target_formation_mods.evasion_mod,

            cutin,
            cutin_power_mod: cutin_def.and_then(|def| def.power_mod).unwrap_or(1.0),
            cutin_accuracy_mod: cutin_def.and_then(|def| def.accuracy_mod).unwrap_or(1.0),
            hits: cutin_def.map_or(1.0, |def| def.hits),
        }
    }

    fn starshell_accuracy_mod(&self) -> f64 {
        if self.attacker_situation.starshell {
            5.0
        } else {
            0.0
        }
    }

    fn searchlight_accuracy_mod(&self) -> f64 {
        if self.attacker_situation.searchlight {
            7.0
        } else {
            0.0
        }
    }

    fn searchlight_evasion_mod(&self) -> f64 {
        if self.target_situation.starshell {
            0.2
        } else {
            1.0
        }
    }

    fn night_contact_power_mod(&self) -> f64 {
        self.attacker_situation
            .night_contact_rank
            .map(|rank| rank.night_mods().accuracy_mod)
            .unwrap_or(0.0)
    }

    fn night_contact_accuracy_mod(&self) -> f64 {
        self.attacker_situation
            .night_contact_rank
            .map(|rank| rank.night_mods().accuracy_mod)
            .unwrap_or(1.0)
    }

    const NIGHT_CRITICAL_RATE_CONSTANT: f64 = 1.5;

    fn critical_rate_constant(&self) -> f64 {
        self.attacker_situation
            .night_contact_rank
            .map(|rank| rank.night_mods().critical_rate_constant)
            .unwrap_or(Self::NIGHT_CRITICAL_RATE_CONSTANT)
    }

    pub fn attack_params(&self, attacker: &Ship, target: &Ship) -> AttackParams {
        let ctx = self;

        let proficiency_modifiers = matches!(
            ctx.attack_type,
            NightAttackType::Carrier | NightAttackType::ArkRoyal
        )
        .then(|| attacker.proficiency_modifiers(None));

        let attack_power_params =
            calc_attack_power_params(ctx, attacker, target, &proficiency_modifiers);

        let hit_rate_params = calc_hit_rate_params(ctx, attacker, target, &proficiency_modifiers);

        let armor_penetration = attack_power_params
            .as_ref()
            .map_or(0.0, |p| p.armor_penetration);
        let defense_params = DefenseParams::from_target(&ctx.target_env, target, armor_penetration);

        AttackParams {
            attack_power_params,
            hit_rate_params,
            defense_params,
            is_cutin: ctx.cutin.is_some(),
            hits: ctx.hits,
        }
    }
}

fn calc_attack_power_params(
    ctx: &NightAttackContext,
    attacker: &Ship,
    target: &Ship,
    proficiency_modifiers: &Option<ProficiencyModifiers>,
) -> Option<AttackPowerParams> {
    let anti_inst = target.is_installation();
    let contact_mod = ctx.night_contact_power_mod();

    let damage_mod = attacker.damage_state().common_power_mod();
    let formation_mod = ctx.formation_power_mod;
    let cutin_mod = ctx.cutin_power_mod;
    let cruiser_fit_bonus = attacker.cruiser_fit_bonus();

    let remaining_ammo_mod = attacker.remaining_ammo_mod();

    let a14 = damage_mod * formation_mod * cutin_mod;
    let b14 = cruiser_fit_bonus;

    let mut mods = special_enemy_modifiers(attacker, target.special_enemy_type(), false);

    mods.apply_a14(a14);
    mods.apply_b14(b14);

    let base = AttackPowerParams {
        cap: NIGHT_POWER_CAP,
        mods,
        remaining_ammo_mod,
        proficiency_critical_mod: proficiency_modifiers
            .as_ref()
            .map(|mods| mods.critical_power_mod),
        ..Default::default()
    };

    let result = match ctx.attack_type {
        NightAttackType::Normal => {
            let firepower = attacker.firepower()?;
            let torpedo = if anti_inst { 0 } else { attacker.torpedo()? };
            let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.night_power);
            let basic = firepower as f64 + torpedo as f64 + ibonus + contact_mod;
            AttackPowerParams { basic, ..base }
        }
        NightAttackType::Carrier => {
            let night_carrier_power = attacker.night_carrier_power(anti_inst)?;

            AttackPowerParams {
                basic: night_carrier_power + contact_mod,
                ..base
            }
        }
        NightAttackType::ArkRoyal => {
            let night_carrier_power = attacker.night_ark_royal_power(anti_inst)?;

            AttackPowerParams {
                basic: night_carrier_power + contact_mod,
                ..base
            }
        }
    };

    Some(result)
}

fn calc_accuracy_term(ctx: &NightAttackContext, attacker: &Ship) -> Option<f64> {
    let basic_accuracy_term = attacker.basic_accuracy_term()?;
    let starshell_mod = ctx.starshell_accuracy_mod();
    let searchlight_mod = ctx.searchlight_accuracy_mod();
    let contact_mod = ctx.night_contact_accuracy_mod();

    let accuracy = attacker.accuracy() as f64;
    let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.night_accuracy);

    let formation_mod = ctx.formation_accuracy_mod;
    let morale_mod = attacker.morale_state().common_accuracy_mod();
    let cutin_mod = ctx.cutin_accuracy_mod;
    let fit_gun_bonus = fit_gun_bonus(attacker, true);

    // 乗算前に切り捨て
    let premultiplication = ((NIGHT_ACCURACY_CONSTANT + starshell_mod) * contact_mod
        + basic_accuracy_term
        + accuracy
        + ibonus)
        .floor();

    let accuracy_term = (premultiplication * formation_mod * morale_mod * cutin_mod
        + searchlight_mod
        + fit_gun_bonus)
        .floor();

    Some(accuracy_term)
}

fn calc_evasion_term(ctx: &NightAttackContext, target: &Ship) -> Option<f64> {
    let formation_mod = ctx.formation_evasion_mod;

    let ship_type_additive = if matches!(target.ship_type, ShipType::CA | ShipType::CAV) {
        5.0
    } else {
        0.0
    };

    let searchlight_evasion_mod = ctx.searchlight_evasion_mod();

    target.evasion_term(formation_mod, ship_type_additive, searchlight_evasion_mod)
}

fn calc_hit_rate_params(
    ctx: &NightAttackContext,
    attacker: &Ship,
    target: &Ship,
    proficiency_modifiers: &Option<ProficiencyModifiers>,
) -> Option<HitRateParams> {
    let accuracy_term = calc_accuracy_term(ctx, attacker)?;
    let evasion_term = calc_evasion_term(ctx, target)?;

    let hit_percentage_bonus = proficiency_modifiers
        .as_ref()
        .map(|mods| mods.hit_percentage_bonus)
        .unwrap_or_default();

    let critical_percentage_bonus = proficiency_modifiers
        .as_ref()
        .map(|mods| mods.critical_percentage_bonus)
        .unwrap_or_default();

    Some(HitRateParams {
        accuracy_term,
        evasion_term,
        morale_mod: target.morale_state().hit_rate_mod(),
        critical_rate_constant: ctx.critical_rate_constant(),
        hit_percentage_bonus,
        critical_percentage_bonus,
    })
}
