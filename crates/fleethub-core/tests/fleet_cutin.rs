mod common;

use common::fleet_from_toml;
use fleethub_core::{
    attack::{get_possible_fleet_cutin_effect_vec, FleetCutinAttackParams, FleetCutinEffect},
    types::{Engagement, FleetCutin, Formation, Time},
};

fn assert_fleet_cutin(
    value: toml::Table,
    formation: Formation,
    engagement: Engagement,
    time: Time,
    cutin: FleetCutin,
    expected: impl IntoIterator<Item = (usize, f64)>,
) {
    let expected_effect = FleetCutinEffect {
        cutin,
        attacks: expected
            .into_iter()
            .map(|(index, power_mod)| {
                let accuracy_mod = match cutin {
                    FleetCutin::NelsonTouch => 1.05,
                    FleetCutin::KongouClassCutin => 1.4,
                    _ => 1.0,
                };

                FleetCutinAttackParams {
                    index,
                    power_mod,
                    accuracy_mod,
                }
            })
            .collect(),
    };

    let result =
        get_possible_fleet_cutin_effect_vec(&fleet_from_toml(value), formation, engagement, time)
            .into_iter()
            .any(|effect| effect == expected_effect);

    assert!(result)
}

#[test]
fn test_nelson_touch() {
    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "Nelson"
            s2.ship_id = "睦月"
            s3.ship_id = "睦月"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::DOUBLE_LINE,
        Engagement::Parallel,
        Time::Day,
        FleetCutin::NelsonTouch,
        [(0, 2.0), (2, 2.0), (4, 2.0)],
    );

    // T不利補正 1.25
    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "Nelson"
            s2.ship_id = "睦月"
            s3.ship_id = "睦月"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::DOUBLE_LINE,
        Engagement::RedT,
        Time::Day,
        FleetCutin::NelsonTouch,
        [(0, 2.0 * 1.25), (2, 2.0 * 1.25), (4, 2.0 * 1.25)],
    );
}

#[test]
fn test_nagato_class_cutin() {
    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "長門改二"
            s2.ship_id = "陸奥改二"
            s3.ship_id = "睦月"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::ECHELON,
        Engagement::Parallel,
        Time::Day,
        FleetCutin::NagatoClassCutin,
        [(0, 1.4 * 1.2), (0, 1.4 * 1.2), (1, 1.4 * 1.2)],
    );

    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "長門改二"
            s1.g1.gear_id = "22号対水上電探"
            s2.ship_id = "陸奥改二"
            s3.ship_id = "睦月"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::ECHELON,
        Engagement::Parallel,
        Time::Day,
        FleetCutin::NagatoClassCutin,
        [(0, 1.4 * 1.2 * 1.15), (0, 1.4 * 1.2 * 1.15), (1, 1.4 * 1.2)],
    );
}

#[test]
fn test_colorado_class_cutin() {
    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "Colorado"
            s2.ship_id = "長門"
            s3.ship_id = "陸奥"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::ECHELON,
        Engagement::Parallel,
        Time::Day,
        FleetCutin::ColoradoClassCutin,
        [(0, 1.5), (1, 1.3), (2, 1.3)],
    );
}

#[test]
fn test_kongou_cutin() {
    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "金剛改二丙"
            s2.ship_id = "比叡改二丙"
            s3.ship_id = "睦月"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::LINE_AHEAD,
        Engagement::Parallel,
        Time::Night,
        FleetCutin::KongouClassCutin,
        [(0, 2.4), (1, 2.4)],
    );
}

