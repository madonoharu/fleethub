use enumset::EnumSet;

use crate::{
    gear_id,
    types::{GearAttr, GearType, NightCutin, ShipType},
};

use super::Ship;

pub fn get_possible_night_cutin_set(ship: &Ship) -> EnumSet<NightCutin> {
    let mut set = EnumSet::new();

    if ship.is_night_carrier() {
        let night_fighter_count =
            ship.count_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::NightFighter));
        let night_attacker_count =
            ship.count_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::NightAttacker));

        if night_fighter_count >= 2 && night_attacker_count >= 1 {
            set.insert(NightCutin::Cvci1_25);
        }

        if night_fighter_count >= 1 && night_attacker_count >= 1 {
            set.insert(NightCutin::Cvci1_20);
        }

        let has_fuze_bomber =
            ship.has_non_zero_slot_gear(gear_id!("彗星一二型(三一号光電管爆弾搭載機)"));

        if has_fuze_bomber && night_fighter_count + night_attacker_count >= 1 {
            set.insert(NightCutin::Photobomber);
        }

        if night_fighter_count == 0 {
            return set;
        }

        let semi_night_plane_count =
            ship.count_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::SemiNightPlane));

        if night_fighter_count + semi_night_plane_count >= 3
            || night_attacker_count + semi_night_plane_count >= 2
        {
            set.insert(NightCutin::Cvci1_18);
        }

        return set;
    }

    let torpedo_count = ship.gears.count_type(GearType::Torpedo)
        + ship.gears.count_type(GearType::SubmarineTorpedo);
    let main_gun_count = ship.gears.count_attr(GearAttr::MainGun);
    let sec_gun_count = ship.gears.count_type(GearType::SecondaryGun);

    if ship.ship_type == ShipType::DD && torpedo_count >= 1 {
        let has_surface_radar = ship.gears.has_attr(GearAttr::SurfaceRadar);

        let has_tslo = ship.gears.has(gear_id!("水雷戦隊 熟練見張員"));
        let has_lookout = has_tslo || ship.gears.has(gear_id!("熟練見張員"));

        if has_surface_radar {
            if main_gun_count >= 1 {
                set.insert(NightCutin::MainTorpRadar);
            }
            if has_lookout {
                set.insert(NightCutin::TorpLookoutRadar);
            }
        }

        if has_tslo {
            if torpedo_count >= 2 {
                set.insert(NightCutin::TorpTsloTorp);
            }
            if ship.gears.has(gear_id!("ドラム缶(輸送用)")) {
                set.insert(NightCutin::TorpTsloDrum);
            }
        }
    }

    let late_model_bow_torpedo_count = ship.gears.count_attr(GearAttr::LateModelBowTorpedo);
    let has_submarine_radar = ship.gears.has_type(GearType::SubmarineEquipment);

    if late_model_bow_torpedo_count >= 1 && has_submarine_radar {
        set.insert(NightCutin::SubRadarTorp);
    } else if late_model_bow_torpedo_count >= 2 {
        set.insert(NightCutin::SubTorpTorp);
    } else if main_gun_count >= 3 {
        set.insert(NightCutin::MainMainMain);
    } else if main_gun_count >= 2 && sec_gun_count >= 1 {
        set.insert(NightCutin::MainMainSec);
    } else if torpedo_count >= 2 {
        set.insert(NightCutin::TorpTorpTorp);
    } else if torpedo_count >= 1 && main_gun_count >= 1 {
        set.insert(NightCutin::TorpTorpMain);
    } else if main_gun_count + sec_gun_count >= 2 {
        set.insert(NightCutin::DoubleAttack);
    }

    set
}
