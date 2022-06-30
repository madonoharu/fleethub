mod master_data;

use master_data::ship_from_toml;
use toml::toml;

#[test]
fn test_participates_in_day() {
    {
        let ship = ship_from_toml(toml! {
            ship_id = "赤城"
        });

        assert_eq!(ship.participates_in_day(true), false);
    }

    {
        let ship1 = ship_from_toml(toml! {
            ship_id = "赤城"
            g1.gear_id = "彗星"
            ss1 = 0
        });

        let ship2 = ship_from_toml(toml! {
            ship_id = "赤城"
            g1.gear_id = "彗星"
            ss1 = 1
        });

        assert_eq!(ship1.participates_in_day(false), false);
        assert_eq!(ship2.participates_in_day(false), true);
    }

    {
        let ship = ship_from_toml(toml! {
            ship_id = "赤城"
            g1.gear_id = "流星"
            ss1 = 1
        });

        assert_eq!(ship.participates_in_day(true), true);
    }

    {
        let ship = ship_from_toml(toml! {
            ship_id = "赤城"
            g1.gear_id = "彗星一二型(六三四空/三号爆弾搭載機)"
            ss1 = 0
        });

        assert_eq!(ship.participates_in_day(true), false);
    }

    {
        let ship = ship_from_toml(toml! {
            ship_id = "赤城"
            g1.gear_id = "彗星一二型(六三四空/三号爆弾搭載機)"
            ss1 = 1
        });

        assert_eq!(ship.participates_in_day(true), true);
    }

    {
        let ship = ship_from_toml(toml! {
            ship_id = "赤城"
            g1.gear_id = "彗星一二型(六三四空/三号爆弾搭載機)"
            g2.gear_id = "彗星"
            ss1 = 0
            ss2 = 1
        });

        assert_eq!(ship.participates_in_day(true), false);
    }

    {
        let ship = ship_from_toml(toml! {
            ship_id = "赤城"
            g1.gear_id = "彗星一二型(六三四空/三号爆弾搭載機)"
            g2.gear_id = "彗星"
            ss1 = 1
            ss2 = 1
        });

        assert_eq!(ship.participates_in_day(true), true);
    }
}
