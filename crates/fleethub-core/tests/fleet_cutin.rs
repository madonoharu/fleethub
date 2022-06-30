mod master_data;

use fleethub_core::{
    attack::fleet_cutin_mod::{get_possible_fleet_cutin_vec, FleetCutinAttacks},
    attack::get_possible_fleet_cutin_set,
    types::{Engagement, FleetCutin, Formation},
};
use master_data::fleet_from_toml;
use toml::toml;

#[test]
fn test_fleet_cutin() {
    let fleet = fleet_from_toml(toml! {
        s1.ship_id = "大和改二"
        s2.ship_id = "武蔵改二"
        s3.ship_id = "睦月"
        s4.ship_id = "睦月"
        s5.ship_id = "睦月"
        s6.ship_id = "睦月"
    });

    println!(
        "{:#?}",
        get_possible_fleet_cutin_set(&fleet, Formation::CRUISING4, false)
    );
}

#[test]
fn test_nelson_touch() {
    let fleet = fleet_from_toml(toml! {
        s1.ship_id = "Nelson"
        s2.ship_id = "睦月"
        s3.ship_id = "睦月"
        s4.ship_id = "睦月"
        s5.ship_id = "睦月"
        s6.ship_id = "睦月"
    });

    assert_eq!(
        get_possible_fleet_cutin_vec(&fleet, Formation::DOUBLE_LINE, Engagement::Parallel, false)
            .into_iter()
            .next()
            .unwrap(),
        FleetCutinAttacks {
            cutin: FleetCutin::NelsonTouch,
            attacks: [(0, 2.0), (2, 2.0), (4, 2.0)].into()
        }
    );

    // T不利補正 1.25
    assert_eq!(
        get_possible_fleet_cutin_vec(&fleet, Formation::DOUBLE_LINE, Engagement::RedT, false)
            .into_iter()
            .next()
            .unwrap(),
        FleetCutinAttacks {
            cutin: FleetCutin::NelsonTouch,
            attacks: [(0, 2.0 * 1.25), (2, 2.0 * 1.25), (4, 2.0 * 1.25)].into()
        }
    );

    assert_eq!(
        get_possible_fleet_cutin_vec(
            &fleet_from_toml(toml! {
                s1.ship_id = "Nelson"
                s2.ship_id = "睦月"
                s3.ship_id = "睦月"
                s4.ship_id = "睦月"
                s5.ship_id = "睦月"
            }),
            Formation::DOUBLE_LINE,
            Engagement::Parallel,
            false,
        )
        .into_iter()
        .next(),
        None
    );
}

#[test]
fn test_nagato_class_cutin() {
    assert_eq!(
        get_possible_fleet_cutin_vec(
            &fleet_from_toml(toml! {
                s1.ship_id = "長門改二"
                s2.ship_id = "陸奥改二"
                s3.ship_id = "睦月"
                s4.ship_id = "睦月"
                s5.ship_id = "睦月"
                s6.ship_id = "睦月"
            }),
            Formation::ECHELON,
            Engagement::Parallel,
            false,
        )
        .into_iter()
        .next(),
        Some(FleetCutinAttacks {
            cutin: FleetCutin::NagatoCutin,
            attacks: [(0, 1.4 * 1.2), (0, 1.4 * 1.2), (1, 1.4 * 1.2)].into()
        })
    );

    assert_eq!(
        get_possible_fleet_cutin_vec(
            &fleet_from_toml(toml! {
                s1.ship_id = "長門改二"
                s1.g1.gear_id = "22号対水上電探"
                s2.ship_id = "陸奥改二"
                s3.ship_id = "睦月"
                s4.ship_id = "睦月"
                s5.ship_id = "睦月"
                s6.ship_id = "睦月"
            }),
            Formation::ECHELON,
            Engagement::Parallel,
            false,
        )
        .into_iter()
        .next(),
        Some(FleetCutinAttacks {
            cutin: FleetCutin::NagatoCutin,
            attacks: [(0, 1.4 * 1.2 * 1.15), (0, 1.4 * 1.2 * 1.15), (1, 1.4 * 1.2)].into()
        })
    );
}

#[test]
fn test_colorado_class_cutin() {
    assert_eq!(
        get_possible_fleet_cutin_vec(
            &fleet_from_toml(toml! {
                s1.ship_id = "Colorado"
                s2.ship_id = "長門"
                s3.ship_id = "陸奥"
                s4.ship_id = "睦月"
                s5.ship_id = "睦月"
                s6.ship_id = "睦月"
            }),
            Formation::ECHELON,
            Engagement::Parallel,
            false,
        )
        .into_iter()
        .next(),
        Some(FleetCutinAttacks {
            cutin: FleetCutin::ColoradoCutin,
            attacks: [(0, 1.5), (1, 1.3), (2, 1.3)].into()
        })
    );
}

#[test]
fn test_kongou_cutin() {
    assert_eq!(
        get_possible_fleet_cutin_vec(
            &fleet_from_toml(toml! {
                s1.ship_id = "金剛改二丙"
                s2.ship_id = "比叡改二丙"
                s3.ship_id = "睦月"
                s4.ship_id = "睦月"
                s5.ship_id = "睦月"
                s6.ship_id = "睦月"
            }),
            Formation::LINE_AHEAD,
            Engagement::Parallel,
            true,
        )
        .into_iter()
        .next(),
        Some(FleetCutinAttacks {
            cutin: FleetCutin::KongouCutin,
            attacks: [(0, 2.2), (1, 2.2)].into_iter().collect()
        })
    );
}

#[test]
fn test_yamato_2ship_cutin() {
    assert_eq!(
        get_possible_fleet_cutin_vec(
            &fleet_from_toml(toml! {
                s1.ship_id = "大和改二重"
                s2.ship_id = "武蔵改二"
                s3.ship_id = "睦月"
                s4.ship_id = "睦月"
                s5.ship_id = "睦月"
                s6.ship_id = "睦月"
            }),
            Formation::ECHELON,
            Engagement::Parallel,
            false,
        )
        .into_iter()
        .next(),
        Some(FleetCutinAttacks {
            cutin: FleetCutin::Yamato2ShipCutin,
            attacks: [(0, 1.4 * 1.1), (0, 1.4 * 1.1), (1, 1.55 * 1.2)].into()
        })
    );
}

#[test]
fn test_yamato_3ship_cutin() {
    assert_eq!(
        get_possible_fleet_cutin_vec(
            &fleet_from_toml(toml! {
                s1.ship_id = "大和改二重"
                s2.ship_id = "長門改二"
                s3.ship_id = "陸奥改二"
                s4.ship_id = "睦月"
                s5.ship_id = "睦月"
                s6.ship_id = "睦月"
            }),
            Formation::ECHELON,
            Engagement::Parallel,
            false,
        )
        .into_iter()
        .next(),
        Some(FleetCutinAttacks {
            cutin: FleetCutin::Yamato3ShipCutin,
            attacks: [(0, 1.65), (1, 1.65), (2, 1.65)].into()
        })
    );
}
