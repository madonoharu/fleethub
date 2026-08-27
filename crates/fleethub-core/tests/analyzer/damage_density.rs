use fleethub_core::{
    analyzer::{AttackAnalyzer, AttackAnalyzerConfig, AttackAnalyzerShipConfig},
    types::{AirState, Engagement, NodeState, OrgType},
};

use crate::*;

/// 主魚電カットイン (hits = 1.65) が「1回 35% / 2回 65%」の混合になっていること。
///
/// 以前は端数を混ぜる分岐が到達不能で、常に切り上げ (2回) で計算されていた。
/// 作戦室のチップは `1 (35%) ~ 2 (65%)` と表示しているので、表示と分布が食い違っていた。
#[test]
fn test_fractional_hits_night_cutin() {
    let attacker = ship! {
        ship_id = "島風改"
        level = 175
        g1 = "12.7cm連装砲C型改二"
        g2 = "61cm四連装(酸素)魚雷"
        g3 = "22号対水上電探改四"
    };
    let target = ship! {
        ship_id = "戦艦棲姫"
    };

    let mut target_config = AttackAnalyzerShipConfig::default();
    target_config.conditions.position.org_type = OrgType::EnemySingle;

    let analyzer = AttackAnalyzer {
        battle_defs: &battle_definitions(),
        config: AttackAnalyzerConfig {
            air_state: AirState::AirSupremacy,
            engagement: Engagement::Parallel,
            node_state: NodeState::default(),
            attacker: AttackAnalyzerShipConfig::default(),
            target: target_config,
        },
        attacker: &attacker,
        target: &target,
    };

    let analysis = analyzer.analyze();

    let cutin = analysis
        .night
        .data
        .get("MainTorpRadar")
        .expect("主魚電カットインが発動していない");

    assert_eq!(cutin.hits, 1.65, "hits が想定と違う");

    let damage = cutin.damage.as_ref().expect("ダメージが計算されていない");

    let min_damage = damage
        .damage_density
        .keys()
        .copied()
        .min()
        .expect("分布が空");

    // 1発ぶんの最小ダメージ。2回で計算されているとその2倍が下限になる。
    let per_hit_min = damage.normal_damage_min;

    assert!(
        min_damage <= per_hit_min,
        "分布の最小ダメージが {min_damage}。1発ぶんの最小 {per_hit_min} を超えており、\
         端数 hits が無視されて2回ぶんで計算されている"
    );
}
