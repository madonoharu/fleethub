use enumset::EnumSet;
use fasteval::{bool_to_f64, EvalNamespace};
use serde::Deserialize;
use tsify::Tsify;

use crate::types::{gear_id, GearAttr, GearType, GearTypeIdArray};

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterGear {
    pub gear_id: u16,
    pub name: String,
    pub types: GearTypeIdArray,
    #[tsify(optional)]
    pub special_type: Option<u8>,
    #[serde(default)]
    pub max_hp: i16,
    #[serde(default)]
    pub firepower: i16,
    #[serde(default)]
    pub armor: i16,
    #[serde(default)]
    pub torpedo: i16,
    #[serde(default)]
    pub anti_air: i16,
    #[serde(default)]
    pub speed: i16,
    #[serde(default)]
    pub bombing: i16,
    #[serde(default)]
    pub asw: i16,
    #[serde(default)]
    pub los: i16,
    #[serde(default)]
    pub luck: i16,
    #[serde(default)]
    pub accuracy: i16,
    #[serde(default)]
    pub evasion: i16,
    #[serde(default)]
    pub range: u8,
    #[serde(default)]
    pub radius: u8,
    #[serde(default)]
    pub cost: u8,
    #[serde(default)]
    pub improvable: bool,
    #[serde(default = "num_traits::one")]
    pub ship_anti_air_resistance: f64,
    #[serde(default = "num_traits::one")]
    pub fleet_anti_air_resistance: f64,

    #[serde(skip_deserializing)]
    pub attrs: EnumSet<GearAttr>,
}

impl MasterGear {
    pub fn ns<'a>(&'a self) -> impl EvalNamespace + 'a {
        |key: &str, args: Vec<f64>| -> Option<f64> {
            let result = match key {
                "gear_id" => self.gear_id.into(),
                "gear_type" => self.types.gear_type_id().into(),
                "special_type" => self.special_type_id().into(),
                "max_hp" => self.max_hp.into(),
                "firepower" => self.firepower.into(),
                "armor" => self.armor.into(),
                "torpedo" => self.torpedo.into(),
                "anti_air" => self.anti_air.into(),
                "speed" => self.speed.into(),
                "bombing" => self.bombing.into(),
                "asw" => self.asw.into(),
                "los" => self.los.into(),
                "luck" => self.luck.into(),
                "accuracy" => self.accuracy.into(),
                "evasion" => self.evasion.into(),
                "range" => self.range.into(),
                "radius" => self.radius.into(),
                "cost" => self.cost.into(),
                "improvable" => bool_to_f64!(self.improvable),

                "types" => {
                    let index = args.get(0)?.floor() as usize;
                    self.types.get(index)?.into()
                }

                "gear_id_in" => bool_to_f64!(args.iter().any(|v| *v == self.gear_id as f64)),
                "gear_type_in" => {
                    bool_to_f64!(args.iter().any(|v| *v == self.types.gear_type_id() as f64))
                }

                _ => return None,
            };

            Some(result)
        }
    }

    pub fn special_type_id(&self) -> u8 {
        self.special_type.unwrap_or(self.types.gear_type_id())
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
