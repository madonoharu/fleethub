use crate::{
    attack::LandingCraftModifiers,
    ship::Ship,
    types::{
        AttackPowerModifier, AttackType, GearAttr, GearType, NightAttackType, ShellingType,
        ShipType, SpecialEnemyModifiers, SpecialEnemyType, ctype, gear_id, matches_gear_id,
    },
};

impl Ship {
    /// 特効補正
    pub fn special_enemy_mods(
        &self,
        special_enemy_type: SpecialEnemyType,
        attack_type: AttackType,
    ) -> SpecialEnemyModifiers {
        special_enemy_modifiers(self, special_enemy_type, attack_type)
    }
}

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

fn anti_pt_imp_modifiers(attacker: &Ship, attack_type: AttackType) -> SpecialEnemyModifiers {
    let mut mods = SpecialEnemyModifiers::new();
    let gears = &attacker.gears;

    match attack_type {
        AttackType::Shelling(_) | AttackType::Night(_) => {
            let mut pt_mod = AttackPowerModifier::default();

            let small_gun_count = gears.count_type(GearType::SmallMainGun);
            let sec_gun_count = gears.count_type(GearType::SecondaryGun);
            let aa_gun_count = gears.count_type(GearType::AntiAirGun);
            let lookouts_count = gears.count_type(GearType::ShipPersonnel);

            let ab_count = gears.count(gear_id!("装甲艇(AB艇)"));
            let armed_count = gears.count(gear_id!("武装大発"));
            let armored_boat_group_count = ab_count + armed_count;

            let armored_boat_group_stars_average = gears
                .mean_by(|gear| {
                    (matches_gear_id!(gear.gear_id, "装甲艇(AB艇)" | "武装大発"))
                        .then(|| gear.stars as f64)
                })
                .unwrap_or_default();

            let cb_dive_bomber_count = gears.count_type(GearType::CbDiveBomber);
            let jet_fighter_bomber_count = gears.count_type(GearType::JetFighterBomber);
            let has_seaplane = gears.has_type(GearType::SeaplaneBomber)
                || gears.has_type(GearType::SeaplaneFighter);

            apply_mod!(pt_mod, a, small_gun_count, [1.5, 1.5 * 1.4]);
            apply_mod!(pt_mod, a, sec_gun_count, [1.3]);
            apply_mod!(
                pt_mod,
                a,
                cb_dive_bomber_count.max(jet_fighter_bomber_count),
                [1.4, 1.4 * 1.3]
            );
            apply_mod!(pt_mod, a, has_seaplane, 1.2);
            apply_mod!(pt_mod, a, aa_gun_count, [1.2, 1.2 * 1.2]);
            apply_mod!(pt_mod, a, lookouts_count, [1.1]);
            apply_mod!(pt_mod, a, armored_boat_group_count, [1.2, 1.2 * 1.1]);

            pt_mod.a *= 1.0 + armored_boat_group_stars_average / 50.0;

            if attack_type.is_night() {
                pt_mod.a *= 0.6;
            }

            mods.pt_mod = Some(pt_mod);
        }

        AttackType::Torpedo => {
            mods.pt_mod = Some(Default::default());
        }

        _ => (),
    }

    mods
}

/// 戦艦夏姫
fn anti_battleship_summer_princess_modifiers(
    attacker: &Ship,
    attack_type: AttackType,
) -> SpecialEnemyModifiers {
    if !matches!(attack_type, AttackType::Shelling(_) | AttackType::Night(_)) {
        return Default::default();
    }

    let mut mods = SpecialEnemyModifiers::new();
    let gears = &attacker.gears;

    let has_aa_shell = gears.has_type(GearType::ApShell);
    apply_mod!(mods.postcap_general_mod, a, has_aa_shell, 1.2);

    let has_seaplane = gears.has_by(|gear| {
        matches!(
            gear.gear_type,
            GearType::SeaplaneBomber | GearType::SeaplaneFighter
        )
    });
    apply_mod!(mods.postcap_general_mod, a, has_seaplane, 1.1);

    let cb_swordfish_count = gears.count_attr(GearAttr::CbSwordfish);
    apply_mod!(
        mods.postcap_general_mod,
        a,
        cb_swordfish_count,
        [1.15, 1.15 * 1.05]
    );

    if matches!(
        attacker.ctype,
        ctype!("Bismarck級")
            | ctype!("Admiral Hipper級")
            | ctype!("Ark Royal級")
            | ctype!("Gotland級")
            | ctype!("Nelson級")
    ) {
        mods.postcap_general_mod.a *= 1.1
    }

    mods
}

