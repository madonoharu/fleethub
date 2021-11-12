use crate::{
    types::{BattleConfig, Engagement},
    Ship,
};

use super::{
    special_enemy_mods::shelling_support_special_enemy_modifiers, AttackParams,
    AttackPowerModifiers, AttackPowerParams, DefenseParams, HitRateParams, ShellingAttackType,
    WarfareContext, WarfareShipEnvironment,
};

const SHELLING_SUPPORT_POWER_CAP: f64 = 170.0;
const SHELLING_SUPPORT_CRITICAL_RATE_CONSTANT: f64 = 1.0;

pub struct ShellingSupportAttackContext<'a> {
    pub attack_type: ShellingAttackType,

    pub attacker_env: &'a WarfareShipEnvironment,
    pub target_env: &'a WarfareShipEnvironment,
    pub external_power_mods: &'a AttackPowerModifiers,
    pub engagement: Engagement,

    pub formation_power_mod: f64,
    pub formation_accuracy_mod: f64,
    pub target_formation_evasion_mod: f64,
}

impl<'a> ShellingSupportAttackContext<'a> {
    pub fn new(
        config: &BattleConfig,
        warfare_context: &'a WarfareContext,
        attack_type: ShellingAttackType,
    ) -> Self {
        let attacker_env = &warfare_context.attacker_env;
        let target_env = &warfare_context.target_env;

        let attacker_formation_def = config.get_formation_def_by_env(attacker_env);
        let target_formation_def = config.get_formation_def_by_env(target_env);

        let formation_power_mod = attacker_formation_def
            .and_then(|def| def.shelling_support.power_mod)
            .unwrap_or(1.0);
        let formation_accuracy_mod = if attacker_env.formation.is_ineffective(target_env.formation)
        {
            1.0
        } else {
            attacker_formation_def
                .and_then(|def| def.shelling_support.accuracy_mod)
                .unwrap_or(1.0)
        };
        let target_formation_evasion_mod = target_formation_def
            .and_then(|def| def.shelling_support.evasion_mod)
            .unwrap_or(1.0);

        Self {
            attack_type,
            attacker_env,
            target_env,
            external_power_mods: &warfare_context.external_power_mods,
            engagement: warfare_context.engagement,
            formation_power_mod,
            formation_accuracy_mod,
            target_formation_evasion_mod,
        }
    }

    pub fn attack_params(&self, attacker: &Ship, target: &Ship) -> AttackParams {
        let ctx = self;

        let special_enemy_mods =
            shelling_support_special_enemy_modifiers(attacker, target.special_enemy_type());

        let mut carrier_power = None;
        let mut carrier_power_ebonus = 0.0;

        if self.attack_type == ShellingAttackType::Carrier {
            let anti_inst = target.is_installation();

            carrier_power = Some(attacker.carrier_power(anti_inst) as f64);
            carrier_power_ebonus = attacker.ebonuses.carrier_power as f64;
        }

        let calc_attack_power_params = || -> Option<AttackPowerParams> {
            let firepower = attacker.firepower()? as f64;
            let damage_mod = attacker.damage_state().common_power_mod();

            let formation_mod = ctx.formation_power_mod;
            let engagement_mod = ctx.engagement.modifier();

            let remaining_ammo_mod = attacker.remaining_ammo_mod();

            let basic = 4.0 + firepower;

            let a14 = formation_mod * engagement_mod * damage_mod;
            let b14 = carrier_power_ebonus;

            let mods_base = AttackPowerModifiers {
                a14,
                b14,
                ..Default::default()
            };

            let mods = mods_base + special_enemy_mods + self.external_power_mods.clone();

            let params = AttackPowerParams {
                basic,
                cap: SHELLING_SUPPORT_POWER_CAP,
                mods,
                ap_shell_mod: None,
                carrier_power,
                proficiency_critical_mod: None,
                remaining_ammo_mod,
                armor_penetration: 0.0,
            };

            Some(params)
        };

        let calc_accuracy_term = || -> Option<f64> {
            let basic_accuracy_term = attacker.basic_accuracy_term()?;
            let ship_accuracy = attacker.accuracy() as f64;
            let morale_mod = attacker.morale_state().common_accuracy_mod();
            let formation_mod = ctx.formation_accuracy_mod;

            // 乗算前に切り捨て
            let premultiplication = (basic_accuracy_term + ship_accuracy).floor();

            let result = (premultiplication * formation_mod * morale_mod).floor();

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
                critical_rate_constant: SHELLING_SUPPORT_CRITICAL_RATE_CONSTANT,
                critical_percentage_bonus: 0.0,
                hit_percentage_bonus: 0.0,
            })
        };

        let armor_penetration = 0.0;
        let defense_params = DefenseParams::from_target(&ctx.target_env, target, armor_penetration);

        AttackParams {
            attack_power_params: calc_attack_power_params(),
            hit_rate_params: calc_hit_rate_params(),
            defense_params: defense_params,
            is_cutin: false,
            hits: 1.0,
        }
    }
}
