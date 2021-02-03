use crate::{
    constants::{GearAttr, ShipAttr, SpeedGroup},
    gear::{GearState, IBonuses},
    ship::ShipEquippable,
};
use arrayvec::ArrayVec;
use fasteval::bool_to_f64;
use serde::Deserialize;
use std::collections::HashMap;
use std::str::FromStr;
use wasm_bindgen::prelude::*;
use wasmer_enumset::EnumSet;

#[derive(Debug, Deserialize, Default)]
pub struct MasterGear {
    pub gear_id: i32,
    pub name: String,
    pub types: [i32; 5],
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

fn option_i32_as_f64(value: Option<i32>) -> Option<f64> {
    Some(value.unwrap_or_default() as f64)
}

impl MasterGear {
    fn eval(&self, expr_str: &str) -> Option<f64> {
        let mut ns = |key: &str, args: Vec<f64>| match key {
            "gear_id" => Some(self.gear_id as f64),
            "special_type" => option_i32_as_f64(self.special_type),
            "max_hp" => option_i32_as_f64(self.max_hp),
            "firepower" => option_i32_as_f64(self.firepower),
            "armor" => option_i32_as_f64(self.armor),
            "torpedo" => option_i32_as_f64(self.torpedo),
            "anti_air" => option_i32_as_f64(self.anti_air),
            "speed" => option_i32_as_f64(self.speed),
            "bombing" => option_i32_as_f64(self.bombing),
            "asw" => option_i32_as_f64(self.asw),
            "los" => option_i32_as_f64(self.los),
            "luck" => option_i32_as_f64(self.luck),
            "accuracy" => option_i32_as_f64(self.accuracy),
            "evasion" => option_i32_as_f64(self.evasion),
            "range" => option_i32_as_f64(self.range),
            "radius" => option_i32_as_f64(self.radius),
            "cost" => option_i32_as_f64(self.cost),
            "improvable" => Some(bool_to_f64!(self.improvable.unwrap_or_default())),

            "types" => args
                .get(0)
                .and_then(|i| self.types.get(i.floor() as usize))
                .map(|value| *value as f64),

            "gear_id_in" => Some(bool_to_f64!(args.iter().any(|v| *v == self.gear_id as f64))),

            "category_in" => Some(bool_to_f64!(args
                .iter()
                .any(|v| *v == self.types[2] as f64))),

            _ => None,
        };

        fasteval::ez_eval(expr_str, &mut ns).ok()
    }
}

#[derive(Debug, Deserialize)]
pub struct MasterDataAttrRule {
    pub key: String,
    pub name: String,
    pub expr: String,
}

#[derive(Debug, Deserialize)]
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

#[derive(Debug, Deserialize)]
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
#[derive(Debug, Default, Clone, Copy, Deserialize)]
pub struct StatInterval(pub Option<i32>, pub Option<i32>);

#[wasm_bindgen]
#[derive(Debug, Default, Clone, Deserialize)]
pub struct MasterShip {
    pub ship_id: i32,
    #[wasm_bindgen(skip)]
    pub name: String,
    #[wasm_bindgen(skip)]
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
    #[wasm_bindgen(skip)]
    pub slots: ArrayVec<[Option<i32>; 5]>,
    #[wasm_bindgen(skip)]
    pub stock: ArrayVec<[GearState; 5]>,
    #[wasm_bindgen(skip)]
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

#[derive(Debug, Deserialize)]
pub struct EquipStype {
    pub id: i32,
    pub equip_type: Vec<i32>,
}

#[derive(Debug, Deserialize)]
pub struct MstEquipShip {
    pub api_ship_id: i32,
    pub api_equip_type: Vec<i32>,
}

#[derive(Debug, Deserialize)]
pub struct MstEquipExslotShip {
    pub api_slotitem_id: i32,
    pub api_ship_ids: Vec<i32>,
}

#[derive(Debug, Deserialize)]
pub struct MasterDataEquippable {
    pub equip_stype: Vec<EquipStype>,
    pub equip_exslot: Vec<i32>,
    pub equip_ship: Vec<MstEquipShip>,
    pub equip_exslot_ship: Vec<MstEquipExslotShip>,
}

#[derive(Debug, Deserialize)]
pub struct MasterData {
    pub gears: Vec<MasterGear>,
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
            types: [0, 1, 2, 3, 4],
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
            special_type: Some(26),
            improvable: Some(true),
            ..Default::default()
        };

        assert_eq!(gear.eval("gear_id == 10 && types[1] == 1"), Some(1.));
        assert_eq!(gear.eval("los > 5 && anti_air >= 2"), Some(1.));

        assert_eq!(gear.eval("gear_id"), Some(10.));
        assert_eq!(gear.eval("types[3]"), Some(3.));

        assert_eq!(gear.eval("gear_id_in(10)"), Some(1.));
        assert_eq!(gear.eval("category_in(1,2,3,4,5)"), Some(1.));
        assert_eq!(gear.eval("category_in(1,3,4,5)"), Some(0.));
        assert_eq!(
            gear.eval("improvable"),
            Some(bool_to_f64!(gear.improvable.unwrap_or_default()))
        );

        macro_rules! test_fields {
            ($($field: ident),*) => (
                {
                    $(assert_eq!(
                        gear.eval(stringify!($field)),
                        Some(gear.$field.unwrap_or_default() as f64)
                    ));*
                }
            )
        }

        test_fields!(
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
            special_type
        );
    }
}
