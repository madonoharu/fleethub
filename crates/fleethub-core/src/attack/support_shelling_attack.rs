#![allow(dead_code)]

use crate::{
    member::BattleMemberRef,
    types::{
        AttackPowerModifier, Engagement, FormationParams, NodeState, ShellingType,
        SupportShellingType,
    },
};

use super::{Attack, AttackParams, AttackPowerParams, DefenseParams, HitRateParams};

const SUPPORT_SHELLING_POWER_CAP: f64 = 170.0;
const SUPPORT_SHELLING_CRITICAL_RATE_CONSTANT: f64 = 1.0;
const SUPPORT_SHELLING_ACCURACY_CONSTANT: f64 = 64.0;

pub struct SupportShellingAttackParams<'a> {
    pub attack_type: SupportShellingType,
    pub attacker: &'a BattleMemberRef<'a>,
    pub target: &'a BattleMemberRef<'a>,
    pub engagement: Engagement,
    pub formation_params: FormationParams,
    pub node_state: NodeState,
}

impl SupportShellingAttackParams<'_> {
    pub fn to_attack(&self) -> Attack {
        self.calc_attack_params().into_attack()
    }

    pub fn calc_attack_params(&self) -> AttackParams {
        let defense_params = DefenseParams::from_target(self.target, self.target.side(), 0.0);

        AttackParams {
            attack_power_params: self.calc_attack_power_params(),
            hit_rate_params: self.calc_hit_rate_params(),
            defense_params,
            hits: 1.0,
        }
    }

    fn calc_attack_power_params(&self) -> Option<AttackPowerParams> {
        let attacker = self.attacker;
        let target = self.target;

        let mut aerial_power = None;
        let mut aerial_power_ebonus = 0.0;

        if self.attack_type.0 == ShellingType::Aerial {
            let anti_inst = target.is_installation();

            aerial_power = Some(attacker.aerial_power(anti_inst) as f64);
            aerial_power_ebonus = attacker.ebonuses.aerial_power as f64;
        }

        let firepower = attacker.firepower()? as f64;
        let damage_mod = attacker.damage_state().common_power_mod();

        let formation_mod = self.formation_params.power_mod;
        let engagement_mod = self.engagement.modifier();

        let remaining_ammo_mod = attacker.remaining_ammo_mod();

        let basic = 4.0 + firepower;

        let a14 = formation_mod * engagement_mod * damage_mod;
        let b14 = aerial_power_ebonus;

        let precap_mod = AttackPowerModifier::new(a14, b14);
        let postcap_mod = Default::default();

        let special_enemy_mods =
            attacker.special_enemy_mods(self.target.special_enemy_type(), self.attack_type.into());

        let params = AttackPowerParams {
            is_cutin: false,
            basic,
            cap: SUPPORT_SHELLING_POWER_CAP,
            precap_mod,
            postcap_mod,
            ap_shell_mod: None,
            aerial_power,
            proficiency_critical_mod: 1.0,
            remaining_ammo_mod,
            armor_penetration: 0.0,
            balloon_mod: 1.0,
            special_enemy_mods,
            historical_mod: Default::default(),
            custom_mods: attacker.custom_power_mods(),
        };

        Some(params)
    }

    fn calc_accuracy_term(&self) -> Option<f64> {
        let attacker = self.attacker;
        let target = self.target;
        let basic_accuracy_term = attacker.basic_accuracy_term()?;
        let gears_accuracy = attacker.gears.sum_by(|gear| gear.accuracy) as f64;
        let morale_mod = attacker.morale_state().common_accuracy_mod();
        let formation_mod = self.formation_params.accuracy_mod;

        // 警戒陣回避補正
        let vanguard_mod = if target.formation.is_vanguard() {
            if target.ship_type.is_destroyer() {
                let is_event = self.node_state.is_event();

                if is_event {
                    match target.position.index {
                        0 | 1 => 0.95,
                        2 | 3 => 0.66,
                        4 => 0.52,
                        5 => 0.48,
                        6 => 0.4,
                        _ => 1.0,
                    }
                } else {
                    match target.position.index {
                        0 | 1 => 0.95,
                        2 | 3 => 0.8,
                        4 => 0.69,
                        5 => 0.64,
                        6 => 0.64,
                        _ => 1.0,
                    }
                }
            } else {
                match target.position.index {
                    0..=3 => 0.95,
                    4 => 0.86,
                    5 => 0.8,
                    6 => 0.7,
                    _ => 1.0,
                }
            }
        } else {
            1.0
        };

        // 乗算前に切り捨て
        let multiplicand =
            ((SUPPORT_SHELLING_ACCURACY_CONSTANT + basic_accuracy_term + gears_accuracy).floor()
                * vanguard_mod)
                .floor();

        let accuracy_term = (multiplicand * formation_mod * morale_mod).floor();

        Some(accuracy_term)
    }

    fn calc_hit_rate_params(&self) -> Option<HitRateParams> {
        let target = self.target;
        let formation_mod = self.formation_params.target_evasion_mod;
        let evasion_term = target.evasion_term(formation_mod, 0.0, 1.0)?;
        let accuracy_term = self.calc_accuracy_term()?;

        Some(HitRateParams {
            accuracy_term,
            evasion_term,
            target_morale_mod: target.morale_state().hit_rate_mod(),
            critical_rate_constant: SUPPORT_SHELLING_CRITICAL_RATE_CONSTANT,
            critical_percentage_bonus: 0.0,
            hit_percentage_bonus: 0.0,
        })
    }
}
