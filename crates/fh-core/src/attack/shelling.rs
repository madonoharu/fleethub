use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    attack::{AttackPowerModifiers, AttackPowerParams, HitRateParams},
    ship::Ship,
    types::{AirState, Engagement, MasterData, ShellingSpecialAttack, SpecialAttackDef},
};

use super::{
    fit_gun_bonus, fleet_factor, special_enemy_mods::special_enemy_modifiers, AttackParams,
    DefenseParams, WarfareContext, WarfareShipEnvironment,
};

const SHELLING_POWER_CAP: f64 = 220.0;
const SHELLING_CRITICAL_RATE_CONSTANT: f64 = 1.3;

pub struct ProficiencyModifiers {
    pub hit_percentage_bonus: f64,
    pub critical_power_mod: f64,
    pub critical_percentage_bonus: f64,
}

impl Default for ProficiencyModifiers {
    fn default() -> Self {
        Self {
            hit_percentage_bonus: 0.0,
            critical_power_mod: 1.0,
            critical_percentage_bonus: 0.0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, TS)]
pub enum ShellingAttackType {
    Normal,
    Carrier,
}

pub struct ShellingAttackContext<'a> {
    pub attack_type: ShellingAttackType,

    pub attacker_env: &'a WarfareShipEnvironment,
    pub target_env: &'a WarfareShipEnvironment,
    pub external_power_mods: &'a AttackPowerModifiers,
    pub engagement: Engagement,
    pub air_state: AirState,

    pub formation_power_mod: f64,
    pub formation_accuracy_mod: f64,
    pub target_formation_evasion_mod: f64,

    pub special_attack_def: Option<SpecialAttackDef<ShellingSpecialAttack>>,
}

const IS_DAY: bool = true;

impl<'a> ShellingAttackContext<'a> {
    pub fn new(
        master_data: &MasterData,
        warfare_context: &'a WarfareContext,
        attack_type: ShellingAttackType,
        special_attack_def: Option<SpecialAttackDef<ShellingSpecialAttack>>,
    ) -> Self {
        let attacker_env = &warfare_context.attacker_env;
        let target_env = &warfare_context.target_env;

        let attacker_formation_def = master_data.constants.get_formation_def(attacker_env);
        let target_formation_def = master_data.constants.get_formation_def(target_env);

        let formation_power_mod = attacker_formation_def
            .and_then(|def| def.shelling.power_mod)
            .unwrap_or(1.0);
        let formation_accuracy_mod = if attacker_env.formation.is_ineffective(target_env.formation)
        {
            1.0
        } else {
            attacker_formation_def
                .and_then(|def| def.shelling.accuracy_mod)
                .unwrap_or(1.0)
        };
        let target_formation_evasion_mod = target_formation_def
            .and_then(|def| def.shelling.evasion_mod)
            .unwrap_or(1.0);

        // let cutin_def = cutin.and_then(|cutin| master_data.constants.get_day_cutin_def(cutin));
        // let cutin_power_mod = cutin_def.and_then(|def| def.power_mod).unwrap_or(1.0);
        // let cutin_accuracy_mod = cutin_def.and_then(|def| def.accuracy_mod).unwrap_or(1.0);
        // let hits = cutin_def.map_or(1.0, |def| def.hits as f64);

        Self {
            attack_type,
            attacker_env,
            target_env,
            external_power_mods: &warfare_context.external_power_mods,
            air_state: warfare_context.air_state,
            engagement: warfare_context.engagement,
            formation_power_mod,
            formation_accuracy_mod,
            target_formation_evasion_mod,
            special_attack_def,
        }
    }