/// 重巡夏姫
fn anti_heavy_cruiser_summer_princess_modifiers(
    attacker: &Ship,
    attack_type: AttackType,
) -> SpecialEnemyModifiers {
    if !matches!(attack_type, AttackType::Shelling(_) | AttackType::Night(_)) {
        return Default::default();
    }

    let mut mods = SpecialEnemyModifiers::new();
    let gears = &attacker.gears;

    let has_aa_shell = gears.has_type(GearType::ApShell);
    apply_mod!(mods.postcap_general_mod, a, has_aa_shell, 1.1);

    let has_seaplane = gears.has_by(|gear| {
        matches!(
            gear.gear_type,
            GearType::SeaplaneBomber | GearType::SeaplaneFighter
        )
    });
    apply_mod!(mods.postcap_general_mod, a, has_seaplane, 1.15);

    let cb_swordfish_count = gears.count_attr(GearAttr::CbSwordfish);
    apply_mod!(
        mods.postcap_general_mod,
        a,
        cb_swordfish_count,
        [1.1, 1.1 * 1.1]
    );

    if matches!(
        attacker.ctype,
        ctype!("Bismarck級")
            | ctype!("Admiral Hipper級")
            | ctype!("Ark Royal級")
            | ctype!("Gotland級")
            | ctype!("Nelson級")
    ) {
        mods.postcap_general_mod.a *= 1.1
    }

    mods
}

/// 戦艦仏棲姫
fn anti_french_battleship_princess_modifiers(
    attacker: &Ship,
    attack_type: AttackType,
) -> SpecialEnemyModifiers {
    if !matches!(attack_type, AttackType::Shelling(_) | AttackType::Night(_)) {
        return Default::default();
    }

    let gears = &attacker.gears;
    let mut mods = SpecialEnemyModifiers::new();

    let has_aa_shell = gears.has_type(GearType::ApShell);
    apply_mod!(mods.postcap_general_mod, a, has_aa_shell, 1.2);

    let has_seaplane = gears.has_by(|gear| {
        matches!(
            gear.gear_type,
            GearType::SeaplaneBomber | GearType::SeaplaneFighter
        )
    });
    apply_mod!(mods.postcap_general_mod, a, has_seaplane, 1.1);

    apply_mod!(
        mods.postcap_general_mod,
        a,
        gears.has(gear_id!("Laté 298B")),
        1.2
    );

    let dive_bomber_count =
        gears.count_type(GearType::CbDiveBomber) + gears.count_type(GearType::JetFighterBomber);
    apply_mod!(
        mods.postcap_general_mod,
        a,
        dive_bomber_count,
        [1.1, 1.1 * 1.15]
    );

    apply_mod!(
        mods.postcap_general_mod,
        a,
        attacker.master.nationality == 34,
        1.15
    );

    mods
}

/// 空母夏鬼
fn anti_summer_aircraft_carrier_demon_modifiers(
    attacker: &Ship,
    attack_type: AttackType,
) -> SpecialEnemyModifiers {
    if !matches!(attack_type, AttackType::Shelling(_) | AttackType::Night(_)) {
        return Default::default();
    }

    let gears = &attacker.gears;
    let mut mods = SpecialEnemyModifiers::new();

    let has_aa_shell = gears.has_type(GearType::ApShell);
    apply_mod!(mods.postcap_general_mod, a, has_aa_shell, 1.1);

    let has_seaplane = gears.has_by(|gear| {
        matches!(
            gear.gear_type,
            GearType::SeaplaneBomber | GearType::SeaplaneFighter
        )
    });
    apply_mod!(mods.postcap_general_mod, a, has_seaplane, 1.1);

    let dive_bomber_count =
        gears.count_type(GearType::CbDiveBomber) + gears.count_type(GearType::JetFighterBomber);
    apply_mod!(
        mods.postcap_general_mod,
        a,
        dive_bomber_count,
        [1.1, 1.1 * 1.1]
    );

    let cb_swordfish_count = gears.count_attr(GearAttr::CbSwordfish);
    apply_mod!(
        mods.postcap_general_mod,
        a,
        cb_swordfish_count,
        [1.1, 1.1 * 1.2]
    );

    if matches!(
        attacker.ctype,
        ctype!("Bismarck級")
            | ctype!("Admiral Hipper級")
            | ctype!("Ark Royal級")
            | ctype!("Gotland級")
            | ctype!("Nelson級")
    ) {
        mods.postcap_general_mod.a *= 1.1
    }

    mods
}

