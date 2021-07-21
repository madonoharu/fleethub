use crate::attack::hit_rate::{HitRate, HitRateParams};
use crate::damage::{DamageAttackerParams, DamageParams, DamageTargetParams};
use crate::types::DayCutin;
use crate::{
    attack::attack_power::{AttackPower, AttackPowerParams},
    utils::NumMap,
};

const SHELLING_POWER_CAP: i32 = 180;
const SHELLING_CRITICAL_RATE_MULTIPLIER: f64 = 1.3;

pub struct ShellingDef {
    pub attack_type: DayCutin,
    pub times: usize,
    pub denom: Option<u8>,
    pub sp_power_mod: f64,
    pub sp_accuracy_mod: f64,
}

struct ShellingPowerParams {
    firepower: f64,
    ibonus: f64,
    fleet_factor: f64,
    air_power: Option<f64>,
    health_modifier: f64,
    cruiser_fit_bonus: f64,
    ap_shell_modifier: Option<f64>,
    formation_modifier: f64,
    engagement_modifier: f64,
    special_attack_modifier: Option<f64>,
    special_enemy_modifiers: Option<f64>,
    proficiency_critical_modifier: Option<f64>,
}

impl ShellingPowerParams {
    fn to_attack_power_params(&self) -> AttackPowerParams {
        let basic = 5. + self.firepower + self.ibonus + self.fleet_factor;

        let a14 = Some(self.formation_modifier * self.engagement_modifier * self.health_modifier);
        let b14 = Some(self.cruiser_fit_bonus);
        let a11 = self.special_attack_modifier;

        AttackPowerParams {
            basic,
            cap: SHELLING_POWER_CAP,

            a12: None,
            b12: None,
            a13: None,
            b13: None,
            a13next: None,
            b13next: None,
            a14,
            b14,
            air_power: self.air_power,

            a11,
            b11: None,
            a5: None,
            b5: None,
            a6: None,
            b6: None,
            ap_shell_modifier: self.ap_shell_modifier,
            proficiency_critical_modifier: self.proficiency_critical_modifier,
        }
    }

    #[allow(dead_code)]
    fn calc(&self) -> AttackPower {
        self.to_attack_power_params().calc()
    }
}

struct ShellingAccuracyParams {
    fleet_factor: f64,
    basic_accuracy_term: f64,
    equipment_accuracy: f64,
    ibonus: f64,
    fit_gun_bonus: f64,
    morale_modifier: f64,
    formation_modifier: f64,
    ap_shell_modifier: f64,
    special_attack_modifier: f64,
}

impl ShellingAccuracyParams {
    fn calc(&self) -> i32 {
        let base =
            (self.fleet_factor + self.basic_accuracy_term + self.equipment_accuracy + self.ibonus)
                .floor();

        ((base * self.formation_modifier * self.morale_modifier + self.fit_gun_bonus)
            * self.special_attack_modifier
            * self.ap_shell_modifier)
            .floor() as i32
    }
}

struct ShellingHitRateParams {
    morale_modifier: f64,
    hit_rate_bonus: Option<f64>,
    critical_rate_bonus: Option<f64>,
}

struct ShellingParams {
    power: ShellingPowerParams,
    accuracy: ShellingAccuracyParams,
    hit_rate: ShellingHitRateParams,
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
    pub fn analyze(&self) -> NumMap<i32, f64> {
        let attack_power = self.power.calc();
        let accuracy_term = self.accuracy.calc();

        let hit_rate = HitRateParams {
            accuracy_term,
            evasion_term: 0,
            morale_mod: 1.,
            critical_rate_bonus: 0.,
            critical_rate_multiplier: SHELLING_CRITICAL_RATE_MULTIPLIER,
            hit_rate_bonus: 0.,
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

        DamageDistributionParams {
            attack_power,
            hit_rate,
            damage_target_params: damage_target_params,
        }
        .calc(current_hp, 2)
    }
}

struct ShellingAttack {
    params: ShellingParams,
}
