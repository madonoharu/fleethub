use crate::attack::hit_rate::{HitRate, HitRateParams};
use crate::damage::{DamageAttackerParams, DamageParams, DamageTargetParams};
use crate::{
    attack::attack_power::{AttackPower, AttackPowerModifiers, AttackPowerParams},
    utils::NumMap,
};

const SHELLING_POWER_CAP: i32 = 180;
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

    pub air_power: Option<f64>,
    pub air_power_ebonus: Option<f64>,
    pub proficiency_critical_mod: Option<f64>,

    pub special_enemy_mods: AttackPowerModifiers,
}

impl ShellingPowerParams {
    fn to_attack_power_params(&self) -> Option<AttackPowerParams> {
        let basic = 5. + self.firepower? + self.ibonus + self.fleet_factor;

        let a14 = Some(self.formation_mod? * self.engagement_mod * self.damage_mod);
        let b14 = Some(self.cruiser_fit_bonus + self.air_power_ebonus.unwrap_or_default());
        let a11 = self.cutin_mod;

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
            air_power: self.air_power,
            proficiency_critical_mod: self.proficiency_critical_mod,
        };

        Some(params)
    }

    #[allow(dead_code)]
    fn calc(&self) -> Option<AttackPower> {
        self.to_attack_power_params().map(|params| params.calc())
    }
}

pub struct ShellingAccuracyParams {
    pub fleet_factor: f64,
    pub basic_accuracy_term: Option<f64>,
    pub equipment_accuracy: f64,
    pub ibonus: f64,
    pub fit_gun_bonus: f64,
    pub morale_mod: f64,
    pub formation_mod: Option<f64>,
    pub ap_shell_mod: Option<f64>,
    pub cutin_mod: Option<f64>,
}

impl ShellingAccuracyParams {
    fn calc(&self) -> Option<f64> {
        let base =
            (self.fleet_factor + self.basic_accuracy_term? + self.equipment_accuracy + self.ibonus)
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

pub struct ShellingParams {
    pub power: ShellingPowerParams,
    pub accuracy: ShellingAccuracyParams,
    pub hit_rate: ShellingHitRateParams,
}

struct DamageDistributionParams {
    attack_power: AttackPower,
    hit_rate: HitRate,
    damage_target_params: DamageTargetParams,
}

impl DamageDistributionParams {
    fn calc(&self, current_hp: i32, count: usize) -> NumMap<i32, f64> {
        let normal_damage_distribution = DamageParams {
            attacker: DamageAttackerParams {
                attack_term: self.attack_power.normal,
                armor_penetration: 0.,
                remaining_ammo_mod: 1.,
            },
            target: self.damage_target_params.clone(),
        }
        .to_distribution();

        let critical_damage_distribution = DamageParams {
            attacker: DamageAttackerParams {
                attack_term: self.attack_power.critical,
                armor_penetration: 0.,
                remaining_ammo_mod: 1.,
            },
            target: self.damage_target_params.clone(),
        }
        .to_distribution();

        let d1: NumMap<i32, f64> = normal_damage_distribution * self.hit_rate.normal
            + critical_damage_distribution * self.hit_rate.critical
            + [(0, 1. - self.hit_rate.total)].into();

        if count <= 1 {
            d1
        } else {
            d1.into_iter().fold(NumMap::new(), |d2, item| {
                let hp = current_hp - item.0;
                d2 + self.calc(hp, count - 1) * item.1
            })
        }
    }
}

impl ShellingParams {
    pub fn damage_distribution(&self) -> Option<NumMap<i32, f64>> {
        let attack_power = self.power.calc()?;
        let accuracy_term = self.accuracy.calc()?;
        let evasion_term = self.hit_rate.evasion_term?;

        let hit_rate = HitRateParams {
            accuracy_term,
            evasion_term,
            morale_mod: self.hit_rate.morale_mod,
            critical_rate_multiplier: SHELLING_CRITICAL_RATE_MULTIPLIER,
            critical_percent_bonus: self.hit_rate.critical_percent_bonus,
            hit_percent_bonus: self.hit_rate.hit_percent_bonus,
        }
        .calc();

        let current_hp = 0;

        let damage_target_params = DamageTargetParams {
            armor: 0,
            ibonus: 0.,
            max_hp: 0,
            current_hp,
            overkill_protection: false,
            sinkable: false,
        };

        let map = DamageDistributionParams {
            attack_power,
            hit_rate,
            damage_target_params: damage_target_params,
        }
        .calc(current_hp, 2);

        Some(map)
    }
}

struct ShellingAttack {
    params: ShellingParams,
}
