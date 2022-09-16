use crate::{
    member::BattleMemberRef,
    types::{
        AttackPowerModifier, Engagement, FleetFactors, FormationParams, HistoricalParams,
        TorpedoAttackType,
    },
};

use super::{
    anti_pt_imp_modifiers::AntiPtImpAccuracyModifiers, Attack, AttackParams, AttackPowerParams,
    DefenseParams, HitRateParams, SpecialEnemyModifiers,
};

const TORPEDO_POWER_CAP: f64 = 180.0;
const TORPEDO_CRITICAL_RATE_CONSTANT: f64 = 1.5;

pub struct TorpedoAttackParams<'a> {
    pub attacker: &'a BattleMemberRef<'a>,
    pub target: &'a BattleMemberRef<'a>,
    pub engagement: Engagement,
    pub formation_params: FormationParams,
    pub historical_params: HistoricalParams,
}

impl TorpedoAttackParams<'_> {
    pub fn to_attack(&self) -> Attack {
        self.calc_attack_params().into_attack()
    }

    pub fn calc_attack_params(&self) -> AttackParams {
        let fleet_factors =
            FleetFactors::for_torpedo(self.attacker.position, self.target.position).ok();

        let attack_power_params = self.calc_attack_power_params(fleet_factors);
        let normal_attack_power = attack_power_params.as_ref().map(|p| p.calc().normal);
        let armor_penetration = attack_power_params
            .as_ref()
            .map(|p| p.armor_penetration)
            .unwrap_or_default();

        let hit_rate_params = self.calc_hit_rate_params(fleet_factors, normal_attack_power);

        let defense_params =
            DefenseParams::from_target(self.target, self.target.side(), armor_penetration);

        AttackParams {
            attack_power_params,
            hit_rate_params,
            defense_params,
            hits: 1.0,
            is_cutin: false,
        }
    }

    fn calc_attack_power_params(
        &self,
        fleet_factors: Option<FleetFactors>,
    ) -> Option<AttackPowerParams> {
        let attacker = self.attacker;

        let fleet_factor = fleet_factors?.power as f64;
        let torpedo = attacker.torpedo()? as f64;
        let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.torpedo_power);
        // 基本攻撃力の定数 5.0 は`fleet_factor`に含まれている
        let basic = fleet_factor + torpedo + ibonus;

        let damage_mod = attacker.damage_state().torpedo_power_mod();
        let a14 = self.formation_params.power_mod * self.engagement.modifier() * damage_mod;

        let precap_mod = AttackPowerModifier::new(a14, 0.0);
        let postcap_mod = Default::default();

        // todo!
        let mut special_enemy_mods = SpecialEnemyModifiers::default();
        if self.target.is_pt_imp() {
            special_enemy_mods.precap_general_mod.merge(0.35, 15.0);
        }

        Some(AttackPowerParams {
            basic,
            cap: TORPEDO_POWER_CAP,
            precap_mod,
            postcap_mod,
            ap_shell_mod: None,
            aerial_power: None,
            proficiency_critical_mod: 1.0,
            armor_penetration: 0.0,
            remaining_ammo_mod: attacker.remaining_ammo_mod(),
            special_enemy_mods,
            historical_mod: self.historical_params.power_mod,
            custom_mods: attacker.custom_power_mods(),
        })
    }

    fn calc_accuracy_term(
        &self,
        fleet_factors: Option<FleetFactors>,
        normal_attack_power: Option<f64>,
    ) -> Option<f64> {
        let attacker = self.attacker;
        let target = self.target;

        let fleet_factor = fleet_factors?.accuracy as f64;
        let basic_accuracy_term = attacker.basic_accuracy_term()?;
        let equipment_accuracy = attacker.gears.sum_by(|gear| gear.accuracy) as f64;
        let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.torpedo_accuracy);
        let attack_power_mod = (normal_attack_power? * 0.2).floor();
        let innate_torpedo_accuracy = attacker.innate_torpedo_accuracy();

        let formation_mod = self.formation_params.accuracy_mod;
        let morale_mod = attacker.morale_state().torpedo_accuracy_mod();
        let pt_mods = AntiPtImpAccuracyModifiers::new(attacker, target, TorpedoAttackType);
        let historical_mod = self.historical_params.accuracy_mod;

        // 乗算前に切り捨て
        let multiplicand = (fleet_factor
            + basic_accuracy_term
            + equipment_accuracy
            + ibonus
            + attack_power_mod
            + innate_torpedo_accuracy)
            .floor();

        let post_formation_mod =
            (multiplicand * formation_mod * morale_mod * pt_mods.multiplicative + pt_mods.additive)
                .floor();

        // 史実補正の位置どこ？
        let accuracy_term = (post_formation_mod * historical_mod).floor();

        Some(accuracy_term)
    }

    fn calc_hit_rate_params(
        &self,
        fleet_factors: Option<FleetFactors>,
        normal_attack_power: Option<f64>,
    ) -> Option<HitRateParams> {
        let target = self.target;

        let accuracy_term = self.calc_accuracy_term(fleet_factors, normal_attack_power)?;
        let formation_mod = self.formation_params.target_evasion_mod;
        let ibonus = target.gears.sum_by(|gear| gear.ibonuses.torpedo_evasion);
        let historical_mod = self.historical_params.target_evasion_mod;
        let evasion_term = target.evasion_term(formation_mod, ibonus, historical_mod)?;

        Some(HitRateParams {
            accuracy_term,
            evasion_term,
            target_morale_mod: target.morale_state().hit_rate_mod(),
            critical_rate_constant: TORPEDO_CRITICAL_RATE_CONSTANT,
            critical_percentage_bonus: 0.0,
            hit_percentage_bonus: 0.0,
        })
    }
}
