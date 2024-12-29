use wasm_bindgen::prelude::*;

use crate::types::{ctype, gear_id, matches_gear_id, ship_id, GearType, ShipType};

use super::Ship;

#[wasm_bindgen]
impl Ship {
    #[inline]
    pub fn state_day_gunfit_accuracy(&self) -> Option<f64> {
        self.state.day_gunfit_accuracy.map(|v| v.into())
    }

    #[inline]
    pub fn state_night_gunfit_accuracy(&self) -> Option<f64> {
        self.state.night_gunfit_accuracy.map(|v| v.into())
    }

    /// フィット砲補正
    pub fn gunfit_accuracy(&self, is_night: bool) -> f64 {
        let state = if is_night {
            self.state_night_gunfit_accuracy()
        } else {
            self.state_day_gunfit_accuracy()
        };

        state.unwrap_or_else(|| match self.ship_type {
            ShipType::DD => destroyer_bonus(self),
            ShipType::CL | ShipType::CLT | ShipType::CT => light_cruiser_bonus(self),
            ShipType::CA | ShipType::CAV => heavy_cruiser_bonus(self, is_night),
            ShipType::FBB | ShipType::BB | ShipType::BBV => battleship_bonus(self, is_night),
            ShipType::AV => seaplane_tender_bonus(self),
            _ => 0.0,
        })
    }
}

/// 駆逐フィット補正
fn destroyer_bonus(ship: &Ship) -> f64 {
    let mut result = 0.0;
    let gears = &ship.gears;
    let ctype = ship.ctype;

    if ctype == ctype!("睦月型") {
        let single_high_angle_mount_count =
            gears.count(gear_id!("12.7cm単装高角砲(後期型)")) as f64;
        result += 5.0 * single_high_angle_mount_count.sqrt();
    }

    result
}

