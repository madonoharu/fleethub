use enumset::EnumSet;

use crate::types::{
    gear_id, DamageState, GearAttr, GearType, NightConditions, NightCutin, ShipType, Side,
};

use super::Ship;

impl Ship {
    pub fn get_possible_night_cutin_set(&self, anti_inst: bool) -> EnumSet<NightCutin> {
        let gears = &self.gears;
        let mut set = EnumSet::new();

        if self.is_night_carrier() {
            let night_fighter_count =
                self.count_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::NightFighter));
            let night_attacker_count =
                self.count_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::NightAttacker));

            if night_fighter_count >= 2 && night_attacker_count >= 1 {
                set.insert(NightCutin::Cvci1_25);
            }

            if night_fighter_count >= 1 && night_attacker_count >= 1 {
                set.insert(NightCutin::Cvci1_20);
            }

            let has_fuze_bomber =
                self.has_non_zero_slot_gear(gear_id!("彗星一二型(三一号光電管爆弾搭載機)"));

            if has_fuze_bomber && night_fighter_count + night_attacker_count >= 1 {
                set.insert(NightCutin::Photobomber);
            }

            if night_fighter_count == 0 {
                return set;
            }

            let semi_night_plane_count =
                self.count_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::SemiNightPlane));

            if night_fighter_count + semi_night_plane_count >= 3
                || night_attacker_count + semi_night_plane_count >= 2
            {
                set.insert(NightCutin::Cvci1_18);
            }

            return set;
        }

        let torpedo_count = if anti_inst {
            0
        } else {
            gears.count_type(GearType::Torpedo) + gears.count_type(GearType::SubmarineTorpedo)
        };

        let main_gun_count = gears.count_attr(GearAttr::MainGun);
        let sec_gun_count = gears.count_type(GearType::SecondaryGun);

        if self.ship_type == ShipType::DD && torpedo_count >= 1 {
            let has_surface_radar = gears.has_attr(GearAttr::SurfaceRadar);

            let has_tslo = gears.has(gear_id!("水雷戦隊 熟練見張員"));
            let has_lookout = has_tslo || gears.has(gear_id!("熟練見張員"));

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
                if gears.has(gear_id!("ドラム缶(輸送用)")) {
                    set.insert(NightCutin::TorpTsloDrum);
                }
            }
        }

        if matches!(
            self.ship_type,
            ShipType::CL | ShipType::CAV | ShipType::BBV | ShipType::AV
        ) && main_gun_count >= 2
        {
            let night_zuiun_count = self.count_non_zero_slot_gear_by(|gear| {
                gear.gear_id == gear_id!("試製 夜間瑞雲(攻撃装備)")
            });

            let has_surface_radar = gears.has_attr(GearAttr::SurfaceRadar);

            if night_zuiun_count >= 2 {
                if has_surface_radar {
                    set.insert(NightCutin::NightZuiun2Radar);
                }
                set.insert(NightCutin::NightZuiun2);
            }

            if night_zuiun_count >= 1 {
                if has_surface_radar {
                    set.insert(NightCutin::NightZuiunRadar);
                }
                set.insert(NightCutin::NightZuiun);
            }
        }

        let late_model_bow_torpedo_count = if anti_inst {
            0
        } else {
            gears.count_attr(GearAttr::LateModelBowTorpedo)
        };

        let has_submarine_radar = gears.has_type(GearType::SubmarineEquipment);

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

    pub fn calc_night_cutin_term(&self, params: NightCutinTermParams) -> Option<f64> {
        let level = self.level as f64;
        let luck = self.luck()? as f64;
        let damage_state = params
            .damage_state_override
            .unwrap_or_else(|| self.damage_state());

        let mut value = if luck < 50.0 {
            luck + 15.0 + 0.75 * level.sqrt()
        } else {
            (luck - 50.0).sqrt() + 65.0 + 0.8 * level.sqrt()
        }
        .floor();

        if params.is_flagship {
            value += 15.0
        }

        if damage_state == DamageState::Chuuha {
            value += 18.0
        }

        if self.gears.has(gear_id!("熟練見張員")) {
            value += 5.0
        }

        // https://twitter.com/Divinity__123/status/1479343022974324739
        if self.gears.has(gear_id!("水雷戦隊 熟練見張員"))
            && (self.ship_type.is_destroyer() || self.ship_type.is_light_cruiser())
        {
            value += 9.0
        }

        if params.attacker_searchlight {
            value += 7.0
        }

        if params.target_searchlight {
            value += -5.0
        }

        if params.attacker_starshell {
            value += 4.0
        }

        if params.target_starshell {
            value += -10.0
        }

        Some(value)
    }
}

pub struct NightCutinTermParams {
    pub is_flagship: bool,
    pub attacker_starshell: bool,
    pub attacker_searchlight: bool,
    pub target_starshell: bool,
    pub target_searchlight: bool,
    pub damage_state_override: Option<DamageState>,
}

impl NightCutinTermParams {
    pub fn new(is_flagship: bool, attacker_side: Side, conditions: &NightConditions) -> Self {
        let attacker = conditions.night_fleet_conditions(attacker_side);
        let target = conditions.night_fleet_conditions(!attacker_side);

        Self {
            is_flagship,
            attacker_starshell: attacker.activates_starshell(),
            attacker_searchlight: attacker.activates_searchlight(),
            target_starshell: target.activates_starshell(),
            target_searchlight: target.activates_searchlight(),
            damage_state_override: None,
        }
    }

    pub fn set_damage_state_override(self, damage_state: DamageState) -> Self {
        Self {
            damage_state_override: Some(damage_state),
            ..self
        }
    }
}
