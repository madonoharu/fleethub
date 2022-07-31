mod common;

use fleethub_core::types::{AttackPowerModifier, SpecialEnemyType, Time};

fn test_case(gears: Vec<&str>, expected: (f64, f64)) {
    let get = |index: usize| gears.get(index).unwrap_or(&"").to_string();

    let g1 = get(0);
    let g2 = get(1);
    let g3 = get(2);
    let g4 = get(3);
    let g5 = get(4);
    let gx = get(5);

    let ship = ship! {
        ship_id = "睦月"
        g1 = g1
        g2 = g2
        g3 = g3
        g4 = g4
        g5 = g5
        gx = gx
    };

    let mods = ship.special_enemy_mods(SpecialEnemyType::SoftSkinned, Time::Day);
    assert_eq!(
        mods.landing_craft_synergy_mod,
        AttackPowerModifier::from(expected)
    );
}

macro_rules! table {
    ($($gears: expr => $expected: expr),+ $(,)?) => {
        $(test_case($gears.into(), $expected);)+
    };
}

#[test]
fn test_landing_craft_synergy_mod() {
    table! {
        ["装甲艇(AB艇)"] => (1.0, 0.0),
        ["武装大発"] => (1.0, 0.0),
        ["大発動艇"] => (1.0, 0.0),
        // 武装大発だけ2枠以上、または装甲艇(AB艇)だけ2枠以上の場合このシナジーは発生しない
        ["装甲艇(AB艇)", "装甲艇(AB艇)", "大発動艇"] => (1.0, 0.0),
        ["武装大発", "武装大発", "大発動艇"] => (1.0, 0.0),

        ["武装大発", "大発動艇"] => (1.2, 10.0),
        ["武装大発", "特二式内火艇"] => (1.2, 10.0),
        ["武装大発", "大発動艇", "特二式内火艇"] => (1.2, 10.0),
        ["装甲艇(AB艇)", "大発動艇"] => (1.2, 10.0),

        ["武装大発", "装甲艇(AB艇)", "大発動艇"] => (1.32, 12.0),
        ["武装大発", "武装大発", "装甲艇(AB艇)", "大発動艇"] => (1.32, 12.0),

        ["武装大発", "装甲艇(AB艇)", "大発動艇"] => (1.32, 12.0),
        ["武装大発", "装甲艇(AB艇)", "特大発動艇"] => (1.32, 12.0),
        ["武装大発", "装甲艇(AB艇)", "大発動艇(八九式中戦車&陸戦隊)"] => (1.32, 12.0),
        ["武装大発", "装甲艇(AB艇)", "大発動艇(II号戦車/北アフリカ仕様)"] => (1.32, 12.0),
        ["武装大発", "装甲艇(AB艇)", "特大発動艇+一式砲戦車"] => (1.32, 12.0),

        ["武装大発", "装甲艇(AB艇)", "特大発動艇+戦車第11連隊"] => (1.44, 13.0),
        ["武装大発", "装甲艇(AB艇)", "特二式内火艇"] => (1.44, 13.0),

        ["武装大発", "装甲艇(AB艇)", "大発動艇", "大発動艇"] => (1.56, 15.0),
        ["武装大発", "装甲艇(AB艇)", "大発動艇", "特二式内火艇"] => (1.56, 15.0),
        ["武装大発", "装甲艇(AB艇)", "大発動艇", "大発動艇", "大発動艇"] => (1.56, 15.0),
    }
}
