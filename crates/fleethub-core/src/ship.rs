mod anti_air_cutin;
mod day_cutin;
mod gunfit_accuracy;
mod night_cutin;
mod proficiency;
mod special_enemy_modifiers;

use std::hash::Hash;

use paste::paste;
use wasm_bindgen::prelude::*;

use crate::{
    gear::Gear,
    gear_array::{GearArray, into_gear_key},
    master_data::{MasterShip, ShipEquippability},
    plane::{Plane, PlaneImpl, PlaneMut},
    types::{
        AirStateRank, AirWaveType, AswAttackType, AswPhase, CustomPowerModifiers, DamageState,
        DayPhaseAttackType, DefensePower, EBonuses, GearAttr, GearType, MoraleState,
        NightAttackType, NightPhaseAttackType, ShellingType, ShipAttr, ShipCategory, ShipMeta,
        ShipState, ShipType, Side, SlotSizeVec, SpecialEnemyType, ctype, gear_id, matches_gear_id,
        matches_ship_id, ship_id,
    },
};

pub use night_cutin::NightCutinTermParams;

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Ship {
    #[wasm_bindgen(getter_with_clone)]
    pub id: String,
    #[wasm_bindgen(readonly)]
    pub hash: u64,
    #[wasm_bindgen(readonly)]
    pub ship_id: u16,
    #[wasm_bindgen(readonly)]
    pub level: u16,
    #[wasm_bindgen(readonly)]
    pub current_hp: u16,
    #[wasm_bindgen(readonly)]
    pub morale: u8,
    #[wasm_bindgen(readonly)]
    pub ammo: u16,
    #[wasm_bindgen(readonly)]
    pub fuel: u16,

    #[wasm_bindgen(readonly)]
    pub ship_type: ShipType,
    #[wasm_bindgen(readonly)]
    pub ctype: u16,

    #[wasm_bindgen(getter_with_clone)]
    pub slots: SlotSizeVec,
    #[wasm_bindgen(skip)]
    pub gears: GearArray,
    #[wasm_bindgen(skip)]
    pub ebonuses: EBonuses,

    state: ShipState,
    #[wasm_bindgen(skip)]
    pub master: MasterShip,
    #[wasm_bindgen(skip)]
    pub equippability: ShipEquippability,
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
                            .map(|base| base as i16 + self.state.[<$key _mod>].unwrap_or_default())
                            .or(self.state.[<$key _mod>])
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
                        let stat_mod = self.state.[<$key _mod>];

                        self.master
                            .$key
                            .zipped()
                            .map(|(at1, at99)| {
                                let at1 = at1 as f64;
                                let at99 = at99 as f64;
                                let level = self.level as f64;
                                let stat_mod = stat_mod.unwrap_or_default();

                                let value = (((at99 - at1) * level) / 99.0 + at1).floor() as i16;
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

impl PartialEq for Ship {
    fn eq(&self, other: &Self) -> bool {
        self.state.id.is_some() && self.state.id == other.state.id
    }
}

impl Eq for Ship {}

impl Hash for Ship {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.hash.hash(state);
    }
}

impl Ship {
    pub fn new(
        hash: u64,
        state: ShipState,
        master: &MasterShip,
        equippability: ShipEquippability,
        gears: GearArray,
        ebonuses: EBonuses,
    ) -> Self {
        let ctype = master.ctype;
        let is_nisshin = ctype == ctype!("日進型");

        let slotnum = master.slotnum;

        let slots = state
            .slots
            .clone()
            .into_iter()
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
            .collect::<SlotSizeVec>()
            .with_slotnum(slotnum);

        let mut ship = Ship {
            id: state.id.clone().unwrap_or_default(),
            hash,

            ship_id: state.ship_id,
            level: state.level.unwrap_or_else(|| master.default_level()),
            current_hp: state.current_hp.unwrap_or_default(),
            morale: state.morale.unwrap_or(49),
            ammo: state.ammo.unwrap_or(master.ammo),
            fuel: state.fuel.unwrap_or(master.fuel),
            ship_type: master.ship_type(),
            ctype,

            slots,
            gears,

            ebonuses,
            equippability,
            master: master.clone(),
            state,
        };

        if ship.current_hp == 0 {
            ship.current_hp = ship.max_hp().unwrap_or_default();
        }

        ship
    }

    pub fn planes(&self) -> impl Iterator<Item = Plane<'_>> {
        self.gears
            .0
            .iter()
            .zip(self.slots.iter())
            .enumerate()
            .filter_map(|(index, (gear, &slot_size))| {
                let gear = gear.as_ref()?;

                gear.has_proficiency().then_some(Plane {
                    index,
                    gear,
                    slot_size,
                })
            })
    }

    pub fn planes_mut(&mut self) -> impl Iterator<Item = PlaneMut<'_>> {
        self.gears
            .0
            .iter_mut()
            .zip(self.slots.iter_mut())
            .enumerate()
            .filter_map(|(index, (gear, slot_size))| {
                let gear = gear.as_mut()?;

                gear.has_proficiency().then_some(PlaneMut {
                    index,
                    gear,
                    slot_size,
                })
            })
    }

    pub fn gears_with_slot_size(&self) -> impl Iterator<Item = (usize, &Gear, Option<u8>)> {
        self.gears.iter().map(|(index, gear)| {
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

    pub fn is_heavily_armored_ship(&self) -> bool {
        matches!(
            self.ship_type,
            ShipType::CA
                | ShipType::CAV
                | ShipType::FBB
                | ShipType::BB
                | ShipType::BBV
                | ShipType::CV
                | ShipType::XBB
                | ShipType::CVB
        )
    }

    pub fn get_ap_shell_modifiers(&self) -> (f64, f64) {
        let has_main = self.gears.has_attr(GearAttr::MainGun);
        let has_ap_shell = self.gears.has_type(GearType::ApShell);
        let has_radar = self.gears.has_attr(GearAttr::Radar);
        let has_secondary = self.gears.has_type(GearType::SecondaryGun);

        if !has_ap_shell || !has_main {
            (1.0, 1.0)
        } else if has_secondary && has_radar {
            (1.15, 1.3)
        } else if has_secondary {
            (1.15, 1.2)
        } else if has_radar {
            (1.1, 1.25)
        } else {
            (1.08, 1.1)
        }
    }

    pub fn is_ao_carrier(&self) -> bool {
        self.ship_id == ship_id!("速吸改")
            || self.ctype == ctype!("特2TL型")
            || self.ctype == ctype!("特1TL型")
    }

    pub fn is_carrier_like(&self) -> bool {
        if matches!(self.ship_type, ShipType::CVL | ShipType::CV | ShipType::CVB) {
            return true;
        }

        if self.is_ao_carrier() || self.is_installation() {
            self.gears.has_by(|gear| gear.is_carrier_shelling_plane())
        } else {
            false
        }
    }

    pub fn participates_in_day_combat(&self, anti_inst: bool) -> bool {
        if self.is_carrier_like() {
            if !self.has_non_zero_slot_gear_by(|gear| gear.is_carrier_shelling_plane()) {
                false
            } else if !anti_inst
                || self
                    .has_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::AntiInstDiveBomber))
            {
                true
            } else {
                self.planes()
                    .filter(|plane| plane.is_carrier_shelling_plane())
                    .all(|plane| plane.gear_type == GearType::CbTorpedoBomber)
            }
        } else if self.ship_type.is_submarine() {
            anti_inst && self.gears.has_type(GearType::AmphibiousTank)
        } else {
            self.naked_firepower().unwrap_or_default() > 0
        }
    }

    pub fn is_healthy_as_carrier(&self) -> bool {
        let ds = self.damage_state();

        if self.ship_type == ShipType::CVB {
            ds < DamageState::Taiha
        } else {
            ds < DamageState::Chuuha
        }
    }

    pub fn can_do_normal_night_attack(&self) -> bool {
        self.master.firepower.0.unwrap_or_default() + self.master.torpedo.0.unwrap_or_default() > 0
    }

    pub fn aerial_power(&self, anti_inst: bool) -> i16 {
        let (torpedo, bombing) = if anti_inst {
            let torpedo = 0;
            let bombing = self.gears.sum_by(|gear| {
                if gear.has_attr(GearAttr::AntiInstDiveBomber)
                    || gear.gear_type == GearType::CbTorpedoBomber
                    || gear.is_hayabusa_20th_squadron()
                {
                    gear.bombing
                } else {
                    0
                }
            });

            (torpedo, bombing)
        } else {
            let torpedo = self.gears.sum_by(|gear| gear.torpedo) + self.ebonuses.torpedo;
            let bombing = self.gears.sum_by(|gear| gear.bombing) + self.ebonuses.bombing;

            (torpedo, bombing)
        };

        (1.3 * (bombing as f64)).floor() as i16 + torpedo + 15
    }

    pub fn is_night_carrier(&self) -> bool {
        if !matches!(self.ship_type, ShipType::CVL | ShipType::CV | ShipType::CVB)
            || self.ship_id == ship_id!("しまね丸改")
        {
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

    pub fn night_aerial_power(&self, anti_inst: bool) -> Option<f64> {
        let naked_firepower = self.naked_firepower()? as f64;

        let night_plane_power = self
            .gears_with_slot_size()
            .filter_map(|(_, gear, slot_size)| Some(gear.night_plane_power(slot_size?, anti_inst)))
            .sum::<f64>();

        let ibonus = self.gears.sum_by(|gear| gear.ibonuses.night_aerial_power);

        Some(naked_firepower + night_plane_power + ibonus)
    }

    pub fn night_swordfish_power(&self, anti_inst: bool) -> Option<f64> {
        let naked_firepower = self.naked_firepower()? as f64;

        let night_plane_power = self
            .gears_with_slot_size()
            .filter_map(|(_, gear, slot_size)| {
                if slot_size? == 0 || !gear.has_attr(GearAttr::CbSwordfish) {
                    return None;
                }

                let firepower = gear.firepower as f64;
                let torpedo = if anti_inst { 0 } else { gear.torpedo } as f64;
                let ibonus = (gear.stars as f64).sqrt();

                Some(firepower + torpedo + ibonus)
            })
            .sum::<f64>();

        Some(naked_firepower + night_plane_power)
    }

    /// D型砲補正
    pub fn model_d_small_gun_mod(&self) -> f64 {
        let k2_count = self.gears.count(gear_id!("12.7cm連装砲D型改二"));
        let k3_count = self.gears.count(gear_id!("12.7cm連装砲D型改三"));
        let total = k2_count + k3_count;

        if total == 0 {
            return 1.0;
        }

        let base = if total == 1 { 1.25 } else { 1.4 };

        if k3_count == 1 {
            base * 1.05
        } else if k3_count >= 2 {
            base * 1.1
        } else {
            base
        }
    }

    pub fn is_escort_light_carrier(&self) -> bool {
        self.ship_type == ShipType::CVL && self.master.asw.0.unwrap_or_default() > 0
    }

    pub fn select_asw_attack_type(&self, phase: AswPhase) -> Option<AswAttackType> {
        use ShipType::*;

        if self.is_submarine() {
            return None;
        }

        let is_abyssal = self.is_abyssal();

        // 改式では敵軽空母の場合flagshipのみ対潜に参加するが、ブラウザでは軽母ヌ級改eliteなどの例外が存在する。
        // 深海攻撃哨戒鷹系統を所持している敵軽空母の場合、対戦に参加する？
        // @see https://wikiwiki.jp/kancolle/敵艦船
        if is_abyssal
            && self.ship_type == CVL
            && (self.master.yomi.ne("flagship")
                || self.has_non_zero_slot_gear_by(|gear| gear.is_abyssal_patrolling_attack_hawk()))
        {
            return None;
        }

        if !phase.is_night() {
            let has_anti_sub_aircraft =
                || self.has_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::AntiSubAircraft));

            if matches!(self.ship_type, CAV | CVL | BBV | AV | LHA) {
                if !is_abyssal {
                    return has_anti_sub_aircraft().then_some(AswAttackType::Aerial);
                }

                if has_anti_sub_aircraft() {
                    return Some(AswAttackType::Aerial);
                }
            }

            if self.is_ao_carrier() && has_anti_sub_aircraft() {
                return Some(AswAttackType::Aerial);
            }
        }

        let naked_asw = self.naked_asw().unwrap_or_default();
        if naked_asw == 0 {
            return None;
        }

        let is_anti_sub_ship = if self.is_escort_light_carrier() {
            // 夜戦砲撃を行う護衛空母は対潜攻撃が優先される？
            self.can_do_normal_night_attack()
        } else {
            matches!(self.ship_type, DE | DD | CL | CLT | CT | AO)
                || self.ship_id == ship_id!("加賀改二護")
                || is_abyssal
        };

        is_anti_sub_ship.then_some(AswAttackType::DepthCharge)
    }

    pub fn select_day_phase_attack_type(&self, target: &Ship) -> Option<DayPhaseAttackType> {
        let is_carrier_like = self.is_carrier_like();
        let anti_inst = target.is_installation();
        let participates = self.participates_in_day_combat(anti_inst);

        let capable = !is_carrier_like || self.is_healthy_as_carrier();

        if !participates || !capable {
            return None;
        }

        if target.is_submarine() {
            self.select_asw_attack_type(AswPhase::Day)
                .map(DayPhaseAttackType::Asw)
        } else {
            let t = if is_carrier_like {
                ShellingType::Aerial
            } else {
                ShellingType::Normal
            };

            Some(DayPhaseAttackType::Shelling(t))
        }
    }

    pub fn select_night_phase_attack_type(&self, target: &Ship) -> Option<NightPhaseAttackType> {
        if self.damage_state() >= DamageState::Taiha {
            return None;
        }

        if target.is_submarine() {
            return self
                .select_asw_attack_type(AswPhase::Night)
                .map(NightPhaseAttackType::Asw);
        }

        let attack_type = if self.is_night_carrier() && self.is_healthy_as_carrier() {
            Some(NightAttackType::Aerial)
        } else if self.ctype == ctype!("Ark Royal級")
            && self.has_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::CbSwordfish))
            && self.is_healthy_as_carrier()
        {
            Some(NightAttackType::Swordfish)
        } else {
            self.can_do_normal_night_attack()
                .then_some(NightAttackType::Normal)
        };

        attack_type.map(NightPhaseAttackType::Night)
    }

    pub fn prioritizes_shelling(&self) -> bool {
        matches_ship_id!(self.ship_id, "鈴谷航改二" | "熊野航改二")
    }

    pub fn can_do_opening_asw(&self) -> bool {
        let &Self {
            ship_id,
            ship_type,
            ctype,
            ..
        } = self;

        if matches_ship_id!(ship_id, "五十鈴改二" | "龍田改二" | "夕張改二丁")
            || ctype == ctype!("Fletcher級")
            || (ctype == ctype!("J級") && self.remodel_rank() >= 2)
            || (ctype == ctype!("John C.Butler級") && self.remodel_rank() >= 2)
        {
            return true;
        }

        if ship_id == ship_id!("日向改二") {
            return self
                .gears
                .has_by(|gear| matches_gear_id!(gear.gear_id, "S-51J" | "S-51J改"))
                || self.gears.count_type(GearType::Rotorcraft) >= 2;
        }

        let has_sonar =
            self.gears.has_type(GearType::Sonar) || self.gears.has_type(GearType::LargeSonar);
        let asw = self.asw().unwrap_or_default();

        if asw >= 100 && has_sonar {
            return true;
        }

        let is_taiyou_class_kai_after = (ctype == ctype!("大鷹型") && self.remodel_rank() >= 3)
            || ship_id == ship_id!("神鷹改");

        if ship_id == ship_id!("加賀改二護") || is_taiyou_class_kai_after {
            return self.has_non_zero_slot_gear_by(|gear| gear.has_attr(GearAttr::AntiSubAircraft));
        }

        let threshold = match ship_type {
            ShipType::CVL => {
                let has_high_asw_aircraft = self.gears.has_by(|gear| {
                    gear.asw >= 7
                        && matches!(
                            gear.gear_type,
                            GearType::CbTorpedoBomber
                                | GearType::Rotorcraft
                                | GearType::AntiSubPatrolAircraft
                        )
                });

                if !has_high_asw_aircraft {
                    return false;
                }

                if has_sonar && !matches_ship_id!(ship_id, "鈴谷航改二" | "熊野航改二") {
                    50
                } else {
                    65
                }
            }
            ShipType::DE => {
                let equip_asw = self.gears.sum_by(|gear| gear.asw);

                if has_sonar {
                    60
                } else if equip_asw >= 4 {
                    75
                } else {
                    return false;
                }
            }
            _ => {
                return false;
            }
        };

        threshold <= asw
    }

    pub fn asw_synergy_mod(&self) -> f64 {
        let gears = &self.gears;

        let has_sonar = gears.has_type(GearType::Sonar);
        let has_large_sonar = gears.has_type(GearType::LargeSonar);
        let has_depth_charge = gears.has_type(GearType::DepthCharge);
        let has_additional_depth_charge = gears.has_attr(GearAttr::SynergisticDepthCharge);
        let has_depth_charge_projector = gears.has_attr(GearAttr::DepthChargeProjector);

        let old_mod = if (has_sonar || has_large_sonar) && has_depth_charge {
            1.15
        } else {
            1.0
        };

        let new_mod = if has_additional_depth_charge && has_depth_charge_projector {
            if has_sonar { 1.25 } else { 1.1 }
        } else {
            1.0
        };

        old_mod * new_mod
    }

    pub fn asw_armor_penetration(&self) -> f64 {
        let total = self.gears.sum_by(|gear| {
            if gear.has_attr(GearAttr::ApDepthCharge) {
                let asw = gear.asw as f64;
                (asw - 2.0).max(0.0).sqrt()
            } else {
                0.0
            }
        });

        let ship_type_bonus = if self.ship_type == ShipType::DE {
            1.0
        } else {
            0.0
        };

        total + ship_type_bonus
    }

    pub fn calc_observation_term(
        &self,
        fleet_los_mod: f64,
        is_main_flagship: bool,
        air_state_rank: AirStateRank,
    ) -> Option<f64> {
        let (as_mod1, as_mod2, as_mod3) = match air_state_rank {
            AirStateRank::Rank3 => (0.7, 1.6, 10.0),
            AirStateRank::Rank2 => (0.6, 1.2, 0.0),
            _ => return Some(0.0),
        };

        let luck = self.luck()? as f64;
        let equipment_los = self.gears.sum_by(|g| g.los) as f64;

        let luck_factor = (luck.sqrt() + 10.0).floor();
        let flagship_mod = if is_main_flagship { 15.0 } else { 0.0 };

        let result = (luck_factor + as_mod1 * (fleet_los_mod + as_mod2 * equipment_los) + as_mod3)
            .floor()
            + flagship_mod;

        Some(result)
    }
}

