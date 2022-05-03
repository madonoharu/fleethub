mod master_data;

use fleethub_core::{
    attack::{special_enemy_modifiers, AttackPowerModifier},
    types::{gear_id, GearState, ShipState, SpecialEnemyType},
};
use master_data::FH_CORE;

macro_rules! gear_id_vec {
  ($($x:tt),+ $(,)?) => {
    vec![$(gear_id!($x)),+]
  };
}

#[test]
fn test_landing_craft_synergy_mod() {
    fn case(vec: Vec<u16>, a: f64, b: f64) {
        let get_gear_state = |i: usize| {
            vec.get(i).map(|&gear_id| GearState {
                gear_id,
                ..Default::default()
            })
        };

        let ship_state = ShipState {
            ship_id: 1,
            g1: get_gear_state(0),
            g2: get_gear_state(1),
            g3: get_gear_state(2),
            g4: get_gear_state(3),
            g5: get_gear_state(4),
            ..Default::default()
        };

        let ship = FH_CORE.create_ship(Some(ship_state)).unwrap();

        let mods = special_enemy_modifiers(&ship, SpecialEnemyType::SoftSkinned, true);

        assert_eq!(mods.landing_craft_synergy_mod, AttackPowerModifier { a, b });
    }

    case(gear_id_vec!["装甲艇(AB艇)"], 1.0, 0.0);
    case(gear_id_vec!["武装大発"], 1.0, 0.0);

    // 武装大発だけ2枠以上、または装甲艇(AB艇)だけ2枠以上の場合このシナジーは発生しない
    case(
        gear_id_vec!["装甲艇(AB艇)", "装甲艇(AB艇)", "大発動艇"],
        1.0,
        0.0,
    );
    case(gear_id_vec!["武装大発", "武装大発", "大発動艇"], 1.0, 0.0);

    case(gear_id_vec!["武装大発", "大発動艇"], 1.2, 10.0);
    case(gear_id_vec!["武装大発", "特二式内火艇"], 1.2, 10.0);
    case(
        gear_id_vec!["武装大発", "大発動艇", "特二式内火艇"],
        1.2,
        10.0,
    );
    case(gear_id_vec!["装甲艇(AB艇)", "大発動艇"], 1.2, 10.0);

    case(
        gear_id_vec!["武装大発", "装甲艇(AB艇)", "大発動艇"],
        1.32,
        12.0,
    );
    case(
        gear_id_vec!["武装大発", "武装大発", "装甲艇(AB艇)", "大発動艇"],
        1.32,
        12.0,
    );

    case(
        gear_id_vec!["武装大発", "装甲艇(AB艇)", "特大発動艇+戦車第11連隊"],
        1.44,
        13.0,
    );

    case(
        gear_id_vec!["武装大発", "装甲艇(AB艇)", "大発動艇", "大発動艇"],
        1.56,
        15.0,
    );
    case(
        gear_id_vec!["武装大発", "装甲艇(AB艇)", "大発動艇", "特二式内火艇"],
        1.56,
        15.0,
    );
}