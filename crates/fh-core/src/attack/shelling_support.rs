use crate::{
    types::{BattleConfig, Engagement, FormationDef},
    Ship,
};

use super::{
    special_enemy_mods::shelling_support_special_enemy_modifiers, AttackParams,
    AttackPowerModifiers, AttackPowerParams, DefenseParams, HitRateParams, ShellingAttackType,
    WarfareContext,
};

const SHELLING_SUPPORT_POWER_CAP: f64 = 170.0;
const SHELLING_SUPPORT_CRITICAL_RATE_CONSTANT: f64 = 1.0;
const SHELLING_SUPPORT_ACCURACY_CONSTANT: f64 = 64.0;

pub struct ShellingSupportAttackParams<'a> {
    pub attacker: &'a Ship,
    pub target: &'a Ship,
    pub attack_type: ShellingAttackType,
    pub engagement: Engagement,
    pub attacker_formation_def: &'a FormationDef,
    pub target_formation_def: &'a FormationDef,
    pub external_power_mods: AttackPowerModifiers,
    pub defense_params: Option<DefenseParams>,
}

impl<'a> ShellingSupportAttackParams<'a> {
    pub fn into_attack_params(self) -> AttackParams {
        let Self {
            attacker,
            target,
            attack_type,
            engagement,
            attacker_formation_def,
            target_formation_def,
            external_power_mods,
            defense_params,
        } = self;

        let attacker_formation_power_mod = attacker_formation_def
            .shelling_support
            .power_mod
            .unwrap_or(1.0);
        let attacker_formation_accuracy_mod = if attacker_formation_def
            .tag
            .is_ineffective(target_formation_def.tag)
        {
            1.0
        } else {
            attacker_formation_def
                .shelling_support
                .accuracy_mod
                .unwrap_or(1.0)
        };
        let target_formation_evasion_mod = target_formation_def
            .shelling_support
            .evasion_mod
            .unwrap_or(1.0);

        let special_enemy_mods =
            shelling_support_special_enemy_modifiers(attacker, target.special_enemy_type());

        let mut carrier_power = None;
        let mut carrier_power_ebonus = 0.0;

        if attack_type == ShellingAttackType::Carrier {
            let anti_inst = target.is_installation();

            carrier_power = Some(attacker.carrier_power(anti_inst) as f64);
            carrier_power_ebonus = attacker.ebonuses.carrier_power as f64;
        }

        let calc_attack_power_params = || -> Option<AttackPowerParams> {
            let firepower = attacker.firepower()? as f64;
            let damage_mod = attacker.damage_state().common_power_mod();

            let formation_mod = attacker_formation_power_mod;
            let engagement_mod = engagement.modifier();

            let remaining_ammo_mod = attacker.remaining_ammo_mod();

            let basic = 4.0 + firepower;

            let a14 = formation_mod * engagement_mod * damage_mod;
            let b14 = carrier_power_ebonus;

            let mods_base = AttackPowerModifiers {
                a14,
                b14,
                ..Default::default()
            };

            let mods = mods_base + special_enemy_mods + external_power_mods;

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
            let formation_mod = attacker_formation_accuracy_mod;

            // 乗算前に切り捨て
            let premultiplication =
                (SHELLING_SUPPORT_ACCURACY_CONSTANT + basic_accuracy_term + ship_accuracy).floor();

            let result = (premultiplication * formation_mod * morale_mod).floor();

            Some(result)
        };

        let calc_hit_rate_params = || {
            let formation_mod = target_formation_evasion_mod;
            let evasion_term = target.evasion_term(formation_mod, 0.0, 1.0)?;

            let accuracy_term = calc_accuracy_term()?;

            Some(HitRateParams {
                accuracy_term,
                evasion_term,
                target_morale_mod: target.morale_state().hit_rate_mod(),
                critical_rate_constant: SHELLING_SUPPORT_CRITICAL_RATE_CONSTANT,
                critical_percentage_bonus: 0.0,
                hit_percentage_bonus: 0.0,
            })
        };

        AttackParams {
            attack_power_params: calc_attack_power_params(),
            hit_rate_params: calc_hit_rate_params(),
            defense_params,
            is_cutin: false,
            hits: 1.0,
        }
    }
}

pub struct ShellingSupportAttackContext<'a> {
    config: &'a BattleConfig,
    warfare_context: &'a WarfareContext,
    attack_type: ShellingAttackType,
}

impl<'a> ShellingSupportAttackContext<'a> {
    fn support_attack_params(
        &self,
        attacker: &'a Ship,
        target: &'a Ship,
    ) -> ShellingSupportAttackParams<'a> {
        let attacker_env = &self.warfare_context.attacker_env;
        let target_env = &self.warfare_context.target_env;
        let attacker_formation_def = self.config.get_formation_def_by_env(attacker_env);
        let target_formation_def = self.config.get_formation_def_by_env(target_env);

        let external_power_mods = self.warfare_context.external_power_mods.clone();

        let armor_penetration = 0.0;
        let defense_params =
            DefenseParams::from_target(target, target_env.org_type.side(), armor_penetration);

        ShellingSupportAttackParams {
            attacker,
            target,
            attack_type: self.attack_type,
            engagement: self.warfare_context.engagement,
            attacker_formation_def,
            target_formation_def,
            external_power_mods,
            defense_params,
        }
    }

    pub fn new(
        config: &'a BattleConfig,
        warfare_context: &'a WarfareContext,
        attack_type: ShellingAttackType,
    ) -> Self {
        Self {
            config,
            warfare_context,
            attack_type,
        }
    }

    pub fn attack_params(&self, attacker: &Ship, target: &Ship) -> AttackParams {
        self.support_attack_params(attacker, target)
            .into_attack_params()
    }
}
