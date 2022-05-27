use crate::{
    ship::Ship,
    types::{gear_id, GearType, ShipType, SpecialEnemyType},
};

use super::SpecialEnemyModifiers;

macro_rules! apply_mod_impl {
    ($name1:expr, a, $v:expr) => {
        $name1.a *= $v
    };

    ($name1:expr, b, $v:expr) => {
        $name1.b += $v
    };
}

macro_rules! apply_mod {
    ($name1:expr, $name2:ident, $e:expr, [ $v1:expr ]) => {
        if $e >= 1 {
            apply_mod_impl!($name1, $name2, $v1)
        }
    };

    ($name1:expr, $name2:ident, $e:expr, [ $v1:expr, $v2:expr ]) => {
        match $e {
            0 => (),
            1 => apply_mod_impl!($name1, $name2, $v1),
            2 => apply_mod_impl!($name1, $name2, $v2),
            _ => apply_mod_impl!($name1, $name2, $v2),
        }
    };

    ($name1:expr, $name2:ident, $e:expr, [ $v1:expr, $v2:expr, $v3:expr ]) => {
        match $e {
            0 => (),
            1 => apply_mod_impl!($name1, $name2, $v1),
            2 => apply_mod_impl!($name1, $name2, $v2),
            3 => apply_mod_impl!($name1, $name2, $v3),
            _ => apply_mod_impl!($name1, $name2, $v3),
        }
    };

    ($name1:expr, $name2:ident, $e:expr, [ $v1:expr, $v2:expr, $v3:expr, $v4:expr ]) => {
        match $e {
            0 => (),
            1 => apply_mod_impl!($name1, $name2, $v1),
            2 => apply_mod_impl!($name1, $name2, $v2),
            3 => apply_mod_impl!($name1, $name2, $v3),
            4 => apply_mod_impl!($name1, $name2, $v4),
            _ => apply_mod_impl!($name1, $name2, $v4),
        }
    };

    ($name1:expr, $name2:ident, $e:expr, [ $v1:expr, $v2:expr, $v3:expr, $v4:expr, $v5:expr ]) => {
        match $e {
            0 => (),
            1 => apply_mod_impl!($name1, $name2, $v1),
            2 => apply_mod_impl!($name1, $name2, $v2),
            3 => apply_mod_impl!($name1, $name2, $v3),
            4 => apply_mod_impl!($name1, $name2, $v4),
            5 => apply_mod_impl!($name1, $name2, $v5),
            _ => apply_mod_impl!($name1, $name2, $v5),
        }
    };

    ($name1:expr, $name2:ident, $e:expr, $v:expr) => {
        if $e {
            apply_mod_impl!($name1, $name2, $v);
        }
    };
}

/// 砲撃支援特効補正
pub fn shelling_support_special_enemy_modifiers(
    attacker: &Ship,
    special_enemy_type: SpecialEnemyType,
) -> SpecialEnemyModifiers {
    let mut mods = SpecialEnemyModifiers::new();

    if attacker.gears.has_type(GearType::AntiAirShell) {
        let aa_shell_mod = match special_enemy_type {
            SpecialEnemyType::IsolatedIsland | SpecialEnemyType::HarbourSummerPrincess => 1.75,
            SpecialEnemyType::SoftSkinned | SpecialEnemyType::SupplyDepot => 2.5,
            _ => 1.0,
        };

        mods.precap_general_mod.a *= aa_shell_mod;
    }

    mods
}

