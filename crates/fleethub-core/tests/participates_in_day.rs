mod master_data;

use fleethub_core::types::{gear_id, ship_id, ShipState};
use master_data::{create_ship, FH_CORE};

#[test]
fn test_participates_in_day() {
    {
        let ship1 = create_ship!({
            "ship_id": ship_id!("赤城"),
            "g1": { "gear_id": gear_id!("彗星") },
            "ss1": 0,
        });

        let ship2 = create_ship!({
            "ship_id": ship_id!("赤城"),
            "g1": { "gear_id": gear_id!("彗星") },
            "ss1": 1,
        });

        assert_eq!(ship1.participates_in_day(false), false);
        assert_eq!(ship2.participates_in_day(false), true);
    }

    {
        let ship = create_ship!({
            "ship_id": ship_id!("赤城"),
        });

        assert_eq!(ship.participates_in_day(true), false);
    }

    {
        let ship = create_ship!({
            "ship_id": ship_id!("赤城"),
            "g1": { "gear_id": gear_id!("流星") },
            "ss1": 1,
        });

        assert_eq!(ship.participates_in_day(true), true);
    }

    {
        let ship = create_ship!({
            "ship_id": ship_id!("赤城"),
            "g1": { "gear_id": gear_id!("彗星一二型(六三四空/三号爆弾搭載機)") },
            "ss1": 0,
        });

        assert_eq!(ship.participates_in_day(true), false);
    }

    {
        let ship = create_ship!({
            "ship_id": ship_id!("赤城"),
            "g1": { "gear_id": gear_id!("彗星一二型(六三四空/三号爆弾搭載機)") },
            "ss1": 1,
        });

        assert_eq!(ship.participates_in_day(true), true);
    }

    {
        let ship = create_ship!({
            "ship_id": ship_id!("赤城"),
            "g1": { "gear_id": gear_id!("彗星一二型(六三四空/三号爆弾搭載機)") },
            "g2": { "gear_id": gear_id!("彗星") },
            "ss1": 0,
            "ss2": 1,
        });

        assert_eq!(ship.participates_in_day(true), false);
    }

    {
        let ship = create_ship!({
            "ship_id": ship_id!("赤城"),
            "g1": { "gear_id": gear_id!("彗星一二型(六三四空/三号爆弾搭載機)") },
            "g2": { "gear_id": gear_id!("彗星") },
            "ss1": 1,
            "ss2": 1,
        });

        assert_eq!(ship.participates_in_day(true), true);
    }
}
