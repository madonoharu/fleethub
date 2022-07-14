use crate::{
    ship::Ship,
    types::{AirState, AttackPowerModifier, BattleDefinitions, Engagement, ShipEnvironment},
};

use super::{
    fleet_factor::{self, ShipPosition},
    AttackParams, AttackPowerParams, DefenseParams, HitRateParams, WarfareContext,
};

const TORPEDO_POWER_CAP: f64 = 180.0;
const TORPEDO_CRITICAL_RATE_CONSTANT: f64 = 1.5;

pub struct TorpedoAttackContext<'a> {
    pub attacker_env: &'a ShipEnvironment,
    pub target_env: &'a ShipEnvironment,
    pub engagement: Engagement,
    pub air_state: AirState,

    pub formation_power_mod: f64,
    pub formation_accuracy_mod: f64,
    pub target_formation_evasion_mod: f64,
}

impl<'a> TorpedoAttackContext<'a> {
    pub fn new(config: &BattleDefinitions, warfare_context: &'a WarfareContext) -> Self {
        let attacker_env = &warfare_context.attacker_env;
        let target_env = &warfare_context.target_env;

        let attacker_formation_def = config.get_formation_def_by_env(attacker_env);
        let target_formation_def = config.get_formation_def_by_env(target_env);

        let formation_power_mod = attacker_formation_def.torpedo.power_mod.unwrap_or(1.0);
        let formation_accuracy_mod = attacker_formation_def.torpedo.accuracy_mod.unwrap_or(1.0);
        let target_formation_evasion_mod = target_formation_def.torpedo.evasion_mod.unwrap_or(1.0);

        Self {
            attacker_env,
            target_env,
            air_state: warfare_context.air_state,
            engagement: warfare_context.engagement,
            formation_power_mod,
            formation_accuracy_mod,
            target_formation_evasion_mod,
        }
    }

    fn attack_power_params(&self, attacker: &Ship, fleet_factor: f64) -> Option<AttackPowerParams> {
        let torpedo = attacker.torpedo()? as f64;
        let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.torpedo_power);

        let basic = torpedo + ibonus + fleet_factor;

        let damage_mod = attacker.damage_state().torpedo_power_mod();
        let a14 = self.formation_power_mod * self.engagement.modifier() * damage_mod;

        let precap_mod = AttackPowerModifier::new(a14, 0.0);
        let postcap_mod = Default::default();

        Some(AttackPowerParams {
            basic,
            cap: TORPEDO_POWER_CAP,
            precap_mod,
            postcap_mod,
            remaining_ammo_mod: attacker.remaining_ammo_mod(),
            ap_shell_mod: None,
            carrier_power: None,
            proficiency_critical_mod: None,
            armor_penetration: 0.0,
            special_enemy_mods: Default::default(),
            custom_mods: attacker.custom_power_mods(),
        })
    }

    pub fn attack_params(&self, attacker: &Ship, target: &Ship) -> AttackParams {
        let attacker_side = self.attacker_env.org_type.side();
        let (player_position, enemy_position) = if self.attacker_env.org_type.is_player() {
            (
                ShipPosition::from(self.attacker_env),
                ShipPosition::from(self.target_env),
            )
        } else {
            (
                ShipPosition::from(self.target_env),
                ShipPosition::from(self.attacker_env),
            )
        };

        let power_fleet_factor =
            fleet_factor::get_torpedo_power_factor(player_position, enemy_position) as f64;
        let accuracy_fleet_factor = fleet_factor::get_torpedo_accuracy_factor(
            player_position,
            enemy_position,
            attacker_side,
        ) as f64;

        let attack_power_params = self.attack_power_params(attacker, power_fleet_factor);
        let normal_attack_power = attack_power_params.as_ref().map(|p| p.calc().normal);

        let calc_accuracy_term = || {
            let basic_accuracy_term = attacker.basic_accuracy_term()?;
            let equipment_accuracy = attacker.gears.sum_by(|gear| gear.accuracy) as f64;
            let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.torpedo_accuracy);
            let attack_power_mod = (normal_attack_power? * 0.2).floor();
            let innate_torpedo_accuracy = attacker.innate_torpedo_accuracy();

            let formation_mod = self.formation_accuracy_mod;
            let morale_mod = attacker.morale_state().torpedo_accuracy_mod();

            // 乗算前に切り捨て
            let pre_multiplication = (accuracy_fleet_factor
                + basic_accuracy_term
                + equipment_accuracy
                + ibonus
                + attack_power_mod
                + innate_torpedo_accuracy)
                .floor();

            let accuracy_term = (pre_multiplication * formation_mod * morale_mod).floor();
            Some(accuracy_term)
        };

        let calc_hit_rate_params = || {
            let accuracy_term = calc_accuracy_term()?;

            let ibonus = target.gears.sum_by(|gear| gear.ibonuses.torpedo_evasion);
            let evasion_term =
                target.evasion_term(self.target_formation_evasion_mod, ibonus, 1.0)?;

            Some(HitRateParams {
                accuracy_term,
                evasion_term,
                target_morale_mod: target.morale_state().hit_rate_mod(),
                critical_rate_constant: TORPEDO_CRITICAL_RATE_CONSTANT,
                critical_percentage_bonus: 0.0,
                hit_percentage_bonus: 0.0,
            })
        };

        let armor_penetration = attack_power_params
            .as_ref()
            .map(|p| p.armor_penetration)
            .unwrap_or_default();

        AttackParams {
            attack_power_params,
            hit_rate_params: calc_hit_rate_params(),
            defense_params: DefenseParams::from_target(
                target,
                self.target_env.org_type.side(),
                armor_penetration,
            ),
            hits: 1.0,
            is_cutin: false,
        }
    }
}
