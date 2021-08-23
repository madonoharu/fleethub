use enumset::EnumSet;
use num_traits::FromPrimitive;
use paste::paste;
use wasm_bindgen::prelude::*;

use crate::{
    attack::shelling::ProficiencyModifiers,
    gear::Gear,
    gear_array::{into_gear_index, into_gear_key, GearArray},
    gear_id, ship_id,
    types::{
        AirState, DamageState, DayCutin, EBonuses, GearAttr, GearType, MasterShip, NightCutin,
        ShipAttr, ShipClass, ShipState, ShipType, SlotSizeArray, SpecialEnemyType,
    },
    utils::xxh3,
    JsShipAttr,
};

#[derive(Debug, Default, Clone)]
pub struct ShipEquippable {
    pub types: Vec<u8>,
    pub exslot_types: Vec<u8>,
    pub exslot_gear_ids: Vec<u16>,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Ship {
    pub(crate) xxh3: u64,

    #[wasm_bindgen(skip)]
    pub id: String,

    #[wasm_bindgen(readonly)]
    pub ship_id: u16,
    #[wasm_bindgen(readonly)]
    pub level: u16,
    #[wasm_bindgen(readonly)]
    pub current_hp: u16,

    #[wasm_bindgen(skip)]
    pub ship_type: ShipType,
    #[wasm_bindgen(skip)]
    pub ship_class: ShipClass,

    max_hp_mod: Option<i16>,
    firepower_mod: Option<i16>,
    torpedo_mod: Option<i16>,
    armor_mod: Option<i16>,
    anti_air_mod: Option<i16>,
    evasion_mod: Option<i16>,
    asw_mod: Option<i16>,
    los_mod: Option<i16>,
    luck_mod: Option<i16>,

    #[wasm_bindgen(skip)]
    pub slots: SlotSizeArray,
    #[wasm_bindgen(skip)]
    pub gears: GearArray,
    #[wasm_bindgen(skip)]
    pub ebonuses: EBonuses,

    master: MasterShip,
    equippable: ShipEquippable,
}

fn get_marriage_bonus(left: u16) -> u16 {
    match left {
        0..=29 => 4,
        30..=39 => 5,
        40..=49 => 6,
        50..=69 => 7,
        70..=89 => 8,
        _ => 9,
    }
}

fn get_average_exp_modifiers(planes: &Vec<(usize, &Gear)>) -> (f64, f64, f64) {
    let average_exp =
        planes.iter().map(|(_, gear)| gear.exp as f64).sum::<f64>() / (planes.len() as f64);

    let a = if average_exp >= 10.0 {
        average_exp.sqrt().floor()
    } else {
        0.0
    };

    let b = if average_exp >= 100.0 {
        9.0
    } else if average_exp >= 80.0 {
        6.0
    } else if average_exp >= 70.0 {
        4.0
    } else if average_exp >= 55.0 {
        3.0
    } else if average_exp >= 40.0 {
        2.0
    } else if average_exp >= 25.0 {
        1.0
    } else {
        0.0
    };

    (average_exp, a, b)
}

macro_rules! match_stat {
    ($key: ident, $obj: expr) => {
        match $key {
            "firepower" => $obj.firepower,
            "torpedo" => $obj.torpedo,
            "armor" => $obj.armor,
            "anti_air" => $obj.anti_air,
            "accuracy" => $obj.accuracy,
            "evasion" => $obj.evasion,
            "asw" => $obj.asw,
            "los" => $obj.los,
            "range" => $obj.range as i16,
            _ => 0,
        }
    };
}

macro_rules! impl_naked_stats {
    ($($key:ident),*) => {
        paste! {
            #[wasm_bindgen]
            impl Ship {
                $(
                    #[wasm_bindgen(getter)]
                    pub fn [<naked_ $key>](&self) -> Option<u16> {
                        self.master
                            .$key
                            .1
                            .map(|base| base as i16 + self.[<$key _mod>].unwrap_or_default())
                            .or(self.[<$key _mod>])
                            .map(|v| v as u16)
                    }
                )*
            }
        }
    };
}

macro_rules! impl_naked_stats_with_level {
    ($($key:ident),*) => {
        paste! {
            #[wasm_bindgen]
            impl Ship {
                $(
                    #[wasm_bindgen(getter)]
                    pub fn [<naked_ $key>](&self) -> Option<u16> {
                        let stat_mod = self.[<$key _mod>];

                        self.master
                            .$key
                            .zipped()
                            .map(|(at1, at99)| {
                                let at1 = at1 as f64;
                                let at99 = at99 as f64;
                                let stat_mod = stat_mod.unwrap_or_default();

                                let value = (((at99 - at1) * self.level as f64) / 99.0 + at1).floor() as i16;
                                value + stat_mod
                            })
                            .or(stat_mod)
                            .map(|v| v as u16)
                    }
                )*
            }
        }
    };
}

macro_rules! impl_stats {
    ($($key:ident),*) => {
        #[wasm_bindgen]
        impl Ship {
            $(
                #[wasm_bindgen(getter)]
                pub fn $key(&self) -> Option<u16> {
                    paste! {
                        let naked = self.[<naked_ $key>]()? as i16;
                        let ebonus = self.ebonuses.$key;
                        let total = self.gears.sum_by(|gear| gear.$key);

                        Some((naked + ebonus + total).max(0) as u16)
                    }
                }
            )*
        }
    };
}

impl_naked_stats!(firepower, torpedo, armor, anti_air);

impl_naked_stats_with_level!(evasion, asw, los);

impl_stats!(firepower, torpedo, armor, anti_air, evasion, asw, los);

fn nisshin_max_slot_size(master: &MasterShip, gears: &GearArray, index: usize) -> Option<u8> {
    if gears
        .get(index)
        .map(|gear| gear.gear_type == GearType::LargeFlyingBoat)
        .unwrap_or_default()
    {
        Some(1)
    } else {
        master.get_max_slot_size(index)
    }
}

impl Ship {
    pub fn new(
        state: ShipState,
        master: &MasterShip,
        equippable: ShipEquippable,
        gears: GearArray,
        ebonuses: EBonuses,
    ) -> Self {
        let xxh3 = xxh3(&state);

        let ship_class = FromPrimitive::from_u16(master.ctype).unwrap_or_default();
        let is_nisshin = ship_class == ShipClass::NisshinClass;

        let slots =
            std::array::IntoIter::new([state.ss1, state.ss2, state.ss3, state.ss4, state.ss5])
                .enumerate()
                .map(|(index, slot_size)| {
                    slot_size.or_else(|| {
                        if is_nisshin {
                            nisshin_max_slot_size(master, &gears, index)
                        } else {
                            master.get_max_slot_size(index)
                        }
                    })
                })
                .collect();

        let mut ship = Ship {
            xxh3,

            id: state.id.unwrap_or_default(),
            ship_id: state.ship_id,
            level: state.level.unwrap_or(master.default_level()),
            current_hp: state.current_hp.unwrap_or_default(),
            ship_type: FromPrimitive::from_u8(master.stype).unwrap_or_default(),
            ship_class,

            slots,
            gears,

            ebonuses,
            equippable,
            master: master.clone(),

            max_hp_mod: state.max_hp_mod,
            firepower_mod: state.firepower_mod,
            torpedo_mod: state.torpedo_mod,
            armor_mod: state.armor_mod,
            anti_air_mod: state.anti_air_mod,
            evasion_mod: state.evasion_mod,
            asw_mod: state.asw_mod,
            los_mod: state.los_mod,
            luck_mod: state.luck_mod,
        };

        if ship.current_hp == 0 {
            ship.current_hp = ship.max_hp().unwrap_or_default();
        }

        ship
    }

