use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    ship::Ship,
    types::{ctype, DamageState, GearAttr, NightAttackType},
};

use super::{AswAttackType, ShellingAttackType};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "t", content = "c")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum DayBattleAttackType {
    Shelling(ShellingAttackType),
    Asw(AswAttackType),
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "t", content = "c")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum NightBattleAttackType {
    NightAttack(NightAttackType),
    Asw(AswAttackType),
}

pub fn get_day_battle_attack_type(attacker: &Ship, target: &Ship) -> Option<DayBattleAttackType> {
    let is_carrier_like = attacker.is_carrier_like();
    let anti_inst = target.is_installation();
    let participates = attacker.participates_day(anti_inst);

    let capable = !is_carrier_like || attacker.is_healthy_as_carrier();

    if !participates || !capable {
        return None;
    }

    if target.is_submarine() {
        attacker
            .asw_attack_type(false)
            .map(DayBattleAttackType::Asw)
    } else {
        let t = if is_carrier_like {
            ShellingAttackType::Carrier
        } else {
            ShellingAttackType::Normal
        };

        Some(DayBattleAttackType::Shelling(t))
    }
}

pub fn get_night_battle_attack_type(
    attacker: &Ship,
    target: &Ship,
) -> Option<NightBattleAttackType> {
    if attacker.damage_state() >= DamageState::Taiha {
        return None;
    }

    if target.is_submarine() {
        return attacker
            .asw_attack_type(true)
            .map(NightBattleAttackType::Asw);
    }

    let night_attack_type = if attacker.is_night_carrier() && attacker.is_healthy_as_carrier() {
        Some(NightAttackType::Carrier)
    } else if attacker.ctype == ctype!("Ark Royal級")
        && attacker.has_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::CbSwordfish))
        && attacker.is_healthy_as_carrier()
    {
        Some(NightAttackType::ArkRoyal)
    } else {
        attacker
            .can_do_normal_night_attack()
            .then(|| NightAttackType::Normal)
    };

    night_attack_type.map(NightBattleAttackType::NightAttack)
}

pub fn get_oasw_attack_type(attacker: &Ship, target: &Ship) -> Option<AswAttackType> {
    if !target.is_submarine() || !attacker.can_do_oasw() {
        return None;
    }

    attacker.asw_attack_type(false)
}
