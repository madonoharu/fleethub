use fleethub_core::types::Side;

mod common;

#[test]
fn test_can_do_opening_asw() {
    macro_rules! table {
        ($($ship_name: expr => $expected: expr),+ $(,)?) => {
            $(
              let ship = ship! {
                ship_id = $ship_name
              };

              assert_eq!(ship.can_do_opening_asw(), $expected);
            )*
        };
    }

    table! {
      "五十鈴改二" => true,
      "龍田改二" => true,
      "夕張改二丁" => true,
      "Samuel B.Roberts改" => true,
      "Samuel B.Roberts Mk.II" => true,
      "Jervis改" => true,
      "Fletcher" => true,

      "夕張改二" => false,
      "夕張改二特" => false,
      "天龍改二" => false,
      "Samuel B.Roberts" => false,
    };
}

#[test]
fn test_ship_fleet_anti_air_mod() {
    let ship = ship! {
        ship_id = "天霧改二丁"
        g1 = { gear_id = "12.7cm連装砲A型改三(戦時改修)+高射装置", stars = 10 }
        g2 = { gear_id = "12.7cm連装砲A型改三(戦時改修)+高射装置", stars = 10 }
        g3 = { gear_id = "13号対空電探改", stars = 7 }
    };

    let ebonus = ship.ebonuses.anti_air as f64;
    let expected = ((0.35 * 8.0 + 3.0 * 10_f64.sqrt()) * 2.0
        + (0.4 * 4.0 + 1.5 * 7_f64.sqrt())
        + 0.5 * ebonus)
        .floor();

    assert!(ebonus > 0.0);
    assert_eq!(ship.fleet_anti_air_mod(), expected);
}

#[test]
fn test_ship_adjusted_anti_air() {
    let ship = ship! {
        ship_id = "天霧改二丁"
        g1 = { gear_id = "12.7cm連装砲A型改三(戦時改修)+高射装置", stars = 10 }
        g2 = { gear_id = "12.7cm連装砲A型改三(戦時改修)+高射装置", stars = 10 }
        g3 = { gear_id = "13号対空電探改", stars = 10 }
    };

    let gears_total = (2.0 * 8.0 + 1.5 * 10_f64.sqrt()) * 2.0 + (1.5 * 4.0);
    let naked_anti_air = ship.naked_anti_air().unwrap() as f64;
    let ebonus = ship.ebonuses.anti_air as f64;
    let expected = (naked_anti_air * 0.5 + gears_total + 0.75 * ebonus).floor();

    assert!(ebonus > 0.0);
    assert_eq!(ship.ship_adjusted_anti_air(Side::Player), Some(expected));
}