/// 泊地水鬼 バカンスmode
fn anti_anchorage_water_demon_vacation_mode_modifiers(
    attacker: &Ship,
    attack_type: AttackType,
) -> SpecialEnemyModifiers {
    let mut mods = SpecialEnemyModifiers::new();
    if !matches!(attack_type, AttackType::Shelling(_) | AttackType::Night(_)) {
        return mods;
    }

    let dlc_mods = LandingCraftModifiers::new(
        attacker,
        attack_type,
        SpecialEnemyType::AnchorageWaterDemonVacationMode,
    );
    mods.postcap_general_mod.a *= dlc_mods.postcap;

    let gears = &attacker.gears;

    let dive_bomber_count =
        gears.count_type(GearType::CbDiveBomber) + gears.count_type(GearType::JetFighterBomber);
    apply_mod!(
        mods.postcap_general_mod,
        a,
        dive_bomber_count,
        [1.4, 1.4 * 1.75]
    );

    let wg42_count = gears.count(gear_id!("WG42 (Wurfgerät 42)"));
    apply_mod!(mods.postcap_general_mod, a, wg42_count, [1.2, 1.2 * 1.3]);

    let type4_rocket_count = gears.count(gear_id!("艦載型 四式20cm対地噴進砲"));
    let type4_rocket_cd_count = gears.count(gear_id!("四式20cm対地噴進砲 集中配備"));
    let type4_rocket_group_count = type4_rocket_count + type4_rocket_cd_count;
    apply_mod!(
        mods.postcap_general_mod,
        a,
        type4_rocket_group_count,
        [1.15, 1.15 * 1.4]
    );

    let mortar_count = gears.count(gear_id!("二式12cm迫撃砲改"));
    let mortar_cd_count = gears.count(gear_id!("二式12cm迫撃砲改 集中配備"));
    let mortar_group_count = mortar_count + mortar_cd_count;
    apply_mod!(mods.postcap_general_mod, a, mortar_group_count, [1.1]);

    let has_aa_shell = gears.has_type(GearType::AntiAirShell);
    apply_mod!(mods.postcap_general_mod, a, has_aa_shell, 1.45);

    if attacker.ctype == ctype!("大和型") || attacker.ctype == ctype!("長門型") {
        mods.postcap_general_mod.a *= 1.2;
    }

    mods
}

/// 船渠棲姫
fn anti_dock_princess_modifiers(attacker: &Ship, attack_type: AttackType) -> SpecialEnemyModifiers {
    if !matches!(
        attack_type,
        AttackType::Shelling(_) | AttackType::Night(_) | AttackType::Torpedo
    ) {
        return Default::default();
    }

    let gears = &attacker.gears;
    let mut mods = SpecialEnemyModifiers::new();

    let dlc_mods =
        LandingCraftModifiers::new(attacker, attack_type, SpecialEnemyType::DockPrincess);
    mods.postcap_general_mod.a *= dlc_mods.postcap;

    let dive_bomber_count =
        gears.count_type(GearType::CbDiveBomber) + gears.count_type(GearType::JetFighterBomber);
    apply_mod!(
        mods.postcap_general_mod,
        a,
        dive_bomber_count,
        [1.1, 1.1 * 1.1]
    );

    let has_seaplane = gears.has_by(|gear| {
        matches!(
            gear.gear_type,
            GearType::SeaplaneBomber | GearType::SeaplaneFighter
        )
    });
    apply_mod!(mods.postcap_general_mod, a, has_seaplane, 1.1);

    let wg42_count = gears.count(gear_id!("WG42 (Wurfgerät 42)"));
    apply_mod!(mods.postcap_general_mod, a, wg42_count, [1.1, 1.2]);

    let has_aa_shell = gears.has_type(GearType::AntiAirShell);
    apply_mod!(mods.postcap_general_mod, a, has_aa_shell, 1.3);

    if attacker.master.nationality == 31 {
        mods.postcap_general_mod.a *= 1.1;
    }

    mods
}