/// 軽巡フィット補正
fn light_cruiser_bonus(ship: &Ship) -> f64 {
    if ship.is_abyssal() {
        return -3.0 * ship.gears.count_type(GearType::MediumMainGun) as f64;
    }

    let mut r = 0.0;
    let gears = &ship.gears;
    let ctype = ship.ctype;

    let is_married = ship.level > 99;
    let m1 = if is_married { 2.0 } else { 0.0 };
    let m2 = if is_married { 0.6 } else { 1.0 };
    let m3 = if is_married { 0.8 } else { 1.0 };

    let count_14cm_group = gears.count_by(|gear| {
        matches_gear_id!(gear.gear_id, "14cm単装砲" | "14cm連装砲" | "14cm連装砲改")
    }) as f64;

    let count_15_2cm_twin_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "15.2cm連装砲"
                | "15.2cm連装砲改"
                | "15.2cm連装砲改二"
                | "Bofors 15.2cm連装砲 Model 1930"
                | "Bofors 15cm連装速射砲 Mk.9 Model 1938"
                | "Bofors 15cm連装速射砲 Mk.9改+単装速射砲 Mk.10改 Model 1938"
                | "6inch 連装速射砲 Mk.XXI"
        )
    }) as f64;

    let count_15_2cm_triple_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "6inch三連装速射砲 Mk.16"
                | "6inch三連装速射砲 Mk.16 mod.2"
                | "6inch Mk.XXIII三連装砲"
                | "152mm/55 三連装速射砲"
                | "152mm/55 三連装速射砲改"
        )
    }) as f64;

    let count_15_5cm_group = gears
        .count_by(|gear| matches_gear_id!(gear.gear_id, "15.5cm三連装砲" | "15.5cm三連装砲改"))
        as f64;

    let count_5inch_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "5inch連装両用砲(集中配備)" | "5inch連装砲(副砲配置) 集中配備"
        )
    }) as f64;

    let count_20_3cm_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "20.3cm連装砲"
                | "20.3cm(3号)連装砲"
                | "20.3cm(2号)連装砲"
                | "試製20.3cm(4号)連装砲"
                | "203mm/53 連装砲"
                | "SKC34 20.3cm連装砲"
        )
    }) as f64;

    let count_8inch_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "8inch三連装砲 Mk.9" | "8inch三連装砲 Mk.9 mod.2"
        )
    }) as f64;

    match ctype {
        ctype!("阿賀野型") => {
            if count_14cm_group >= 1.0 {
                r += m1
            };
            r += 3.0 * count_15_2cm_twin_group.sqrt();
            if count_15_2cm_twin_group >= 1.0 {
                r += m1
            };
            r += -2.0 * count_15_5cm_group.sqrt();
            if count_15_5cm_group >= 1.0 {
                r += m1
            };
            r += m2 * -3.0 * count_15_2cm_triple_group.sqrt();
            r += m2 * -3.0 * count_5inch_group.sqrt();
            r += m2 * -4.0 * count_20_3cm_group.sqrt();
            r += m3 * -11.0 * count_8inch_group.sqrt();
        }

        ctype!("大淀型") => {
            if count_14cm_group >= 1.0 {
                r += m1
            };
            if count_15_2cm_twin_group >= 1.0 {
                r += m1
            };
            r += m2 * -1.0 * count_15_5cm_group.sqrt();
            r += m2 * -3.0 * count_15_2cm_triple_group.sqrt();
            r += m2 * -3.0 * count_5inch_group.sqrt();
            r += m2 * -5.0 * count_20_3cm_group.sqrt();
            r += m3 * -11.0 * count_8inch_group.sqrt();
        }

        ctype!("Atlanta級") => {
            if count_14cm_group >= 1.0 {
                r += m1
            };
            if count_15_2cm_twin_group >= 1.0 {
                r += m1
            };
            r += -2.0 * count_15_5cm_group.sqrt();
            if count_15_5cm_group >= 1.0 {
                r += m1
            };
            r += m2 * -3.0 * count_15_2cm_triple_group.sqrt();
            if count_5inch_group >= 1.0 {
                r += m1 * 1.5
            };
            r += m2 * -4.0 * count_20_3cm_group.sqrt();
            r += m3 * -11.0 * count_8inch_group.sqrt();
        }
        _ => {
            if count_14cm_group >= 1.0 {
                r += m1
            };
            if count_15_2cm_twin_group >= 1.0 {
                r += m1
            };
            r += -2.0 * count_15_5cm_group.sqrt();
            if count_15_5cm_group >= 1.0 {
                r += m1
            };
            r += m2 * -3.0 * count_15_2cm_triple_group.sqrt();
            r += m2 * -3.0 * count_5inch_group.sqrt();
            r += m2 * -3.0 * count_20_3cm_group.sqrt();
            r += m3 * -11.0 * count_8inch_group.sqrt();
        }
    }

    r
}

/// 重巡フィット補正
fn heavy_cruiser_bonus(ship: &Ship, is_night: bool) -> f64 {
    let mut result = 0.0;
    let gears = &ship.gears;
    let ctype = ship.ctype;

    if is_night {
        if gears.has(gear_id!("20.3cm連装砲")) || gears.has(gear_id!("20.3cm(2号)連装砲")) {
            result += 10.0
        } else if gears.has(gear_id!("20.3cm(3号)連装砲"))
            || gears.has(gear_id!("試製20.3cm(4号)連装砲"))
        {
            result += 15.0
        }
    }

    if ctype == ctype!("最上型") {
        result += 2.0 * (gears.count(gear_id!("15.5cm三連装砲")) as f64);
        result += 5.0 * (gears.count(gear_id!("15.5cm三連装砲改")) as f64);
    } else if ctype == ctype!("Zara級") {
        let count = gears.count(gear_id!("203mm/53 連装砲")) as f64;
        result += count.sqrt();
    }

    result
}

/// 水母フィット補正
fn seaplane_tender_bonus(ship: &Ship) -> f64 {
    let gears = &ship.gears;
    let mut result = 0.0;

    let count14cm15cm = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "14cm単装砲"
                | "14cm連装砲"
                | "14cm連装砲改"
                | "15.2cm単装砲"
                | "15.2cm連装砲"
                | "15.2cm連装砲改"
                | "15.2cm三連装砲"
        )
    });

    let count203 = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "20.3cm連装砲"
                | "20.3cm(3号)連装砲"
                | "20.3cm(2号)連装砲"
                | "試製20.3cm(4号)連装砲"
                | "203mm/53 連装砲"
                | "152mm/55 三連装速射砲"
                | "152mm/55 三連装速射砲改"
        )
    });

    // 20.3,15.2混載時ペナ消失
    if count203 > 0 && count14cm15cm == 0 {
        result += -8.0;
    }

    result += -6.0 * count14cm15cm as f64;
    result += -10.0 * count203 as f64;

    result
}

