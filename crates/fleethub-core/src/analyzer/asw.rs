use crate::{
    attack::{AswAttackContext, AswAttackType, AswTime, WarfareContext},
    ship::Ship,
    types::BattleConfig,
};

use super::attack_info::AttackStats;

pub fn analyze_asw_attack(
    config: &BattleConfig,
    ctx: &WarfareContext,
    attack_type: AswAttackType,
    time: AswTime,
    attacker: &Ship,
    target: &Ship,
) -> AttackStats {
    let asw_ctx = AswAttackContext::new(config, ctx, attack_type, time);

    asw_ctx.attack_params(attacker, target).into_stats()
}
