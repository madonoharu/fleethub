use crate::{
    member::BattleMemberRef,
    types::{
        AttackPowerModifier, Engagement, FleetFactors, FormationParams, ShellingStyle,
        ShellingType, Time,
    },
};

use super::{Attack, AttackParams, AttackPowerParams, DefenseParams, HitRateParams};

const IS_DAY: bool = true;
const SHELLING_POWER_CAP: f64 = 220.0;
const SHELLING_CRITICAL_RATE_CONSTANT: f64 = 1.3;

pub struct ShellingAttackParams<'a> {
    pub style: ShellingStyle,
    pub attacker: &'a BattleMemberRef<'a>,
    pub target: &'a BattleMemberRef<'a>,
    pub engagement: Engagement,
    pub formation_params: FormationParams,
}

impl ShellingAttackParams<'_> {
    pub fn calc_attack_params(&self) -> AttackParams {
        let &Self {
            attacker,
            target,
            engagement,
            formation_params,
            ..
        } = self;

        let style = &self.style;
        let fleet_factors = FleetFactors::for_shelling(attacker.position, target.position).ok();
        let target_side = target.side();

        let ap_shell_mods = target
            .is_heavily_armored_ship()
            .then(|| attacker.get_ap_shell_modifiers());

        let special_enemy_mods =
            attacker.special_enemy_mods(target.special_enemy_type(), Time::Day);

        let mut carrier_power = None;
        let mut carrier_power_ebonus = 0.0;
        let mut proficiency_mods = None;
        let mut carrier_shelling_power_ibonus = 0.0;

        if style.attack_type == ShellingType::Carrier {
            let day_cutin = style.as_day_cutin();
            let anti_inst = target.is_installation();

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
            let fleet_factor = fleet_factors?.power as f64;
            let damage_mod = attacker.damage_state().common_power_mod();
            let cruiser_fit_bonus = attacker.cruiser_fit_bonus();

            let formation_mod = formation_params.power_mod;
            let engagement_mod = engagement.modifier();
            let cutin_mod = style.power_mod;

            let proficiency_critical_mod = proficiency_mods
                .as_ref()
                .map_or(1.0, |mods| mods.critical_power_mod);
            let remaining_ammo_mod = attacker.remaining_ammo_mod();

            // 基本攻撃力の定数 5.0 は`fleet_factor`に含まれている
            let basic = fleet_factor + firepower + ibonus + carrier_shelling_power_ibonus;

            let a14 = formation_mod * engagement_mod * damage_mod;
            let b14 = cruiser_fit_bonus + carrier_power_ebonus;
            let a11 = cutin_mod;

            let precap_mod = AttackPowerModifier::new(a14, b14);
            let postcap_mod = AttackPowerModifier::new(a11, 0.0);

            let custom_mods = attacker.custom_power_mods();

            let params = AttackPowerParams {
                basic,
                cap: SHELLING_POWER_CAP,
                precap_mod,
                postcap_mod,
                ap_shell_mod: ap_shell_mods.map(|mods| mods.0),
                carrier_power,
                proficiency_critical_mod,
                remaining_ammo_mod,
                armor_penetration: 0.0,
                special_enemy_mods,
                custom_mods,
            };

            Some(params)
        };

        let calc_accuracy_term = || -> Option<f64> {
            let fleet_factor = fleet_factors?.accuracy as f64;

            let basic_accuracy_term = attacker.basic_accuracy_term()?;
            let ship_accuracy = attacker.accuracy() as f64;
            let ibonus = attacker
                .gears
                .sum_by(|gear| gear.ibonuses.shelling_accuracy);
            let gunfit_accuracy = attacker.gunfit_accuracy(!IS_DAY);
            let morale_mod = attacker.morale_state().common_accuracy_mod();
            let formation_mod = formation_params.accuracy_mod;
            let ap_shell_mod = ap_shell_mods.map(|mods| mods.1).unwrap_or(1.0);
            let cutin_mod = style.accuracy_mod;

            // 乗算前に切り捨て
            let pre_multiplication =
                (fleet_factor + basic_accuracy_term + ship_accuracy + ibonus).floor();

            let result = ((pre_multiplication * formation_mod * morale_mod + gunfit_accuracy)
                * cutin_mod
                * ap_shell_mod)
                .floor();

            Some(result)
        };

        let calc_hit_rate_params = || {
            let formation_mod = formation_params.target_evasion_mod;
            let evasion_term = target.evasion_term(formation_mod, 0.0, 1.0)?;

            let accuracy_term = calc_accuracy_term()?;

            Some(HitRateParams {
                accuracy_term,
                evasion_term,
                target_morale_mod: target.morale_state().hit_rate_mod(),
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
        let defense_params = DefenseParams::from_target(target, target_side, armor_penetration);

        AttackParams {
            attack_power_params: calc_attack_power_params(),
            hit_rate_params: calc_hit_rate_params(),
            defense_params,
            is_cutin: style.is_cutin(),
            hits: style.hits,
        }
    }

    pub fn to_attack(&self) -> Attack {
        self.calc_attack_params().into_attack()
    }
}
