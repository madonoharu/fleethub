use enumset::EnumSet;

use crate::types::{ctype, gear_id, DamageState, DayCutin, GearAttr, GearType, ShipAttr};

use super::Ship;

impl Ship {
    pub fn get_possible_day_cutin_set(&self, anti_inst: bool) -> EnumSet<DayCutin> {
        let mut set: EnumSet<DayCutin> = EnumSet::new();

        if self.damage_state() >= DamageState::Taiha {
            return set;
        }

        if self.is_carrier_like() {
            if anti_inst {
                return set;
            }

            let cb_bomber_count = self
                .gears
                .count_by(|g| g.gear_type == GearType::CbDiveBomber);

            let has_cb_torpedo_bomber =
                self.has_non_zero_slot_gear_by(|gear| gear.gear_type == GearType::CbTorpedoBomber);

            let has_cb_fighter =
                self.has_non_zero_slot_gear_by(|gear| gear.gear_type == GearType::CbFighter);

            if cb_bomber_count == 0 || !has_cb_torpedo_bomber {
                return set;
            }

            set.insert(DayCutin::BA);

            if cb_bomber_count >= 2 {
                set.insert(DayCutin::BBA);
            }

            if has_cb_fighter {
                set.insert(DayCutin::FBA);
            }

            return set;
        }

        let main_gun_count = self.gears.count_by(|g| g.has_attr(GearAttr::MainGun));

        if main_gun_count == 0 {
            return set;
        }

        if self.ctype == ctype!("伊勢型") && self.has_attr(ShipAttr::Kai2) {
            let zuiun_count = self.count_non_zero_slot_gear_by(|gear| {
                matches!(
                    gear.gear_id,
                    gear_id!("瑞雲")
                        | gear_id!("瑞雲(六三一空)")
                        | gear_id!("瑞雲(六三四空)")
                        | gear_id!("瑞雲(六三四空/熟練)")
                        | gear_id!("瑞雲12型")
                        | gear_id!("瑞雲12型(六三四空)")
                        | gear_id!("瑞雲改二(六三四空)")
                        | gear_id!("瑞雲改二(六三四空/熟練)")
                )
            });

            if zuiun_count >= 2 {
                set.insert(DayCutin::Zuiun);
            }

            let suisei_634_count = self.count_non_zero_slot_gear_by(|gear| {
                matches!(
                    gear.gear_id,
                    gear_id!("彗星一二型(六三四空/三号爆弾搭載機)")
                        | gear_id!("彗星二二型(六三四空)")
                        | gear_id!("彗星二二型(六三四空/熟練)")
                )
            });

            if suisei_634_count >= 2 {
                set.insert(DayCutin::AirSea);
            }
        }

        let has_observation_seaplane =
            self.has_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::ObservationSeaplane));

        if !has_observation_seaplane {
            return set;
        }

        let secondary_gun_count = self
            .gears
            .count_by(|g| g.gear_type == GearType::SecondaryGun);
        let has_ap_shell = self.gears.has_type(GearType::ApShell);
        let has_radar = self.gears.has_attr(GearAttr::Radar);

        if main_gun_count >= 2 {
            set.insert(DayCutin::DoubleAttack);

            if has_ap_shell {
                set.insert(DayCutin::MainMain);
            }
        }

        if secondary_gun_count >= 1 {
            set.insert(DayCutin::MainSec);

            if has_radar {
                set.insert(DayCutin::MainRadar);
            }
            if has_ap_shell {
                set.insert(DayCutin::MainAp);
            }
        }

        set
    }
}
