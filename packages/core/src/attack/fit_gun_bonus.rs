use crate::{
    gear_id,
    ship::Ship,
    ship_id,
    types::{ShipAttr, ShipClass, ShipType},
};

/// 駆逐フィット補正
fn destroyer_bonus(ship: &Ship) -> f64 {
    let mut result = 0.0;
    let gears = &ship.gears;
    let ship_class = ship.ship_class;

    if ship_class == ShipClass::MutsukiClass {
        let single_high_angle_mount_count =
            gears.count(gear_id!("12.7cm単装高角砲(後期型)")) as f64;
        result += 5.0 * single_high_angle_mount_count.sqrt();
    }

    result
}

/// 軽巡フィット補正
fn light_cruiser_bonus(ship: &Ship) -> f64 {
    let mut result = 0.0;
    let gears = &ship.gears;
    let ship_class = ship.ship_class;

    let single_gun_count = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("14cm単装砲") | gear_id!("15.2cm単装砲")
        )
    }) as f64;

    let twin_gun_count1 = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("15.2cm連装砲") | gear_id!("14cm連装砲") | gear_id!("15.2cm連装砲改")
        )
    }) as f64;

    result += 4.0 * single_gun_count.sqrt();

    result += match ship_class {
        ShipClass::AganoClass => 8.0,
        ShipClass::OoyodoClass => 5.0,
        _ => 3.0,
    } * twin_gun_count1.sqrt();

    if ship_class == ShipClass::AganoClass {
        let twin_gun_count2 = gears.count_by(|gear| {
            matches!(
                gear.gear_id,
                gear_id!("Bofors 15.2cm連装砲 Model 1930")
                    | gear_id!("14cm連装砲改")
                    | gear_id!("6inch 連装速射砲 Mk.XXI")
                    | gear_id!("Bofors 15cm連装速射砲 Mk.9 Model 1938")
                    | gear_id!("Bofors 15cm連装速射砲 Mk.9改+単装速射砲 Mk.10改 Model 1938")
                    | gear_id!("15.2cm連装砲改二")
            )
        }) as f64;

        result += 7.0 * twin_gun_count2.sqrt();
    }

    if ship_class == ShipClass::OoyodoClass {
        let triple_gun_count = gears.count_by(|gear| {
            matches!(
                gear.gear_id,
                gear_id!("15.5cm三連装砲") | gear_id!("15.5cm三連装砲改")
            )
        }) as f64;

        result += 7.0 * triple_gun_count.sqrt();
    }

    if ship.ship_id == ship_id!("由良改二") {
        let single_high_angle_mount_count =
            gears.count(gear_id!("12.7cm単装高角砲(後期型)")) as f64;
        result += 10.0 * single_high_angle_mount_count.sqrt();
    }

    result
}