    pub fn has_attr(&self, attr: ShipAttr) -> bool {
        self.master.attrs.contains(attr)
    }

    pub fn special_enemy_type(&self) -> SpecialEnemyType {
        if self.has_attr(ShipAttr::Pillbox) {
            SpecialEnemyType::Pillbox
        } else if self.has_attr(ShipAttr::IsolatedIsland) {
            SpecialEnemyType::IsolatedIsland
        } else if self.has_attr(ShipAttr::HarbourSummerPrincess) {
            SpecialEnemyType::HarbourSummerPrincess
        } else if self.has_attr(ShipAttr::SupplyDepot) {
            SpecialEnemyType::SupplyDepot
        } else if self.has_attr(ShipAttr::PtImp) {
            SpecialEnemyType::PtImp
        } else if self.has_attr(ShipAttr::BattleshipSummerPrincess) {
            SpecialEnemyType::BattleshipSummerPrincess
        } else if self.has_attr(ShipAttr::HeavyCruiserSummerPrincess) {
            SpecialEnemyType::HeavyCruiserSummerPrincess
        } else if self.has_attr(ShipAttr::Installation) {
            SpecialEnemyType::SoftSkinned
        } else {
            SpecialEnemyType::None
        }
    }

    pub fn damage_state(&self) -> DamageState {
        DamageState::from_hp(self.max_hp().unwrap_or_default(), self.current_hp)
    }

    pub fn gears_with_slot_size(&self) -> impl Iterator<Item = (usize, &Gear, Option<u8>)> {
        self.gears.iter().map(move |(index, gear)| {
            let slot_size = if index == GearArray::EXSLOT_INDEX {
                Some(0)
            } else {
                self.get_slot_size(index)
            };
            (index, gear, slot_size)
        })
    }

