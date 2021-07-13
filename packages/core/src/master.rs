use std::{collections::HashMap, str::FromStr};

use enumset::EnumSet;
use fasteval::bool_to_f64;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use wasm_bindgen::prelude::*;

use crate::{
    array::{MyArrayVec, SlotSizeArray},
    gear::{GearState, IBonuses},
    ship::ShipEquippable,
    types::{DayCutin, Formation, GearAttr, GearCategory, NightCutin, ShipAttr, SpeedGroup},
    utils::OrderedF64,
};

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterDataGearCategory {
    pub id: i32,
    pub name: String,
    pub key: String,
}

fn default_as_1() -> f64 {
    1.0
}

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

    fn category_id(&self) -> i32 {
        self.2
    }

    pub fn category(&self) -> GearCategory {
        num_traits::FromPrimitive::from_i32(self.category_id()).unwrap_or_default()
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
    #[serde(default)]
    pub max_hp: i32,
    #[serde(default)]
    pub firepower: i32,
    #[serde(default)]
    pub armor: i32,
    #[serde(default)]
    pub torpedo: i32,
    #[serde(default)]
    pub anti_air: i32,
    #[serde(default)]
    pub speed: i32,
    #[serde(default)]
    pub bombing: i32,
    #[serde(default)]
    pub asw: i32,
    #[serde(default)]
    pub los: i32,
    #[serde(default)]
    pub luck: i32,
    #[serde(default)]
    pub accuracy: i32,
    #[serde(default)]
    pub evasion: i32,
    #[serde(default)]
    pub range: i32,
    #[serde(default)]
    pub radius: i32,
    #[serde(default)]
    pub cost: i32,
    #[serde(default)]
    pub improvable: bool,

    #[serde(default = "default_as_1")]
    pub adjusted_anti_air_resistance: f64,
    #[serde(default = "default_as_1")]
    pub fleet_anti_air_resistance: f64,
}