/// 欧州水姫
fn anti_european_water_princess_modifiers(
    attacker: &Ship,
    attack_type: AttackType,
) -> SpecialEnemyModifiers {
    if !matches!(attack_type, AttackType::Shelling(_) | AttackType::Night(_)) {
        return Default::default();
    }

    let mut mods = SpecialEnemyModifiers::new();
    let gears = &attacker.gears;

    let has_aa_shell = gears.has_type(GearType::ApShell);
    apply_mod!(mods.postcap_general_mod, a, has_aa_shell, 1.15);

    let has_seaplane = gears.has_by(|gear| {
        matches!(
            gear.gear_type,
            GearType::SeaplaneBomber | GearType::SeaplaneFighter
        )
    });
    apply_mod!(mods.postcap_general_mod, a, has_seaplane, 1.1);

    let cb_swordfish_count = gears.count_attr(GearAttr::CbSwordfish);
    apply_mod!(
        mods.postcap_general_mod,
        a,
        cb_swordfish_count,
        [1.2, 1.2 * 1.3]
    );

    if matches!(
        attacker.ctype,
        ctype!("Bismarck級")
            | ctype!("Admiral Hipper級")
            | ctype!("Ark Royal級")
            | ctype!("Gotland級")
            | ctype!("Nelson級")
    ) {
        mods.postcap_general_mod.a *= 1.15
    }

    mods
}

