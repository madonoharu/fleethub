#![allow(clippy::bool_assert_comparison)]

mod common;

#[test]
fn test_participates_in_day_combat() {
    {
        let ship = ship! {
            ship_id = "赤城"
        };

        assert_eq!(ship.participates_in_day_combat(true), false);
    }

    {
        let ship1 = ship! {
            ship_id = "赤城"
            g1 = "彗星"
            ss1 = 0
        };

        let ship2 = ship! {
            ship_id = "赤城"
            g1 = "彗星"
            ss1 = 1
        };

        assert_eq!(ship1.participates_in_day_combat(false), false);
        assert_eq!(ship2.participates_in_day_combat(false), true);
    }

    {
        let ship = ship! {
            ship_id = "赤城"
            g1 = "流星"
            ss1 = 1
        };

        assert_eq!(ship.participates_in_day_combat(true), true);
    }

    {
        let ship = ship! {
            ship_id = "赤城"
            g1 = "彗星一二型(六三四空/三号爆弾搭載機)"
            ss1 = 0
        };

        assert_eq!(ship.participates_in_day_combat(true), false);
    }

    {
        let ship = ship! {
            ship_id = "赤城"
            g1 = "彗星一二型(六三四空/三号爆弾搭載機)"
            ss1 = 1
        };

        assert_eq!(ship.participates_in_day_combat(true), true);
    }

    {
        let ship = ship! {
            ship_id = "赤城"
            g1 = "彗星一二型(六三四空/三号爆弾搭載機)"
            g2 = "彗星"
            ss1 = 0
            ss2 = 1
        };

        assert_eq!(ship.participates_in_day_combat(true), false);
    }

    {
        let ship = ship! {
            ship_id = "赤城"
            g1 = "彗星一二型(六三四空/三号爆弾搭載機)"
            g2 = "彗星"
            ss1 = 1
            ss2 = 1
        };

        assert_eq!(ship.participates_in_day_combat(true), true);
    }
}