    pub fn has_non_zero_slot_gear_by<F: FnMut(&Gear) -> bool>(&self, mut cb: F) -> bool {
        self.gears_with_slot_size()
            .any(|(_, gear, slot_size)| slot_size.unwrap_or_default() > 0 && cb(gear))
    }

    pub fn has_non_zero_slot_gear(&self, id: u16) -> bool {
        self.has_non_zero_slot_gear_by(|g| g.gear_id == id)
    }

    pub fn count_non_zero_slot_gear_by<F: FnMut(&Gear) -> bool>(&self, mut cb: F) -> usize {
        self.gears_with_slot_size()
            .filter(|(_, gear, slot_size)| slot_size.unwrap_or_default() > 0 && cb(gear))
            .count()
    }

    pub fn count_non_zero_slot_gear(&self, id: u16) -> usize {
        self.count_non_zero_slot_gear_by(|g| g.gear_id == id)
    }

    pub fn get_ap_shell_modifiers(&self) -> (f64, f64) {
        let mut iter = self.gears.values();
        let has_main = iter.any(|g| g.attrs.contains(GearAttr::MainGun));
        let has_ap_shell = iter.any(|g| g.gear_type == GearType::ApShell);
        let has_rader = iter.any(|g| g.attrs.contains(GearAttr::Radar));
        let has_secondary = iter.any(|g| g.gear_type == GearType::SecondaryGun);

        if !has_ap_shell || !has_main {
            (1., 1.)
        } else if has_secondary && has_rader {
            (1.15, 1.3)
        } else if has_secondary {
            (1.15, 1.2)
        } else if has_rader {
            (1.1, 1.25)
        } else {
            (1.08, 1.1)
        }
    }

    pub fn is_carrier_like(&self) -> bool {
        if matches!(self.ship_type, ShipType::CVL | ShipType::CV | ShipType::CVB) {
            return true;
        }

        if self.ship_id != ship_id!("速吸改") && self.has_attr(ShipAttr::Installation) {
            return false;
        }

        self.gears.has_by(|g| {
            matches!(
                g.gear_type,
                GearType::CbDiveBomber
                    | GearType::CbTorpedoBomber
                    | GearType::JetFighterBomber
                    | GearType::JetTorpedoBomber
            )
        })
    }

    pub fn shelling_air_power(&self, is_anti_land: bool) -> i16 {
        let (torpedo, bombing) = if is_anti_land {
            let torpedo = 0;
            let bombing = self.gears.sum_by(|gear| {
                if gear.has_attr(GearAttr::AntiInstallationCbBomber)
                    || gear.gear_type == GearType::CbTorpedoBomber
                {
                    gear.bombing
                } else {
                    0
                }
            });

            (torpedo, bombing)
        } else {
            let torpedo = self.gears.sum_by(|gear| gear.torpedo);
            let bombing = self.gears.sum_by(|gear| gear.bombing);

            (torpedo, bombing)
        };

        (1.3 * (bombing as f64)).floor() as i16 + torpedo + 15
    }

    pub fn proficiency_modifiers(&self, cutin: Option<DayCutin>) -> ProficiencyModifiers {
        if let Some(cutin) = cutin {
            return self.carrier_cutin_proficiency_modifiers(cutin);
        }

        let planes = self
            .gears_with_slot_size()
            // 使い勝手のためにslot_sizeがNoneの場合スルーする
            .filter_map(|(i, g, slot_size)| (slot_size? > 0).then(|| (i, g)))
            .filter(|(_, gear)| {
                matches!(
                    gear.gear_type,
                    GearType::CbDiveBomber
                        | GearType::CbTorpedoBomber
                        | GearType::SeaplaneBomber
                        | GearType::LargeFlyingBoat
                        | GearType::JetFighterBomber
                        | GearType::JetTorpedoBomber
                )
            })
            .collect::<Vec<_>>();

        let (_, average_exp_mod_a, average_exp_mod_b) = get_average_exp_modifiers(&planes);

        let hit_percent_bonus = average_exp_mod_a + average_exp_mod_b;

        let critical_power_mod = planes
            .iter()
            .map(|(index, gear)| {
                let m = gear.proficiency_critical_power_mod();
                if *index == 0 {
                    m / 100.0
                } else {
                    m / 200.0
                }
            })
            .sum::<f64>();

        let critical_percent_bonus = planes
            .iter()
            .map(|(index, gear)| {
                let first_slot_bonus = if *index == 0 { 6.0 } else { 0.0 };
                let exp = gear.exp as f64;
                let ace = gear.ace() as f64;
                let modifier = ((exp * 0.1).sqrt() + ace) / 2.0 + 1.0;

                (modifier + first_slot_bonus).floor()
            })
            .sum::<f64>();

        ProficiencyModifiers {
            hit_percent_bonus,
            critical_power_mod,
            critical_percent_bonus,
        }
    }