    pub fn attack_params(&self, attacker: &Ship, target: &Ship) -> AttackParams {
        let ctx = self;

        let ap_shell_mods = target
            .is_heavily_armored_ship()
            .then(|| attacker.get_ap_shell_modifiers());

        let special_enemy_mods =
            special_enemy_modifiers(attacker, target.special_enemy_type(), IS_DAY);

        let mut carrier_power = None;
        let mut carrier_power_ebonus = 0.0;
        let mut proficiency_mods = None;
        let mut carrier_shelling_power_ibonus = 0.0;

        if self.attack_type == ShellingAttackType::Carrier {
            let anti_inst = target.is_installation();
            let day_cutin = ctx
                .special_attack_def
                .as_ref()
                .and_then(|def| match def.kind {
                    ShellingSpecialAttack::DayCutin(cutin) => Some(cutin),
                    _ => None,
                });

            carrier_power = Some(attacker.carrier_power(anti_inst) as f64);
            carrier_power_ebonus = attacker.ebonuses.carrier_power as f64;
            proficiency_mods = Some(attacker.proficiency_modifiers(day_cutin));

            carrier_shelling_power_ibonus = attacker
                .gears
                .sum_by(|gear| gear.ibonuses.carrier_shelling_power);
        }

        let calc_attack_power_params = || -> Option<AttackPowerParams> {
            let firepower = attacker.firepower()? as f64;
            let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.shelling_power);
            let fleet_factor = fleet_factor::find_shelling_power_factor(
                ctx.attacker_env.org_type,
                ctx.target_env.org_type,
                ctx.attacker_env.role,
            ) as f64;
            let damage_mod = attacker.damage_state().common_power_mod();
            let cruiser_fit_bonus = attacker.cruiser_fit_bonus();

            let formation_mod = ctx.formation_power_mod;
            let engagement_mod = ctx.engagement.modifier();
            let cutin_mod = ctx
                .special_attack_def
                .as_ref()
                .map_or(1.0, |def| def.power_mod);

            let proficiency_critical_mod = proficiency_mods
                .as_ref()
                .map(|mods| mods.critical_power_mod);
            let remaining_ammo_mod = attacker.remaining_ammo_mod();

            let basic = 5.0 + fleet_factor + firepower + ibonus + carrier_shelling_power_ibonus;

            let a14 = formation_mod * engagement_mod * damage_mod;
            let b14 = cruiser_fit_bonus + carrier_power_ebonus;
            let a11 = cutin_mod;

            let mods_base = AttackPowerModifiers {
                a14,
                b14,
                a11,
                ..Default::default()
            };

            let mods = mods_base + special_enemy_mods + self.external_power_mods.clone();

            let params = AttackPowerParams {
                basic,
                cap: SHELLING_POWER_CAP,
                mods,
                ap_shell_mod: ap_shell_mods.map(|mods| mods.0),
                carrier_power,
                proficiency_critical_mod,
                remaining_ammo_mod,
                armor_penetration: 0.0,
            };

            Some(params)
        };

        let calc_accuracy_term = || -> Option<f64> {
            let fleet_factor = fleet_factor::find_shelling_accuracy_factor(
                ctx.attacker_env.org_type,
                ctx.attacker_env.role,
            ) as f64;

            let basic_accuracy_term = attacker.basic_accuracy_term()?;
            let ship_accuracy = attacker.accuracy() as f64;
            let ibonus = attacker
                .gears
                .sum_by(|gear| gear.ibonuses.shelling_accuracy);
            let fit_gun_bonus = fit_gun_bonus::fit_gun_bonus(attacker, !IS_DAY);
            let morale_mod = attacker.morale_state().common_accuracy_mod();
            let formation_mod = ctx.formation_accuracy_mod;
            let ap_shell_mod = ap_shell_mods.map(|mods| mods.1).unwrap_or(1.0);
            let cutin_mod = ctx
                .special_attack_def
                .as_ref()
                .map_or(1.0, |def| def.accuracy_mod);

            // 乗算前に切り捨て
            let premultiplication =
                (fleet_factor + basic_accuracy_term + ship_accuracy + ibonus).floor();

            let result = ((premultiplication * formation_mod * morale_mod + fit_gun_bonus)
                * cutin_mod
                * ap_shell_mod)
                .floor();

            Some(result)
        };

        let calc_hit_rate_params = || {
            let formation_mod = ctx.target_formation_evasion_mod;
            let evasion_term = target.evasion_term(formation_mod, 0.0, 1.0)?;

            let accuracy_term = calc_accuracy_term()?;

            Some(HitRateParams {
                accuracy_term,
                evasion_term,
                morale_mod: target.morale_state().hit_rate_mod(),
                critical_rate_constant: SHELLING_CRITICAL_RATE_CONSTANT,
                critical_percentage_bonus: proficiency_mods
                    .as_ref()
                    .map_or(0.0, |mods| mods.critical_percentage_bonus),
                hit_percentage_bonus: proficiency_mods
                    .as_ref()
                    .map_or(0.0, |mods| mods.hit_percentage_bonus),
            })
        };

        let armor_penetration = 0.0;
        let defense_params = DefenseParams::from_target(&ctx.target_env, target, armor_penetration);

        AttackParams {
            attack_power_params: calc_attack_power_params(),
            hit_rate_params: calc_hit_rate_params(),
            defense_params: defense_params,
            is_cutin: ctx.special_attack_def.is_some(),
            hits: ctx.special_attack_def.as_ref().map_or(1.0, |def| def.hits),
        }
    }
}