#[wasm_bindgen]
impl Ship {
    #[allow(clippy::should_implement_trait)]
    pub fn default() -> Self {
        Default::default()
    }

    pub fn eq_id(&self, id: &str) -> bool {
        self.id.eq(id)
    }

    pub fn state(&self) -> ShipState {
        self.state.clone()
    }

    pub fn custom_power_mods(&self) -> CustomPowerModifiers {
        self.state.custom_power_mods.clone()
    }

    pub fn meta(&self) -> ShipMeta {
        ShipMeta {
            id: self.id.clone(),
            ship_id: self.ship_id,
        }
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
    pub fn stype(&self) -> u8 {
        self.master.stype
    }

    #[wasm_bindgen(getter)]
    pub fn sort_id(&self) -> u16 {
        self.master.sort_id
    }

    #[wasm_bindgen(getter)]
    pub fn remodel_rank(&self) -> u16 {
        self.master.remodel_rank()
    }

    #[wasm_bindgen(getter)]
    pub fn slotnum(&self) -> usize {
        self.master.slotnum
    }

    #[wasm_bindgen(getter)]
    pub fn next_id(&self) -> u16 {
        self.master.next_id
    }

    #[wasm_bindgen(getter)]
    pub fn useful(&self) -> bool {
        self.master.useful
    }

    pub fn damage_state(&self) -> DamageState {
        DamageState::new(self.max_hp().unwrap_or_default(), self.current_hp)
    }

    pub fn morale_state(&self) -> MoraleState {
        MoraleState::new(self.morale)
    }

    pub fn category(&self) -> ShipCategory {
        self.ship_type.category()
    }

    pub fn has_attr(&self, attr: ShipAttr) -> bool {
        self.master.attrs.contains(attr)
    }

    pub fn gear_keys(&self) -> Vec<js_sys::JsString> {
        let slotnum = self.master.slotnum;

        (0..GearArray::CAPACITY)
            .filter(|&index| {
                index < slotnum
                    || index == GearArray::EXSLOT_INDEX
                    || self.gears.get(index).is_some()
            })
            .filter_map(into_gear_key)
            .map(js_sys::JsString::from)
            .collect::<Vec<_>>()
    }

    pub fn get_gear(&self, key: &str) -> Option<Gear> {
        self.gears.get_by_gear_key(key).cloned()
    }

    pub fn get_damage_bound(&self, state: DamageState) -> Option<u16> {
        let max_hp = self.max_hp()?;
        Some(state.bound(max_hp))
    }

    pub fn get_remaining_fuel(&self, rate: f64, ceil: bool) -> u16 {
        let v_f64 = self.max_fuel() as f64 * rate;
        let v = if ceil || v_f64 < 1.0 {
            v_f64.ceil()
        } else {
            v_f64.floor()
        } as u16;
        self.fuel.saturating_sub(v)
    }

    pub fn get_remaining_ammo(&self, rate: f64, ceil: bool) -> u16 {
        let v_f64 = self.max_ammo() as f64 * rate;
        let v = if ceil || v_f64 < 1.0 {
            v_f64.ceil()
        } else {
            v_f64.floor()
        } as u16;
        self.ammo.saturating_sub(v)
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

    pub fn get_stat_interval_left(&self, key: &str) -> Option<u16> {
        match key {
            "max_hp" => self.master.max_hp.0,
            "firepower" => self.master.firepower.0,
            "torpedo" => self.master.torpedo.0,
            "armor" => self.master.armor.0,
            "anti_air" => self.master.anti_air.0,
            "evasion" => self.master.evasion.0,
            "asw" => self.master.asw.0,
            "los" => self.master.los.0,
            "luck" => self.master.luck.0,
            _ => None,
        }
    }

    pub fn get_stat_interval_right(&self, key: &str) -> Option<u16> {
        match key {
            "max_hp" => self.master.max_hp.1,
            "firepower" => self.master.firepower.1,
            "torpedo" => self.master.torpedo.1,
            "armor" => self.master.armor.1,
            "anti_air" => self.master.anti_air.1,
            "evasion" => self.master.evasion.1,
            "asw" => self.master.asw.1,
            "los" => self.master.los.1,
            "luck" => self.master.luck.1,
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
            "max_hp" => self.state.max_hp_mod,
            "firepower" => self.state.firepower_mod,
            "torpedo" => self.state.torpedo_mod,
            "armor" => self.state.armor_mod,
            "anti_air" => self.state.anti_air_mod,
            "evasion" => self.state.evasion_mod,
            "asw" => self.state.asw_mod,
            "los" => self.state.los_mod,
            "luck" => self.state.luck_mod,
            _ => None,
        }
    }

    pub fn is_abyssal(&self) -> bool {
        self.master.is_abyssal()
    }

    pub fn is_submarine(&self) -> bool {
        self.ship_type.is_submarine()
    }

    pub fn is_amagiri(&self) -> bool {
        matches_ship_id!(self.ship_id, "天霧" | "天霧改" | "天霧改二" | "天霧改二丁")
    }

    pub fn can_equip(&self, gear: &Gear, key: &str) -> bool {
        self.equippability.can_equip(key, gear)
    }

    #[wasm_bindgen(getter)]
    pub fn max_hp(&self) -> Option<u16> {
        if let Some(left) = self.master.max_hp.0 {
            let base = if self.level >= 100 {
                left + get_marriage_bonus(left)
            } else {
                left
            };

            let value = base as i16 + self.state.max_hp_mod.unwrap_or_default();
            let capped = self
                .master
                .max_hp
                .1
                .map_or(value, |right| value.min(right as i16));

            Some(capped)
        } else {
            self.state.max_hp_mod
        }
        .map(|v| v as u16)
    }

    #[wasm_bindgen(getter)]
    pub fn max_ammo(&self) -> u16 {
        self.master.ammo
    }

    #[wasm_bindgen(getter)]
    pub fn max_fuel(&self) -> u16 {
        self.master.fuel
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
            Some(base as i16 + self.state.luck_mod.unwrap_or_default())
        } else {
            self.state.luck_mod
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

    #[wasm_bindgen(getter)]
    pub fn innate_torpedo_accuracy(&self) -> f64 {
        self.master.torpedo_accuracy as f64
    }

    pub fn is_installation(&self) -> bool {
        self.has_attr(ShipAttr::Installation)
    }

    #[inline]
    pub fn is_pt_imp(&self) -> bool {
        self.has_attr(ShipAttr::PtImp)
    }

    pub fn special_enemy_type(&self) -> SpecialEnemyType {
        use SpecialEnemyType::*;

        if self.has_attr(ShipAttr::Pillbox) {
            Pillbox
        } else if self.has_attr(ShipAttr::IsolatedIsland) {
            IsolatedIsland
        } else if self.has_attr(ShipAttr::HarbourSummerPrincess) {
            HarbourSummerPrincess
        } else if self.has_attr(ShipAttr::NewSupplyDepot) {
            NewSupplyDepot
        } else if self.has_attr(ShipAttr::SupplyDepot) {
            SupplyDepot
        } else if self.is_installation() {
            SoftSkinned
        } else if self.is_pt_imp() {
            PtImp
        } else if self.has_attr(ShipAttr::BattleshipSummerPrincess) {
            BattleshipSummerPrincess
        } else if self.has_attr(ShipAttr::HeavyCruiserSummerPrincess) {
            HeavyCruiserSummerPrincess
        } else if self.has_attr(ShipAttr::FrenchBattleshipPrincess) {
            FrenchBattleshipPrincess
        } else if self.has_attr(ShipAttr::AnchorageWaterDemonVacationMode) {
            AnchorageWaterDemonVacationMode
        } else if self.has_attr(ShipAttr::DockPrincess) {
            DockPrincess
        } else if self.has_attr(ShipAttr::SummerAircraftCarrierDemon) {
            SummerAircraftCarrierDemon
        } else if self.has_attr(ShipAttr::EuropeanWaterPrincess) {
            EuropeanWaterPrincess
        } else {
            None
        }
    }

    pub fn is_attackable_by_torpedo(&self) -> bool {
        !self.is_submarine() && !self.is_installation()
    }

    pub fn get_slot_size(&self, index: usize) -> Option<u8> {
        self.slots.get(index).and_then(|&s| s)
    }

    pub fn get_max_slot_size(&self, index: usize) -> Option<u8> {
        if self.ctype == ctype!("日進型") {
            nisshin_max_slot_size(&self.master, &self.gears, index)
        } else {
            self.master.get_max_slot_size(index)
        }
    }

    pub fn remaining_ammo_mod(&self) -> f64 {
        let max = self.max_ammo();

        if max == 0 {
            return 1.0;
        }

        let percent = self.ammo * 100 / max;
        (percent as f64 / 50.0).min(1.0)
    }

    pub fn remaining_fuel_mod(&self) -> f64 {
        let max = self.max_fuel();

        if max == 0 {
            return 0.0;
        }

        let percent = self.fuel * 100 / max;
        75_u16.saturating_sub(percent) as f64
    }

    pub fn fighter_power(&self, air_type: AirWaveType) -> Option<i32> {
        self.planes()
            .filter(|plane| plane.participates_in_fighter_combat(air_type))
            .map(|plane| plane.fighter_power())
            .sum()
    }

    pub fn fleet_los_factor(&self) -> Option<f64> {
        let total = self
            .gears
            .without_ex()
            .map(|(index, gear)| {
                if gear.has_attr(GearAttr::ObservationSeaplane) {
                    let los = gear.los as f64;
                    let slot_size = self.get_slot_size(index)? as f64;

                    Some(los * slot_size.sqrt().floor())
                } else {
                    Some(0.0)
                }
            })
            .sum::<Option<f64>>()?;

        let naked_los = self.naked_los()? as f64;

        Some(naked_los + total)
    }

    /// 加重対空
    pub fn ship_adjusted_anti_air(&self, side: Side) -> Option<f64> {
        let ebonus = self.ebonuses.anti_air as f64;
        let total = self.gears.sum_by(|g| g.ship_anti_air_mod());

        if side.is_enemy() {
            let anti_air = self.anti_air()? as f64;
            return Some(anti_air.sqrt().floor() + total);
        }

        let naked_anti_air = self.naked_anti_air()? as f64;
        let pre_floor = naked_anti_air / 2.0 + total + ebonus * 0.75;

        let result = if self.gears.iter().count() == 0 {
            pre_floor
        } else {
            pre_floor.floor()
        };

        Some(result)
    }

    /// 艦隊対空補正
    pub fn fleet_anti_air_mod(&self) -> f64 {
        let ebonus = self.ebonuses.anti_air as f64;
        let total = self.gears.sum_by(|g| g.fleet_anti_air_mod());
        (total + ebonus * 0.5).floor()
    }

    pub fn cruiser_fit_bonus(&self) -> f64 {
        if matches!(self.ship_type, ShipType::CL | ShipType::CLT | ShipType::CT) {
            let single_gun_count = self
                .gears
                .count_by(|gear| matches_gear_id!(gear.gear_id, "14cm単装砲" | "15.2cm単装砲"));

            let twin_gun_count = self.gears.count_by(|gear| {
                matches_gear_id!(
                    gear.gear_id,
                    "15.2cm連装砲"
                        | "14cm連装砲"
                        | "15.2cm連装砲改"
                        | "Bofors 15.2cm連装砲 Model 1930"
                        | "14cm連装砲改"
                        | "6inch 連装速射砲 Mk.XXI"
                        | "Bofors 15cm連装速射砲 Mk.9 Model 1938"
                        | "Bofors 15cm連装速射砲 Mk.9改+単装速射砲 Mk.10改 Model 1938"
                        | "15.2cm連装砲改二"
                )
            });

            (single_gun_count as f64).sqrt() + 2.0 * (twin_gun_count as f64).sqrt()
        } else if self.ctype == ctype!("Zara級") {
            let zara_gun_count = self.gears.count(gear_id!("203mm/53 連装砲"));
            (zara_gun_count as f64).sqrt()
        } else {
            0.0
        }
    }

    pub fn basic_accuracy_term(&self) -> Option<f64> {
        let luck = self.luck()? as f64;
        let level = self.level as f64;

        Some(2.0 * level.sqrt() + 1.5 * luck.sqrt())
    }

    pub fn basic_evasion_term(&self) -> Option<f64> {
        self.master.basic_evasion_term.or_else(|| {
            let evasion = self.evasion()? as f64;
            let luck = self.luck()? as f64;
            Some(evasion + (2.0 * luck).sqrt())
        })
    }

    pub fn evasion_term(
        &self,
        formation_mod: f64,
        postcap_additive: f64,
        postcap_multiplicative: f64,
    ) -> Option<f64> {
        let base = (self.basic_evasion_term()? * formation_mod).floor();

        let postcap = if base >= 65.0 {
            (55.0 + 2.0 * (base - 65.0).sqrt()).floor()
        } else if base >= 40.0 {
            (40.0 + 3.0 * (base - 40.0).sqrt()).floor()
        } else {
            base
        };

        let total_stars = self.gears.sum_by(|gear| {
            if gear.gear_type == GearType::Engine {
                gear.stars
            } else {
                0
            }
        }) as f64;

        let ibonus = (1.5 * total_stars.sqrt()).floor();
        let post_multiplicative = (postcap + ibonus + postcap_additive) * postcap_multiplicative;

        Some(post_multiplicative.floor() - self.remaining_fuel_mod())
    }

    pub fn basic_defense_power(&self, armor_penetration: f64) -> Option<f64> {
        let value = self.armor()? as f64 + self.gears.sum_by(|gear| gear.ibonuses.defense_power)
            - armor_penetration;

        Some(value.max(1.0))
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

    pub fn elos(&self, node_divaricated_factor: u8) -> Option<f64> {
        let naked_los = self.naked_los()? as f64;
        let total = self.gears.sum_by(|gear| gear.elos());
        let ebonus = self.ebonuses.los as f64;

        Some((naked_los + ebonus).sqrt() + total * (node_divaricated_factor as f64) - 2.0)
    }

    /// 確殺攻撃力
    pub fn ohko_power(&self) -> Option<f64> {
        let basic_defense_power = self.basic_defense_power(0.0)?;
        let max_defense_power = DefensePower::new(basic_defense_power).max();
        Some(self.current_hp as f64 + max_defense_power)
    }
}

impl Ship {
    pub fn take_damage(&mut self, value: u16) {
        self.current_hp = self.current_hp.saturating_sub(value);
    }

    pub fn set_damage_state(&mut self, damage_state: DamageState) {
        let max_hp = self.max_hp().unwrap_or_default();
        let bound = damage_state.bound(max_hp);
        self.current_hp = bound;
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{gear::Gear, master_data::StatInterval};

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
                            state: ShipState {
                                [<$key _mod>]: Some(3),
                                ..Default::default()
                            },
                            master: MasterShip {
                                $key: StatInterval(Some(0), Some(10)),
                                ..Default::default()
                            },
                            ..Default::default()
                        };

                        ship.gears.push(Gear {
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
                            state: ShipState {
                                [<$key _mod>]: Some(3),
                                ..Default::default()
                            },

                            master: MasterShip {
                                $key: StatInterval(Some(1), Some(100)),
                                ..Default::default()
                            },
                            ..Default::default()
                        };

                        ship.gears.push(Gear {
                            $key: 5,
                            ..Default::default()
                        });

                        assert_eq!(ship.[<naked_ $key>](), Some(15 + 1 + 3));
                        assert_eq!(ship.$key(), Some(15 + 1 + 3 + 5));
                    }
                )*
            };
        }

        def_stats_test!(firepower, torpedo, armor, anti_air);
        def_stats_with_level_test!(evasion, los, asw);
    }

    #[test]
    fn test_remaining_ammo_mod() {
        let ship = Ship {
            master: MasterShip {
                ammo: 130,
                ..Default::default()
            },
            ammo: 63,
            ..Default::default()
        };

        assert_eq!(ship.remaining_ammo_mod(), 0.96)
    }

    #[test]
    fn test_remaining_fuel_mod() {
        assert_eq!(
            Ship {
                master: MasterShip {
                    fuel: 130,
                    ..Default::default()
                },
                fuel: 98,
                ..Default::default()
            }
            .remaining_fuel_mod(),
            0.0
        );

        assert_eq!(
            Ship {
                master: MasterShip {
                    fuel: 130,
                    ..Default::default()
                },
                fuel: 97,
                ..Default::default()
            }
            .remaining_fuel_mod(),
            1.0
        )
    }
}