    /// 戦爆連合熟練度補正の仮定式
    ///
    /// `critical_percent_bonus` は21%程度？
    ///
    /// 命中項下限で 命中率 > クリティカル率 であることから `hit_percent_bonus` と `critical_percent_bonus` は同程度のボーナスあり？
    /// https://twitter.com/MorimotoKou/status/1046257562230771712
    /// https://docs.google.com/spreadsheets/d/1i5jTixnOVjqrwZvF_4Uqf3L9ObHhS7dFqG8KiE5awkY
    /// https://twitter.com/kankenRJ/status/995827605801709568
    fn carrier_cutin_proficiency_modifiers(&self, cutin: DayCutin) -> ProficiencyModifiers {
        let mut f_count: usize = 0;
        let mut db_count: usize = 0;
        let mut tb_count: usize = 0;

        let (f_limit, db_limit, tb_limit) = match cutin {
            DayCutin::FBA => (1, 1, 1),
            DayCutin::BBA => (0, 2, 1),
            DayCutin::BA => (0, 1, 1),
            _ => {
                return ProficiencyModifiers::default();
            }
        };

        let planes = self
            .gears_with_slot_size()
            // 使い勝手のためにslot_sizeがNoneの場合スルーする
            .filter_map(|(i, g, slot_size)| (slot_size? > 0).then(|| (i, g)))
            .filter(|(_, gear)| match gear.gear_type {
                GearType::CbFighter => {
                    f_count += 1;
                    f_count <= f_limit
                }
                GearType::CbDiveBomber => {
                    db_count += 1;
                    db_count <= db_limit
                }
                GearType::CbTorpedoBomber => {
                    tb_count += 1;
                    tb_count <= tb_limit
                }
                _ => false,
            })
            .collect::<Vec<_>>();

        let (average_exp, average_exp_mod_a, average_exp_mod_b) =
            get_average_exp_modifiers(&planes);

        let y = if average_exp < 50.0 {
            1.0
        } else if average_exp <= 116.0 {
            1.0 + (average_exp - 50.0) / 1000.0
        } else if average_exp < 119.0 {
            1.066 + 0.03
        } else {
            1.066 + 0.04
        };

        let captain_participates = planes.iter().any(|(i, _)| *i == 0);

        let critical_power_mod = if captain_participates {
            y + 0.1 * (average_exp / 100.0).powf(2.0)
        } else {
            y
        };

        let hit_percent_bonus = average_exp_mod_a + average_exp_mod_b + 2.0;

        ProficiencyModifiers {
            hit_percent_bonus,
            critical_power_mod,
            critical_percent_bonus: hit_percent_bonus,
        }
    }

    pub fn is_night_carrier(&self) -> bool {
        if !matches!(self.ship_type, ShipType::CVL | ShipType::CV | ShipType::CVB) {
            return false;
        }

        let has_noap = self.has_attr(ShipAttr::NightCarrier)
            || self.gears.has(gear_id!("夜間作戦航空要員"))
            || self.gears.has(gear_id!("夜間作戦航空要員+熟練甲板員"));

        has_noap
            && self.has_non_zero_slot_gear_by(|g| {
                g.has_attr(GearAttr::NightAttacker) || g.has_attr(GearAttr::NightFighter)
            })
    }