#[test]
fn test_yamato_2ship_cutin() {
    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "大和改二重"
            s2.ship_id = "武蔵改二"
            s3.ship_id = "睦月"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::ECHELON,
        Engagement::Parallel,
        Time::Day,
        FleetCutin::Yamato2ShipCutin,
        [(0, 1.4 * 1.1), (0, 1.4 * 1.1), (1, 1.55 * 1.2)],
    );

    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "武蔵改二"
            s2.ship_id = "大和改二"
            s3.ship_id = "睦月"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::ECHELON,
        Engagement::Parallel,
        Time::Day,
        FleetCutin::Yamato2ShipCutin,
        [(0, 1.4 * 1.1), (0, 1.4 * 1.1), (1, 1.55 * 1.2)],
    );

    assert_fleet_cutin(
        toml::toml! {
            s1.ship_id = "武蔵改二"
            s2.ship_id = "大和改二重"
            s3.ship_id = "睦月"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        Formation::ECHELON,
        Engagement::Parallel,
        Time::Day,
        FleetCutin::Yamato2ShipCutin,
        [(0, 1.4 * 1.1), (0, 1.4 * 1.1), (1, 1.55 * 1.25)],
    );
}

#[test]
fn test_yamato_3ship_cutin() {
    macro_rules! case {
        ([$s1:expr,$s2:expr,$s3:expr], $expected:expr) => {
            case!(
                {
                    s1.ship_id = $s1
                    s2.ship_id = $s2
                    s3.ship_id = $s3
                    s4.ship_id = "睦月"
                    s5.ship_id = "睦月"
                    s6.ship_id = "睦月"
                },
                $expected
            );
        };

        ({ $($toml:tt)+ }, $expected:expr) => {
            let value = toml::toml!($($toml)+);

            assert_fleet_cutin(
                value,
                Formation::ECHELON,
                Engagement::Parallel,
                Time::Day,
                FleetCutin::Yamato3ShipCutin,
                $expected
            )
        };
    }

    case!(
        ["大和改二重", "武蔵改二", "長門改二"],
        [(0, 1.65), (1, 1.8), (2, 1.65)]
    );
    case!(
        ["大和改二重", "武蔵改二", "長門改二"],
        [(0, 1.65), (1, 1.8), (2, 1.65)]
    );
    case!(
        ["大和改二重", "長門改二", "陸奥改二"],
        [(0, 1.65), (1, 1.65), (2, 1.65)]
    );
    case!(
        ["大和改二重", "伊勢改二", "日向改二"],
        [(0, 1.65), (1, 1.575), (2, 1.65)]
    );
    case!(
        ["大和改二重", "扶桑改二", "山城改二"],
        [(0, 1.5), (1, 1.5), (2, 1.65)]
    );
    case!(
        ["大和改二重", "金剛改二丙", "比叡改二丙"],
        [(0, 1.5), (1, 1.5), (2, 1.65)]
    );
    case!(
        ["大和改二重", "Italia", "Roma改"],
        [(0, 1.5), (1, 1.5), (2, 1.65)]
    );
    case!(
        ["大和改二重", "Warspite改", "Nelson改"],
        [(0, 1.5), (1, 1.5), (2, 1.65)]
    );
    case!(
        ["大和改二重", "Washington改", "South Dakota改"],
        [(0, 1.5), (1, 1.5), (2, 1.65)]
    );
    case!(
        ["大和改二重", "Colorado改", "Maryland改"],
        [(0, 1.5), (1, 1.5), (2, 1.65)]
    );

    case!(
        {
            s1.ship_id = "大和改二重"
            s1.g1.gear_id = "一式徹甲弾"
            s2.ship_id = "Colorado改"
            s3.ship_id = "Maryland改"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        [(0, 1.5 * 1.35), (1, 1.5), (2, 1.65)]
    );
    case!(
        {
            s1.ship_id = "大和改二重"
            s1.g1.gear_id = "22号対水上電探"
            s2.ship_id = "Colorado改"
            s3.ship_id = "Maryland改"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        [(0, 1.5 * 1.15), (1, 1.5), (2, 1.65)]
    );
    case!(
        {
            s1.ship_id = "大和改二重"
            s1.g1.gear_id = "15m二重測距儀+21号電探改二"
            s2.ship_id = "Colorado改"
            s3.ship_id = "Maryland改"
            s4.ship_id = "睦月"
            s5.ship_id = "睦月"
            s6.ship_id = "睦月"
        },
        [(0, 1.5 * 1.15 * 1.1), (1, 1.5), (2, 1.65)]
    );
}
