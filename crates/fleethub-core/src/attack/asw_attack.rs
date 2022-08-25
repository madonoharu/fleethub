use crate::{
    member::BattleMemberRef,
    types::{
        matches_gear_id, AswAttackStyle, AswAttackType, AswPhase, AttackPowerModifier, Engagement,
        FormationParams, GearAttr, GearType, ShipType,
    },
};

use super::{Attack, AttackParams, AttackPowerParams, DefenseParams, HitRateParams};

const ASW_POWER_CAP: f64 = 170.0;
const ASW_ACCURACY_CONSTANT: f64 = 80.0;
const ASW_CRITICAL_RATE_CONSTANT: f64 = 1.1;

pub struct AswAttackParams<'a> {
    pub style: AswAttackStyle,
    pub phase: AswPhase,
    pub attacker: &'a BattleMemberRef<'a>,
    pub target: &'a BattleMemberRef<'a>,
    pub engagement: Engagement,
    pub formation_params: FormationParams,
}

impl AswAttackParams<'_> {
    pub fn calc_attack_params(&self) -> AttackParams {
        let &Self {
            style,
            phase,
            attacker,
            target,
            engagement,
            formation_params,
        } = self;

        let attacker_side = attacker.side();
        let target_side = !attacker_side;
        let attack_type = style.attack_type;

        let proficiency_mods = if attack_type == AswAttackType::DepthCharge
            || phase.is_opening()
            || matches!(
                attacker.ship_type,
                ShipType::CV | ShipType::CVB | ShipType::AO
            ) {
            None
        } else {
            Some(attacker.proficiency_modifiers(None))
        };

        let armor_penetration = attacker.asw_armor_penetration();

        let calc_attack_power_params = || -> Option<AttackPowerParams> {
            let naked_asw = attacker.naked_asw()? as f64;

            let equip_asw = attacker.gears.sum_by(|gear| {
                if gear.has_attr(GearAttr::AntiSubWeapon) {
                    gear.asw
                } else {
                    0
                }
            }) as f64;

            let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.asw_power);
            let ebonus = attacker.ebonuses.asw as f64;
            let asw_attack_type_constant = attack_type.type_constant();

            let basic = naked_asw.sqrt() * 2.0
                + (equip_asw + ebonus) * 1.5
                + ibonus
                + asw_attack_type_constant;

            let formation_mod = formation_params.power_mod;
            let engagement_mod = engagement.modifier();
            let damage_mod = attacker.damage_state().common_power_mod();
            let asw_synergy_mod = attacker.asw_synergy_mod();

            let a14 = damage_mod * formation_mod * engagement_mod * asw_synergy_mod;

            let precap_mod = AttackPowerModifier::new(a14, 0.0);

            let proficiency_critical_mod = proficiency_mods
                .as_ref()
                .map_or(1.0, |mods| mods.critical_power_mod);

            Some(AttackPowerParams {
                basic,
                cap: ASW_POWER_CAP,
                precap_mod,
                postcap_mod: Default::default(),
                proficiency_critical_mod,
                armor_penetration,
                remaining_ammo_mod: attacker.remaining_ammo_mod(),
                ap_shell_mod: None,
                carrier_power: None,
                special_enemy_mods: Default::default(),
                custom_mods: attacker.custom_power_mods(),
            })
        };

        let calc_accuracy_term = || {
            let basic_accuracy_term = attacker.basic_accuracy_term()?;

            // 爆雷命中補正
            // 九五式爆雷 二式爆雷
            // https://twitter.com/kankenRJ/status/944494853580210177
            //
            // 対潜の単純合計ではない
            // https://twitter.com/shiro_sh39/status/1514416400227479552
            //
            // Hedgehog(初期型)は無し
            // https://twitter.com/panmodoki10/status/1522507740274651136
            // 暫定 4 * 個数
            let asw_equipment_mod = attacker.gears.sum_by(|gear| {
                if gear.gear_type == GearType::Sonar {
                    2.0 * (gear.asw as f64)
                } else if matches_gear_id!(gear.gear_id, "九五式爆雷" | "二式爆雷") {
                    4.0
                } else {
                    0.0
                }
            });

            let ibonus = attacker.gears.sum_by(|gear| gear.ibonuses.asw_accuracy);

            let formation_mod = formation_params.accuracy_mod;
            let morale_mod = attacker.morale_state().common_accuracy_mod();

            // 乗算前に切り捨て
            let pre_multiplication =
                (ASW_ACCURACY_CONSTANT + basic_accuracy_term + asw_equipment_mod + ibonus).floor();

            Some(pre_multiplication * formation_mod * morale_mod)
        };

        let calc_hit_rate_params = || {
            let accuracy_term = calc_accuracy_term()?;
            let evasion_term =
                target.evasion_term(formation_params.target_evasion_mod, 0.0, 1.0)?;

            let hit_percentage_bonus = proficiency_mods
                .as_ref()
                .map(|mods| mods.hit_percentage_bonus)
                .unwrap_or_default();

            let critical_percentage_bonus = proficiency_mods
                .as_ref()
                .map(|mods| mods.critical_percentage_bonus)
                .unwrap_or_default();

            Some(HitRateParams {
                accuracy_term,
                evasion_term,
                target_morale_mod: target.morale_state().hit_rate_mod(),
                critical_rate_constant: ASW_CRITICAL_RATE_CONSTANT,
                critical_percentage_bonus,
                hit_percentage_bonus,
            })
        };

        let attack_power_params = calc_attack_power_params();
        let hit_rate_params = calc_hit_rate_params();
        let defense_params = DefenseParams::from_target(target, target_side, armor_penetration);

        AttackParams {
            attack_power_params,
            hit_rate_params,
            defense_params,
            hits: 1.0,
            is_cutin: false,
        }
    }

    pub fn to_attack(&self) -> Attack {
        self.calc_attack_params().into_attack()
    }
}
