mod common;

use common::battle_definitions;
use fleethub_core::{
    member::BattleMember,
    ship::Ship,
    types::{
        AswAttackType, AttackType, BattleDefinitions, Formation, NightAttackType, NodeState,
        OrgType, ShellingType, ShipPosition,
    },
};

const MAP: i16 = 601;

fn defs(bonuses: serde_json::Value) -> BattleDefinitions {
    BattleDefinitions {
        historical_bonuses: serde_json::from_value(bonuses).unwrap(),
        ..battle_definitions()
    }
}

fn power_mod(defs: &BattleDefinitions, attack_type: AttackType, attacker: &Ship) -> f64 {
    let node_state = NodeState {
        map: MAP,
        ..Default::default()
    };
    let target = ship! { ship_id = "駆逐イ級" };
    let enemy_position = ShipPosition {
        org_type: OrgType::EnemySingle,
        ..Default::default()
    };

    defs.get_historical_params(
        attack_type,
        node_state,
        &BattleMember::new(attacker, Default::default(), Formation::default(), None),
        &BattleMember::new(&target, enemy_position, Formation::default(), None),
    )
    .power_mod
    .a
}

fn carrier(slot_size: u8) -> Ship {
    ship! {
        ship_id = "赤城"
        g1 = "流星"
        ss1 = slot_size
    }
}

fn plane_id(ship: &Ship) -> u16 {
    ship.planes().next().unwrap().gear_id
}

#[test]
fn test_plane_bonus_requires_remaining_planes() {
    let ship = carrier(1);
    let defs = defs(serde_json::json!([{
        "map": MAP,
        "ship": format!("count_remaining_planes({}) >= 1", plane_id(&ship)),
        "power_mod": { "a": 1.1 },
    }]));
    let shelling = AttackType::Shelling(ShellingType::Normal);

    assert_eq!(power_mod(&defs, shelling, &ship), 1.1);
    assert_eq!(power_mod(&defs, shelling, &carrier(0)), 1.0);
}

#[test]
fn test_plane_bonus_by_gear_type_requires_remaining_planes() {
    let ship = carrier(1);
    let gear_type = ship.planes().next().unwrap().gear_type as u8;
    let defs = defs(serde_json::json!([{
        "map": MAP,
        "ship": format!("count_remaining_planes_by_gear_type({gear_type}) >= 1"),
        "power_mod": { "a": 1.1 },
    }]));
    let shelling = AttackType::Shelling(ShellingType::Normal);

    assert_eq!(power_mod(&defs, shelling, &ship), 1.1);
    assert_eq!(power_mod(&defs, shelling, &carrier(0)), 1.0);
}

#[test]
fn test_aerial_only_bonus_applies_only_to_aerial_attacks() {
    let ship = carrier(1);
    let defs = defs(serde_json::json!([{
        "map": MAP,
        "aerial_only": true,
        "power_mod": { "a": 1.2 },
    }]));

    assert_eq!(
        power_mod(&defs, AttackType::Shelling(ShellingType::Aerial), &ship),
        1.2
    );
    assert_eq!(
        power_mod(&defs, AttackType::Night(NightAttackType::Aerial), &ship),
        1.2
    );
    assert_eq!(
        power_mod(&defs, AttackType::Night(NightAttackType::Swordfish), &ship),
        1.2
    );
    assert_eq!(
        power_mod(&defs, AttackType::Shelling(ShellingType::Normal), &ship),
        1.0
    );
    assert_eq!(power_mod(&defs, AttackType::Torpedo, &ship), 1.0);
}

#[test]
fn test_aerial_only_bonus_applies_to_day_asw_by_planes_except_cv_and_ao() {
    let defs = defs(serde_json::json!([{
        "map": MAP,
        "aerial_only": true,
        "power_mod": { "a": 1.2 },
    }]));
    let asw = AttackType::Asw(AswAttackType::Aerial);
    let light_carrier = ship! { ship_id = "大鷹改二" g1 = "流星" ss1 = 1 };
    let oiler = ship! { ship_id = "速吸改" g1 = "流星" ss1 = 1 };

    assert_eq!(power_mod(&defs, asw, &light_carrier), 1.2);
    assert_eq!(power_mod(&defs, asw, &carrier(1)), 1.0);
    assert_eq!(power_mod(&defs, asw, &oiler), 1.0);
    assert_eq!(
        power_mod(
            &defs,
            AttackType::Asw(AswAttackType::DepthCharge),
            &light_carrier
        ),
        1.0
    );
}

#[test]
fn test_aerial_only_bonus_does_not_apply_to_opening_asw() {
    let defs = defs(serde_json::json!([{
        "map": MAP,
        "aerial_only": true,
        "power_mod": { "a": 1.2 },
    }]));
    let attacker = ship! { ship_id = "大鷹改二" g1 = "流星" ss1 = 1 };
    let target = ship! { ship_id = "潜水カ級" };
    let enemy_position = ShipPosition {
        org_type: OrgType::EnemySingle,
        ..Default::default()
    };

    let params = defs.get_opening_asw_historical_params(
        NodeState {
            map: MAP,
            ..Default::default()
        },
        &BattleMember::new(&attacker, Default::default(), Formation::default(), None),
        &BattleMember::new(&target, enemy_position, Formation::default(), None),
    );

    assert_eq!(params.power_mod.a, 1.0);
}
