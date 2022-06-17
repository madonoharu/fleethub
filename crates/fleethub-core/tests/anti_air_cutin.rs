mod master_data;

use fleethub_core::types::{gear_id, ship_id, GearState, GearVecState, ShipState};
use master_data::FH_CORE;

fn test_case(ship_id: u16, vec: Vec<u16>, expected: Vec<u8>) {
    let get_gear_state = |i: usize| {
        vec.get(i).map(|&gear_id| GearState {
            gear_id,
            ..Default::default()
        })
    };

    let ship_state = ShipState {
        ship_id,
        gears: GearVecState {
            g1: get_gear_state(0),
            g2: get_gear_state(1),
            g3: get_gear_state(2),
            g4: get_gear_state(3),
            g5: get_gear_state(4),
            gx: get_gear_state(5),
        },
        ..Default::default()
    };

    let ship = FH_CORE.create_ship(Some(ship_state)).unwrap();
    assert_eq!(ship.get_possible_anti_air_cutin_ids(), expected);
}

macro_rules! table {
  ($([$ship: tt, $($x:tt),+ $(,)?] => $expected: expr),+ $(,)?) => {
      $(test_case(ship_id!($ship) ,vec![$(gear_id!($x)),+], $expected.into());)+
  };
}

#[test]
fn test_anti_air_cutin() {
    table! {
        ["秋月", "10cm連装高角砲", "22号対水上電探"] => [2],
        ["秋月", "10cm連装高角砲", "10cm連装高角砲"] => [3],
        ["秋月", "10cm連装高角砲", "10cm連装高角砲", "22号対水上電探"] => [1, 2, 3],
        ["大和改二", "10cm連装高角砲群 集中配備", "10cm連装高角砲群 集中配備", "15m二重測距儀+21号電探改二", "25mm三連装機銃"] => [42, 43, 44, 45, 5, 8],
        ["大和改二", "10cm連装高角砲群 集中配備", "10cm連装高角砲群 集中配備", "15m二重測距儀+21号電探改二"] => [43, 45, 5, 8],
        ["大和改二", "10cm連装高角砲群 集中配備", "15m二重測距儀+21号電探改二", "25mm三連装機銃"] => [44, 45, 8],
        ["大和改二", "10cm連装高角砲群 集中配備", "15m二重測距儀+21号電探改二"] => [45, 8],
    }
}