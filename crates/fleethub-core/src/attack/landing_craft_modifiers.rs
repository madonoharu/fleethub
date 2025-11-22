use crate::{
    ship::Ship,
    types::{AttackType, GearType, SpecialEnemyType, gear_id, matches_gear_id},
};

pub struct LandingCraftModifiers {
    pub precap: f64,
    pub postcap: f64,
}

struct Multipliers {
    a: f64,
    b: f64,
    c: f64,
    dd: f64,
    e: f64,
    ff: f64,
    g: f64,
    hh: f64,
    i: f64,
    j: f64,
    t2: (f64, f64),
    lf: (f64, f64, f64),
}

impl Default for Multipliers {
    fn default() -> Self {
        Self {
            a: 1.0,
            b: 1.0,
            c: 1.0,
            dd: 1.0,
            e: 1.0,
            ff: 1.0,
            g: 1.0,
            hh: 1.0,
            i: 1.0,
            j: 1.0,
            t2: (1.0, 1.0),
            lf: (1.0, 1.0, 1.0),
        }
    }
}

impl LandingCraftModifiers {
    pub fn new(attacker: &Ship, attack_type: AttackType, target_type: SpecialEnemyType) -> Self {
        let is_day = attack_type.is_shelling();
        let gears = &attacker.gears;

        let landing_craft_stars_average = gears
            .mean_by(|gear| (gear.gear_type == GearType::LandingCraft).then_some(gear.stars as f64))
            .unwrap_or_default();

        let t4_tank_group_stars_average = gears
            .mean_by(|gear| {
                matches_gear_id!(gear.gear_id, "特四式内火艇" | "特四式内火艇改")
                    .then_some(gear.stars as f64)
            })
            .unwrap_or_default();

        let t2_tank_stars_average = gears
            .mean_by(|gear| (gear.gear_id == gear_id!("特二式内火艇")).then_some(gear.stars as f64))
            .unwrap_or_default();

        let ibonus1 = 1.0 + landing_craft_stars_average / 50.0 + t4_tank_group_stars_average / 50.0;
        let ibonus2 = 1.0 + t2_tank_stars_average / 30.0;

        let landing_craft_count = gears.count_type(GearType::LandingCraft);
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
        let t4_tank_group_count = t4_tank_count + t4_tank_kai_count;

        let army_infantry_count = gears.count(gear_id!("陸軍歩兵部隊"));
        let t97_tank_chiha_count = gears.count(gear_id!("九七式中戦車(チハ)"));
        let t97_tank_chiha_kai_count = gears.count(gear_id!("九七式中戦車 新砲塔(チハ改)"));
        let army_infantry_chiha_kai_count = gears.count(gear_id!("陸軍歩兵部隊+チハ改"));
        let landing_forces_count = army_infantry_count
            + t97_tank_chiha_count
            + t97_tank_chiha_kai_count
            + army_infantry_chiha_kai_count;

        let cond_a = landing_craft_count + t4_tank_group_count + landing_forces_count >= 1;
        let cond_b = toku_dlc_count
            + toku_dlc_panzer3_count
            + toku_dlc_panzer3_j_count
            + army_infantry_count
            + army_infantry_chiha_kai_count
            >= 1;

        let c_count = t89_tank_count
            + honi1_count
            + toku_dlc_panzer3_count
            + toku_dlc_panzer3_j_count
            + army_infantry_count
            + army_infantry_chiha_kai_count;
        let cond_c = c_count >= 1;
        let cond_dd = c_count
            + chiha_count
            + chiha_kai_count
            + t97_tank_chiha_count
            + t97_tank_chiha_kai_count
            >= 2;

        let e_count = panzer2_count;
        let cond_e = e_count >= 1;
        let cond_ff = e_count >= 2;

        let g_count = ab_count + armed_count;
        let cond_g = g_count >= 1;
        let cond_hh = g_count >= 2 || t4_tank_group_count >= 2;

        let cond_i = m4a1dd_count
            + chiha_kai_count
            + toku_dlc_panzer3_j_count
            + t97_tank_chiha_kai_count
            + army_infantry_chiha_kai_count
            >= 1;
        let cond_j =
            shikon_count + honi1_count + toku_dlc_panzer3_count + toku_dlc_panzer3_j_count >= 1;

        let precap_ms = match target_type {
            SpecialEnemyType::Pillbox => Multipliers {
                a: 1.8 * ibonus1 * ibonus2,
                b: 1.15,
                c: 1.5,
                dd: 1.4,
                e: 1.5,
                ff: 1.4,
                g: 1.3,
                hh: 1.2,
                i: 2.0,
                j: 1.0,
                t2: (2.4, 1.35),
                lf: (1.0, 1.0, 1.0),
            },
            SpecialEnemyType::IsolatedIsland => Multipliers {
                a: 1.8 * ibonus1 * ibonus2,
                b: 1.15,
                c: 1.2,
                dd: 1.4,
                e: 1.2,
                ff: 1.4,
                g: 1.3,
                hh: 1.1,
                i: 1.8,
                j: 1.0,
                t2: (2.4, 1.35),
                lf: (1.0, 1.0, 1.0),
            },
            SpecialEnemyType::HarbourSummerPrincess => Multipliers {
                a: 1.7 * ibonus1 * ibonus2,
                b: 1.2,
                c: 1.6,
                dd: 1.5,
                e: 1.6,
                ff: 1.5,
                g: 1.5,
                hh: 1.1,
                i: 2.0,
                j: 1.0,
                t2: (2.8, 1.5),
                lf: (1.0, 1.0, 1.0),
            },
            SpecialEnemyType::SoftSkinned | SpecialEnemyType::SupplyDepot => Multipliers {
                a: 1.4 * ibonus1 * ibonus2,
                b: 1.15,
                c: 1.5,
                dd: 1.3,
                e: 1.5,
                ff: 1.3,
                g: 1.1,
                hh: 1.1,
                i: 1.1,
                j: 1.0,
                t2: (1.5, 1.2),
                lf: (1.4, 1.2, 1.1),
            },
            _ => Default::default(),
        };

        let postcap_ms = match target_type {
            SpecialEnemyType::SupplyDepot | SpecialEnemyType::NewSupplyDepot => Multipliers {
                a: 1.7 * ibonus1 * ibonus2,
                b: 1.2,
                c: 1.3 * ibonus1,
                dd: 1.6,
                e: 1.3 * ibonus1,
                ff: 1.6,
                g: 1.5,
                hh: 1.1,
                i: 1.2,
                j: 1.0,
                t2: (1.7, 1.5),
                lf: (1.85, 1.45, 1.2),
            },
            SpecialEnemyType::AnchorageWaterDemonVacationMode => Multipliers {
                a: 1.4 * ibonus1 * ibonus2,
                b: 1.15,
                c: 1.2,
                dd: 1.4,
                e: 1.2,
                ff: 1.4,
                g: 1.2,
                hh: 1.1,
                i: 1.8,
                j: 1.0,
                t2: (2.4, 1.35),
                lf: (1.0, 1.0, 1.0),
            },
            SpecialEnemyType::DockPrincess => Multipliers {
                a: 1.1 * ibonus1 * ibonus2,
                b: 1.15,
                c: 1.15,
                dd: 1.15,
                e: 1.15,
                ff: 1.15,
                g: 1.1,
                hh: 1.1,
                i: 1.1,
                j: 1.4,
                t2: (1.2, 1.2),
                lf: (1.0, 1.0, 1.0),
            },
            _ => Default::default(),
        };

        let precap = {
            let a = if cond_a { precap_ms.a } else { 1.0 };
            let b = if cond_b { precap_ms.b } else { 1.0 };
            let c = if cond_c { precap_ms.c } else { 1.0 };
            let dd = if cond_dd { precap_ms.dd } else { 1.0 };
            let e = if cond_e { precap_ms.e } else { 1.0 };
            let ff = if cond_ff { precap_ms.ff } else { 1.0 };
            let g = if is_day && cond_g { precap_ms.g } else { 1.0 };
            let hh = if is_day && cond_hh { precap_ms.hh } else { 1.0 };
            let i = if cond_i { precap_ms.i } else { 1.0 };
            let j = if cond_j { precap_ms.j } else { 1.0 };

            let mut t2 = 1.0;
            if t2_tank_count >= 1 {
                t2 *= precap_ms.t2.0;
            }
            if t2_tank_count >= 2 || t4_tank_kai_count >= 1 {
                t2 *= precap_ms.t2.1;
            }

            let mut lf = 1.0;
            if landing_forces_count >= 1 {
                lf *= precap_ms.lf.0;
            }
            if landing_forces_count >= 2 {
                lf *= precap_ms.lf.1;
            }
            if landing_forces_count >= 3 {
                lf *= precap_ms.lf.2;
            }

            a * b * c * dd * e * ff * g * hh * i * j * t2 * lf
        };

        let postcap = {
            let a = if cond_a { postcap_ms.a } else { 1.0 };
            let b = if cond_b { postcap_ms.b } else { 1.0 };
            let c = if cond_c { postcap_ms.c } else { 1.0 };
            let dd = if cond_dd { postcap_ms.dd } else { 1.0 };
            let e = if cond_e { postcap_ms.e } else { 1.0 };
            let ff = if cond_ff { postcap_ms.ff } else { 1.0 };
            let g = if cond_g { postcap_ms.g } else { 1.0 };
            let hh = if cond_hh { postcap_ms.hh } else { 1.0 };
            let i = if cond_i { postcap_ms.i } else { 1.0 };
            let j = if cond_j { postcap_ms.j } else { 1.0 };

            let mut t2 = 1.0;
            if t2_tank_count >= 1 {
                t2 *= postcap_ms.t2.0;
            }
            if t2_tank_count >= 2 || t4_tank_kai_count >= 1 {
                t2 *= postcap_ms.t2.1;
            }

            let mut lf = 1.0;
            if landing_forces_count >= 1 {
                lf *= postcap_ms.lf.0;
            }
            if landing_forces_count >= 2 {
                lf *= postcap_ms.lf.1;
            }
            if landing_forces_count >= 3 {
                lf *= postcap_ms.lf.2;
            }

            a * b * c * dd * e * ff * g * hh * i * j * t2 * lf
        };

        Self { precap, postcap }
    }
}