/// 特効補正
pub fn special_enemy_modifiers(
    attacker: &Ship,
    special_enemy_type: SpecialEnemyType,
    is_day: bool,
) -> SpecialEnemyModifiers {
    let mut mods = SpecialEnemyModifiers::new();

    if special_enemy_type.is_none() {
        return mods;
    }

    let gears = &attacker.gears;

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
            let small_gun_count = gears.count_type(GearType::SmallMainGun);
            let sec_gun_count = gears.count_type(GearType::SecondaryGun);
            let jet_fighter_bomber_count = gears.count_type(GearType::JetFighterBomber);
            let aa_gun_count = gears.count_type(GearType::AntiAirGun);
            let lookouts_count = gears.count_type(GearType::ShipPersonnel);

            mods.postcap_general_mod.merge(0.35, 15.0);

            apply_mod!(mods.pt_mod, a, small_gun_count, [1.5, 1.5 * 1.4]);
            apply_mod!(mods.pt_mod, a, sec_gun_count, [1.3]);
            apply_mod!(
                mods.pt_mod,
                a,
                cb_dive_bomber_count.max(jet_fighter_bomber_count),
                [1.4, 1.4 * 1.3]
            );
            apply_mod!(mods.pt_mod, a, aa_gun_count, [1.2, 1.2 * 1.2]);
            apply_mod!(mods.pt_mod, a, lookouts_count, [1.1]);
            apply_mod!(mods.pt_mod, a, armored_boat_group_count, [1.2, 1.2 * 1.1]);

            return mods;
        }
        SpecialEnemyType::BattleshipSummerPrincess => {
            apply_mod!(mods.postcap_general_mod, a, has_seaplane, 1.1);
            apply_mod!(mods.postcap_general_mod, a, has_ap_shell, 1.2);

            return mods;
        }
        SpecialEnemyType::HeavyCruiserSummerPrincess => {
            apply_mod!(mods.postcap_general_mod, a, has_seaplane, 1.15);
            apply_mod!(mods.postcap_general_mod, a, has_ap_shell, 1.1);

            return mods;
        }
        _ => (),
    }

    if !special_enemy_type.is_installation() {
        return mods;
    }

    let wg42_count = gears.count(gear_id!("WG42 (Wurfgerät 42)"));

    let mortar_count = gears.count(gear_id!("二式12cm迫撃砲改"));
    let mortar_cd_count = gears.count(gear_id!("二式12cm迫撃砲改 集中配備"));
    let mortar_group_count = mortar_count + mortar_cd_count;

    let type4_rocket_count = gears.count(gear_id!("艦載型 四式20cm対地噴進砲"));
    let type4_rocket_cd_count = gears.count(gear_id!("四式20cm対地噴進砲 集中配備"));
    let type4_rocket_group_count = type4_rocket_count + type4_rocket_cd_count;

    let landing_craft_count = gears.count_type(GearType::LandingCraft);
    let tank_count = gears.count_type(GearType::AmphibiousTank);

    let toku_daihatsu_count = gears.count(gear_id!("特大発動艇"));
    let t89_tank_count = gears.count(gear_id!("大発動艇(八九式中戦車&陸戦隊)"));
    let africa_count = gears.count(gear_id!("大発動艇(II号戦車/北アフリカ仕様)"));
    let shikon_count = gears.count(gear_id!("特大発動艇+戦車第11連隊"));
    let m4a1dd_count = gears.count(gear_id!("M4A1 DD"));
    let honi_count = gears.count(gear_id!("特大発動艇+一式砲戦車"));

    let t2_tank_count = gears.count(gear_id!("特二式内火艇"));

    let toku_daihatsu_tank_count = shikon_count + honi_count;
    let t89_tank_or_honi_count = t89_tank_count + honi_count;

    // 改修補正
    let landing_craft_stars = gears.sum_by(|gear| {
        if gear.gear_type == GearType::LandingCraft {
            gear.stars
        } else {
            0
        }
    });

    let tank_stars = gears.sum_by(|gear| {
        if gear.gear_type == GearType::AmphibiousTank {
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

    mods.precap_general_mod.a *= landing_craft_ibonus * tank_ibonus;

    apply_mod!(
        mods.precap_general_mod,
        b,
        wg42_count,
        [75.0, 110.0, 140.0, 160.0, 160.0]
    );
    apply_mod!(
        mods.precap_general_mod,
        b,
        mortar_count,
        [30.0, 55.0, 75.0, 90.0, 90.0]
    );
    apply_mod!(
        mods.precap_general_mod,
        b,
        mortar_cd_count,
        [60.0, 110.0, 150.0, 150.0, 150.0]
    );
    apply_mod!(
        mods.precap_general_mod,
        b,
        type4_rocket_count,
        [55.0, 115.0, 160.0, 190.0, 190.0]
    );
    apply_mod!(
        mods.precap_general_mod,
        b,
        type4_rocket_cd_count,
        [80.0, 170.0, 170.0, 170.0, 170.0]
    );

    // 艦種補正
    apply_mod!(
        mods.stype_mod,
        b,
        matches!(attacker.ship_type, ShipType::SS | ShipType::SSV),
        30.0
    );

    // 特大発戦車補正
    if toku_daihatsu_tank_count > 0 {
        mods.toku_daihatsu_tank_mod.merge(1.8, 25.0);
    }

    // M4A1DD
    if m4a1dd_count > 0 {
        mods.m4a1dd_mod.merge(1.4, 35.0);
    }

    // 特大発動艇+一式砲戦車
    if honi_count > 0 {
        mods.honi_mod.merge(1.3, 42.0);
    }

    // 陸上共通 支援上陸用舟艇シナジー
    let calc_landing_craft_synergy_bonuses = || {
        if armored_boat_group_count == 0 {
            return None;
        }

        if armored_boat_group_count >= 2 && (ab_count == 0 || armed_count == 0) {
            return None;
        }

        let daihatsu_count = gears.count(gear_id!("大発動艇"));
        let dlc_group1_count =
            daihatsu_count + toku_daihatsu_count + t89_tank_count + africa_count + honi_count;
        let dlc_group2_count = shikon_count + t2_tank_count;

        if dlc_group1_count + dlc_group2_count == 0 {
            return None;
        }

        let mut a13_2 = 1.2;
        let mut b13_2 = 10.0;

        if armored_boat_group_count == 1 {
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

    if let Some((a, b)) = calc_landing_craft_synergy_bonuses() {
        mods.landing_craft_synergy_mod.merge(a, b);
    }

    if special_enemy_type == SpecialEnemyType::SupplyDepot {
        let mut n = 1.0;

        if t89_tank_or_honi_count > 0 {
            n += 1.0;
        }
        if africa_count > 0 {
            n += 1.0;
        }

        mods.postcap_general_mod.a *= landing_craft_ibonus.powf(n);
        mods.postcap_general_mod.a *= tank_ibonus;

        apply_mod!(mods.postcap_general_mod, a, wg42_count, [1.25, 1.25 * 1.3]);
        apply_mod!(
            mods.postcap_general_mod,
            a,
            type4_rocket_group_count,
            [1.2, 1.2 * 1.4]
        );
        apply_mod!(
            mods.postcap_general_mod,
            a,
            mortar_group_count,
            [1.15, 1.15 * 1.2]
        );
        apply_mod!(mods.postcap_general_mod, a, landing_craft_count, [1.7]);
        apply_mod!(mods.postcap_general_mod, a, toku_daihatsu_count, [1.2]);
        apply_mod!(
            mods.postcap_general_mod,
            a,
            t89_tank_or_honi_count,
            [1.3, 1.3 * 1.6]
        );
        apply_mod!(mods.postcap_general_mod, a, m4a1dd_count, [1.2]);
        apply_mod!(mods.postcap_general_mod, a, t2_tank_count, [1.7, 1.7 * 1.5]);
        apply_mod!(mods.postcap_general_mod, a, africa_count, [1.3]); //2積み検証待ち
        apply_mod!(
            mods.postcap_general_mod,
            a,
            armored_boat_group_count,
            [1.5, 1.5 * 1.1]
        );
    }

    match special_enemy_type {
        SpecialEnemyType::Pillbox => {
            apply_mod!(mods.precap_general_mod, a, has_ap_shell, 1.85);
            apply_mod!(mods.precap_general_mod, a, wg42_count, [1.6, 1.6 * 1.7]);
            apply_mod!(
                mods.precap_general_mod,
                a,
                type4_rocket_group_count,
                [1.5, 1.5 * 1.8]
            );
            apply_mod!(
                mods.precap_general_mod,
                a,
                mortar_group_count,
                [1.3, 1.3 * 1.5]
            );
            apply_mod!(mods.precap_general_mod, a, has_seaplane, 1.5);
            apply_mod!(
                mods.precap_general_mod,
                a,
                cb_dive_bomber_count,
                [1.5, 1.5 * 2.0]
            );
            apply_mod!(mods.precap_general_mod, a, landing_craft_count, [1.8]);
            apply_mod!(mods.precap_general_mod, a, toku_daihatsu_count, [1.15]);
            apply_mod!(
                mods.precap_general_mod,
                a,
                t89_tank_or_honi_count,
                [1.5, 1.5 * 1.4]
            );
            apply_mod!(mods.precap_general_mod, a, africa_count, [1.5]); //2積み検証待ち
            apply_mod!(mods.precap_general_mod, a, m4a1dd_count, [2.0]);
            apply_mod!(mods.precap_general_mod, a, t2_tank_count, [2.4, 2.4 * 1.35]);

            let ship_is_dd_or_cl = matches!(attacker.ship_type, ShipType::DD | ShipType::CL);
            apply_mod!(mods.precap_general_mod, a, ship_is_dd_or_cl, 1.4);

            if is_day {
                apply_mod!(
                    mods.precap_general_mod,
                    a,
                    armored_boat_group_count,
                    [1.3, 1.3 * 1.2]
                );
            }
        }
        SpecialEnemyType::IsolatedIsland => {
            apply_mod!(mods.precap_general_mod, a, has_aa_shell, 1.75);
            apply_mod!(mods.precap_general_mod, a, wg42_count, [1.4, 1.4 * 1.5]);
            apply_mod!(
                mods.precap_general_mod,
                a,
                type4_rocket_group_count,
                [1.3, 1.3 * 1.65]
            );
            apply_mod!(
                mods.precap_general_mod,
                a,
                mortar_group_count,
                [1.2, 1.2 * 1.4]
            );
            apply_mod!(
                mods.precap_general_mod,
                a,
                cb_dive_bomber_count,
                [1.4, 1.4 * 1.75]
            );
            apply_mod!(mods.precap_general_mod, a, landing_craft_count, [1.8]);
            apply_mod!(mods.precap_general_mod, a, toku_daihatsu_count, [1.15]);
            apply_mod!(
                mods.precap_general_mod,
                a,
                t89_tank_or_honi_count,
                [1.2, 1.2 * 1.4]
            );
            // apply_mod!(mods.precap_general_mod,a, africa_count, [1.2]); //検証待ち
            apply_mod!(mods.precap_general_mod, a, m4a1dd_count, [1.8]);
            apply_mod!(mods.precap_general_mod, a, t2_tank_count, [2.4, 2.4 * 1.35]);

            if is_day {
                apply_mod!(
                    mods.precap_general_mod,
                    a,
                    armored_boat_group_count,
                    [1.3, 1.3 * 1.1]
                );
            }
        }
        SpecialEnemyType::HarbourSummerPrincess => {
            apply_mod!(mods.precap_general_mod, a, has_aa_shell, 1.75);
            apply_mod!(mods.precap_general_mod, a, has_ap_shell, 1.3);
            apply_mod!(mods.precap_general_mod, a, wg42_count, [1.4, 1.4 * 1.2]);
            apply_mod!(
                mods.precap_general_mod,
                a,
                type4_rocket_group_count,
                [1.25, 1.25 * 1.4]
            );
            apply_mod!(
                mods.precap_general_mod,
                a,
                mortar_group_count,
                [1.1, 1.1 * 1.15]
            );
            apply_mod!(mods.precap_general_mod, a, has_seaplane, 1.3);
            apply_mod!(
                mods.precap_general_mod,
                a,
                cb_dive_bomber_count,
                [1.3, 1.3 * 1.2]
            );
            apply_mod!(mods.precap_general_mod, a, landing_craft_count, [1.7]);
            apply_mod!(mods.precap_general_mod, a, toku_daihatsu_count, [1.2]);
            apply_mod!(
                mods.precap_general_mod,
                a,
                t89_tank_or_honi_count,
                [1.6, 1.6 * 1.5]
            );
            // apply_mod!(mods.precap_general_mod,a, africa_count, [1.6]); //検証待ち
            apply_mod!(mods.precap_general_mod, a, m4a1dd_count, [2.0]);
            apply_mod!(mods.precap_general_mod, a, t2_tank_count, [2.8]);
        }
        SpecialEnemyType::SoftSkinned | SpecialEnemyType::SupplyDepot => {
            apply_mod!(mods.precap_general_mod, a, has_aa_shell, 2.5);
            apply_mod!(mods.precap_general_mod, a, wg42_count, [1.3, 1.3 * 1.4]);
            apply_mod!(
                mods.precap_general_mod,
                a,
                type4_rocket_group_count,
                [1.25, 1.25 * 1.5]
            );
            apply_mod!(
                mods.precap_general_mod,
                a,
                mortar_group_count,
                [1.2, 1.2 * 1.3]
            );
            apply_mod!(mods.precap_general_mod, a, has_seaplane, 1.2);
            apply_mod!(mods.precap_general_mod, a, landing_craft_count, [1.4]);
            apply_mod!(mods.precap_general_mod, a, toku_daihatsu_count, [1.15]);
            apply_mod!(
                mods.precap_general_mod,
                a,
                t89_tank_or_honi_count,
                [1.5, 1.5 * 1.3]
            );
            apply_mod!(mods.precap_general_mod, a, africa_count, [1.5]); //2積み検証待ち
            apply_mod!(mods.precap_general_mod, a, m4a1dd_count, [1.1]);
            apply_mod!(mods.precap_general_mod, a, t2_tank_count, [1.5, 1.5 * 1.2]);

            if is_day {
                apply_mod!(
                    mods.precap_general_mod,
                    a,
                    armored_boat_group_count,
                    [1.1, 1.1 * 1.1]
                );
            }
        }
        _ => (),
    }

    mods
}