/// 特効補正
fn special_enemy_modifiers(
    attacker: &Ship,
    special_enemy_type: SpecialEnemyType,
    attack_type: AttackType,
) -> SpecialEnemyModifiers {
    match special_enemy_type {
        SpecialEnemyType::PtImp => {
            return anti_pt_imp_modifiers(attacker, attack_type);
        }
        SpecialEnemyType::BattleshipSummerPrincess => {
            return anti_battleship_summer_princess_modifiers(attacker, attack_type);
        }
        SpecialEnemyType::HeavyCruiserSummerPrincess => {
            return anti_heavy_cruiser_summer_princess_modifiers(attacker, attack_type);
        }
        SpecialEnemyType::AnchorageWaterDemonVacationMode => {
            return anti_anchorage_water_demon_vacation_mode_modifiers(attacker, attack_type);
        }
        SpecialEnemyType::FrenchBattleshipPrincess => {
            return anti_french_battleship_princess_modifiers(attacker, attack_type);
        }
        SpecialEnemyType::DockPrincess => {
            return anti_dock_princess_modifiers(attacker, attack_type);
        }
        SpecialEnemyType::SummerAircraftCarrierDemon => {
            return anti_summer_aircraft_carrier_demon_modifiers(attacker, attack_type);
        }
        SpecialEnemyType::EuropeanWaterPrincess => {
            return anti_european_water_princess_modifiers(attacker, attack_type);
        }
        SpecialEnemyType::None => {
            return Default::default();
        }
        _ => (),
    }

    match attack_type {
        AttackType::SupportShelling(_) => {
            return anti_inst_support_shelling_modifiers(attacker, special_enemy_type);
        }

        AttackType::Torpedo | AttackType::Asw(_) => {
            return Default::default();
        }

        AttackType::Shelling(_) | AttackType::Night(_) => (),
    }

    let mut mods = SpecialEnemyModifiers::new();
    let dlc_mods = LandingCraftModifiers::new(attacker, attack_type, special_enemy_type);
    mods.precap_general_mod.a *= dlc_mods.precap;
    mods.postcap_general_mod.a *= dlc_mods.postcap;

    let gears = &attacker.gears;

    let has_seaplane = gears.has_by(|gear| {
        matches!(
            gear.gear_type,
            GearType::SeaplaneBomber | GearType::SeaplaneFighter
        )
    });
    let has_aa_shell = gears.has_type(GearType::AntiAirShell);
    let has_ap_shell = gears.has_type(GearType::ApShell);

    let dive_bomber_count = if matches!(
        attack_type,
        AttackType::Shelling(ShellingType::Aerial) | AttackType::Night(NightAttackType::Aerial)
    ) {
        gears.count_attr(GearAttr::AntiInstDiveBomber)
    } else {
        gears.count_type(GearType::CbDiveBomber) + gears.count_type(GearType::JetFighterBomber)
    };

    let wg42_count = gears.count(gear_id!("WG42 (Wurfgerät 42)"));
    let type4_rocket_count = gears.count(gear_id!("艦載型 四式20cm対地噴進砲"));
    let type4_rocket_cd_count = gears.count(gear_id!("四式20cm対地噴進砲 集中配備"));
    let type4_rocket_group_count = type4_rocket_count + type4_rocket_cd_count;
    let mortar_count = gears.count(gear_id!("二式12cm迫撃砲改"));
    let mortar_cd_count = gears.count(gear_id!("二式12cm迫撃砲改 集中配備"));
    let mortar_group_count = mortar_count + mortar_cd_count;

    let toku_dlc_count = gears.count(gear_id!("特大発動艇"));
    let t89_tank_count = gears.count(gear_id!("大発動艇(八九式中戦車&陸戦隊)"));
    let panzer2_count = gears.count(gear_id!("大発動艇(II号戦車/北アフリカ仕様)"));
    let m4a1dd_count = gears.count(gear_id!("M4A1 DD"));
    let ab_count = gears.count(gear_id!("装甲艇(AB艇)"));
    let armed_count = gears.count(gear_id!("武装大発"));
    let shikon_count = gears.count(gear_id!("特大発動艇+戦車第11連隊"));
    let honi1_count = gears.count(gear_id!("特大発動艇+一式砲戦車"));
    let toku_dlc_panzer3_count = gears.count(gear_id!("特大発動艇+Ⅲ号戦車(北アフリカ仕様)"));
    let toku_dlc_panzer3_j_count = gears.count(gear_id!("特大発動艇+Ⅲ号戦車J型"));
    let chiha_count = gears.count(gear_id!("特大発動艇+チハ"));
    let chiha_kai_count = gears.count(gear_id!("特大発動艇+チハ改"));
    let t2_tank_count = gears.count(gear_id!("特二式内火艇"));
    let t4_tank_count = gears.count(gear_id!("特四式内火艇"));
    let t4_tank_kai_count = gears.count(gear_id!("特四式内火艇改"));
    let army_infantry_count = gears.count(gear_id!("陸軍歩兵部隊"));
    let t97_tank_chiha_count = gears.count(gear_id!("九七式中戦車(チハ)"));
    let t97_tank_chiha_kai_count = gears.count(gear_id!("九七式中戦車 新砲塔(チハ改)"));
    let army_infantry_chiha_kai_count = gears.count(gear_id!("陸軍歩兵部隊+チハ改"));

    let dlc_sp1_count =
        shikon_count + honi1_count + toku_dlc_panzer3_count + toku_dlc_panzer3_j_count;
    let dlc_sp2_count = m4a1dd_count;
    let dlc_sp3_count = honi1_count;
    let dlc_sp4_count = chiha_count;
    let dlc_sp5_count = chiha_kai_count;
    let landing_forces_count = army_infantry_count
        + t97_tank_chiha_count
        + t97_tank_chiha_kai_count
        + army_infantry_chiha_kai_count;

    // 集積地キャップ後補正
    if matches!(
        special_enemy_type,
        SpecialEnemyType::SupplyDepot | SpecialEnemyType::NewSupplyDepot
    ) {
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
    }

    if special_enemy_type == SpecialEnemyType::NewSupplyDepot {
        return mods;
    }

    apply_mod!(
        mods.precap_general_mod,
        b,
        wg42_count,
        [75.0, 110.0, 140.0, 160.0]
    );
    apply_mod!(
        mods.precap_general_mod,
        b,
        mortar_count,
        [30.0, 55.0, 75.0, 90.0]
    );
    apply_mod!(
        mods.precap_general_mod,
        b,
        mortar_cd_count,
        [60.0, 110.0, 150.0, 180.0]
    );
    apply_mod!(
        mods.precap_general_mod,
        b,
        type4_rocket_count,
        [55.0, 115.0, 160.0, 190.0]
    );
    apply_mod!(
        mods.precap_general_mod,
        b,
        type4_rocket_cd_count,
        [80.0, 170.0, 230.0, 260.0]
    );

    // 艦種補正
    apply_mod!(
        mods.stype_mod,
        b,
        matches!(attacker.ship_type, ShipType::SS | ShipType::SSV),
        30.0
    );

    // 特殊上陸艇補正
    {
        if dlc_sp1_count >= 1 {
            mods.toku_daihatsu_tank_mod.merge(1.8, 25.0);
        }

        if dlc_sp2_count >= 1 {
            mods.m4a1dd_mod.merge(1.4, 35.0);
        }

        if dlc_sp3_count >= 1 {
            mods.honi_mod.merge(1.3, 42.0);
        }

        if dlc_sp4_count >= 1 {
            mods.toku_daihatsu_chiha_mod.merge(1.4, 28.0);
        }

        if dlc_sp5_count >= 1 {
            mods.toku_daihatsu_chiha_kai_mod.merge(1.5, 33.0);
        }

        if army_infantry_count + army_infantry_chiha_kai_count >= 1 {
            mods.army_infantry_mod.merge(1.2, 60.0);
        }

        if t97_tank_chiha_count + t97_tank_chiha_kai_count >= 1 {
            mods.t97_tank_chiha_mod.merge(1.5, 70.0);
        }

        if t97_tank_chiha_kai_count >= 1 {
            mods.t97_tank_chiha_kai_mod.merge(1.5, 50.0);
        }

        if army_infantry_chiha_kai_count >= 1 {
            mods.army_infantry_chiha_kai_mod.merge(1.6, 70.0);
        }

        if landing_forces_count >= 2 {
            mods.landing_forces_mod.merge(2.0, 100.0);
        }

        if landing_forces_count >= 2 {
            if army_infantry_chiha_kai_count >= 1
                || army_infantry_count
                    + t97_tank_chiha_count
                    + t97_tank_chiha_kai_count
                    + t2_tank_count
                    + t4_tank_count
                    + t4_tank_kai_count
                    >= 3
            {
                mods.landing_forces_group_mod.merge(3.0, 150.0);
            }
        }

        if landing_forces_count >= 2 || t4_tank_count >= 1 {
            mods.landing_forces_t4_mod.merge(1.0, 100.0);
        }

        if landing_forces_count >= 2 || t4_tank_kai_count >= 1 {
            mods.landing_forces_t4kai_mod.merge(1.0, 172.0);
        }

        if t4_tank_count + t4_tank_kai_count >= 1 {
            mods.t4_tank_group_mod.merge(1.2, 42.0);
        }

        if t4_tank_kai_count >= 1 {
            mods.t4_tank_kai_mod.merge(1.1, 28.0);
        }
    }

    // 上陸用舟艇シナジー
    let landing_craft_synergy_mod = {
        let daihatsu_count = gears.count(gear_id!("大発動艇"));
        let a = armed_count;
        let b = ab_count;
        let c = daihatsu_count
            + toku_dlc_count
            + t89_tank_count
            + panzer2_count
            + honi1_count
            + t4_tank_count
            + t4_tank_kai_count;
        let d =
            shikon_count + toku_dlc_panzer3_count + chiha_count + chiha_kai_count + t2_tank_count;

        match (a, b, c, d) {
            (1, 0, _, _) | (0, 1, _, _) if c + d >= 1 => Some((1.2, 10.0)),
            (1, 1, 1, 0) => Some((1.3, 15.0)),
            (1, 1, 0, 1) => Some((1.4, 20.0)),
            (1, 1, _, _) if c + d >= 2 => Some((1.5, 25.0)),
            _ => None,
        }
    };

    if let Some(v) = landing_craft_synergy_mod {
        mods.landing_craft_synergy_mod = v.into();
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
                dive_bomber_count,
                [1.5, 1.5 * 2.0]
            );

            let ship_is_dd_or_cl = matches!(attacker.ship_type, ShipType::DD | ShipType::CL);
            apply_mod!(mods.precap_general_mod, a, ship_is_dd_or_cl, 1.4);
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
                dive_bomber_count,
                [1.4, 1.4 * 1.75]
            );
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
                dive_bomber_count,
                [1.3, 1.3 * 1.2]
            );
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
        }
        _ => (),
    }

    mods
}

/// 砲撃支援特効補正
fn anti_inst_support_shelling_modifiers(
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