impl MasterGear {
    fn eval(&self, expr_str: &str) -> Option<f64> {
        let mut ns = |key: &str, args: Vec<f64>| match key {
            "gear_id" => Some(self.gear_id as f64),
            "special_type" => Some(self.special_type.unwrap_or_default() as f64),
            "max_hp" => Some(self.max_hp as f64),
            "firepower" => Some(self.firepower as f64),
            "armor" => Some(self.armor as f64),
            "torpedo" => Some(self.torpedo as f64),
            "anti_air" => Some(self.anti_air as f64),
            "speed" => Some(self.speed as f64),
            "bombing" => Some(self.bombing as f64),
            "asw" => Some(self.asw as f64),
            "los" => Some(self.los as f64),
            "luck" => Some(self.luck as f64),
            "accuracy" => Some(self.accuracy as f64),
            "evasion" => Some(self.evasion as f64),
            "range" => Some(self.range as f64),
            "radius" => Some(self.radius as f64),
            "cost" => Some(self.cost as f64),
            "improvable" => Some(bool_to_f64!(self.improvable)),

            "types" => args
                .get(0)
                .and_then(|i| self.types.get(i.floor() as usize))
                .map(|value| value as f64),

            "gear_id_in" => Some(bool_to_f64!(args.iter().any(|v| *v == self.gear_id as f64))),

            "category_in" => Some(bool_to_f64!(args.iter().any(|v| *v == self.types.2 as f64))),

            _ => None,
        };

        fasteval::ez_eval(expr_str, &mut ns).ok()
    }
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterDataAttrRule {
    pub key: String,
    pub name: String,
    pub expr: String,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterDataIBonusRule {
    pub expr: String,
    pub formula: String,
}

impl MasterDataIBonusRule {
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
pub struct MasterDataIBonuses {
    shelling_power: Vec<MasterDataIBonusRule>,
    shelling_accuracy: Vec<MasterDataIBonusRule>,
    torpedo_power: Vec<MasterDataIBonusRule>,
    torpedo_accuracy: Vec<MasterDataIBonusRule>,
    torpedo_evasion: Vec<MasterDataIBonusRule>,
    asw_power: Vec<MasterDataIBonusRule>,
    asw_accuracy: Vec<MasterDataIBonusRule>,
    night_power: Vec<MasterDataIBonusRule>,
    night_accuracy: Vec<MasterDataIBonusRule>,
    defense_power: Vec<MasterDataIBonusRule>,
    contact_selection: Vec<MasterDataIBonusRule>,
    fighter_power: Vec<MasterDataIBonusRule>,
    adjusted_anti_air: Vec<MasterDataIBonusRule>,
    fleet_anti_air: Vec<MasterDataIBonusRule>,
    effective_los: Vec<MasterDataIBonusRule>,
}

impl MasterDataIBonuses {
    pub fn to_ibonuses(&self, gear: &MasterGear, stars: i32) -> IBonuses {
        let calc = |rules: &Vec<MasterDataIBonusRule>| {
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
pub struct MasterDataEquippable {
    pub equip_stype: Vec<EquipStype>,
    pub equip_exslot: Vec<i32>,
    pub equip_ship: Vec<MstEquipShip>,
    pub equip_exslot_ship: Vec<MstEquipExslotShip>,
}

#[derive(Debug, Default, Clone, Deserialize, TS)]
pub struct MasterData {
    pub gears: Vec<MasterGear>,
    pub gear_categories: Vec<MasterDataGearCategory>,
    pub gear_attrs: Vec<MasterDataAttrRule>,
    pub ships: Vec<MasterShip>,
    pub ship_attrs: Vec<MasterDataAttrRule>,
    pub ship_banners: HashMap<String, String>,
    pub ibonuses: MasterDataIBonuses,
    pub equippable: MasterDataEquippable,
}

impl MasterData {
    pub fn find_gear_attrs(&self, gear: &MasterGear) -> EnumSet<GearAttr> {
        self.gear_attrs
            .iter()
            .filter_map(|rule| {
                if gear.eval(&rule.expr).unwrap_or_default() == 1. {
                    match GearAttr::from_str(&rule.key) {
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
                    match ShipAttr::from_str(&rule.key) {
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

        let categories: Vec<i32> = equip_ship
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
            categories,
            exslot_gear_ids,
            exslot_categories: self.equippable.equip_exslot.clone(),
        }
    }
}

pub struct DayCutinDef {
    pub kind: DayCutin,
    pub times: usize,
    pub denom: Option<u8>,
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
}

pub struct NightCutinDef {
    pub kind: NightCutin,
    pub times: usize,
    pub denom: Option<u8>,
    pub power_mod: Option<f64>,
    pub accuracy_mod: Option<f64>,
}

pub struct AntiAirCutinDef {
    pub id: u8,
    pub numer: Option<u8>,
    pub minimum_bonus: Option<u8>,
    pub fixed_air_defense_mod: Option<OrderedF64>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct FormationAttackModifiers {
    power: OrderedF64,
    accuracy: OrderedF64,
    evasion: OrderedF64,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub enum FormationAttackDef {
    Single(FormationAttackModifiers),
    Vanguard {
        top_half: FormationAttackModifiers,
        bottom_half: FormationAttackModifiers,
    },
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct FormationDef {
    kind: Formation,
    protection_rate: OrderedF64,
    fleet_anti_air: OrderedF64,
    shelling: FormationAttackDef,
    torpedo: FormationAttackDef,
    asw: FormationAttackDef,
    night: FormationAttackDef,
}

struct Config {
    day_cutins: Vec<DayCutinDef>,
    night_cutins: Vec<NightCutinDef>,
    anti_air_cutins: Vec<AntiAirCutinDef>,
    formations: Vec<FormationDef>,
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

            max_hp: 11,
            firepower: 12,
            armor: 13,
            torpedo: 14,
            anti_air: 15,
            speed: 16,
            bombing: 17,
            asw: 18,
            los: 19,
            luck: 20,
            accuracy: 21,
            evasion: 22,
            range: 23,
            radius: 24,
            cost: 25,
            improvable: true,
            ..Default::default()
        };

        assert_eq!(gear.eval("gear_id == 10 && types[1] == 1"), Some(1.));
        assert_eq!(gear.eval("los > 5 && anti_air >= 2"), Some(1.));

        assert_eq!(gear.eval("gear_id"), Some(10.));
        assert_eq!(gear.eval("types[3]"), Some(3.));
        assert_eq!(gear.eval("special_type"), Some(26.));

        assert_eq!(gear.eval("gear_id_in(10)"), Some(1.));
        assert_eq!(gear.eval("category_in(1,2,3,4,5)"), Some(1.));
        assert_eq!(gear.eval("category_in(1,3,4,5)"), Some(0.));
        assert_eq!(gear.eval("improvable"), Some(bool_to_f64!(gear.improvable)));

        macro_rules! test_fields {
            ($($field: ident),*) => (
                {
                    $(assert_eq!(
                        gear.eval(stringify!($field)),
                        Some(gear.$field as f64)
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
