mod common;

use fleethub_core::types::{
    AttackPowerModifier, AttackType, SpecialEnemyModifiers, SpecialEnemyType,
};

use SpecialEnemyType::*;

fn get_special_enemy_mods(
    special_enemy_type: SpecialEnemyType,
    attack_type: AttackType,
    gears: Vec<&str>,
) -> SpecialEnemyModifiers {
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

    ship.special_enemy_mods(special_enemy_type, attack_type)
}

macro_rules! table {
    ($($gears: expr => $expected: expr),+ $(,)?) => {
        $(test_case($gears.into(), $expected);)+
    };
}

#[test]
fn test_landing_craft_synergy_mod() {
    fn test_case(gears: Vec<&str>, expected: (f64, f64)) {
        let mods = get_special_enemy_mods(
            SoftSkinned,
            AttackType::Shelling(Default::default()),
            gears.clone(),
        );
        assert_eq!(
            mods.landing_craft_synergy_mod,
            AttackPowerModifier::from(expected),
            "{:?}",
            gears
        );
    }

    table! {
        ["装甲艇(AB艇)"] => (1.0, 0.0),
        ["武装大発"] => (1.0, 0.0),
        ["大発動艇"] => (1.0, 0.0),
        // 武装大発だけ2枠以上、または装甲艇(AB艇)だけ2枠以上の場合このシナジーは発生しない
        ["装甲艇(AB艇)", "装甲艇(AB艇)", "大発動艇"] => (1.0, 0.0),
        ["武装大発", "武装大発", "大発動艇"] => (1.0, 0.0),
        ["武装大発", "武装大発", "装甲艇(AB艇)", "大発動艇"] => (1.0, 0.0),

        ["武装大発", "大発動艇"] => (1.2, 10.0),
        ["武装大発", "特二式内火艇"] => (1.2, 10.0),
        ["武装大発", "大発動艇", "特二式内火艇"] => (1.2, 10.0),
        ["装甲艇(AB艇)", "大発動艇"] => (1.2, 10.0),

        ["武装大発", "装甲艇(AB艇)", "大発動艇"] => (1.3, 15.0),

        ["武装大発", "装甲艇(AB艇)", "大発動艇"] => (1.3, 15.0),
        ["武装大発", "装甲艇(AB艇)", "特大発動艇"] => (1.3, 15.0),
        ["武装大発", "装甲艇(AB艇)", "大発動艇(八九式中戦車&陸戦隊)"] => (1.3, 15.0),
        ["武装大発", "装甲艇(AB艇)", "大発動艇(II号戦車/北アフリカ仕様)"] => (1.3, 15.0),
        ["武装大発", "装甲艇(AB艇)", "特大発動艇+一式砲戦車"] => (1.3, 15.0),

        ["武装大発", "装甲艇(AB艇)", "特大発動艇+戦車第11連隊"] => (1.4, 20.0),
        ["武装大発", "装甲艇(AB艇)", "特二式内火艇"] => (1.4, 20.0),

        ["武装大発", "装甲艇(AB艇)", "大発動艇", "大発動艇"] => (1.5, 25.0),
        ["武装大発", "装甲艇(AB艇)", "大発動艇", "特二式内火艇"] => (1.5, 25.0),
        ["武装大発", "装甲艇(AB艇)", "大発動艇", "大発動艇", "大発動艇"] => (1.5, 25.0),
    }
}

#[test]
fn test_anti_isolated_island() {
    fn test_case(gears: Vec<&str>, expected: (f64, f64)) {
        let mods = get_special_enemy_mods(
            IsolatedIsland,
            AttackType::Shelling(Default::default()),
            gears,
        );
        assert_eq!(mods.precap_general_mod, AttackPowerModifier::from(expected));
    }

    table! {
        ["大発動艇(II号戦車/北アフリカ仕様)"] => (2.16, 0.0),
    }
}

#[test]
fn test_special_enemy_mods_with_attack_type_torpedo() {
    [
        None,
        SoftSkinned,
        Pillbox,
        IsolatedIsland,
        SupplyDepot,
        NewSupplyDepot,
        HarbourSummerPrincess,
    ]
    .into_iter()
    .for_each(|ty| {
        assert_eq!(
            get_special_enemy_mods(
                ty,
                AttackType::Torpedo,
                vec![
                    "WG42 (Wurfgerät 42)",
                    "武装大発",
                    "装甲艇(AB艇)",
                    "大発動艇(II号戦車/北アフリカ仕様)"
                ]
            ),
            Default::default()
        );
    });

    let mods = get_special_enemy_mods(SpecialEnemyType::PtImp, AttackType::Torpedo, vec![]);
    assert!(mods.pt_mod.is_some());
}

#[test]
fn test_special_enemy_mods_with_attack_type_support_shelling() {
    [
        None,
        SoftSkinned,
        Pillbox,
        IsolatedIsland,
        SupplyDepot,
        NewSupplyDepot,
        HarbourSummerPrincess,
        PtImp,
    ]
    .into_iter()
    .for_each(|ty| {
        assert_eq!(
            get_special_enemy_mods(
                ty,
                AttackType::SupportShelling(Default::default()),
                vec![
                    "WG42 (Wurfgerät 42)",
                    "武装大発",
                    "装甲艇(AB艇)",
                    "大発動艇(II号戦車/北アフリカ仕様)"
                ]
            ),
            Default::default()
        );
    });
}
