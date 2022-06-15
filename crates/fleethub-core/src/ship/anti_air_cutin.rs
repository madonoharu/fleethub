use crate::{
    gear::Gear,
    matches_gear_id,
    types::{ctype, gear_id, ship_id, GearAttr, GearType, ShipAttr, ShipType},
};

use super::Ship;

impl Ship {
    pub fn get_possible_anti_air_cutin_ids(&self) -> Vec<u8> {
        let &Self {
            ship_id,
            ship_type,
            ctype,
            ref gears,
            ..
        } = self;

        let mut vec: Vec<u8> = Vec::with_capacity(10);

        if ctype == ctype!("Fletcher級") {
            let mk30_kai_count = gears.count(gear_id!("5inch単装砲 Mk.30改"));
            let mk30_count = gears.count(gear_id!("5inch単装砲 Mk.30改")) + mk30_kai_count;
            let mk30_gfcs_count = gears.count(gear_id!("5inch単装砲 Mk.30改+GFCS Mk.37"));

            // 5inch単装砲 Mk.30改＋GFCS Mk.37 2本
            if mk30_gfcs_count >= 2 {
                vec.push(34)
            }

            // 5inch単装砲 Mk.30改＋GFCS Mk.37 && 5inch単装砲 Mk.30(改)
            if mk30_gfcs_count > 0 && mk30_count > 0 {
                vec.push(35)
            }

            // Mk.30(改) 2本
            if mk30_count >= 2 && gears.has(gear_id!("GFCS Mk.37")) {
                vec.push(36)
            }

            // Mk.30改 2本
            if mk30_kai_count >= 2 {
                vec.push(37)
            }
        }

        if ctype == ctype!("Atlanta級") {
            let mk37_5inch_gfcs_count =
                gears.count(gear_id!("GFCS Mk.37+5inch連装両用砲(集中配備)"));
            let mk37_5inch_count = gears.count(gear_id!("5inch連装両用砲(集中配備)"));
            let atlanta_gun_count = mk37_5inch_gfcs_count + mk37_5inch_count;

            if mk37_5inch_gfcs_count >= 2 {
                vec.push(38)
            }
            if mk37_5inch_gfcs_count >= 1 && mk37_5inch_count >= 1 {
                vec.push(39)
            }
            if atlanta_gun_count >= 2 {
                if gears.has(gear_id!("GFCS Mk.37")) {
                    vec.push(40)
                }
                vec.push(41)
            }
        }

        // 秋月型 かつ 高角砲を装備
        if ctype == ctype!("秋月型") && gears.has_attr(GearAttr::HighAngleMount) {
            // 高角砲を2つ以上装備 かつ 電探を装備
            if gears.count_attr(GearAttr::HighAngleMount) >= 2 && gears.has_attr(GearAttr::Radar) {
                vec.push(1)
            }
            // 電探を装備
            if gears.has_attr(GearAttr::Radar) {
                vec.push(2)
            }
            // 高角砲を2つ以上装備
            if gears.count_attr(GearAttr::HighAngleMount) >= 2 {
                vec.push(3)
            }

            return vec;
        }

        let is_cdmg = |gear: &Gear| gear.gear_type == GearType::AntiAirGun && gear.anti_air >= 9;
        let is_standard_anti_air_gun =
            |g: &Gear| g.gear_type == GearType::AntiAirGun && g.anti_air >= 3 && g.anti_air <= 8;

        let is_builtin_high_angle_mount =
            |gear: &Gear| gear.has_attr(GearAttr::HighAngleMount) && gear.anti_air >= 8;

        let has_air_radar = gears.has_attr(GearAttr::AirRadar);
        let high_angle_mount_count = gears.count_attr(GearAttr::HighAngleMount);
        let has_high_angle_mount = high_angle_mount_count > 0;

        // 大和改二改二
        if ctype == ctype!("大和型") && self.has_attr(ShipAttr::Kai2) {
            let has_15m_duplex_rangefinder_t21_air_radar_or_fdc = gears.has_by(|gear| {
                matches_gear_id!(
                    gear.gear_id,
                    "15m二重測距儀+21号電探改二" | "15m二重測距儀改+21号電探改二+熟練射撃指揮所"
                )
            });

            if has_15m_duplex_rangefinder_t21_air_radar_or_fdc {
                let number_of_10cm_cd = gears.count(gear_id!("10cm連装高角砲群 集中配備"));
                let has_aa_gun_with_aa_gth_6 = gears
                    .has_by(|gear| gear.gear_type == GearType::AntiAirGun && gear.anti_air >= 6);

                if number_of_10cm_cd >= 2 {
                    if has_aa_gun_with_aa_gth_6 {
                        vec.push(42)
                    }
                    vec.push(43)
                }

                if number_of_10cm_cd >= 1 {
                    if has_aa_gun_with_aa_gth_6 {
                        vec.push(44)
                    }
                    vec.push(45)
                }
            }
        }

        // 摩耶改二 かつ 高角砲を装備 かつ 特殊機銃を装備
        if ship_id == ship_id!("摩耶改二") && has_high_angle_mount && gears.has_by(is_cdmg) {
            if has_air_radar {
                vec.push(10)
            }
            vec.push(11)
        }

        // 五十鈴改二 かつ 高角砲を装備 かつ 対空機銃を装備
        if ship_id == ship_id!("五十鈴改二")
            && has_high_angle_mount
            && gears.has_type(GearType::AntiAirGun)
        {
            if has_air_radar {
                vec.push(14)
            }
            vec.push(15)
        }

        // 霞改二乙 かつ 高角砲を装備 かつ 対空機銃を装備
        if ship_id == ship_id!("霞改二乙")
            && has_high_angle_mount
            && gears.has_type(GearType::AntiAirGun)
        {
            if has_air_radar {
                vec.push(16)
            }
            vec.push(17)
        }

        if ship_id == ship_id!("夕張改二")
            && has_high_angle_mount
            && gears.has_type(GearType::AntiAirGun)
            && has_air_radar
        {
            vec.push(16)
        }

        // 鬼怒改二 かつ 特殊機銃を装備 かつ 標準高角砲を装備
        if ship_id == ship_id!("鬼怒改二")
            && gears.has_by(is_cdmg)
            && gears.has_by(|g| g.has_attr(GearAttr::HighAngleMount) && g.anti_air < 8)
        {
            vec.push(19)
        }

        // 由良改二 かつ 高角砲を装備 かつ 対空電探
        if ship_id == ship_id!("由良改二") && has_high_angle_mount && has_air_radar {
            vec.push(21)
        }

        // 伊勢型航空戦艦 かつ 12cm30連装噴進砲改二を装備 かつ 対空強化弾(三式弾)を装備 かつ 対空電探を装備
        if ctype == ctype!("伊勢型")
            && self.ship_type == ShipType::BBV
            && gears.has(gear_id!("12cm30連装噴進砲改二"))
            && gears.has_type(GearType::AntiAirShell)
            && has_air_radar
        {
            vec.push(25)
        }

        // 高射装置を装備 かつ 大口径主砲を装備 かつ 対空強化弾(三式弾)を装備 かつ 対空電探を装備
        if gears.has_type(GearType::AntiAirFireDirector)
            && gears.has_type(GearType::LargeMainGun)
            && gears.has_type(GearType::AntiAirShell)
            && has_air_radar
        {
            vec.push(4)
        }

        // 特殊高角砲を2つ以上装備 かつ 対空電探を装備
        if gears.count_by(is_builtin_high_angle_mount) >= 2 && has_air_radar {
            vec.push(5)
        }

        // 高射装置を装備 かつ 大口径主砲を装備 かつ 対空強化弾(三式弾)を装備
        if gears.has_type(GearType::AntiAirFireDirector)
            && gears.has_type(GearType::LargeMainGun)
            && gears.has_type(GearType::AntiAirShell)
        {
            vec.push(6)
        }

        // 特殊高角砲を装備 かつ 対空電探を装備
        if gears.has_by(is_builtin_high_angle_mount) && has_air_radar {
            vec.push(8)
        }

        // 高射装置を装備かつ 高角砲を装備 かつ 対空電探を装備
        if gears.has_type(GearType::AntiAirFireDirector) && has_high_angle_mount && has_air_radar {
            vec.push(7)
        }

        // 大和型改二 かつ 10cm連装高角砲改+増設機銃を装備 かつ 対空電探を装備
        if ctype == ctype!("大和型")
            && self.has_attr(ShipAttr::Kai2)
            && gears.has(gear_id!("10cm連装高角砲改+増設機銃"))
            && has_air_radar
        {
            vec.push(26)
        }

        // (伊勢型航空戦艦|武蔵改|武蔵改二) かつ 12cm30連装噴進砲改二を装備 かつ 対空電探を装備
        if (ctype == ctype!("伊勢型") && ship_type == ShipType::BBV)
            || matches!(ship_id, ship_id!("武蔵改") | ship_id!("武蔵改二"))
        {
            if gears.has(gear_id!("12cm30連装噴進砲改二")) && has_air_radar {
                vec.push(28)
            }
        }

        // (浜風乙改 または 磯風乙改) かつ 高角砲を装備 かつ 対空電探を装備
        if matches!(ship_id, ship_id!("浜風乙改") | ship_id!("磯風乙改")) {
            if has_high_angle_mount && has_air_radar {
                vec.push(29)
            }
        }

        // 高射装置を装備 かつ 高角砲を装備
        if gears.has_type(GearType::AntiAirFireDirector) && has_high_angle_mount {
            vec.push(9)
        }

        // Gotland改以上 かつ 高角砲を装備 かつ 対空4以上の対空機銃を装備
        if matches!(ship_id, ship_id!("Gotland改") | ship_id!("Gotland andra"))
            && has_high_angle_mount
            && gears.has_by(|g| g.gear_type == GearType::AntiAirGun && g.anti_air >= 4)
        {
            vec.push(33)
        }

        // 特殊機銃を装備 かつ 対空電探を装備 かつ 標準機銃または特殊機銃を装備
        if gears.has_by(is_cdmg)
            && has_air_radar
            && gears.count_by(|g| g.gear_type == GearType::AntiAirGun && g.anti_air >= 3) >= 2
        {
            vec.push(12)
        }

        // 特殊高角砲を装備 かつ 特殊機銃を装備 かつ 対空電探を装備
        if gears.has_by(is_builtin_high_angle_mount) && gears.has_by(is_cdmg) && has_air_radar {
            vec.push(13)
        }

        // 皐月改二 かつ 特殊機銃を装備
        if ship_id == ship_id!("皐月改二") && gears.has_by(is_cdmg) {
            vec.push(18)
        }

        // 鬼怒改二 かつ 特殊機銃を装備
        if ship_id == ship_id!("鬼怒改二") && gears.has_by(is_cdmg) {
            vec.push(20)
        }

        // 文月改二 かつ 特殊機銃を装備
        if ship_id == ship_id!("文月改二") && gears.has_by(is_cdmg) {
            vec.push(22)
        }

        // (UIT-25 または 伊504) かつ 標準機銃を装備
        if ship_id == ship_id!("UIT-25") || ship_id == ship_id!("伊504") {
            if gears.has_by(is_standard_anti_air_gun) {
                vec.push(23)
            }
        }

        // (龍田改二|天龍改二) かつ 高角砲を装備 かつ 標準機銃を装備
        if matches!(ship_id, ship_id!("龍田改二") | ship_id!("天龍改二"))
            && has_high_angle_mount
            && gears.has_by(is_standard_anti_air_gun)
        {
            vec.push(24)
        }

        // (天龍改二|Gotland改) かつ 高角砲を3つ以上装備
        if matches!(ship_id, ship_id!("天龍改二") | ship_id!("Gotland改"))
            && high_angle_mount_count >= 3
        {
            vec.push(30)
        }

        // 天龍改二 かつ 高角砲を2つ以上装備
        if ship_id == ship_id!("天龍改二") && high_angle_mount_count >= 2 {
            vec.push(31)
        }

        if self.has_attr(ShipAttr::RoyalNavy)
            || (ctype == ctype!("金剛型") && self.has_attr(ShipAttr::Kai2))
        {
            let rocket_launchers_count = gears.count(gear_id!("20連装7inch UP Rocket Launchers"));
            let has_rocket_launchers = rocket_launchers_count > 0;
            let has_pom_pom_gun = gears.has(gear_id!("QF 2ポンド8連装ポンポン砲"));

            if rocket_launchers_count >= 2
                || (has_pom_pom_gun && has_rocket_launchers)
                || (has_pom_pom_gun && gears.has(gear_id!("16inch Mk.I三連装砲改+FCR type284")))
            {
                vec.push(32)
            }
        }

        vec
    }
}
