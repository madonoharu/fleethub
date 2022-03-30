use std::str::FromStr;

use anyhow::Result;
use arrayvec::ArrayVec;
use enumset::EnumSet;
use fasteval::{bool_to_f64, Compiler, Evaler, Instruction, Slab};
use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use crate::{
    gear::IBonuses,
    gear_id,
    ship::ShipEquippable,
    types::{GearAttr, GearState, GearType, ShipAttr, SpeedGroup},
};

use super::BattleConfig;

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
pub struct GearTypes(u8, u8, u8, u8, u8);

impl GearTypes {
    pub fn get(&self, index: usize) -> Option<u8> {
        match index {
            0 => Some(self.0),
            1 => Some(self.1),
            2 => Some(self.2),
            3 => Some(self.3),
            4 => Some(self.4),
            _ => None,
        }
    }

    pub fn gear_type_id(&self) -> u8 {
        self.2
    }

    pub fn gear_type(&self) -> GearType {
        num_traits::FromPrimitive::from_u8(self.gear_type_id()).unwrap_or_default()
    }

    pub fn icon_id(&self) -> u8 {
        self.3
    }
}

const SLOT_SIZE_ARRAY_CAPACITY: usize = 5;
pub type SlotSizeArray = ArrayVec<Option<u8>, SLOT_SIZE_ARRAY_CAPACITY>;

trait EvalerStruct {
    fn ns(&self, key: &str, args: Vec<f64>) -> Option<f64>;

    fn eval(&self, expr_str: &str) -> Result<f64, fasteval::Error> {
        let mut ns = |key: &str, args: Vec<f64>| self.ns(key, args);
        fasteval::ez_eval(expr_str, &mut ns)
    }

    fn eval_compiled(
        &self,
        compiled: &fasteval::Instruction,
        slab: &fasteval::Slab,
    ) -> Result<f64, fasteval::Error> {
        let mut ns = |key: &str, args: Vec<f64>| self.ns(key, args);
        Ok(fasteval::eval_compiled_ref!(compiled, slab, &mut ns))
    }
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterGear {
    pub gear_id: u16,
    pub name: String,
    pub types: GearTypes,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub special_type: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_hp: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub firepower: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub armor: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub torpedo: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub anti_air: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub speed: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bombing: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub asw: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub los: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub luck: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub accuracy: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub evasion: Option<i16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub range: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub radius: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cost: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub improvable: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub adjusted_anti_air_resistance: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fleet_anti_air_resistance: Option<f64>,

    #[serde(skip_deserializing)]
    pub attrs: EnumSet<GearAttr>,
}

macro_rules! impl_i16_fields {
    ($($key:ident),* $(,)?) => {
        impl MasterGear {
            $(
                pub fn $key(&self) -> i16 {
                    self.$key.unwrap_or_default()
                }
            )*
        }
    };
}

macro_rules! impl_u8_fields {
    ($($key:ident),* $(,)?) => {
        impl MasterGear {
            $(
                pub fn $key(&self) -> u8 {
                    self.$key.unwrap_or_default()
                }
            )*
        }
    };
}

impl_i16_fields!(
    max_hp, firepower, armor, torpedo, anti_air, speed, bombing, asw, los, luck, accuracy, evasion,
);

impl_u8_fields!(range, radius, cost,);

impl MasterGear {
    pub fn special_type(&self) -> u8 {
        self.special_type.unwrap_or_default()
    }

    pub fn has_attr(&self, attr: GearAttr) -> bool {
        self.attrs.contains(attr)
    }

