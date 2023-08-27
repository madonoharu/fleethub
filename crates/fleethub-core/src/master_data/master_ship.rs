use std::str::FromStr;

use arrayvec::ArrayVec;
use enumset::EnumSet;
use fasteval::{bool_to_f64, EvalNamespace};
use serde::Deserialize;
use tsify::Tsify;

use crate::types::{GearState, ShipAttr, ShipType, SlotSizeVec, SpeedGroup};

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
    #[serde(default)]
    pub nationality: u8,
    #[serde(default)]
    pub sort_id: u16,
    pub max_hp: StatInterval,
    pub firepower: StatInterval,
    pub armor: StatInterval,
    pub torpedo: StatInterval,
    pub evasion: StatInterval,
    pub anti_air: StatInterval,
    pub asw: StatInterval,
    pub los: StatInterval,
    pub luck: StatInterval,
    #[serde(default)]
    pub torpedo_accuracy: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub basic_evasion_term: Option<f64>,
    pub speed: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub range: Option<u8>,
    #[serde(default)]
    pub fuel: u16,
    #[serde(default)]
    pub ammo: u16,
    #[serde(default)]
    pub next_id: u16,
    #[serde(default)]
    pub next_level: u16,
    pub slotnum: usize,
    pub slots: SlotSizeVec,
    #[tsify(type = "GearState[]")]
    pub stock: ArrayVec<GearState, 5>,
    #[serde(default)]
    pub speed_group: SpeedGroup,
    #[serde(default)]
    pub useful: bool,

    #[serde(skip_deserializing)]
    pub attrs: EnumSet<ShipAttr>,
}

impl MasterShip {
    pub fn ns(&self) -> impl EvalNamespace + '_ {
        |key: &str, args: Vec<f64>| -> Option<f64> {
            let result = match key {
                "ship_id" => self.ship_id.into(),
                "ship_type" => self.stype.into(),
                "ship_class" => self.ctype.into(),
                "nationality" => self.nationality.into(),
                "sort_id" => self.sort_id.into(),
                "speed" => self.speed.into(),

                "ship_id_in" => bool_to_f64!(args.contains(&self.ship_id.into())),
                "ship_type_in" => bool_to_f64!(args.contains(&self.stype.into())),
                "ship_class_in" => {
                    bool_to_f64!(args.contains(&(self.ctype.into())))
                }

                _ => {
                    let attr = ShipAttr::from_str(key).ok()?;
                    bool_to_f64!(self.has_attr(attr))
                }
            };

            Some(result)
        }
    }

    pub fn has_attr(&self, attr: ShipAttr) -> bool {
        self.attrs.contains(attr)
    }

    pub fn get_max_slot_size(&self, index: usize) -> Option<u8> {
        self.slots.get(index).cloned().flatten()
    }

    #[inline]
    pub fn ship_type(&self) -> ShipType {
        ShipType::from(self.stype)
    }

    pub fn is_abyssal(&self) -> bool {
        self.ship_id > 1500
    }

    pub fn default_level(&self) -> u16 {
        if !self.is_abyssal() {
            99
        } else if self.ship_type().is_submarine() {
            50
        } else {
            1
        }
    }

    pub fn remodel_rank(&self) -> u16 {
        self.sort_id % 10
    }
}
