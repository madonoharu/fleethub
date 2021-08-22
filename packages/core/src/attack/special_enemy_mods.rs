use paste::paste;

use crate::{
    gear_id,
    ship::Ship,
    types::{GearType, ShipType, SpecialEnemyType},
};

use super::attack_power::AttackPowerModifiers;

/// 特効補正
pub fn special_enemy_modifiers(
    attacker: &Ship,
    special_enemy_type: SpecialEnemyType,
    is_day: bool,
) -> AttackPowerModifiers {
    let mut mods = AttackPowerModifiers::default();

    if special_enemy_type.is_none() {
        return mods;
    }

    let gears = &attacker.gears;

    macro_rules! apply_mod {
        ($f:ident, $v:expr) => {
            paste! {
                mods.[<apply_ $f>]($v)
            }
        };

        ($f:ident, $e:expr, [ $v1:expr ]) => {
            if $e >= 1 {
                apply_mod!($f, $v1)
            }
        };

        ($f:ident, $e:expr, [ $v1:expr, $v2:expr ]) => {
            match $e {
                0 => {}
                1 => apply_mod!($f, $v1),
                2 => apply_mod!($f, $v2),
                _ => apply_mod!($f, $v2),
            }
        };

        ($f:ident, $e:expr, [ $v1:expr, $v2:expr, $v3:expr ]) => {
            match $e {
                0 => {}
                1 => apply_mod!($f, $v1),
                2 => apply_mod!($f, $v2),
                3 => apply_mod!($f, $v3),
                _ => apply_mod!($f, $v3),
            }
        };

        ($f:ident, $e:expr, [ $v1:expr, $v2:expr, $v3:expr, $v4:expr ]) => {
            match $e {
                0 => {}
                1 => apply_mod!($f, $v1),
                2 => apply_mod!($f, $v2),
                3 => apply_mod!($f, $v3),
                4 => apply_mod!($f, $v4),
                _ => apply_mod!($f, $v4),
            }
        };

        ($f:ident, $e:expr, [ $v1:expr, $v2:expr, $v3:expr, $v4:expr, $v5:expr ]) => {
            match $e {
                0 => {}
                1 => apply_mod!($f, $v1),
                2 => apply_mod!($f, $v2),
                3 => apply_mod!($f, $v3),
                4 => apply_mod!($f, $v4),
                5 => apply_mod!($f, $v5),
                _ => apply_mod!($f, $v5),
            }
        };

        // ($f:ident, $e:expr, [ $( $vn:expr ),* , ]) => {
        //     apply_mod!($f, $e, [$( $vn ),*])
        // };
        ($f:ident, $e:expr, $v:expr) => {
            if $e {
                apply_mod!($f, $v);
            }
        };
    }

    let has_seaplane = gears.has_by(|gear| {
        matches!(
            gear.gear_type,
            GearType::SeaplaneBomber | GearType::SeaplaneFighter
        )
    });

    let cb_dive_bomber_count = gears.count_type(GearType::CbDiveBomber);

    let has_aa_shell = gears.has_type(GearType::AntiAirShell);
    let has_ap_shell = gears.has_type(GearType::ApShell);

    let ab_count = gears.count(gear_id!("装甲艇(AB艇)"));
    let armed_count = gears.count(gear_id!("武装大発"));
    let armored_boat_group_count = ab_count + armed_count;

    match special_enemy_type {
        SpecialEnemyType::PtImp => {
            let small_gun_count = gears.count_type(GearType::SmallCaliberMainGun);
            let sec_gun_count = gears.count_type(GearType::SecondaryGun);
            let jet_fighter_bomber_count = gears.count_type(GearType::JetFighterBomber);
            let aa_gun_count = gears.count_type(GearType::AntiAirGun);
            let lookouts_count = gears.count_type(GearType::SurfaceShipPersonnel);

            mods.apply_a6(0.35);
            mods.apply_b6(15.0);

            apply_mod!(a7, small_gun_count, [1.5, 1.5 * 1.4]);
            apply_mod!(a7, sec_gun_count, [1.3]);
            apply_mod!(
                a7,
                cb_dive_bomber_count.max(jet_fighter_bomber_count),
                [1.4, 1.4 * 1.3]
            );
            apply_mod!(a7, aa_gun_count, [1.2, 1.2 * 1.2]);
            apply_mod!(a7, lookouts_count, [1.1]);
            apply_mod!(a7, armored_boat_group_count, [1.2, 1.2 * 1.1]);
        }
        SpecialEnemyType::BattleshipSummerPrincess => {
            apply_mod!(a6, has_seaplane, 1.1);
            apply_mod!(a6, has_ap_shell, 1.2);
        }
        SpecialEnemyType::HeavyCruiserSummerPrincess => {
            apply_mod!(a6, has_seaplane, 1.15);
            apply_mod!(a6, has_ap_shell, 1.1);
        }
        _ => (),
    }

    let wg42_count = gears.count(gear_id!("WG42 (Wurfgerät 42)"));

    let mortar_count = gears.count(gear_id!("二式12cm迫撃砲改"));
    let mortar_cd_count = gears.count(gear_id!("二式12cm迫撃砲改 集中配備"));
    let mortar_group_count = mortar_count + mortar_cd_count;

    let type4_rocket_count = gears.count(gear_id!("艦載型 四式20cm対地噴進砲"));
    let type4_rocket_cd_count = gears.count(gear_id!("四式20cm対地噴進砲 集中配備"));
    let type4_rocket_group_count = type4_rocket_count + type4_rocket_cd_count;

    let landing_craft_count = gears.count_type(GearType::LandingCraft);
    let tank_count = gears.count_type(GearType::SpecialAmphibiousTank);

    let toku_daihatsu_count = gears.count(gear_id!("特大発動艇"));
    let t89_tank_count = gears.count(gear_id!("大発動艇(八九式中戦車&陸戦隊)"));
    let shikon_count = gears.count(gear_id!("特大発動艇+戦車第11連隊"));
    let m4a1dd_count = gears.count(gear_id!("M4A1 DD"));
    let t2_tank_count = gears.count(gear_id!("特二式内火艇"));

    // 改修補正
    let landing_craft_stars = gears.sum_by(|gear| {
        if gear.gear_type == GearType::LandingCraft {
            gear.stars
        } else {
            0
        }
    });

    let tank_stars = gears.sum_by(|gear| {
        if gear.gear_type == GearType::SpecialAmphibiousTank {
            gear.stars
        } else {
            0
        }
    });

    let landing_craft_stars_average = if landing_craft_count > 0 {
        (landing_craft_stars as f64) / (landing_craft_count as f64)
    } else {
        0.0
    };

    let tank_stars_average = if tank_count > 0 {
        (tank_stars as f64) / (tank_count as f64)
    } else {
        0.0
    };

    let landing_craft_ibonus = 1.0 + landing_craft_stars_average / 50.0;
    let tank_ibonus = 1.0 + tank_stars_average / 30.0;

    // 陸上共通 a13
    mods.apply_a13(landing_craft_ibonus);
    mods.apply_a13(tank_ibonus);

    // 陸上共通 b13
    apply_mod!(
        b13,
        shikon_count + m4a1dd_count > 0,
        (shikon_count + m4a1dd_count) as f64 * 25.0
    );

    // 陸上共通 a13_2
    apply_mod!(a13_2, gears.has(gear_id!("M4A1 DD")), 1.4);

    // 陸上共通 b13_2
    apply_mod!(b13_2, wg42_count, [75.0, 110.0, 140.0, 160.0, 160.0]);
    apply_mod!(b13_2, mortar_count, [30.0, 55.0, 75.0, 90.0, 90.0]);
    apply_mod!(b13_2, mortar_cd_count, [60.0, 110.0, 150.0, 150.0, 150.0]);
    apply_mod!(
        b13_2,
        type4_rocket_count,
        [55.0, 115.0, 160.0, 190.0, 190.0]
    );
    apply_mod!(
        b13_2,
        type4_rocket_cd_count,
        [80.0, 170.0, 170.0, 170.0, 170.0]
    );

    // 陸上共通 b12
    apply_mod!(
        b12,
        matches!(attacker.ship_type, ShipType::SS | ShipType::SSV),
        30.0
    );

    // 陸上共通 支援上陸用舟艇シナジー
    let calc_landing_craft_synergy_bonuses = || {
        if ab_count >= 2 || armed_count >= 2 || armored_boat_group_count == 0 {
            return None;
        }

        let daihatsu_count = gears.count(gear_id!("大発動艇"));
        let dlc_group1_count = daihatsu_count + toku_daihatsu_count + t89_tank_count;
        let dlc_group2_count = shikon_count + t2_tank_count;

        if dlc_group1_count + dlc_group2_count == 0 {
            return None;
        }

        let mut a13_2 = 1.2;
        let mut b13_2 = 10.0;

        if armored_boat_group_count <= 2 {
            return Some((a13_2, b13_2));
        }

        if dlc_group1_count + dlc_group2_count >= 2 {
            a13_2 *= 1.3;
            b13_2 = 15.0;
        } else if dlc_group2_count >= 1 {
            a13_2 *= 1.2;
            b13_2 = 13.0;
        } else if dlc_group1_count >= 1 {
            a13_2 *= 1.1;
            b13_2 = 12.0;
        }

        Some((a13_2, b13_2))
    };

    if let Some((a13_2, b13_2)) = calc_landing_craft_synergy_bonuses() {
        mods.apply_a13_2(a13_2);
        mods.apply_b13_2(b13_2);
    }

    if special_enemy_type == SpecialEnemyType::SupplyDepot {
        if t89_tank_count > 0 {
            mods.apply_a6(landing_craft_ibonus.powf(2.0))
        } else {
            mods.apply_a6(landing_craft_ibonus)
        }
        mods.apply_a6(tank_ibonus);

        apply_mod!(a6, type4_rocket_group_count, [1.2, 1.2 * 1.4]);
        apply_mod!(a6, mortar_group_count, [1.15, 1.15 * 1.2]);
        apply_mod!(a6, landing_craft_count, [1.7]);
        apply_mod!(a6, toku_daihatsu_count, [1.2]);
        apply_mod!(a6, t89_tank_count, [1.3, 1.3 * 1.6]);
        apply_mod!(a6, m4a1dd_count, [1.2]);
        apply_mod!(a6, t2_tank_count, [1.7, 1.7 * 1.5]);
        apply_mod!(a6, armored_boat_group_count, [1.5, 1.5 * 1.1]);
    }

    match special_enemy_type {
        SpecialEnemyType::Pillbox => {
            apply_mod!(a13, has_ap_shell, 1.85);
            apply_mod!(a13, wg42_count, [1.6, 1.6 * 1.7]);
            apply_mod!(a13, type4_rocket_group_count, [1.5, 1.5 * 1.8]);
            apply_mod!(a13, mortar_group_count, [1.3, 1.3 * 1.5]);
            apply_mod!(a13, has_seaplane, 1.5);
            apply_mod!(a13, cb_dive_bomber_count, [1.5, 1.5 * 2.0]);
            apply_mod!(a13, landing_craft_count, [1.8]);
            apply_mod!(a13, toku_daihatsu_count, [1.15]);
            apply_mod!(a13, t89_tank_count, [1.5, 1.5 * 1.4]);
            apply_mod!(a13, shikon_count, [1.8]);
            apply_mod!(a13, m4a1dd_count, [2.0]);
            apply_mod!(a13, t2_tank_count, [2.4, 2.4 * 1.35]);

            let ship_is_dd_or_cl = matches!(attacker.ship_type, ShipType::DD | ShipType::CL);
            apply_mod!(a13, ship_is_dd_or_cl, 1.4);

            if is_day {
                apply_mod!(a13, armored_boat_group_count, [1.3, 1.3 * 1.2]);
            }
        }
        SpecialEnemyType::IsolatedIsland => {
            apply_mod!(a13, has_aa_shell, 1.75);
            apply_mod!(a13, wg42_count, [1.4, 1.4 * 1.5]);
            apply_mod!(a13, type4_rocket_group_count, [1.3, 1.3 * 1.65]);
            apply_mod!(a13, mortar_group_count, [1.2, 1.2 * 1.4]);
            apply_mod!(a13, cb_dive_bomber_count, [1.4, 1.4 * 1.75]);
            apply_mod!(a13, landing_craft_count, [1.8]);
            apply_mod!(a13, toku_daihatsu_count, [1.15]);
            apply_mod!(a13, t89_tank_count, [1.2, 1.2 * 1.4]);
            apply_mod!(a13, shikon_count, [1.8]);
            apply_mod!(a13, m4a1dd_count, [1.8]);
            apply_mod!(a13, t2_tank_count, [2.4, 2.4 * 1.35]);

            if is_day {
                apply_mod!(a13, armored_boat_group_count, [1.3, 1.3 * 1.1]);
            }
        }
        SpecialEnemyType::HarbourSummerPrincess => {
            apply_mod!(a13, has_aa_shell, 1.75);
            apply_mod!(a13, has_ap_shell, 1.3);
            apply_mod!(a13, wg42_count, [1.4, 1.4 * 1.2]);
            apply_mod!(a13, type4_rocket_group_count, [1.25, 1.25 * 1.4]);
            apply_mod!(a13, mortar_group_count, [1.1, 1.1 * 1.15]);
            apply_mod!(a13, has_seaplane, 1.3);
            apply_mod!(a13, cb_dive_bomber_count, [1.3, 1.3 * 1.2]);
            apply_mod!(a13, landing_craft_count, [1.7]);
            apply_mod!(a13, toku_daihatsu_count, [1.2]);
            apply_mod!(a13, t89_tank_count, [1.6, 1.6 * 1.5]);
            apply_mod!(a13, shikon_count, [1.8]);
            apply_mod!(a13, m4a1dd_count, [2.0]);
            apply_mod!(a13, t2_tank_count, [2.8]);
        }
        SpecialEnemyType::SoftSkinned | SpecialEnemyType::SupplyDepot => {
            apply_mod!(a13, has_aa_shell, 2.5);
            apply_mod!(a13, wg42_count, [1.3, 1.3 * 1.4]);
            apply_mod!(a13, type4_rocket_group_count, [1.25, 1.25 * 1.5]);
            apply_mod!(a13, mortar_group_count, [1.2, 1.2 * 1.3]);
            apply_mod!(a13, has_seaplane, 1.2);
            apply_mod!(a13, landing_craft_count, [1.2]);
            apply_mod!(a13, toku_daihatsu_count, [1.15]);
            apply_mod!(a13, t89_tank_count, [1.5, 1.5 * 1.3]);
            apply_mod!(a13, shikon_count, [1.8]);
            apply_mod!(a13, m4a1dd_count, [1.1]);
            apply_mod!(a13, t2_tank_count, [1.5, 1.5 * 1.2]);

            if is_day {
                apply_mod!(a13, armored_boat_group_count, [1.1, 1.1 * 1.1]);
            }
        }
        _ => (),
    }

    mods
}
