use crate::{
    ship::Ship,
    types::{gear_id, AttackType, GearType, SpecialEnemyType},
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
        }
    }
}

impl LandingCraftModifiers {
    pub fn new(attacker: &Ship, attack_type: AttackType, target_type: SpecialEnemyType) -> Self {
        let is_day = attack_type.is_shelling();
        let gears = &attacker.gears;

        let stars_average = gears
            .mean_by(|gear| (gear.gear_type == GearType::LandingCraft).then_some(gear.stars as f64))
            .unwrap_or_default();
        let ibonus = 1.0 + stars_average / 50.0;

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

        let a_count = landing_craft_count;
        let b_count = toku_dlc_count + toku_dlc_panzer3_count + toku_dlc_panzer3_j_count;
        let c_count =
            t89_tank_count + honi1_count + toku_dlc_panzer3_count + toku_dlc_panzer3_j_count;
        let dd_count = c_count + chiha_count + chiha_kai_count;
        let e_count = panzer2_count;
        let ff_count = e_count;
        let g_count = ab_count + armed_count;
        let hh_count = g_count;
        let i_count = m4a1dd_count + chiha_kai_count + toku_dlc_panzer3_j_count;
        let j_count =
            shikon_count + honi1_count + toku_dlc_panzer3_count + toku_dlc_panzer3_j_count;

        let precap_ms = match target_type {
            SpecialEnemyType::Pillbox => Multipliers {
                a: 1.8 * ibonus,
                b: 1.15,
                c: 1.5,
                dd: 1.4,
                e: 1.5,
                ff: 1.4,
                g: 1.3,
                hh: 1.2,
                i: 2.0,
                j: 1.0,
            },
            SpecialEnemyType::IsolatedIsland => Multipliers {
                a: 1.8 * ibonus,
                b: 1.15,
                c: 1.2,
                dd: 1.4,
                e: 1.2,
                ff: 1.4,
                g: 1.3,
                hh: 1.1,
                i: 1.8,
                j: 1.0,
            },
            SpecialEnemyType::HarbourSummerPrincess => Multipliers {
                a: 1.7 * ibonus,
                b: 1.2,
                c: 1.6,
                dd: 1.5,
                e: 1.6,
                ff: 1.5,
                g: 1.5,
                hh: 1.1,
                i: 2.0,
                j: 1.0,
            },
            SpecialEnemyType::SoftSkinned | SpecialEnemyType::SupplyDepot => Multipliers {
                a: 1.4 * ibonus,
                b: 1.15,
                c: 1.5,
                dd: 1.3,
                e: 1.5,
                ff: 1.3,
                g: 1.1,
                hh: 1.1,
                i: 1.1,
                j: 1.0,
            },
            _ => Default::default(),
        };

        let postcap_ms = match target_type {
            SpecialEnemyType::SupplyDepot | SpecialEnemyType::NewSupplyDepot => Multipliers {
                a: 1.7 * ibonus,
                b: 1.2,
                c: 1.3 * ibonus,
                dd: 1.6,
                e: 1.3 * ibonus,
                ff: 1.6,
                g: 1.5,
                hh: 1.1,
                i: 1.2,
                j: 1.0,
            },
            SpecialEnemyType::AnchorageWaterDemonVacationMode => Multipliers {
                a: 1.4 * ibonus,
                b: 1.15,
                c: 1.2,
                dd: 1.4,
                e: 1.2,
                ff: 1.4,
                g: 1.2,
                hh: 1.1,
                i: 1.8,
                j: 1.0,
            },
            SpecialEnemyType::DockPrincess => Multipliers {
                a: 1.1 * ibonus,
                b: 1.15,
                c: 1.15,
                dd: 1.15,
                e: 1.15,
                ff: 1.15,
                g: 1.1,
                hh: 1.1,
                i: 1.1,
                j: 1.4,
            },
            _ => Default::default(),
        };

        let precap = {
            let a = if a_count >= 1 { precap_ms.a } else { 1.0 };
            let b = if b_count >= 1 { precap_ms.b } else { 1.0 };
            let c = if c_count >= 1 { precap_ms.c } else { 1.0 };
            let dd = if dd_count >= 2 { precap_ms.dd } else { 1.0 };
            let e = if e_count >= 1 { precap_ms.e } else { 1.0 };
            let ff = if ff_count >= 2 { precap_ms.ff } else { 1.0 };
            let g = if is_day && g_count >= 1 {
                precap_ms.g
            } else {
                1.0
            };
            let hh = if is_day && hh_count >= 2 {
                precap_ms.hh
            } else {
                1.0
            };
            let i = if i_count >= 1 { precap_ms.i } else { 1.0 };
            let j = if j_count >= 1 { precap_ms.j } else { 1.0 };
            a * b * c * dd * e * ff * g * hh * i * j
        };

        let postcap = {
            let a = if a_count >= 1 { postcap_ms.a } else { 1.0 };
            let b = if b_count >= 1 { postcap_ms.b } else { 1.0 };
            let c = if c_count >= 1 { postcap_ms.c } else { 1.0 };
            let dd = if dd_count >= 2 { postcap_ms.dd } else { 1.0 };
            let e = if e_count >= 1 { postcap_ms.e } else { 1.0 };
            let ff = if ff_count >= 2 { postcap_ms.ff } else { 1.0 };
            let g = if g_count >= 1 { postcap_ms.g } else { 1.0 };
            let hh = if hh_count >= 2 { postcap_ms.hh } else { 1.0 };
            let i = if i_count >= 1 { postcap_ms.i } else { 1.0 };
            let j = if j_count >= 1 { postcap_ms.j } else { 1.0 };
            a * b * c * dd * e * ff * g * hh * i * j
        };

        Self { precap, postcap }
    }
}