/// 重巡フィット補正
fn heavy_cruiser_bonus(ship: &Ship, is_night: bool) -> f64 {
    let mut result = 0.0;
    let gears = &ship.gears;
    let ship_class = ship.ship_class;

    if is_night {
        if gears.has(gear_id!("20.3cm連装砲")) || gears.has(gear_id!("20.3cm(2号)連装砲")) {
            result += 10.0
        } else if gears.has(gear_id!("20.3cm(3号)連装砲")) {
            result += 15.0
        }
    }

    if ship_class == ShipClass::MogamiClass {
        result += 2.0 * (gears.count(gear_id!("15.5cm三連装砲")) as f64);
        result += 5.0 * (gears.count(gear_id!("15.5cm三連装砲改")) as f64);
    } else if ship_class == ShipClass::ZaraClass {
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
        matches!(
            gear.gear_id,
            gear_id!("14cm単装砲")
                | gear_id!("14cm連装砲")
                | gear_id!("14cm連装砲改")
                | gear_id!("15.2cm単装砲")
                | gear_id!("15.2cm連装砲")
                | gear_id!("15.2cm連装砲改")
                | gear_id!("15.2cm三連装砲")
        )
    });

    let count203 = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("20.3cm連装砲")
                | gear_id!("20.3cm(3号)連装砲")
                | gear_id!("20.3cm(2号)連装砲")
                | gear_id!("203mm/53 連装砲")
                | gear_id!("152mm/55 三連装速射砲")
                | gear_id!("152mm/55 三連装速射砲改")
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
    let mut r = 0.0;
    let gears = &ship.gears;
    let ship_id = ship.ship_id;
    let ship_class = ship.ship_class;
    let is_married = ship.level > 99;
    let m = if is_married { 0.6 } else { 1.0 };

    let count_51cm = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("51cm連装砲") | gear_id!("試製51cm連装砲")
        )
    }) as f64;

    let count_46cm_triple_kai = gears.count(gear_id!("46cm三連装砲改")) as f64;
    let count_46cm_triple = gears.count(gear_id!("46cm三連装砲")) as f64;
    let count_proto_46cm = gears.count(gear_id!("試製46cm連装砲")) as f64;
    let count_41cm_triple_kai2 = gears.count(gear_id!("41cm三連装砲改二")) as f64;
    let count_41cm_twin_kai2 = gears.count(gear_id!("41cm連装砲改二")) as f64;
    let count_41cm_series = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("41cm連装砲") | gear_id!("試製41cm三連装砲") | gear_id!("41cm三連装砲改")
        )
    }) as f64;

    let count_16inch_mk7 = gears.count(gear_id!("16inch三連装砲 Mk.7")) as f64;
    let count_16inch_mk7_gfcs = gears.count(gear_id!("16inch三連装砲 Mk.7+GFCS")) as f64;

    let count_16inch_mk1_triple_fcr =
        gears.count(gear_id!("16inch Mk.I三連装砲改+FCR type284")) as f64;
    let count_16inch_mk1_triple_afct = gears.count(gear_id!("16inch Mk.I三連装砲+AFCT改")) as f64;
    let count_16inch_mk1_triple = gears.count(gear_id!("16inch Mk.I三連装砲")) as f64;

    let count_16inch_mk5_twin = gears.count(gear_id!("16inch Mk.V連装砲")) as f64;
    let count_16inch_mk1_twin = gears.count(gear_id!("16inch Mk.I連装砲")) as f64;

    let count_381mm = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("381mm/50 三連装砲") | gear_id!("381mm/50 三連装砲改")
        )
    }) as f64;

    let count_38cm_quad = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("38cm四連装砲") | gear_id!("38cm四連装砲改")
        )
    }) as f64;

    let count_35_6cm_38cm_twin = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("35.6cm連装砲")
                | gear_id!("試製35.6cm三連装砲")
                | gear_id!("35.6cm連装砲(ダズル迷彩)")
                | gear_id!("35.6cm三連装砲改(ダズル迷彩仕様)")
                | gear_id!("35.6cm連装砲改")
                | gear_id!("35.6cm連装砲改二")
                | gear_id!("38cm連装砲")
                | gear_id!("38cm連装砲改")
        )
    }) as f64;

    let count_38_1cm = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("38.1cm Mk.I連装砲") | gear_id!("38.1cm Mk.I/N連装砲改")
        )
    }) as f64;

    let count_30_5cm = gears.count_by(|gear| {
        matches!(
            gear.gear_id,
            gear_id!("30.5cm三連装砲") | gear_id!("30.5cm三連装砲改")
        )
    }) as f64;

    let count_35_6cm_38cm_twin_38_1cm_30_5cm = count_35_6cm_38cm_twin + count_38_1cm + count_30_5cm;

    match ship_class {
        ShipClass::GangutClass => {
            r += -18.0 * m * count_46cm_triple.sqrt();
            r += -7.0 * m * count_proto_46cm.sqrt();
            r += -11.0 * m * count_41cm_series.sqrt();
            r += -3.0 * m * count_16inch_mk7.sqrt();
            r += -7.0 * m * count_16inch_mk1_triple.sqrt();
            r += -5.0 * m * count_16inch_mk5_twin.sqrt();
            r += 1.0 * count_381mm.sqrt();
            r += 7.0 * (count_35_6cm_38cm_twin + count_38_1cm).sqrt();
            r += 10.0 * count_30_5cm.sqrt();
        }
        ShipClass::KongouClass => {
            r += -10.0 * m * count_46cm_triple_kai.sqrt();
            r += -10.0 * m * count_46cm_triple.sqrt();
            r += -7.0 * m * count_proto_46cm.sqrt();
            r += -5.0 * m * count_41cm_triple_kai2.sqrt();
            r += -5.0 * m * count_41cm_series.sqrt();
            r += -6.0 * m * count_16inch_mk7_gfcs.sqrt();
            r += -5.0 * m * count_16inch_mk7.sqrt();
            r += -3.0 * m * count_16inch_mk1_triple_fcr.sqrt();
            r += -6.0 * m * count_16inch_mk1_triple_afct.sqrt();
            r += -5.0 * m * count_16inch_mk1_triple.sqrt();
            r += -2.0 * m * count_381mm.sqrt();
            r += 7.0 * count_35_6cm_38cm_twin_38_1cm_30_5cm.sqrt();
        }
        ShipClass::BismarckClass | ShipClass::VittorioVenetoClass => {
            r += -10.0 * m * count_46cm_triple.sqrt();
            r += -7.0 * m * count_proto_46cm.sqrt();
            r += -5.0 * m * count_41cm_series.sqrt();
            r += -4.0 * m * count_16inch_mk7_gfcs.sqrt();
            r += -5.0 * m * count_16inch_mk7.sqrt();
            r += -5.0 * m * count_16inch_mk1_triple.sqrt();
            r += 1.0 * m * count_381mm.sqrt();
            r += -2.0 * count_38cm_quad.sqrt();
            r += 4.0 * count_35_6cm_38cm_twin_38_1cm_30_5cm.sqrt();
        }
        ShipClass::IowaClass => {
            r += -10.0 * m * count_46cm_triple.sqrt();
            r += -7.0 * m * count_proto_46cm.sqrt();
            r += -5.0 * m * count_41cm_series.sqrt();
            r += -2.0 * m * count_381mm.sqrt();
            r += 4.0 * count_35_6cm_38cm_twin_38_1cm_30_5cm.sqrt();

            // 意味不明
            if is_married {
                r += -2.0 * count_16inch_mk7.sqrt();
                r += 5.0 * count_16inch_mk7_gfcs.sqrt();
            } else {
                r += if count_16inch_mk7 == 0.0 {
                    0.0
                } else if count_16inch_mk7 == 1.0 {
                    -7.0
                } else {
                    4.0 + -5.0 * (count_16inch_mk7 - 2.0)
                };
                r += -2.0 * count_16inch_mk7_gfcs.sqrt();
            }
        }
        ShipClass::ColoradoClass => {
            r += -7.0 * m * count_46cm_triple_kai.sqrt();
            r += -2.0 * m * count_16inch_mk7.sqrt();
            r += 2.0 * count_41cm_series.sqrt();
            r += 1.0 * count_35_6cm_38cm_twin_38_1cm_30_5cm.sqrt();
        }
        ShipClass::RichelieuClass => {
            r += -10.0 * m * count_46cm_triple.sqrt();
            r += -7.0 * m * count_proto_46cm.sqrt();
            r += -5.0 * m * count_41cm_series.sqrt();
            r += -5.0 * m * count_16inch_mk7.sqrt();
            r += -8.0 * m * count_16inch_mk1_triple_fcr.sqrt();
            r += -14.0 * m * count_16inch_mk1_triple_afct.sqrt();
            r += -7.0 * m * count_16inch_mk1_triple.sqrt();
            r += -2.0 * m * count_381mm.sqrt();
            r += 4.0 * count_38cm_quad.sqrt();
            r += 4.0 * count_35_6cm_38cm_twin_38_1cm_30_5cm.sqrt();
        }
        ShipClass::QueenElizabethClass => {
            r += -11.0 * count_46cm_triple.sqrt();
            r += -8.0 * count_proto_46cm.sqrt();
            r += 2.0 * count_41cm_series.sqrt();
            r += -2.0 * count_16inch_mk7_gfcs.sqrt();
            r += 3.0 * count_16inch_mk1_triple_fcr.sqrt();
            r += 5.0 * count_16inch_mk1_triple.sqrt();
            r += 2.0 * count_381mm.sqrt();
            r += 6.0 * (count_35_6cm_38cm_twin + count_30_5cm).sqrt();
            r += 8.0 * count_38_1cm.sqrt();
        }
        ShipClass::NelsonClass => {
            r += -2.0 * count_46cm_triple.sqrt();
            r += 3.0 * count_41cm_series.sqrt();
        }
        ShipClass::YamatoClass => {
            r += 7.0 * count_46cm_triple_kai.sqrt();
            r += 3.0 * count_46cm_triple.sqrt();
            r += 3.0 * count_proto_46cm.sqrt();
        }
        _ => {}
    };

    if ship_id == ship_id!("長門改二") || ship_id == ship_id!("陸奥改二") {
        if ship_id == ship_id!("長門改二") {
            r += -5.0 * count_51cm.sqrt();
        } else if ship_id == ship_id!("陸奥改二") {
            r += -8.0 * count_51cm.sqrt();
        }

        r += -6.0 * count_46cm_triple_kai.sqrt();
        r += -4.0 * count_46cm_triple.sqrt();
        r += -2.0 * count_proto_46cm.sqrt();
        r += 4.0 * count_16inch_mk1_triple_afct.sqrt();
        r += 5.0 * count_41cm_twin_kai2.sqrt();
        r += 5.0 * count_41cm_triple_kai2.sqrt();
        r += 5.0 * count_41cm_series.sqrt();
        r += 2.0 * count_16inch_mk1_twin.sqrt();
        r += 2.0 * count_381mm.sqrt();
        r += 2.0 * count_35_6cm_38cm_twin_38_1cm_30_5cm.sqrt();
    } else if ship_class == ShipClass::IseClass && ship.has_attr(ShipAttr::Kai2) {
        r += -7.0 * count_46cm_triple.sqrt();
        r += 4.0 * count_41cm_triple_kai2.sqrt();
        r += 6.0 * count_41cm_twin_kai2.sqrt();
        r += 4.0 * count_41cm_series.sqrt();
        r += 2.0 * count_16inch_mk7.sqrt();
        r += 2.0 * count_16inch_mk1_triple_fcr.sqrt();
        r += 1.0 * count_381mm.sqrt();
        r += 4.0 * count_35_6cm_38cm_twin_38_1cm_30_5cm.sqrt();
    } else if matches!(
        ship_class,
        ShipClass::IseClass | ShipClass::FusouClass | ShipClass::NagatoClass
    ) {
        r += -4.0 * count_46cm_triple_kai.sqrt();
        r += -7.0 * count_46cm_triple.sqrt();
        r += -3.0 * count_proto_46cm.sqrt();
        r += 3.0 * count_16inch_mk1_triple.sqrt();
        r += 2.0 * count_16inch_mk7.sqrt();
        r += 2.0 * count_16inch_mk7_gfcs.sqrt();
        r += 2.0 * count_41cm_series.sqrt();
        r += 2.0 * m * count_381mm.sqrt();
        r += 4.0 * count_35_6cm_38cm_twin_38_1cm_30_5cm.sqrt();
    }

    r
}

/// 砲撃戦フィット補正
pub fn fit_gun_bonus(ship: &Ship, is_night: bool) -> f64 {
    match ship.ship_type {
        ShipType::DD => destroyer_bonus(ship),
        ShipType::CL | ShipType::CLT | ShipType::CT => light_cruiser_bonus(ship),
        ShipType::CA | ShipType::CAV => heavy_cruiser_bonus(ship, is_night),
        ShipType::FBB | ShipType::BB | ShipType::BBV => battleship_bonus(ship, is_night),
        ShipType::AV => seaplane_tender_bonus(ship),
        _ => 0.0,
    }
}
