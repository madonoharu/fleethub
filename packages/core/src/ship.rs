use crate::{
    array::{GearArray, SlotSizeArray},
    const_gear_id, const_ship_id,
    constants::*,
    gear::{Gear, GearState},
    master::{MasterShip, StatInterval},
};
use num_traits::FromPrimitive;
use paste::paste;
use serde::Deserialize;
use wasm_bindgen::prelude::*;
use wasmer_enumset::EnumSet;

#[derive(Debug, Default, Clone, Deserialize)]
pub struct ShipState {
    pub id: Option<String>,
    pub ship_id: i32,
    pub slots: Option<SlotSizeArray>,
    pub level: Option<i32>,
    pub current_hp: Option<i32>,
    pub max_hp_mod: Option<i32>,
    pub firepower_mod: Option<i32>,
    pub torpedo_mod: Option<i32>,
    pub armor_mod: Option<i32>,
    pub anti_air_mod: Option<i32>,
    pub evasion_mod: Option<i32>,
    pub asw_mod: Option<i32>,
    pub los_mod: Option<i32>,
    pub luck_mod: Option<i32>,

    pub g1: Option<GearState>,
    pub g2: Option<GearState>,
    pub g3: Option<GearState>,
    pub g4: Option<GearState>,
    pub g5: Option<GearState>,
    pub gx: Option<GearState>,

    pub ss1: Option<i32>,
    pub ss2: Option<i32>,
    pub ss3: Option<i32>,
    pub ss4: Option<i32>,
    pub ss5: Option<i32>,
}

#[derive(Debug, Default, Clone, Deserialize)]
pub struct EBonuses {
    firepower: i32,
    torpedo: i32,
    anti_air: i32,
    armor: i32,
    evasion: i32,
    asw: i32,
    los: i32,
    bombing: i32,
    accuracy: i32,
    range: i32,
    speed: i32,
    effective_los: i32,
}

