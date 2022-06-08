mod master_data;

use fleethub_core::types::{gear_id, ship_id, GearState, ShipState};
use master_data::FH_CORE;

macro_rules! create_gear_state {
    ($name: tt) => {
        Some(GearState {
            gear_id: gear_id!($name),
            ..Default::default()
        })
    };
}

#[test]
fn test_participates_day() {
    {
        let state0 = ShipState {
            ship_id: ship_id!("赤城"),
            g1: create_gear_state!("彗星"),
            ss1: Some(0),
            ..Default::default()
        };

        let state1 = ShipState {
            ss1: Some(1),
            ..state0.clone()
        };

        assert_eq!(
            FH_CORE
                .create_ship(Some(state0))
                .unwrap()
                .participates_day(false),
            false
        );

        assert_eq!(
            FH_CORE
                .create_ship(Some(state1))
                .unwrap()
                .participates_day(false),
            true
        );
    }

    {
        let input = Some(ShipState {
            ship_id: ship_id!("赤城"),
            ..Default::default()
        });

        assert_eq!(
            FH_CORE.create_ship(input).unwrap().participates_day(true),
            false
        );
    }

    {
        let input = Some(ShipState {
            ship_id: ship_id!("赤城"),
            g1: create_gear_state!("流星"),
            ss1: Some(1),
            ..Default::default()
        });

        assert_eq!(
            FH_CORE.create_ship(input).unwrap().participates_day(true),
            true
        );
    }

    {
        let input = Some(ShipState {
            ship_id: ship_id!("赤城"),
            g1: create_gear_state!("彗星一二型(六三四空/三号爆弾搭載機)"),
            ss1: Some(0),
            ..Default::default()
        });

        assert_eq!(
            FH_CORE.create_ship(input).unwrap().participates_day(true),
            false
        );
    }

    {
        let input = Some(ShipState {
            ship_id: ship_id!("赤城"),
            g1: create_gear_state!("彗星一二型(六三四空/三号爆弾搭載機)"),
            ss1: Some(1),
            ..Default::default()
        });

        assert_eq!(
            FH_CORE.create_ship(input).unwrap().participates_day(true),
            true
        );
    }

    {
        let input = Some(ShipState {
            ship_id: ship_id!("赤城"),
            g1: create_gear_state!("彗星一二型(六三四空/三号爆弾搭載機)"),
            g2: create_gear_state!("彗星"),
            ss1: Some(0),
            ss2: Some(1),
            ..Default::default()
        });

        assert_eq!(
            FH_CORE.create_ship(input).unwrap().participates_day(true),
            false
        );
    }

    {
        let input = Some(ShipState {
            ship_id: ship_id!("赤城"),
            g1: create_gear_state!("彗星一二型(六三四空/三号爆弾搭載機)"),
            g2: create_gear_state!("彗星"),
            ss1: Some(1),
            ss2: Some(1),
            ..Default::default()
        });

        assert_eq!(
            FH_CORE.create_ship(input).unwrap().participates_day(true),
            true
        );
    }
}