/// 戦艦フィット補正
fn battleship_bonus(ship: &Ship, is_night: bool) -> f64 {
    // todo!
    if is_night {
        return 0.0;
    }

    let mut r = 0.0;
    let gears = &ship.gears;
    let ship_id = ship.ship_id;
    let ctype = ship.ctype;
    let is_married = ship.level > 99;
    let m = if is_married { 0.6 } else { 1.0 };

    let count_51cm_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "51cm連装砲" | "試製51cm連装砲" | "試製51cm三連装砲"
        )
    }) as f64;

    let count_46cm_triple_kai = gears.count(gear_id!("46cm三連装砲改")) as f64;
    let count_46cm_triple = gears.count(gear_id!("46cm三連装砲")) as f64;
    let count_proto_46cm = gears.count(gear_id!("試製46cm連装砲")) as f64;

    let count_16inch_mk7 = gears.count(gear_id!("16inch三連装砲 Mk.7")) as f64;
    let count_16inch_mk7_gfcs = gears.count(gear_id!("16inch三連装砲 Mk.7+GFCS")) as f64;
    let count_16inch_mk7_group = count_16inch_mk7 + count_16inch_mk7_gfcs;

    let count_41cm_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "41cm連装砲"
                | "試製41cm三連装砲"
                | "41cm三連装砲改"
                | "41cm三連装砲改二"
                | "41cm連装砲改二"
                | "16inch Mk.I三連装砲"
                | "16inch Mk.I三連装砲+AFCT改"
                | "16inch Mk.I三連装砲改+FCR type284"
                | "16inch Mk.I連装砲"
                | "16inch Mk.V連装砲"
                | "16inch Mk.VIII連装砲改"
                | "16inch三連装砲 Mk.6"
                | "16inch三連装砲 Mk.6 mod.2"
                | "16inch三連装砲 Mk.6+GFCS"
        )
    }) as f64;

    let count_381mm_group = gears.count_by(|gear| {
        matches_gear_id!(gear.gear_id, "381mm/50 三連装砲" | "381mm/50 三連装砲改")
    }) as f64;

    let count_38cm_quad_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "38cm四連装砲" | "38cm四連装砲改" | "38cm四連装砲改 deux"
        )
    }) as f64;

    let count_35_6cm_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "35.6cm連装砲"
                | "試製35.6cm三連装砲"
                | "35.6cm連装砲(ダズル迷彩)"
                | "35.6cm三連装砲改(ダズル迷彩仕様)"
                | "35.6cm連装砲改"
                | "35.6cm連装砲改二"
                | "38cm連装砲"
                | "38cm連装砲改"
                | "35.6cm連装砲改三(ダズル迷彩仕様)"
                | "35.6cm連装砲改四"
        )
    }) as f64;

    let count_30_5cm_group = gears.count_by(|gear| {
        matches_gear_id!(
            gear.gear_id,
            "30.5cm三連装砲" | "30.5cm三連装砲改" | "305mm/46 連装砲" | "305mm/46 三連装砲"
        )
    }) as f64;

    let count_320mm_group = gears
        .count_by(|gear| matches_gear_id!(gear.gear_id, "320mm/44 連装砲" | "320mm/44 三連装砲"))
        as f64;

    // データ不足
    // let count_38_1cm = gears.count_by(|gear| {
    //     matches_gear_id!(gear.gear_id, "38.1cm Mk.I連装砲" | "38.1cm Mk.I/N連装砲改")
    // }) as f64;

    match ctype {
        ctype!("Гангут級") => {
            r += -14.0 * m * count_46cm_triple_kai.sqrt();
            r += -14.0 * m * count_46cm_triple.sqrt();
            r += -11.0 * m * count_proto_46cm.sqrt();
            r += -9.0 * m * count_16inch_mk7_group.sqrt();
            r += -9.0 * m * count_41cm_group.sqrt();
            r += -2.0 * count_381mm_group.sqrt();
            r += 4.0 * count_35_6cm_group.sqrt();
            r += 12.0 * count_30_5cm_group.sqrt();
        }
        ctype!("Conte di Cavour級") => {
            r += -14.0 * m * count_46cm_triple_kai.sqrt();
            r += -14.0 * m * count_46cm_triple.sqrt();
            r += -11.0 * m * count_proto_46cm.sqrt();
            r += -9.0 * m * count_16inch_mk7_group.sqrt();
            r += -9.0 * m * count_41cm_group.sqrt();
            r += -2.0 * m * count_381mm_group.sqrt();
            r += 4.0 * count_35_6cm_group.sqrt();
            r += 14.0 * count_320mm_group.sqrt();
        }
        ctype!("金剛型") => {
            r += -10.0 * m * count_46cm_triple_kai.sqrt();
            r += -10.0 * m * count_46cm_triple.sqrt();
            r += -7.0 * m * count_proto_46cm.sqrt();
            r += -5.0 * m * count_16inch_mk7_group.sqrt();
            r += -5.0 * m * count_41cm_group.sqrt();
            r += -2.0 * m * count_381mm_group.sqrt();
            r += 7.0 * count_35_6cm_group.sqrt();
        }
        ctype!("Bismarck級") | ctype!("V.Veneto級") => {
            r += -14.0 * m * count_46cm_triple_kai.sqrt();
            r += -14.0 * m * count_46cm_triple.sqrt();
            r += -11.0 * m * count_proto_46cm.sqrt();
            r += -9.0 * m * count_16inch_mk7_group.sqrt();
            r += -9.0 * m * count_41cm_group.sqrt();
            r += 1.0 * m * count_381mm_group.sqrt();
            r += 4.0 * count_35_6cm_group.sqrt();
        }
        ctype!("Iowa級") => {
            r += -10.0 * m * count_46cm_triple_kai.sqrt();
            r += -10.0 * m * count_46cm_triple.sqrt();
            r += -7.0 * m * count_proto_46cm.sqrt();
            r += -5.0 * m * count_41cm_group.sqrt();
            r += -2.0 * m * count_381mm_group.sqrt();
            r += 2.0 * m * count_16inch_mk7.sqrt();
            r += 9.0 * m * count_16inch_mk7_gfcs.sqrt();
            r += 4.0 * count_35_6cm_group.sqrt();
        }
        ctype!("Colorado級") => {
            r += -7.0 * m * count_46cm_triple_kai.sqrt();
            r += -7.0 * m * count_46cm_triple.sqrt();
            r += -3.0 * m * count_proto_46cm.sqrt();
            r += 2.0 * m * count_381mm_group.sqrt();
            r += 2.0 * count_16inch_mk7_group.sqrt();
            r += 2.0 * count_41cm_group.sqrt();
            r += 2.0 * count_35_6cm_group.sqrt();
        }
        ctype!("Richelieu級") => {
            r += -10.0 * m * count_46cm_triple_kai.sqrt();
            r += -10.0 * m * count_46cm_triple.sqrt();
            r += -7.0 * m * count_proto_46cm.sqrt();
            r += -7.0 * m * count_16inch_mk7_group.sqrt();
            r += -7.0 * m * count_41cm_group.sqrt();
            r += -2.0 * m * count_381mm_group.sqrt();
            r += 2.0 * count_38cm_quad_group.sqrt();
            r += 4.0 * count_35_6cm_group.sqrt();
        }
        ctype!("Queen Elizabeth級") => {
            r += -7.0 * m * count_46cm_triple_kai.sqrt();
            r += -7.0 * m * count_46cm_triple.sqrt();
            r += -3.0 * m * count_proto_46cm.sqrt();
            r += 2.0 * m * count_381mm_group.sqrt();
            r += 2.0 * count_16inch_mk7_group.sqrt();
            r += 2.0 * count_41cm_group.sqrt();
            r += 2.0 * count_35_6cm_group.sqrt();
        }
        ctype!("Nelson級") => {
            if ship_id != ship_id!("Nelson改") {
                r += -7.0 * m * count_46cm_triple_kai.sqrt();
                r += -7.0 * m * count_46cm_triple.sqrt();
                r += -3.0 * m * count_proto_46cm.sqrt();
                r += 2.0 * m * count_381mm_group.sqrt();
                r += 2.0 * count_16inch_mk7_group.sqrt();
                r += 2.0 * count_41cm_group.sqrt();
                r += 2.0 * count_35_6cm_group.sqrt();
            }
        }
        ctype!("大和型") => match ship_id {
            ship_id!("大和改二") => {
                r += -10.0 * m * count_51cm_group.sqrt();
                r += -10.0 * m * count_46cm_triple_kai.sqrt();
                r += -10.0 * m * count_46cm_triple.sqrt();
                r += -7.0 * m * count_proto_46cm.sqrt();
                r += -5.0 * m * count_16inch_mk7_group.sqrt();
                r += -5.0 * m * count_41cm_group.sqrt();
                r += -2.0 * m * count_381mm_group.sqrt();
                r += 7.0 * count_46cm_triple_kai.sqrt();
                r += 3.0 * count_46cm_triple.sqrt();
                r += 3.0 * count_proto_46cm.sqrt();
                r += 4.0 * count_35_6cm_group.sqrt();
            }
            ship_id!("大和改二重") => {
                r += -8.0
                    * m
                    * (count_51cm_group + count_46cm_triple_kai + count_46cm_triple).sqrt();
                r += -5.0 * m * count_proto_46cm.sqrt();
                r += 2.0 * m * count_381mm_group.sqrt();
                r += 7.0 * count_46cm_triple_kai.sqrt();
                r += 3.0 * count_46cm_triple.sqrt();
                r += 3.0 * count_proto_46cm.sqrt();
                r += 2.0 * count_16inch_mk7_group.sqrt();
                r += 2.0 * count_41cm_group.sqrt();
                r += 4.0 * count_35_6cm_group.sqrt();
            }
            _ => {
                r += 7.0 * count_46cm_triple_kai.sqrt();
                r += 3.0 * count_46cm_triple.sqrt();
                r += 3.0 * count_proto_46cm.sqrt();
            }
        },
        ctype!("長門型") => match ship_id {
            ship_id!("長門改二") => {
                r += -5.0 * m * count_51cm_group.sqrt();
                r += -7.0 * m * count_46cm_triple_kai.sqrt();
                r += -7.0 * m * count_46cm_triple.sqrt();
                r += -3.0 * m * count_proto_46cm.sqrt();
                r += 2.0 * m * count_381mm_group.sqrt();
                r += 2.0 * count_16inch_mk7_group.sqrt();
                r += 5.0 * count_41cm_group.sqrt();
                r += 2.0 * count_35_6cm_group.sqrt();
            }
            _ => {
                r += -5.0 * m * count_51cm_group.sqrt();
                r += -7.0 * m * count_46cm_triple_kai.sqrt();
                r += -7.0 * m * count_46cm_triple.sqrt();
                r += -3.0 * m * count_proto_46cm.sqrt();
                r += 2.0 * m * count_381mm_group.sqrt();
                r += 2.0 * count_16inch_mk7_group.sqrt();
                r += 4.0 * count_41cm_group.sqrt();
                r += 2.0 * count_35_6cm_group.sqrt();
            }
        },
        ctype!("伊勢型") | ctype!("扶桑型") => {
            r += -7.0 * m * count_46cm_triple_kai.sqrt();
            r += -7.0 * m * count_46cm_triple.sqrt();
            r += -3.0 * m * count_proto_46cm.sqrt();
            r += 2.0 * m * count_381mm_group.sqrt();
            r += 2.0 * count_16inch_mk7_group.sqrt();
            r += 2.0 * count_41cm_group.sqrt();
            r += 4.0 * count_35_6cm_group.sqrt();
        }
        _ => {}
    };

    r
}