#[derive(Debug, Default, Clone)]
pub struct ShipEquippable {
    pub categories: Vec<i32>,
    pub exslot_categories: Vec<i32>,
    pub exslot_gear_ids: Vec<i32>,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Ship {
    pub ship_id: i32,
    pub level: i32,
    pub current_hp: i32,

    pub ship_type: ShipType,
    pub ship_class: ShipClass,

    max_hp_mod: i32,
    firepower_mod: i32,
    torpedo_mod: i32,
    armor_mod: i32,
    anti_air_mod: i32,
    evasion_mod: i32,
    asw_mod: i32,
    los_mod: i32,
    luck_mod: i32,

    #[wasm_bindgen(skip)]
    pub slots: SlotSizeArray,
    #[wasm_bindgen(skip)]
    pub attrs: EnumSet<ShipAttr>,
    #[wasm_bindgen(skip)]
    pub gears: GearArray,

    master: MasterShip,
    ebonuses: EBonuses,
    equippable: ShipEquippable,
    banner: Option<String>,
}

fn get_marriage_bonus(left: i32) -> i32 {
    match left {
        0..=29 => 4,
        30..=39 => 5,
        40..=49 => 6,
        50..=69 => 7,
        70..=89 => 8,
        _ => 9,
    }
}

macro_rules! impl_naked_stats {
    ($($key:ident),*) => {
        paste! {
            #[wasm_bindgen]
            impl Ship {
                $(
                    #[wasm_bindgen(getter)]
                    pub fn [<naked_ $key>](&self) -> Option<i32> {
                        self.master.$key.1.map(|v| v + self.[<$key _mod>])
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
                    pub fn [<naked_ $key>](&self) -> Option<i32> {
                        match &self.master.$key {
                            StatInterval(Some(at1), Some(at99)) => Some(((at99 - at1) * self.level) / 99 + at1),
                            _ => None,
                        }
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
                pub fn $key(&self) -> Option<i32> {
                    paste! {
                        self.[<naked_ $key>]().map(|naked| {
                            naked + self.ebonuses.$key + self.gears.values().map(|g| g.$key).sum::<i32>()
                        })
                    }
                }
            )*
        }
    };
}

impl_naked_stats!(firepower, torpedo, armor, anti_air);

impl_naked_stats_with_level!(evasion, asw, los);

impl_stats!(firepower, torpedo, armor, anti_air, evasion, asw, los);

impl Ship {
    pub fn new(
        state: ShipState,
        master: &MasterShip,
        attrs: EnumSet<ShipAttr>,
        equippable: ShipEquippable,
        banner: Option<String>,
        gears: GearArray,
    ) -> Self {
        let ebonuses = EBonuses::default();
        let state_slots = [state.ss1, state.ss2, state.ss3, state.ss4, state.ss5];
        let slots = master
            .slots
            .iter()
            .enumerate()
            .map(|(i, default_size)| state_slots.get(i).cloned().flatten().or(*default_size))
            .collect();

        let mut ship = Ship {
            ship_id: state.ship_id,
            level: state.level.unwrap_or(master.default_level()),
            current_hp: state.current_hp.unwrap_or_default(),
            ship_type: FromPrimitive::from_i32(master.stype).unwrap_or_default(),
            ship_class: master
                .ctype
                .and_then(FromPrimitive::from_i32)
                .unwrap_or_default(),

            attrs,
            slots,
            gears,

            ebonuses,
            equippable,
            banner,
            master: master.clone(),

            max_hp_mod: state.max_hp_mod.unwrap_or_default(),
            firepower_mod: state.firepower_mod.unwrap_or_default(),
            torpedo_mod: state.torpedo_mod.unwrap_or_default(),
            armor_mod: state.armor_mod.unwrap_or_default(),
            anti_air_mod: state.anti_air_mod.unwrap_or_default(),
            evasion_mod: state.evasion_mod.unwrap_or_default(),
            asw_mod: state.asw_mod.unwrap_or_default(),
            los_mod: state.los_mod.unwrap_or_default(),
            luck_mod: state.luck_mod.unwrap_or_default(),
        };

        if ship.current_hp == 0 {
            ship.current_hp = ship.max_hp().unwrap_or_default();
        }

        ship
    }

    pub fn damage_state(&self) -> DamageState {
        DamageState::from_hp(self.max_hp().unwrap_or_default(), self.current_hp)
    }

    pub fn gears_with_slot_size(&self) -> impl Iterator<Item = (&Gear, Option<i32>)> {
        self.gears
            .iter()
            .map(move |(i, g)| (g, self.get_slot_size(i)))
    }

    pub fn get_ap_shell_modifiers(&self) -> (f64, f64) {
        let mut iter = self.gears.values();
        let has_main = iter.any(|g| g.attrs.contains(GearAttr::MainGun));
        let has_ap_shell = iter.any(|g| g.category == GearCategory::ApShell);
        let has_rader = iter.any(|g| g.attrs.contains(GearAttr::Radar));
        let has_secondary = iter.any(|g| g.category == GearCategory::SecondaryGun);

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
        if (ShipType::CVL | ShipType::CV | ShipType::CVB).contains(self.ship_type) {
            return true;
        }

        if self.ship_id != const_ship_id!("速吸改") && self.has_attr(ShipAttr::Installation) {
            return false;
        }

        self.gears.has_by(|g| {
            (GearCategory::CbDiveBomber
                | GearCategory::CbTorpedoBomber
                | GearCategory::JetFighterBomber
                | GearCategory::JetTorpedoBomber)
                .contains(g.category)
        })
    }

    pub fn get_possible_shelling_attack_type_set(&self) -> EnumSet<ShellingAttackType> {
        let mut set: EnumSet<ShellingAttackType> = EnumSet::from(ShellingAttackType::Normal);

        if self.damage_state() <= DamageState::Taiha {
            return set;
        }

        if self.is_carrier_like() {
            let cb_bomber_count = self
                .gears
                .count_by(|g| g.category == GearCategory::CbDiveBomber);

            let has_cb_torpedo_bomber = self.gears_with_slot_size().any(|(g, slot_size)| {
                slot_size.unwrap_or_default() > 0 && g.category == GearCategory::CbTorpedoBomber
            });

            let has_cb_fighter = self.gears_with_slot_size().all(|(g, slot_size)| {
                slot_size.unwrap_or_default() > 0 && g.category == GearCategory::CbFighter
            });

            if cb_bomber_count == 0 || !has_cb_torpedo_bomber {
                return set;
            }

            set.insert(ShellingAttackType::BA);

            if cb_bomber_count >= 2 {
                set.insert(ShellingAttackType::BBA);
            }

            if has_cb_fighter {
                set.insert(ShellingAttackType::FBA);
            }

            return set;
        }

        let main_gun_count = self.gears.count_by(|g| g.has_attr(GearAttr::MainGun));

        if main_gun_count == 0 {
            return set;
        }

        if self.ship_class == ShipClass::IseClass && self.has_attr(ShipAttr::Kai2) {
            let zuiun_count = self
                .gears_with_slot_size()
                .filter(|(g, slot_size)| {
                    slot_size.unwrap_or_default() > 0
                        && [
                            const_gear_id!("瑞雲"),
                            const_gear_id!("瑞雲(六三一空)"),
                            const_gear_id!("瑞雲(六三四空)"),
                            const_gear_id!("瑞雲(六三四空/熟練)"),
                            const_gear_id!("瑞雲12型"),
                            const_gear_id!("瑞雲12型(六三四空)"),
                            const_gear_id!("瑞雲改二(六三四空)"),
                            const_gear_id!("瑞雲改二(六三四空/熟練)"),
                        ]
                        .contains(&g.gear_id)
                })
                .count();

            if zuiun_count >= 2 {
                set.insert(ShellingAttackType::Zuiun);
            }

            let suisei_634_count = self
                .gears_with_slot_size()
                .filter(|(g, slot_size)| {
                    slot_size.unwrap_or_default() > 0
                        && [
                            const_gear_id!("彗星一二型(六三四空/三号爆弾搭載機)"),
                            const_gear_id!("彗星二二型(六三四空)"),
                            const_gear_id!("彗星二二型(六三四空/熟練)"),
                        ]
                        .contains(&g.gear_id)
                })
                .count();

            if suisei_634_count >= 2 {
                set.insert(ShellingAttackType::Suisei);
            }
        }

        let secondary_gun_count = self
            .gears
            .count_by(|g| g.category == GearCategory::SecondaryGun);
        let has_ap_shell = self.gears.has_by(|g| g.category == GearCategory::ApShell);
        let has_rader = self.gears.has_by(|g| g.has_attr(GearAttr::Radar));

        if main_gun_count >= 2 {
            set.insert(ShellingAttackType::DoubleAttack);

            if has_ap_shell {
                set.insert(ShellingAttackType::MainMain);
            }
        }

        if secondary_gun_count >= 1 {
            set.insert(ShellingAttackType::MainSecond);

            if has_rader {
                set.insert(ShellingAttackType::MainRader);
            }
            if has_ap_shell {
                set.insert(ShellingAttackType::MainApShell);
            }
        }

        set
    }

    pub fn calc_observation_term(
        &self,
        fleet_los_mod: f64,
        air_state: AirState,
        is_main_flagship: bool,
    ) -> Option<i32> {
        let (a, b, c) = match air_state {
            AirState::AirSupremacy => (0.7, 1.6, 10.),
            AirState::AirSuperiority => (0.6, 1.2, 0.),
            _ => return Some(0),
        };

        let luck = self.luck()? as f64;
        let equipment_los = self.gears.sum_by(|g| g.luck) as f64;

        let luck_factor = (luck.sqrt() + 10.).floor();
        let flagship_mod = if is_main_flagship { 15 } else { 0 };

        let result = (luck_factor + a * (fleet_los_mod + b * equipment_los) + c).floor() as i32
            + flagship_mod;

        Some(result)
    }
}

#[wasm_bindgen]
impl Ship {
    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.master.name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn yomi(&self) -> String {
        self.master.yomi.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn ctype(&self) -> i32 {
        self.master.ctype.unwrap_or_default()
    }

    #[wasm_bindgen(getter)]
    pub fn stype(&self) -> i32 {
        self.master.stype
    }

    #[wasm_bindgen(getter)]
    pub fn sort_id(&self) -> i32 {
        self.master.sort_id.unwrap_or_default()
    }

    #[wasm_bindgen(getter)]
    pub fn slotnum(&self) -> i32 {
        self.master.slotnum
    }

    #[wasm_bindgen(getter)]
    pub fn next_id(&self) -> i32 {
        self.master.next_id.unwrap_or_default()
    }

    #[wasm_bindgen(getter)]
    pub fn useful(&self) -> bool {
        self.master.useful.unwrap_or_default()
    }

    pub fn has_attr(&self, attr: ShipAttr) -> bool {
        self.attrs.contains(attr)
    }

    pub fn master(&self) -> MasterShip {
        self.master.clone()
    }

    pub fn get_gear(&self, key: String) -> Option<Gear> {
        match key.as_str() {
            "g1" => self.gears.get(0),
            "g2" => self.gears.get(1),
            "g3" => self.gears.get(2),
            "g4" => self.gears.get(3),
            "g5" => self.gears.get(4),
            "gx" => self.gears.get(5),
            _ => &None,
        }
        .clone()
    }

    pub fn set_ebonuses(&mut self, js: JsValue) {
        self.ebonuses = js.into_serde().unwrap();
    }

    pub fn can_equip(&self, gear: &Gear, string: Option<String>) -> bool {
        if self.has_attr(ShipAttr::Abyssal) {
            return true;
        };

        if !self
            .equippable
            .categories
            .contains(&(gear.special_type as i32))
        {
            return false;
        }

        let key = match string {
            Some(v) => v,
            _ => return true,
        };

        let key = key.as_str();

        if key == "gx" {
            return self
                .equippable
                .exslot_categories
                .contains(&(gear.special_type as i32))
                || self.equippable.exslot_gear_ids.contains(&gear.gear_id)
                || gear.gear_id == const_gear_id!("改良型艦本式タービン");
        }

        if self.ship_class == ShipClass::RichelieuClass
            && gear.category == GearCategory::SeaplaneBomber
        {
            return gear.gear_id == const_gear_id!("Laté 298B");
        }

        if self.has_attr(ShipAttr::RoyalNavy) {
            return [
                const_gear_id!("Swordfish(水上機型)"),
                const_gear_id!("Swordfish Mk.III改(水上機型)"),
            ]
            .contains(&gear.gear_id);
        }

        let is_kai2 = self.has_attr(ShipAttr::Kai2);

        if self.ship_class == ShipClass::IseClass && is_kai2 {
            return key == "g1" || key == "g2" || !gear.has_attr(GearAttr::MainGun);
        }

        if self.ship_class == ShipClass::YuubariClass && is_kai2 {
            if key == "g4" {
                return !(gear.has_attr(GearAttr::MainGun)
                    || gear.category == GearCategory::Torpedo
                    || gear.category == GearCategory::MidgetSubmarine);
            }
            if key == "g5" {
                return [
                    GearCategory::AntiAirGun,
                    GearCategory::SmallRadar,
                    GearCategory::CombatRation,
                ]
                .contains(&gear.category);
            }
        }

        true
    }

    #[wasm_bindgen(getter)]
    pub fn max_hp(&self) -> Option<i32> {
        self.master.max_hp.0.map(|left| {
            if self.level >= 100 {
                left + self.max_hp_mod + get_marriage_bonus(left)
            } else {
                left + self.max_hp_mod
            }
        })
    }

    #[wasm_bindgen(getter)]
    pub fn naked_range(&self) -> Option<i32> {
        self.master.range
    }

    #[wasm_bindgen(getter)]
    pub fn naked_speed(&self) -> i32 {
        self.master.speed
    }

    #[wasm_bindgen(getter)]
    pub fn luck(&self) -> Option<i32> {
        Some(self.master.luck.0? + self.luck_mod)
    }

    #[wasm_bindgen(getter)]
    pub fn range(&self) -> Option<i32> {
        let max = self.gears.values().map(|g| g.range).max();

        match (max, self.naked_range()) {
            (Some(m), Some(naked)) => Some(m.max(naked)),
            (Some(m), _) => Some(m),
            (_, Some(naked)) => Some(naked),
            _ => None,
        }
        .map(|range| range + self.ebonuses.range)
    }

    #[wasm_bindgen(getter)]
    pub fn speed_bonus(&self) -> i32 {
        let speed_group = self.master.speed_group.unwrap_or_default();

        if self.has_attr(ShipAttr::Abyssal)
            || !self.gears.has(const_gear_id!("改良型艦本式タービン"))
        {
            return 0;
        }

        let enhanced_boiler_count = self.gears.count(const_gear_id!("強化型艦本式缶"));
        let new_model_boiler_count = self.gears.count(const_gear_id!("新型高温高圧缶"));
        let total_boiler_count = enhanced_boiler_count + new_model_boiler_count;

        let synergy = match speed_group {
            SpeedGroup::A => {
                if new_model_boiler_count >= 1 || total_boiler_count >= 2 {
                    10
                } else {
                    0
                }
            }
            SpeedGroup::B1 => {
                if new_model_boiler_count == 0 {
                    0
                } else if total_boiler_count >= 3 {
                    15
                } else if total_boiler_count >= 2 {
                    10
                } else {
                    0
                }
            }
            SpeedGroup::B2 => {
                if new_model_boiler_count >= 2 || total_boiler_count >= 3 {
                    10
                } else {
                    0
                }
            }
            SpeedGroup::C => {
                if total_boiler_count >= 1 {
                    5
                } else {
                    0
                }
            }
        };

        if synergy == 0 && total_boiler_count >= 1 || self.has_attr(ShipAttr::TurbineSpeedBonus) {
            5
        } else {
            synergy
        }
    }

    #[wasm_bindgen(getter)]
    pub fn speed(&self) -> i32 {
        self.naked_speed() + self.speed_bonus()
    }

    #[wasm_bindgen(getter)]
    pub fn banner(&self) -> Option<String> {
        self.banner.clone()
    }

    pub fn get_slot_size(&self, index: usize) -> Option<i32> {
        self.slots.get(index).and_then(|&s| s)
    }

    pub fn get_max_slot_size(&self, index: usize) -> Option<i32> {
        self.master.slots.get(index).and_then(|&s| s)
    }

    pub fn calc_fighter_power(&self) -> Option<i32> {
        self.gears
            .iter_without_ex()
            .map(|(i, g)| {
                let slot_size = self.get_slot_size(i)?;
                Some(g.calc_fighter_power(slot_size))
            })
            .sum()
    }

    pub fn fleet_los_factor(&self) -> Option<i32> {
        let total = self
            .gears
            .iter_without_ex()
            .map(|(index, g)| {
                let slot_size = self.get_slot_size(index)?;

                if g.attrs.contains(GearAttr::ObservationSeaplane) {
                    Some(g.los * (slot_size as f64).sqrt().floor() as i32)
                } else {
                    Some(0)
                }
            })
            .sum::<Option<i32>>();

        Some(self.naked_los()? + total?)
    }

    pub fn fleet_anti_air(&self) -> i32 {
        self.gears.sum_by(|g| g.fleet_anti_air()).floor() as i32
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
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::gear::Gear;

    #[test]
    fn test_max_hp() {
        fn get_ship(level: i32, max_hp: i32) -> Ship {
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
                            [<$key _mod>]: 3,
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
                            [<$key _mod>]: 3,
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