    pub fn get_possible_day_cutin_set(&self) -> EnumSet<DayCutin> {
        let mut set: EnumSet<DayCutin> = EnumSet::new();

        if self.damage_state() <= DamageState::Taiha {
            return set;
        }

        if self.is_carrier_like() {
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

        if self.ship_class == ShipClass::IseClass && self.has_attr(ShipAttr::Kai2) {
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
        let has_rader = self.gears.has_attr(GearAttr::Radar);

        if main_gun_count >= 2 {
            set.insert(DayCutin::DoubleAttack);

            if has_ap_shell {
                set.insert(DayCutin::MainMain);
            }
        }

        if secondary_gun_count >= 1 {
            set.insert(DayCutin::MainSec);

            if has_rader {
                set.insert(DayCutin::MainRader);
            }
            if has_ap_shell {
                set.insert(DayCutin::MainAp);
            }
        }

        set
    }

    pub fn get_possible_night_cutin_set(&self) -> EnumSet<NightCutin> {
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

        let torpedo_count = self.gears.count_type(GearType::Torpedo);
        let main_gun_count = self.gears.count_attr(GearAttr::MainGun);
        let sec_gun_count = self.gears.count_type(GearType::SecondaryGun);

        if self.ship_type == ShipType::DD && torpedo_count >= 1 {
            let has_surface_radar = self.gears.has_attr(GearAttr::SurfaceRadar);

            let has_tslo = self.gears.has(gear_id!("水雷戦隊 熟練見張員"));
            let has_lookout = has_tslo || self.gears.has(gear_id!("熟練見張員"));

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
                if self.gears.has(gear_id!("ドラム缶(輸送用)")) {
                    set.insert(NightCutin::TorpTsloDrum);
                }
            }
        }

        let late_model_bow_torpedo_count = self.gears.count_by(|gear| {
            matches!(
                gear.gear_id,
                gear_id!("後期型艦首魚雷(6門)") | gear_id!("熟練聴音員+後期型艦首魚雷(6門)")
            )
        });
        let has_submarine_radar = self.gears.has_type(GearType::SubmarineEquipment);

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

    pub fn calc_observation_term(
        &self,
        fleet_los_mod: f64,
        is_main_flagship: bool,
        air_state: AirState,
    ) -> Option<f64> {
        let (as_mod1, as_mod2, as_mod3) = match air_state {
            AirState::AirSupremacy => (0.7, 1.6, 10.),
            AirState::AirSuperiority => (0.6, 1.2, 0.),
            _ => return Some(0.),
        };

        let luck = self.luck()? as f64;
        let equipment_los = self.gears.sum_by(|g| g.luck) as f64;

        let luck_factor = (luck.sqrt() + 10.).floor();
        let flagship_mod = if is_main_flagship { 15. } else { 0. };

        let result = (luck_factor + as_mod1 * (fleet_los_mod + as_mod2 * equipment_los) + as_mod3)
            .floor()
            + flagship_mod;

        Some(result)
    }
}

#[wasm_bindgen]
impl Ship {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> String {
        self.id.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn xxh3(&self) -> String {
        format!("{:X}", self.xxh3)
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.master.name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn yomi(&self) -> String {
        self.master.yomi.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn ship_type(&self) -> String {
        self.ship_type.to_string()
    }

    #[wasm_bindgen(getter)]
    pub fn ship_class(&self) -> String {
        self.ship_class.to_string()
    }

    #[wasm_bindgen(getter)]
    pub fn ctype(&self) -> u16 {
        self.master.ctype
    }

    #[wasm_bindgen(getter)]
    pub fn stype(&self) -> u8 {
        self.master.stype
    }

    #[wasm_bindgen(getter)]
    pub fn sort_id(&self) -> u16 {
        self.master.sort_id.unwrap_or_default()
    }

    #[wasm_bindgen(getter)]
    pub fn slotnum(&self) -> usize {
        self.master.slotnum
    }

    #[wasm_bindgen(getter)]
    pub fn next_id(&self) -> u16 {
        self.master.next_id.unwrap_or_default()
    }

    #[wasm_bindgen(getter)]
    pub fn useful(&self) -> bool {
        self.master.useful.unwrap_or_default()
    }

    #[wasm_bindgen(js_name = has_attr)]
    pub fn js_has_attr(&self, js: JsShipAttr) -> bool {
        let attr = js.into_serde().unwrap();
        self.has_attr(attr)
    }

    pub fn gear_keys(&self) -> JsValue {
        let slotnum = self.master.slotnum;

        let keys = (0..GearArray::CAPACITY)
            .filter(|&index| {
                index < slotnum
                    || index == GearArray::EXSLOT_INDEX
                    || self.gears.get(index).is_some()
            })
            .filter_map(into_gear_key)
            .collect::<Vec<_>>();

        JsValue::from_serde(&keys).unwrap()
    }

    pub fn get_gear(&self, key: &str) -> Option<Gear> {
        self.gears.get_by_gear_key(key).cloned()
    }

    pub fn has_unknown_stat(&self, key: &str) -> bool {
        match key {
            "max_hp" => self.master.max_hp.is_unknown(),
            "firepower" => self.master.firepower.is_unknown(),
            "torpedo" => self.master.torpedo.is_unknown(),
            "armor" => self.master.armor.is_unknown(),
            "anti_air" => self.master.anti_air.is_unknown(),
            "evasion" => self.master.evasion.is_unknown(),
            "asw" => self.master.asw.is_unknown(),
            "los" => self.master.los.is_unknown(),
            "luck" => self.master.luck.is_unknown(),
            "range" => self.master.range.is_none(),
            "speed" => false,
            _ => false,
        }
    }

    pub fn get_naked_stat(&self, key: &str) -> Option<u16> {
        match key {
            "max_hp" => self.max_hp(),
            "firepower" => self.naked_firepower(),
            "torpedo" => self.naked_torpedo(),
            "armor" => self.naked_armor(),
            "anti_air" => self.naked_anti_air(),
            "accuracy" => Some(0),
            "evasion" => self.naked_evasion(),
            "asw" => self.naked_asw(),
            "los" => self.naked_los(),
            "luck" => self.luck(),
            "range" => self.naked_range().map(|v| v as u16),
            "speed" => Some(self.naked_speed() as u16),
            _ => None,
        }
    }

    pub fn get_gear_stat(&self, key: &str) -> i16 {
        self.gears.sum_by(|gear| match_stat!(key, gear))
    }

    pub fn get_ebonus(&self, key: &str) -> i16 {
        match_stat!(key, self.ebonuses)
    }

    pub fn get_stat_mod(&self, key: &str) -> Option<i16> {
        match key {
            "max_hp" => self.max_hp_mod,
            "firepower" => self.firepower_mod,
            "torpedo" => self.torpedo_mod,
            "armor" => self.armor_mod,
            "anti_air" => self.anti_air_mod,
            "evasion" => self.evasion_mod,
            "asw" => self.asw_mod,
            "los" => self.los_mod,
            "luck" => self.luck_mod,
            _ => None,
        }
    }

    pub fn is_abyssal(&self) -> bool {
        self.has_attr(ShipAttr::Abyssal)
    }

    pub fn can_equip(&self, gear: &Gear, key: &str) -> bool {
        if self.is_abyssal() {
            return true;
        };

        if !self.equippable.types.contains(&(gear.special_type as u8)) {
            return false;
        }

        if key == "gx" {
            return self
                .equippable
                .exslot_types
                .contains(&(gear.special_type as u8))
                || self.equippable.exslot_gear_ids.contains(&gear.gear_id)
                || gear.gear_id == gear_id!("改良型艦本式タービン");
        }

        if let Some(index) = into_gear_index(key) {
            if index >= self.master.slotnum {
                return false;
            }
        }

        if self.ship_class == ShipClass::RichelieuClass
            && gear.gear_type == GearType::SeaplaneBomber
        {
            return gear.gear_id == gear_id!("Laté 298B");
        }

        if self.has_attr(ShipAttr::RoyalNavy) {
            return matches!(
                gear.gear_id,
                gear_id!("Swordfish(水上機型)") | gear_id!("Swordfish Mk.III改(水上機型)")
            );
        }

        let is_kai2 = self.has_attr(ShipAttr::Kai2);

        if self.ship_class == ShipClass::IseClass && is_kai2 {
            return key == "g1" || key == "g2" || !gear.has_attr(GearAttr::MainGun);
        }

        if self.ship_class == ShipClass::YuubariClass && is_kai2 {
            if key == "g4" {
                return !(gear.has_attr(GearAttr::MainGun)
                    || gear.gear_type == GearType::Torpedo
                    || gear.gear_type == GearType::MidgetSubmarine);
            }
            if key == "g5" {
                return matches!(
                    gear.gear_type,
                    GearType::AntiAirGun | GearType::SmallRadar | GearType::CombatRation
                );
            }
        }

        true
    }

    #[wasm_bindgen(getter)]
    pub fn max_hp(&self) -> Option<u16> {
        self.master
            .max_hp
            .0
            .map(|left| {
                let base = if self.level >= 100 {
                    left + get_marriage_bonus(left)
                } else {
                    left
                };

                let value = base as i16 + self.max_hp_mod.unwrap_or_default();
                value
            })
            .or(self.max_hp_mod)
            .map(|v| v as u16)
    }

    #[wasm_bindgen(getter)]
    pub fn naked_range(&self) -> Option<u8> {
        self.master.range
    }

    #[wasm_bindgen(getter)]
    pub fn naked_speed(&self) -> u8 {
        self.master.speed
    }

    #[wasm_bindgen(getter)]
    pub fn luck(&self) -> Option<u16> {
        let left = self.master.luck.0;

        if let Some(base) = left {
            Some(base as i16 + self.luck_mod.unwrap_or_default())
        } else {
            self.luck_mod
        }
        .map(|v| v as u16)
    }

    #[wasm_bindgen(getter)]
    pub fn range(&self) -> Option<u8> {
        let max = self.gears.values().map(|g| g.range).max();

        match (max, self.naked_range()) {
            (Some(m), Some(naked)) => Some(m.max(naked)),
            (Some(m), _) => Some(m),
            (_, Some(naked)) => Some(naked),
            _ => None,
        }
        .map(|range| range + self.ebonuses.range.max(0) as u8)
    }

    #[wasm_bindgen(getter)]
    pub fn speed(&self) -> u8 {
        self.naked_speed() + self.ebonuses.speed
    }

    #[wasm_bindgen(getter)]
    pub fn accuracy(&self) -> i16 {
        let accuracy = self.gears.sum_by(|gear| gear.accuracy);
        accuracy + self.ebonuses.accuracy
    }

    pub fn is_land(&self) -> bool {
        self.speed() == 0
    }

    pub fn get_slot_size(&self, index: usize) -> Option<u8> {
        self.slots.get(index).and_then(|&s| s)
    }

    pub fn get_max_slot_size(&self, index: usize) -> Option<u8> {
        if self.ship_class == ShipClass::NisshinClass {
            nisshin_max_slot_size(&self.master, &self.gears, index)
        } else {
            self.master.get_max_slot_size(index)
        }
    }

    pub fn fighter_power(&self, anti_lbas: bool) -> Option<i32> {
        self.gears
            .without_ex()
            .map(|(i, g)| {
                let slot_size = self.get_slot_size(i)?;

                if slot_size == 0 || !g.has_proficiency() {
                    Some(0)
                } else if !anti_lbas && g.has_attr(GearAttr::Recon) {
                    Some(0)
                } else {
                    Some(g.calc_fighter_power(slot_size))
                }
            })
            .sum()
    }

    pub fn fleet_los_factor(&self) -> Option<f64> {
        let total = self
            .gears
            .without_ex()
            .map(|(index, g)| {
                if g.attrs.contains(GearAttr::ObservationSeaplane) {
                    let los = g.los as f64;
                    let slot_size = self.get_slot_size(index)? as f64;

                    Some(los * slot_size.sqrt().floor())
                } else {
                    Some(0.0)
                }
            })
            .sum::<Option<f64>>()?;

        let laked_los = self.naked_los()? as f64;

        Some(laked_los + total)
    }

    pub fn fleet_anti_air(&self) -> i32 {
        self.gears.sum_by(|g| g.fleet_anti_air()).floor() as i32
    }

    pub fn cruiser_fit_bonus(&self) -> f64 {
        if matches!(self.ship_type, ShipType::CL | ShipType::CLT | ShipType::CT) {
            let single_gun_count = self.gears.count_by(|gear| {
                matches!(
                    gear.gear_id,
                    gear_id!("14cm単装砲") | gear_id!("15.2cm単装砲")
                )
            });

            let twin_gun_count = self.gears.count_by(|gear| {
                matches!(
                    gear.gear_id,
                    gear_id!("15.2cm連装砲")
                        | gear_id!("14cm連装砲")
                        | gear_id!("15.2cm連装砲改")
                        | gear_id!("Bofors 15.2cm連装砲 Model 1930")
                        | gear_id!("14cm連装砲改")
                        | gear_id!("6inch 連装速射砲 Mk.XXI")
                        | gear_id!("Bofors 15cm連装速射砲 Mk.9 Model 1938")
                        | gear_id!("Bofors 15cm連装速射砲 Mk.9改+単装速射砲 Mk.10改 Model 1938")
                        | gear_id!("15.2cm連装砲改二")
                )
            });

            (single_gun_count as f64).sqrt() + 2.0 * (twin_gun_count as f64).sqrt()
        } else if self.ship_class == ShipClass::ZaraClass {
            let zara_gun_count = self.gears.count(gear_id!("203mm/53 連装砲"));
            (zara_gun_count as f64).sqrt()
        } else {
            0.0
        }
    }

    pub fn basic_accuracy_term(&self) -> Option<f64> {
        let luck = self.luck()? as f64;
        let level = self.level as f64;

        Some(2. * level.sqrt() + 1.5 * luck.sqrt())
    }

    pub fn basic_evasion_term(&self) -> Option<f64> {
        let evasion = self.evasion()? as f64;
        let luck = self.luck()? as f64;

        Some(evasion + (2. * luck).sqrt())
    }

    pub fn evasion_term(&self, formation_mod: f64, postcap_mod: Option<f64>) -> Option<f64> {
        let base = (self.basic_evasion_term()? * formation_mod).floor();

        let postcap = if base >= 65.0 {
            (55.0 + 2.0 * (base - 65.0).sqrt()).floor()
        } else if base >= 40.0 {
            (40.0 + 3.0 * (base - 40.0).sqrt()).floor()
        } else {
            base
        };

        let total_stars = self.gears.sum_by(|gear| {
            if gear.gear_type == GearType::EngineImprovement {
                gear.stars
            } else {
                0
            }
        }) as f64;

        let ibonus = (1.5 * total_stars.sqrt()).floor();

        Some((postcap + postcap_mod.unwrap_or_default()).floor() + ibonus)
    }

    pub fn get_possible_anti_air_cutin_ids(&self) -> Vec<u8> {
        let ship_id = self.ship_id;
        let ship_class = self.ship_class;
        let gears = &self.gears;
        let mut vec: Vec<u8> = Vec::with_capacity(10);

        if ship_class == ShipClass::FletcherClass {
            let mk30_kai_count = gears.count(gear_id!("5inch単装砲 Mk.30改"));
            let mk30_count = gears.count(gear_id!("5inch単装砲 Mk.30改")) + mk30_kai_count;
            let mk30_gfcs_count = self.gears.count(gear_id!("5inch単装砲 Mk.30改+GFCS Mk.37"));

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

        let gfcs_5inch_count = gears.count(gear_id!("GFCS Mk.37+5inch連装両用砲(集中配備)"));
        let atlanta_gun_count =
            gears.count(gear_id!("5inch連装両用砲(集中配備)")) + gfcs_5inch_count;
        if ship_class == ShipClass::AtlantaClass && atlanta_gun_count >= 2 {
            if gfcs_5inch_count >= 1 {
                vec.push(39)
            }
            if gears.has(gear_id!["GFCS Mk.37"]) {
                vec.push(40)
            }
            vec.push(41)
        }

        // 秋月型 かつ 高角砲を装備
        if ship_class == ShipClass::AkizukiClass && gears.has_attr(GearAttr::HighAngleMount) {
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
        if ship_class == ShipClass::IseClass
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

        // 武蔵改二 かつ 10cm連装高角砲改+増設機銃を装備 かつ 対空電探を装備
        if ship_id == ship_id!("武蔵改二")
            && gears.has(gear_id!("10cm連装高角砲改+増設機銃"))
            && has_air_radar
        {
            vec.push(26)
        }

        // (伊勢型航空戦艦|武蔵改|武蔵改二) かつ 12cm30連装噴進砲改二を装備 かつ 対空電探を装備
        if (ship_class == ShipClass::IseClass && self.ship_type == ShipType::BBV)
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
            || (ship_class == ShipClass::KongouClass && self.has_attr(ShipAttr::Kai2))
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

    pub fn transport_point(&self) -> i32 {
        let ship_type_tp = self.ship_type.transport_point();

        let ship_bonus = if self.ship_id == ship_id!("鬼怒改二") {
            8
        } else {
            0
        };

        let total = self.gears.sum_by(|gear| {
            if gear.gear_type == GearType::LandingCraft {
                8
            } else if gear.gear_type == GearType::CombatRation {
                1
            } else if gear.gear_id == gear_id!("ドラム缶(輸送用)") {
                5
            } else if gear.gear_id == gear_id!("特二式内火艇") {
                2
            } else {
                0
            }
        });

        ship_type_tp + ship_bonus + total
    }

    pub fn get_possible_shelling_attack_type_array(&self) -> Vec<u8> {
        self.get_possible_day_cutin_set()
            .into_iter()
            .map(|t| t as u8)
            .collect()
    }

    pub fn elos(&self, node_divaricated_factor: u8) -> Option<f64> {
        let naked_los = self.naked_los()? as f64;
        let total = self.gears.sum_by(|gear| gear.elos());
        let ebonus = self.ebonuses.effective_los as f64;

        Some((naked_los + ebonus).sqrt() + total * (node_divaricated_factor as f64) - 2.0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{gear::Gear, types::StatInterval};

    #[test]
    fn test_max_hp() {
        fn get_ship(level: u16, max_hp: u16) -> Ship {
            Ship {
                level,
                master: MasterShip {
                    max_hp: StatInterval(Some(max_hp), None),
                    ..Default::default()
                },
                ..Default::default()
            }
        }

        assert_eq!(get_ship(99, 90).max_hp(), Some(90));

        let table = [
            (29, 29 + 4),
            (30, 30 + 5),
            (39, 39 + 5),
            (40, 40 + 6),
            (49, 49 + 6),
            (50, 50 + 7),
            (69, 69 + 7),
            (70, 70 + 8),
            (89, 89 + 8),
            (90, 90 + 9),
        ];

        for (value, expected) in table.iter().cloned() {
            assert_eq!(get_ship(100, value).max_hp(), Some(expected));
        }
    }

    #[test]
    fn test_stats() {
        macro_rules! def_stats_test {
            ($($key:ident),*) => {
                $(
                    paste! {
                        let mut ship = Ship {
                            [<$key _mod>]: Some(3),
                            master: MasterShip {
                                $key: StatInterval(Some(0), Some(10)),
                                ..Default::default()
                            },
                            ..Default::default()
                        };

                        ship.gears.put(0, Gear {
                            $key: 5,
                            ..Default::default()
                        });

                        assert_eq!(ship.[<naked_ $key>](), Some(13));
                        assert_eq!(ship.$key(), Some(18));
                    }
                )*
            };
        }

        macro_rules! def_stats_with_level_test {
            ($($key:ident),*) => {
                $(
                    paste! {
                        let mut ship = Ship {
                            level: 15,
                            [<$key _mod>]: Some(3),
                            master: MasterShip {
                                $key: StatInterval(Some(1), Some(100)),
                                ..Default::default()
                            },
                            ..Default::default()
                        };

                        ship.gears.put(0, Gear {
                            $key: 5,
                            ..Default::default()
                        });

                        assert_eq!(ship.[<naked_ $key>](), Some(16));
                        assert_eq!(ship.$key(), Some(21));
                    }
                )*
            };
        }

        def_stats_test!(firepower, torpedo, armor, anti_air);
        def_stats_with_level_test!(evasion, los, asw);
    }
}