    pub fn default_exp(&self) -> u8 {
        if self.has_attr(GearAttr::Abyssal) {
            return 0;
        }

        if self.gear_id == gear_id!("二式陸上偵察機(熟練)") {
            return 25;
        }

        let gear_type = self.types.gear_type();

        match gear_type {
            GearType::CbFighter
            | GearType::CbRecon
            | GearType::ReconSeaplane
            | GearType::SeaplaneFighter
            | GearType::LargeFlyingBoat
            | GearType::JetFighter
            | GearType::JetFighterBomber
            | GearType::JetRecon
            | GearType::JetTorpedoBomber => 120,
            GearType::CbTorpedoBomber
            | GearType::CbDiveBomber
            | GearType::SeaplaneBomber
            | GearType::LbFighter
            | GearType::LbAttacker
            | GearType::LargeLbAircraft => 100,
            _ => 0,
        }
    }
}

impl EvalerStruct for MasterGear {
    fn ns(&self, key: &str, args: Vec<f64>) -> Option<f64> {
        let result = match key {
            "gear_id" => self.gear_id as f64,
            "gear_type" => self.types.2 as f64,
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

        Some(result)
    }
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterVariantDef {
    pub tag: String,
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterAttrRule {
    pub tag: String,
    pub name: String,
    pub expr: String,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterIBonusRule {
    pub expr: String,
    pub formula: String,
}

impl MasterIBonusRule {
    fn eval(&self, gear: &MasterGear, stars: u8) -> Option<f64> {
        if gear.eval(&self.expr).unwrap_or_default() == 1.0 {
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

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterIBonuses {
    shelling_power: Vec<MasterIBonusRule>,
    carrier_shelling_power: Vec<MasterIBonusRule>,
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
    elos: Vec<MasterIBonusRule>,
}

impl MasterIBonuses {
    pub fn to_ibonuses(&self, gear: &MasterGear, stars: u8) -> IBonuses {
        let calc = |rules: &Vec<MasterIBonusRule>| {
            rules
                .iter()
                .find_map(|rule| rule.eval(gear, stars))
                .unwrap_or_default()
        };

        IBonuses {
            shelling_power: calc(&self.shelling_power),
            carrier_shelling_power: calc(&self.carrier_shelling_power),
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
            elos: calc(&self.elos),
        }
    }
}

#[derive(Debug, Default, Clone, Copy, Deserialize, Tsify)]
pub struct StatInterval(pub Option<u16>, pub Option<u16>);

impl StatInterval {
    pub fn zipped(self) -> Option<(u16, u16)> {
        let StatInterval(left, right) = self;
        left.zip(right)
    }

    pub fn is_unknown(&self) -> bool {
        self.0.is_none() || self.1.is_none()
    }
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterShip {
    pub ship_id: u16,
    pub name: String,
    pub yomi: String,
    pub stype: u8,
    pub ctype: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sort_id: Option<u16>,
    pub max_hp: StatInterval,
    pub firepower: StatInterval,
    pub armor: StatInterval,
    pub torpedo: StatInterval,
    pub evasion: StatInterval,
    pub anti_air: StatInterval,
    pub asw: StatInterval,
    pub los: StatInterval,
    pub luck: StatInterval,
    pub speed: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub range: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fuel: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ammo: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_id: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_level: Option<u16>,
    pub slotnum: usize,
    #[tsify(type = "Array<number | null>")]
    pub slots: SlotSizeArray,
    #[tsify(type = "Array<GearState>")]
    pub stock: ArrayVec<GearState, 5>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub speed_group: Option<SpeedGroup>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub useful: Option<bool>,

    #[serde(skip_deserializing)]
    pub attrs: EnumSet<ShipAttr>,
}

impl MasterShip {
    pub fn has_attr(&self, attr: ShipAttr) -> bool {
        self.attrs.contains(attr)
    }

    pub fn get_max_slot_size(&self, index: usize) -> Option<u8> {
        self.slots.get(index).cloned().flatten()
    }

    pub fn default_level(&self) -> u16 {
        if self.ship_id < 1500 {
            99
        } else {
            1
        }
    }
}

impl EvalerStruct for MasterShip {
    fn ns(&self, key: &str, args: Vec<f64>) -> Option<f64> {
        let result = match key {
            "ship_id" => self.ship_id.into(),
            "ship_type" => self.stype.into(),
            "ship_class" => self.ctype.into(),
            "sort_id" => self.sort_id.unwrap_or_default().into(),
            "speed" => self.speed.into(),

            "ship_id_in" => bool_to_f64!(args.contains(&self.ship_id.into())),
            "ship_type_in" => bool_to_f64!(args.contains(&self.stype.into())),
            "ship_class_in" => {
                bool_to_f64!(args.contains(&(self.ctype.into())))
            }

            _ => return None,
        };

        Some(result)
    }
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct EquipStype {
    pub id: u8,
    pub equip_type: Vec<u8>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MstEquipShip {
    pub api_ship_id: u16,
    pub api_equip_type: Vec<u8>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MstEquipExslotShip {
    pub api_slotitem_id: u16,
    pub api_ship_ids: Vec<u16>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterEquippable {
    pub equip_stype: Vec<EquipStype>,
    pub equip_exslot: Vec<u8>,
    pub equip_ship: Vec<MstEquipShip>,
    pub equip_exslot_ship: Vec<MstEquipExslotShip>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterData {
    pub gears: Vec<MasterGear>,
    pub gear_attrs: Vec<MasterAttrRule>,
    pub ships: Vec<MasterShip>,
    pub ship_attrs: Vec<MasterAttrRule>,
    pub equippable: MasterEquippable,
    pub ibonuses: MasterIBonuses,
    pub config: BattleConfig,
}

fn compile_attr_rules<T>(
    parser: &fasteval::Parser,
    slab: &mut Slab,
    rules: &Vec<MasterAttrRule>,
) -> Vec<(T, Instruction)>
where
    T: FromStr<Err = strum::ParseError>,
{
    rules
        .iter()
        .map(|rule| -> Result<(T, Instruction)> {
            let compiled = parser
                .parse(&rule.expr, &mut slab.ps)
                .map_err(|err| anyhow::format_err!("{:?}: {}", err, &rule.expr))?
                .from(&slab.ps)
                .compile(&slab.ps, &mut slab.cs);

            let attr = T::from_str(&rule.tag)?;

            Ok((attr, compiled))
        })
        .filter_map(|result| match result {
            Ok(v) => Some(v),
            Err(err) => {
                crate::console::error!("{:#?}", err);
                None
            }
        })
        .collect()
}

impl MasterData {
    pub fn new(js: JsValue) -> serde_json::Result<Self> {
        let mut master: Self = js.into_serde()?;

        let Self {
            ships,
            ship_attrs,
            gears,
            gear_attrs,
            ..
        } = &mut master;

        let parser = fasteval::Parser::new();
        let mut slab = fasteval::Slab::new();

        let compiled_ship_attr_rules =
            compile_attr_rules::<ShipAttr>(&parser, &mut slab, ship_attrs);

        let compiled_gear_attr_rules =
            compile_attr_rules::<GearAttr>(&parser, &mut slab, gear_attrs);

        ships.iter_mut().for_each(|ship| {
            let attrs = compiled_ship_attr_rules
                .iter()
                .filter_map(|(attr, compiled)| {
                    if ship.eval_compiled(compiled, &slab).ok()? == 1.0 {
                        Some(attr)
                    } else {
                        None
                    }
                })
                .cloned()
                .collect::<EnumSet<_>>();

            ship.attrs = attrs
        });

        gears.iter_mut().for_each(|gear| {
            let attrs = compiled_gear_attr_rules
                .iter()
                .filter_map(|(attr, compiled)| {
                    if gear.eval_compiled(compiled, &slab).ok()? == 1.0 {
                        Some(attr)
                    } else {
                        None
                    }
                })
                .cloned()
                .collect::<EnumSet<_>>();

            gear.attrs = attrs
        });

        Ok(master)
    }

    pub fn get_ibonuses(&self, gear: &MasterGear, stars: u8) -> IBonuses {
        self.ibonuses.to_ibonuses(gear, stars)
    }

    pub fn create_ship_equippable(&self, ship: &MasterShip) -> ShipEquippable {
        let equip_ship = self
            .equippable
            .equip_ship
            .iter()
            .find(|es| es.api_ship_id == ship.ship_id)
            .map(|es| &es.api_equip_type);

        let types = equip_ship
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
            .collect();

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

        assert_eq!(gear.eval("gear_id == 10 && types[1] == 1"), Ok(1.));
        assert_eq!(gear.eval("los > 5 && anti_air >= 2"), Ok(1.));

        assert_eq!(gear.eval("gear_id"), Ok(10.));
        assert_eq!(gear.eval("types[3]"), Ok(3.));
        assert_eq!(gear.eval("special_type"), Ok(26.));

        assert_eq!(gear.eval("gear_id_in(10)"), Ok(1.));
        assert_eq!(gear.eval("gear_type_in(1,2,3,4,5)"), Ok(1.));
        assert_eq!(gear.eval("gear_type_in(1,3,4,5)"), Ok(0.));
        assert_eq!(
            gear.eval("improvable"),
            Ok(bool_to_f64!(gear.improvable.unwrap()))
        );

        macro_rules! test_fields {
            ($($field: ident),*) => (
                {
                    $(assert_eq!(
                        gear.eval(stringify!($field)),
                        Ok(gear.$field.unwrap() as f64)
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
