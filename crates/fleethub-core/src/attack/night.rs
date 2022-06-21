use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::DefenseParams,
    ship::Ship,
    types::{
        AttackPowerModifier, BattleConfig, ContactRank, CustomPowerModifiers, GearType,
        NightAttackType, NightSpecialAttack, ShipType, SpecialAttackDef,
    },
};

use super::{
    shelling::ProficiencyModifiers, special_enemy_mods::special_enemy_modifiers, AttackParams,
    AttackPowerParams, HitRateParams, WarfareContext, WarfareShipEnvironment,
};

const NIGHT_POWER_CAP: f64 = 360.0;
const NIGHT_ACCURACY_CONSTANT: f64 = 69.0;

#[derive(Debug, Clone, Default, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct NightSituation {
    pub night_contact_rank: Option<ContactRank>,
    pub starshell: bool,
    pub searchlight: bool,
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

    pub custom_mods: &'a CustomPowerModifiers,

    pub special_attack_def: Option<SpecialAttackDef<NightSpecialAttack>>,
}

impl<'a> NightAttackContext<'a> {
    pub fn new(
        config: &BattleConfig,
        warfare_context: &'a WarfareContext,
        attacker_situation: &'a NightSituation,
        target_situation: &'a NightSituation,
        attack_type: NightAttackType,
        special_attack_def: Option<SpecialAttackDef<NightSpecialAttack>>,
    ) -> Self {
        let attacker_env = &warfare_context.attacker_env;
        let target_env = &warfare_context.target_env;

        let attacker_formation_mods = config
            .get_formation_def_by_env(attacker_env)
            .night
            .to_modifiers();

        let target_formation_mods = config
            .get_formation_def_by_env(target_env)
            .night
            .to_modifiers();

        Self {
            attacker_env,
            target_env,
            custom_mods: &warfare_context.custom_mods,
            attacker_situation,
            target_situation,
            attack_type,

            formation_power_mod: attacker_formation_mods.power_mod,
            formation_accuracy_mod: attacker_formation_mods.accuracy_mod,
            formation_evasion_mod: target_formation_mods.evasion_mod,

            special_attack_def,
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

    fn night_contact_power_mod(&self) -> f64 {
        self.attacker_situation
            .night_contact_rank
            .map(|rank| rank.night_mods().power_mod)
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
        let defense_params =
            DefenseParams::from_target(target, ctx.target_env.org_type.side(), armor_penetration);

        AttackParams {
            attack_power_params,
            hit_rate_params,
            defense_params,
            is_cutin: ctx.special_attack_def.is_some(),
            hits: ctx.special_attack_def.as_ref().map_or(1.0, |def| def.hits),
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
    let cutin_mod = ctx
        .special_attack_def
        .as_ref()
        .map_or(1.0, |def| def.power_mod);
    let cruiser_fit_bonus = attacker.cruiser_fit_bonus();

    let remaining_ammo_mod = attacker.remaining_ammo_mod();

    // 主魚電 | 魚見電 のみでD型補正
    let model_d_small_gun_mod = if ctx
        .special_attack_def
        .as_ref()
        .map(|def| def.kind.has_model_d_small_gun_mod())
        .unwrap_or_default()
    {
        attacker.model_d_small_gun_mod()
    } else {
        1.0
    };

    let a14 = damage_mod * formation_mod * cutin_mod * model_d_small_gun_mod;
    let b14 = cruiser_fit_bonus;

    let precap_mod = AttackPowerModifier::new(a14, b14);
    let postcap_mod = Default::default();

    let special_enemy_mods = special_enemy_modifiers(attacker, target.special_enemy_type(), false);
    let custom_mods = ctx.custom_mods.clone();

    let base = AttackPowerParams {
        cap: NIGHT_POWER_CAP,
        precap_mod,
        postcap_mod,
        remaining_ammo_mod,
        proficiency_critical_mod: proficiency_modifiers
            .as_ref()
            .map(|mods| mods.critical_power_mod),
        special_enemy_mods,
        custom_mods,
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
    let cutin_mod = ctx
        .special_attack_def
        .as_ref()
        .map_or(1.0, |def| def.accuracy_mod);
    let gunfit_accuracy = attacker.gunfit_accuracy(true);

    // 乗算前に切り捨て
    let pre_multiplication = ((NIGHT_ACCURACY_CONSTANT + starshell_mod) * contact_mod
        + basic_accuracy_term
        + accuracy
        + ibonus)
        .floor();

    let accuracy_term = (pre_multiplication * formation_mod * morale_mod * cutin_mod
        + searchlight_mod
        + gunfit_accuracy)
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

    // todo!
    let searchlight_evasion_mod =
        if target.gears.has_type(GearType::Searchlight) && ctx.target_situation.searchlight {
            0.2
        } else {
            1.0
        };

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
        target_morale_mod: target.morale_state().hit_rate_mod(),
        critical_rate_constant: ctx.critical_rate_constant(),
        hit_percentage_bonus,
        critical_percentage_bonus,
    })
}
