use std::{collections::HashMap, str::FromStr};

use enumset::EnumSet;
use fasteval::bool_to_f64;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use wasm_bindgen::prelude::*;

use crate::{
    array::{MyArrayVec, SlotSizeArray},
    gear::IBonuses,
    ship::ShipEquippable,
    types::{
        AntiAirCutinDef, DayCutinDef, FormationDef, GearAttr, GearState, GearType, NightCutinDef,
        ShipAttr, SpeedGroup,
    },
};

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct GearTypes(i32, i32, i32, i32, i32);

impl GearTypes {
    pub fn get(&self, index: usize) -> Option<i32> {
        match index {
            0 => Some(self.0),
            1 => Some(self.1),
            2 => Some(self.2),
            3 => Some(self.3),
            4 => Some(self.4),
            _ => None,
        }
    }

    pub fn gear_type_id(&self) -> i32 {
        self.2
    }

    pub fn gear_type(&self) -> GearType {
        num_traits::FromPrimitive::from_i32(self.gear_type_id()).unwrap_or_default()
    }

    pub fn icon_id(&self) -> i32 {
        self.3
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterGear {
    pub gear_id: i32,
    pub name: String,
    pub types: GearTypes,
    pub special_type: Option<i32>,
    pub max_hp: Option<i32>,
    pub firepower: Option<i32>,
    pub armor: Option<i32>,
    pub torpedo: Option<i32>,
    pub anti_air: Option<i32>,
    pub speed: Option<i32>,
    pub bombing: Option<i32>,
    pub asw: Option<i32>,
    pub los: Option<i32>,
    pub luck: Option<i32>,
    pub accuracy: Option<i32>,
    pub evasion: Option<i32>,
    pub range: Option<i32>,
    pub radius: Option<i32>,
    pub cost: Option<i32>,
    pub improvable: Option<bool>,
    pub adjusted_anti_air_resistance: Option<f64>,
    pub fleet_anti_air_resistance: Option<f64>,
}

macro_rules! impl_fields {
    ($($key:ident),* $(,)?) => {
        impl MasterGear {
            $(
                pub fn $key(&self) -> i32 {
                    self.$key.unwrap_or_default()
                }
            )*
        }
    };
}

impl_fields!(
    special_type,
    max_hp,
    firepower,
    armor,
    torpedo,
    anti_air,
    speed,
    bombing,
    asw,
    los,
    luck,
    accuracy,
    evasion,
    range,
    radius,
    cost,
);

impl MasterGear {
    pub fn eval(&self, expr_str: &str) -> Option<f64> {
        let mut ns = |key: &str, args: Vec<f64>| {
            let val = match key {
                "gear_id" => self.gear_id as f64,
                "special_type" => self.special_type() as f64,
                "max_hp" => self.max_hp() as f64,
                "firepower" => self.firepower() as f64,
                "armor" => self.armor() as f64,
                "torpedo" => self.torpedo() as f64,
                "anti_air" => self.anti_air() as f64,
                "speed" => self.speed() as f64,
                "bombing" => self.bombing() as f64,
                "asw" => self.asw() as f64,
                "los" => self.los() as f64,
                "luck" => self.luck() as f64,
                "accuracy" => self.accuracy() as f64,
                "evasion" => self.evasion() as f64,
                "range" => self.range() as f64,
                "radius" => self.radius() as f64,
                "cost" => self.cost() as f64,
                "improvable" => bool_to_f64!(self.improvable?),

                "types" => {
                    let index = args.get(0)?.floor() as usize;
                    self.types.get(index)? as f64
                }

                "gear_id_in" => bool_to_f64!(args.iter().any(|v| *v == self.gear_id as f64)),
                "gear_type_in" => bool_to_f64!(args.iter().any(|v| *v == self.types.2 as f64)),

                _ => return None,
            };

            Some(val)
        };

        fasteval::ez_eval(expr_str, &mut ns).ok()
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterVariantDef {
    pub tag: String,
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterAttrRule {
    pub tag: String,
    pub name: String,
    pub expr: String,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterIBonusRule {
    pub expr: String,
    pub formula: String,
}

impl MasterIBonusRule {
    fn eval(&self, gear: &MasterGear, stars: i32) -> Option<f64> {
        if gear.eval(&self.expr).unwrap_or_default() == 1. {
            let mut ns = |name: &str, args: Vec<f64>| match name {
                "x" => Some(stars as f64),
                "sqrt" => args.get(0).map(|v| v.sqrt()),
                _ => None,
            };

            fasteval::ez_eval(&self.formula, &mut ns).ok()
        } else {
            None
        }
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterIBonuses {
    shelling_power: Vec<MasterIBonusRule>,
    shelling_accuracy: Vec<MasterIBonusRule>,
    torpedo_power: Vec<MasterIBonusRule>,
    torpedo_accuracy: Vec<MasterIBonusRule>,
    torpedo_evasion: Vec<MasterIBonusRule>,
    asw_power: Vec<MasterIBonusRule>,
    asw_accuracy: Vec<MasterIBonusRule>,
    night_power: Vec<MasterIBonusRule>,
    night_accuracy: Vec<MasterIBonusRule>,
    defense_power: Vec<MasterIBonusRule>,
    contact_selection: Vec<MasterIBonusRule>,
    fighter_power: Vec<MasterIBonusRule>,
    adjusted_anti_air: Vec<MasterIBonusRule>,
    fleet_anti_air: Vec<MasterIBonusRule>,
    effective_los: Vec<MasterIBonusRule>,
}

impl MasterIBonuses {
    pub fn to_ibonuses(&self, gear: &MasterGear, stars: i32) -> IBonuses {
        let calc = |rules: &Vec<MasterIBonusRule>| {
            rules
                .iter()
                .find_map(|rule| rule.eval(gear, stars))
                .unwrap_or_default()
        };

        IBonuses {
            shelling_power: calc(&self.shelling_power),
            shelling_accuracy: calc(&self.shelling_accuracy),
            torpedo_power: calc(&self.torpedo_power),
            torpedo_accuracy: calc(&self.torpedo_accuracy),
            torpedo_evasion: calc(&self.torpedo_evasion),
            asw_power: calc(&self.asw_power),
            asw_accuracy: calc(&self.asw_accuracy),
            night_power: calc(&self.night_power),
            night_accuracy: calc(&self.night_accuracy),
            defense_power: calc(&self.defense_power),
            contact_selection: calc(&self.contact_selection),
            fighter_power: calc(&self.fighter_power),
            adjusted_anti_air: calc(&self.adjusted_anti_air),
            fleet_anti_air: calc(&self.fleet_anti_air),
            effective_los: calc(&self.effective_los),
        }
    }
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone, Copy, Deserialize, TS)]
pub struct StatInterval(pub Option<i32>, pub Option<i32>);

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterShip {
    pub ship_id: i32,
    pub name: String,
    pub yomi: String,
    pub stype: i32,
    pub ctype: Option<i32>,
    pub sort_id: Option<i32>,
    pub max_hp: StatInterval,
    pub firepower: StatInterval,
    pub armor: StatInterval,
    pub torpedo: StatInterval,
    pub evasion: StatInterval,
    pub anti_air: StatInterval,
    pub asw: StatInterval,
    pub los: StatInterval,
    pub luck: StatInterval,
    pub speed: i32,
    pub range: Option<i32>,
    pub fuel: Option<i32>,
    pub ammo: Option<i32>,
    pub next_id: Option<i32>,
    pub next_level: Option<i32>,
    pub slotnum: i32,
    pub slots: SlotSizeArray,
    pub stock: MyArrayVec<GearState, 5>,
    pub speed_group: Option<SpeedGroup>,
    pub useful: Option<bool>,
}

impl MasterShip {
    pub fn default_level(&self) -> i32 {
        if self.ship_id < 1500 {
            99
        } else {
            1
        }
    }

    pub fn eval(&self, expr_str: &str) -> Option<f64> {
        let mut ns = |key: &str, args: Vec<f64>| match key {
            "ship_id" => Some(self.ship_id.into()),
            "ship_type" => Some(self.stype.into()),
            "ship_class" => Some(self.ctype.unwrap_or_default().into()),

            "ship_id_in" => Some(bool_to_f64!(args.contains(&self.ship_id.into()))),
            "ship_type_in" => Some(bool_to_f64!(args.contains(&self.stype.into()))),
            "ship_class_in" => Some(bool_to_f64!(
                args.contains(&(self.ctype.unwrap_or_default().into()))
            )),

            _ => None,
        };

        fasteval::ez_eval(expr_str, &mut ns).ok()
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct EquipStype {
    pub id: i32,
    pub equip_type: Vec<i32>,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MstEquipShip {
    pub api_ship_id: i32,
    pub api_equip_type: Vec<i32>,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MstEquipExslotShip {
    pub api_slotitem_id: i32,
    pub api_ship_ids: Vec<i32>,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterEquippable {
    pub equip_stype: Vec<EquipStype>,
    pub equip_exslot: Vec<i32>,
    pub equip_ship: Vec<MstEquipShip>,
    pub equip_exslot_ship: Vec<MstEquipExslotShip>,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterConstants {
    pub formations: Vec<FormationDef>,
    pub anti_air_cutins: Vec<AntiAirCutinDef>,
    pub day_cutins: Vec<DayCutinDef>,
    pub night_cutins: Vec<NightCutinDef>,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterData {
    pub gears: Vec<MasterGear>,
    pub gear_types: Vec<MasterVariantDef>,
    pub gear_attrs: Vec<MasterAttrRule>,
    pub ships: Vec<MasterShip>,
    pub ship_types: Vec<MasterVariantDef>,
    pub ship_classes: Vec<MasterVariantDef>,
    pub ship_attrs: Vec<MasterAttrRule>,
    pub ship_banners: HashMap<String, String>,
    pub equippable: MasterEquippable,
    pub ibonuses: MasterIBonuses,
    pub constants: MasterConstants,
}

impl MasterData {
    pub fn find_gear_attrs(&self, gear: &MasterGear) -> EnumSet<GearAttr> {
        self.gear_attrs
            .iter()
            .filter_map(|rule| {
                if gear.eval(&rule.expr).unwrap_or_default() == 1. {
                    match GearAttr::from_str(&rule.tag) {
                        Ok(attr) => Some(attr),
                        Err(error) => {
                            eprintln!("{:?}", error);
                            None
                        }
                    }
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn find_ship_attrs(&self, ship: &MasterShip) -> EnumSet<ShipAttr> {
        self.ship_attrs
            .iter()
            .filter_map(|rule| {
                if ship.eval(&rule.expr).unwrap_or_default() == 1. {
                    match ShipAttr::from_str(&rule.tag) {
                        Ok(attr) => Some(attr),
                        Err(error) => {
                            eprintln!("{:?}", error);
                            None
                        }
                    }
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn get_ibonuses(&self, gear: &MasterGear, stars: i32) -> IBonuses {
        self.ibonuses.to_ibonuses(gear, stars)
    }

    pub fn create_ship_equippable(&self, ship: &MasterShip) -> ShipEquippable {
        let equip_ship = self
            .equippable
            .equip_ship
            .iter()
            .find(|es| es.api_ship_id == ship.ship_id)
            .map(|es| &es.api_equip_type);

        let types: Vec<i32> = equip_ship
            .or(self
                .equippable
                .equip_stype
                .iter()
                .find(|es| es.id == ship.stype)
                .map(|es| &es.equip_type))
            .map(|v| v.clone())
            .unwrap_or_default();

        let exslot_gear_ids = self
            .equippable
            .equip_exslot_ship
            .iter()
            .filter(|ees| ees.api_ship_ids.contains(&ship.ship_id))
            .map(|ees| ees.api_slotitem_id)
            .collect::<Vec<i32>>();

        ShipEquippable {
            types,
            exslot_gear_ids,
            exslot_types: self.equippable.equip_exslot.clone(),
        }
    }
}

#[cfg(test)]
pub mod test {
    use super::*;

    pub fn get_master_data() -> MasterData {
        let json = std::fs::read_to_string("../utils/master_data.json")
            .map_err(|err| {
                println!("{}", err);
            })
            .unwrap();
        serde_json::from_str(&json).unwrap()
    }

    #[test]
    fn test_master_ship() {
        let md = get_master_data();
        println!("{:#?}", md.ships.get(0).unwrap());
    }

    #[test]
    fn test_find_gear_attrs() {
        let md = get_master_data();
        let gear = md.gears.get(0).unwrap();
        let attrs = md.find_gear_attrs(gear);
        println!("{} {:#?}", gear.name, attrs);
    }

    #[test]
    fn test_get_ibonuses() {
        let md = get_master_data();
        let gear = md.gears.get(0).unwrap();
        let ibonuses = md.get_ibonuses(gear, 10);
        println!("{} {:#?}", gear.name, ibonuses);
    }

    #[test]
    fn test_eval() {
        let gear = MasterGear {
            gear_id: 10,
            name: "name".to_string(),
            types: GearTypes(0, 1, 2, 3, 4),
            special_type: Some(26),
            max_hp: Some(11),
            firepower: Some(12),
            armor: Some(13),
            torpedo: Some(14),
            anti_air: Some(15),
            speed: Some(16),
            bombing: Some(17),
            asw: Some(18),
            los: Some(19),
            luck: Some(20),
            accuracy: Some(21),
            evasion: Some(22),
            range: Some(23),
            radius: Some(24),
            cost: Some(25),
            improvable: Some(true),
            ..Default::default()
        };

        assert_eq!(gear.eval("gear_id == 10 && types[1] == 1"), Some(1.));
        assert_eq!(gear.eval("los > 5 && anti_air >= 2"), Some(1.));

        assert_eq!(gear.eval("gear_id"), Some(10.));
        assert_eq!(gear.eval("types[3]"), Some(3.));
        assert_eq!(gear.eval("special_type"), Some(26.));

        assert_eq!(gear.eval("gear_id_in(10)"), Some(1.));
        assert_eq!(gear.eval("gear_type_in(1,2,3,4,5)"), Some(1.));
        assert_eq!(gear.eval("gear_type_in(1,3,4,5)"), Some(0.));
        assert_eq!(
            gear.eval("improvable"),
            Some(bool_to_f64!(gear.improvable.unwrap()))
        );

        macro_rules! test_fields {
            ($($field: ident),*) => (
                {
                    $(assert_eq!(
                        gear.eval(stringify!($field)),
                        Some(gear.$field.unwrap() as f64)
                    ));*
                }
            )
        }

        test_fields!(
            max_hp, firepower, armor, torpedo, anti_air, speed, bombing, asw, los, luck, accuracy,
            evasion, range, radius, cost
        );
    }
}
