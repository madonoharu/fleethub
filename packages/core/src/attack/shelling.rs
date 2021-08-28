use crate::{
    attack::{AttackPower, AttackPowerModifiers, AttackPowerParams, HitRateParams},
    ship::Ship,
};

use super::context::ShellingContext;
use super::special_enemy_mods::special_enemy_modifiers;
use super::{fit_gun_bonus, fleet_factor};

const SHELLING_POWER_CAP: i32 = 220;
const SHELLING_CRITICAL_RATE_MULTIPLIER: f64 = 1.3;

pub struct ProficiencyModifiers {
    pub hit_percent_bonus: f64,
    pub critical_power_mod: f64,
    pub critical_percent_bonus: f64,
}

impl Default for ProficiencyModifiers {
    fn default() -> Self {
        Self {
            hit_percent_bonus: 0.0,
            critical_power_mod: 1.0,
            critical_percent_bonus: 0.0,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ShellingPowerParams {
    pub firepower: Option<f64>,
    pub ibonus: f64,
    pub fleet_factor: f64,
    pub damage_mod: f64,
    pub cruiser_fit_bonus: f64,
    pub ap_shell_mod: Option<f64>,
    pub formation_mod: Option<f64>,
    pub engagement_mod: f64,
    pub cutin_mod: Option<f64>,

    pub carrier_power: Option<f64>,
    pub carrier_power_ebonus: Option<f64>,
    pub proficiency_critical_mod: Option<f64>,

    pub special_enemy_mods: AttackPowerModifiers,

    pub armor_penetration: f64,
    pub remaining_ammo_mod: f64,
}

impl ShellingPowerParams {
    fn to_attack_power_params(&self) -> Option<AttackPowerParams> {
        let basic = 5. + self.firepower? + self.ibonus + self.fleet_factor;

        let a14 = self.formation_mod? * self.engagement_mod * self.damage_mod;
        let b14 = self.cruiser_fit_bonus + self.carrier_power_ebonus.unwrap_or_default();
        let a11 = self.cutin_mod.unwrap_or(1.0);

        let mods_base = AttackPowerModifiers {
            a14,
            b14,
            a11,
            ..Default::default()
        };

        let params = AttackPowerParams {
            basic,
            cap: SHELLING_POWER_CAP,
            mods: mods_base + self.special_enemy_mods.clone(),
            ap_shell_mod: self.ap_shell_mod,
            carrier_power: self.carrier_power,
            proficiency_critical_mod: self.proficiency_critical_mod,
            armor_penetration: self.armor_penetration,
            remaining_ammo_mod: self.remaining_ammo_mod,
        };

        Some(params)
    }
}

#[derive(Debug)]
pub struct ShellingAccuracyParams {
    pub fleet_factor: f64,
    pub basic_accuracy_term: Option<f64>,
    pub ship_accuracy: f64,
    pub ibonus: f64,
    pub fit_gun_bonus: f64,
    pub morale_mod: f64,
    pub formation_mod: Option<f64>,
    pub ap_shell_mod: Option<f64>,
    pub cutin_mod: Option<f64>,
}

impl ShellingAccuracyParams {
    fn calc(&self) -> Option<f64> {
        // 乗算補正前に切り捨て
        let base =
            (self.fleet_factor + self.basic_accuracy_term? + self.ship_accuracy + self.ibonus)
                .floor();

        let result = ((base * self.formation_mod? * self.morale_mod + self.fit_gun_bonus)
            * self.cutin_mod.unwrap_or(1.0)
            * self.ap_shell_mod.unwrap_or(1.0))
        .floor();

        Some(result)
    }
}

#[derive(Debug, Default, Clone)]
pub struct ShellingHitRateParams {
    pub evasion_term: Option<f64>,
    pub morale_mod: f64,
    pub hit_percent_bonus: f64,
    pub critical_percent_bonus: f64,
}

#[derive(Debug)]
pub struct ShellingParams {
    pub power: ShellingPowerParams,
    pub accuracy: ShellingAccuracyParams,
    pub hit_rate: ShellingHitRateParams,
}

impl ShellingParams {
    pub fn new(context: &ShellingContext, attacker: &Ship, target: &Ship) -> Self {
        let is_day = true;

        let fleet_power_factor = fleet_factor::find_shelling_power_factor(
            context.attacker.org_type,
            context.target.org_type,
            context.attacker.role,
        );

        let ap_shell_mods = target
            .is_heavily_armored_ship()
            .then(|| attacker.get_ap_shell_modifiers());

        let attacker_formation_mods = context.attacker_formation_mods();

        let engagement_mod = context.engagement.modifier();
        let cutin_def = context.cutin_def();

        let special_enemy_mods =
            special_enemy_modifiers(attacker, target.special_enemy_type(), is_day);

        let power_params_base = ShellingPowerParams {
            firepower: attacker.firepower().map(|v| v as f64),
            ibonus: attacker.gears.sum_by(|gear| gear.ibonuses.shelling_power),
            fleet_factor: fleet_power_factor as f64,
            damage_mod: attacker.damage_state().common_power_mod(),
            cruiser_fit_bonus: attacker.cruiser_fit_bonus(),
            ap_shell_mod: ap_shell_mods.map(|mods| mods.0),
            formation_mod: attacker_formation_mods
                .as_ref()
                .and_then(|mods| mods.power_mod),
            engagement_mod,
            cutin_mod: cutin_def.and_then(|def| def.power_mod),

            special_enemy_mods,

            carrier_power: None,
            carrier_power_ebonus: None,
            proficiency_critical_mod: None,

            armor_penetration: 0.0,
            remaining_ammo_mod: attacker.remaining_ammo_mod(),
        };

        let accuracy_params = ShellingAccuracyParams {
            fleet_factor: fleet_factor::find_shelling_accuracy_factor(
                context.attacker.org_type,
                context.attacker.role,
            ) as f64,
            basic_accuracy_term: attacker.basic_accuracy_term(),
            ship_accuracy: attacker.accuracy() as f64,
            ibonus: attacker
                .gears
                .sum_by(|gear| gear.ibonuses.shelling_accuracy),
            fit_gun_bonus: fit_gun_bonus::fit_gun_bonus(attacker, !is_day),
            morale_mod: attacker.morale_state().common_accuracy_mod(),
            formation_mod: attacker_formation_mods.and_then(|mods| mods.accuracy_mod),
            ap_shell_mod: ap_shell_mods.map(|mods| mods.1),
            cutin_mod: cutin_def.and_then(|def| def.accuracy_mod),
        };

        let hit_rate_params_base = {
            let target_formation_mods = context.target_formation_mods();
            let target_formation_mod = target_formation_mods
                .and_then(|mods| mods.evasion_mod)
                .unwrap_or(1.0);

            let evasion_term =
                target.evasion_term(target_formation_mod, target.remaining_fuel_mod());

            ShellingHitRateParams {
                morale_mod: target.morale_state().evasion_mod(),
                evasion_term,
                critical_percent_bonus: 0.0,
                hit_percent_bonus: 0.0,
            }
        };

        if attacker.is_carrier_like() {
            let anti_installation = target.is_installation();

            let carrier_power = Some(attacker.carrier_power(anti_installation) as f64);
            let carrier_power_ebonus = Some(attacker.ebonuses.carrier_power as f64);
            let proficiency_mods = attacker.proficiency_modifiers(context.cutin);

            let power_params = ShellingPowerParams {
                carrier_power,
                carrier_power_ebonus,
                proficiency_critical_mod: Some(proficiency_mods.critical_power_mod),

                ..power_params_base
            };

            let hit_rate_params = ShellingHitRateParams {
                hit_percent_bonus: proficiency_mods.hit_percent_bonus,
                critical_percent_bonus: proficiency_mods.critical_percent_bonus,
                ..hit_rate_params_base
            };

            Self {
                power: power_params,
                accuracy: accuracy_params,
                hit_rate: hit_rate_params,
            }
        } else {
            Self {
                power: power_params_base,
                accuracy: accuracy_params,
                hit_rate: hit_rate_params_base,
            }
        }
    }

    pub fn to_attack_power_params(&self) -> Option<AttackPowerParams> {
        self.power.to_attack_power_params()
    }

    pub fn attack_power(&self) -> Option<AttackPower> {
        self.to_attack_power_params().map(|params| params.calc())
    }

    pub fn accuracy_term(&self) -> Option<f64> {
        self.accuracy.calc()
    }

    pub fn hit_rate_params(&self) -> Option<HitRateParams> {
        let accuracy_term = self.accuracy_term()?;
        let evasion_term = self.hit_rate.evasion_term?;

        Some(HitRateParams {
            accuracy_term,
            evasion_term,
            morale_mod: self.hit_rate.morale_mod,
            critical_rate_multiplier: SHELLING_CRITICAL_RATE_MULTIPLIER,
            critical_percent_bonus: self.hit_rate.critical_percent_bonus,
            hit_percent_bonus: self.hit_rate.hit_percent_bonus,
        })
    }
}
