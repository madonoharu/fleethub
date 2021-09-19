use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    attack::{
        AswAttackContext, AswAttackType, AswTime, NightAttackContext, NightAttackType,
        NightSituation, ShellingAttackContext, ShellingAttackType, TorpedoAttackContext,
        WarfareContext,
    },
    ship::Ship,
    types::{DamageState, DayCutin, GearAttr, MasterData, NightCutin, ShipClass},
};

use super::{AttackInfo, AttackInfoItem, AttackStats, DayCutinRateInfo, NightCutinRateAnalyzer};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, TS)]
#[serde(tag = "t", content = "c")]
pub enum DayBattleAttackType {
    Shelling(ShellingAttackType),
    Asw(AswAttackType),
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, TS)]
#[serde(tag = "t", content = "c")]
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
    } else if attacker.ship_class == ShipClass::ArkRoyalClass
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

pub type DayBattleAttackInfo = AttackInfo<DayBattleAttackType, Option<DayCutin>>;
pub type NightBattleAttackInfo = AttackInfo<NightBattleAttackType, Option<NightCutin>>;
pub type TorpedoAttackInfo = AttackInfo<(), ()>;

fn analyze_asw_attack(
    master_data: &MasterData,
    ctx: &WarfareContext,
    attack_type: AswAttackType,
    time: AswTime,
    attacker: &Ship,
    target: &Ship,
) -> AttackStats {
    let asw_ctx = AswAttackContext::new(master_data, ctx, attack_type, time);
    asw_ctx.attack_params(attacker, target).into_stats()
}

pub fn analyze_day_battle_attack(
    master_data: &MasterData,
    ctx: &WarfareContext,
    attacker: &Ship,
    target: &Ship,
) -> Option<DayBattleAttackInfo> {
    let attack_type = get_day_battle_attack_type(attacker, target)?;

    let items = match attack_type {
        DayBattleAttackType::Shelling(t) => {
            let day_cutin_rate_info = DayCutinRateInfo::new(
                &master_data.constants.day_cutins,
                attacker,
                ctx.attacker_env.fleet_los_mod,
                ctx.attacker_env.is_main_flagship(),
                ctx.air_state,
            );

            let items = day_cutin_rate_info
                .rates
                .into_iter()
                .map(|(cutin, rate)| {
                    let shelling_ctx = ShellingAttackContext::new(master_data, &ctx, t, cutin);
                    let stats = shelling_ctx.attack_params(attacker, target).into_stats();

                    AttackInfoItem { rate, cutin, stats }
                })
                .collect::<Vec<_>>();

            items
        }
        DayBattleAttackType::Asw(t) => {
            let stats = analyze_asw_attack(master_data, ctx, t, AswTime::Day, attacker, target);

            let item = AttackInfoItem {
                cutin: None,
                rate: Some(1.0),
                stats,
            };

            vec![item]
        }
    };

    Some(DayBattleAttackInfo::new(attack_type, items))
}

pub fn analyze_night_battle(
    master_data: &MasterData,
    ctx: &WarfareContext,
    attacker_situation: &NightSituation,
    target_situation: &NightSituation,
    attacker: &Ship,
    target: &Ship,
) -> Option<NightBattleAttackInfo> {
    let attack_type = get_night_battle_attack_type(attacker, target)?;

    let items = match attack_type {
        NightBattleAttackType::NightAttack(attack_type) => {
            let cutin_rate_info = NightCutinRateAnalyzer::new(&master_data.constants)
                .analyze_cutin_rates(
                    attacker,
                    ctx.attacker_env.is_flagship(),
                    attacker_situation,
                    target_situation,
                );

            let items = cutin_rate_info
                .rates
                .into_iter()
                .map(|(cutin, rate)| {
                    let night_ctx = NightAttackContext::new(
                        master_data,
                        ctx,
                        attacker_situation,
                        target_situation,
                        attack_type,
                        cutin,
                    );

                    let stats = night_ctx.attack_params(attacker, target).into_stats();

                    AttackInfoItem { cutin, rate, stats }
                })
                .collect::<Vec<_>>();

            items
        }
        NightBattleAttackType::Asw(attack_type) => {
            let stats = analyze_asw_attack(
                master_data,
                ctx,
                attack_type,
                AswTime::Night,
                attacker,
                target,
            );

            let item = AttackInfoItem {
                cutin: None,
                rate: Some(1.0),
                stats,
            };

            vec![item]
        }
    };

    Some(NightBattleAttackInfo::new(attack_type, items))
}

#[derive(Debug, Deserialize, TS)]
pub struct WarfareAnalysisParams {
    warfare_context: WarfareContext,
    attacker_night_situation: NightSituation,
    target_night_situation: NightSituation,
}

#[derive(Debug, Serialize)]
pub struct WarfareInfo {
    day: Option<DayBattleAttackInfo>,
    night: Option<NightBattleAttackInfo>,
    closing_torpedo: Option<TorpedoAttackInfo>,
}

// ts_rsがうまく動かないので自前実装
impl TS for WarfareInfo {
    fn name() -> String {
        "WarfareInfo".to_string()
    }

    fn decl() -> String {
        format!(
            "interface {} {{
                day: {} | null;
                closing_torpedo: {} | null;
                night: {} | null;
            }}",
            Self::name(),
            DayBattleAttackInfo::name_with_type_args(vec![
                DayBattleAttackType::name(),
                Option::<DayCutin>::name()
            ]),
            TorpedoAttackInfo::name_with_type_args(vec![<()>::name(), <()>::name()]),
            NightBattleAttackInfo::name_with_type_args(vec![
                NightBattleAttackType::name(),
                Option::<NightCutin>::name()
            ])
        )
    }

    fn dependencies() -> Vec<(std::any::TypeId, String)> {
        panic!("Unnecessary")
    }

    fn transparent() -> bool {
        true
    }
}

fn analyze_torpedo_attack(
    master_data: &MasterData,
    ctx: &WarfareContext,
    attacker: &Ship,
    target: &Ship,
) -> Option<AttackInfo<(), ()>> {
    if attacker.naked_torpedo().unwrap_or_default() == 0
        || target.is_submarine()
        || target.is_installation()
    {
        return None;
    }

    let torpedo_ctx = TorpedoAttackContext::new(master_data, ctx);
    let stats = torpedo_ctx.attack_params(attacker, target).into_stats();

    let item = AttackInfoItem {
        cutin: (),
        rate: Some(1.0),
        stats,
    };

    let info = AttackInfo::new((), vec![item]);
    Some(info)
}

pub fn analyze_warfare(
    master_data: &MasterData,
    params: &WarfareAnalysisParams,
    attacker: &Ship,
    target: &Ship,
) -> WarfareInfo {
    let WarfareAnalysisParams {
        warfare_context,
        attacker_night_situation,
        target_night_situation,
    } = params;
    let day = analyze_day_battle_attack(master_data, warfare_context, attacker, target);

    let night = analyze_night_battle(
        master_data,
        warfare_context,
        attacker_night_situation,
        target_night_situation,
        attacker,
        target,
    );

    let closing_torpedo = analyze_torpedo_attack(master_data, warfare_context, attacker, target);

    WarfareInfo {
        day,
        night,
        closing_torpedo,
    }
}
