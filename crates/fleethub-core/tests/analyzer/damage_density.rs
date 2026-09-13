use fleethub_core::{
    analyzer::{
        AttackAnalyzer, AttackAnalyzerConfig, AttackAnalyzerShipConfig, DamageReport, DensityDetail,
    },
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
        density_detail: DensityDetail::Total,
    };

    let analysis = analyzer.analyze();

    let cutin = analysis
        .night
        .data
        .get("MainTorpRadar")
        .expect("主魚電カットインが発動していない");

    assert_eq!(cutin.hits, 1.65, "hits が想定と違う");

    let damage = cutin.damage.as_ref().expect("ダメージが計算されていない");

    let min_of = |report: &DamageReport| {
        report
            .damage_density
            .keys()
            .copied()
            .min()
            .expect("分布が空")
    };

    // 同じ攻撃者・対象で発動する2回カットイン。切り上げ (2回) で計算されていた場合の
    // 分布はこれと同じ下限になる。割合ダメージの下限は攻撃力ではなく対象の耐久で
    // 決まるので、マスタが変わっても両者の関係は保たれる。
    let two_hits = analysis
        .night
        .data
        .get("TorpTorpMain")
        .expect("魚雷カットインが発動していない");

    assert_eq!(two_hits.hits, 2.0, "比較対象の hits が想定と違う");

    let two_hits_damage = two_hits
        .damage
        .as_ref()
        .expect("比較対象のダメージが計算されていない");

    let min_damage = min_of(damage);
    let two_hits_min = min_of(two_hits_damage);

    assert!(
        min_damage < two_hits_min,
        "分布の最小ダメージが {min_damage} で、2回カットインの {two_hits_min} を下回っていない。\
         端数 hits が無視されて2回ぶんだけで計算されている"
    );
}
