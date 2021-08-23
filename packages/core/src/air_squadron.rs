use wasm_bindgen::prelude::*;

use crate::{
    gear::Gear,
    gear_array::GearArray,
    types::{AirSquadronMode, GearAttr, GearType, SlotSizeArray},
};

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct AirSquadron {
    #[wasm_bindgen(skip)]
    pub xxh3: u64,
    #[wasm_bindgen(skip)]
    pub id: String,
    #[wasm_bindgen(skip)]
    pub mode: AirSquadronMode,
    #[wasm_bindgen(skip)]
    pub gears: GearArray,
    #[wasm_bindgen(skip)]
    pub slots: SlotSizeArray,
    #[wasm_bindgen(skip)]
    pub max_slots: SlotSizeArray,
}

#[wasm_bindgen]
impl AirSquadron {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> String {
        self.id.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn xxh3(&self) -> String {
        format!("{:X}", self.xxh3)
    }

    #[wasm_bindgen(getter)]
    pub fn mode(&self) -> String {
        self.mode.to_string()
    }

    pub fn get_gear(&self, key: &str) -> Option<Gear> {
        self.gears.get_by_gear_key(key).cloned()
    }

    pub fn get_slot_size(&self, index: usize) -> Result<u8, JsValue> {
        self.slots
            .get(index)
            .map(|v| v.unwrap_or(18))
            .ok_or_else(|| JsValue::from_str("get_slot_size() argument must be 1 ~ 4"))
    }

    pub fn get_max_slot_size(&self, index: usize) -> Result<u8, JsValue> {
        self.max_slots
            .get(index)
            .map(|v| v.unwrap_or(18))
            .ok_or_else(|| JsValue::from_str("get_max_slot_size() argument must be 1 ~ 4"))
    }

    pub(crate) fn gears_with_slot_size(&self) -> impl Iterator<Item = (usize, &Gear, Option<u8>)> {
        self.gears.iter().map(move |(index, gear)| {
            let slot_size = if index == GearArray::EXSLOT_INDEX {
                Some(0)
            } else {
                self.get_slot_size(index).ok()
            };
            (index, gear, slot_size)
        })
    }

    pub fn fighter_power(&self) -> i32 {
        let total = self
            .gears_with_slot_size()
            .map(|(_, gear, slot_size)| {
                if let Some(ss) = slot_size {
                    gear.calc_fighter_power(ss)
                } else {
                    0
                }
            })
            .sum::<i32>();

        let recon_mod = self
            .gears
            .values()
            .map(|gear| {
                if gear.gear_type != GearType::LbRecon {
                    return 1.0;
                }

                match gear.los {
                    los if los <= 7 => 1.12,
                    8 => 1.15,
                    _ => 1.18,
                }
            })
            .fold(1.0, f64::max);

        (total as f64 * recon_mod).floor() as i32
    }

    pub fn interception_power(&self) -> i32 {
        let total = self
            .gears_with_slot_size()
            .map(|(_, gear, slot_size)| {
                slot_size
                    .map(|ss| gear.calc_interception_power(ss))
                    .unwrap_or_default()
            })
            .sum::<i32>();

        let recon_mod = self
            .gears
            .values()
            .map(|gear| {
                let los = gear.los;

                match gear.gear_type {
                    GearType::CbRecon => match los {
                        los if los <= 7 => 1.2,
                        8 => 1.25,
                        _ => 1.3,
                    },
                    GearType::LbRecon => 1.18,
                    GearType::ReconSeaplane | GearType::LargeFlyingBoat => match los {
                        los if los <= 7 => 1.1,
                        8 => 1.13,
                        _ => 1.16,
                    },
                    _ => 1.0,
                }
            })
            .fold(1.0, f64::max);

        (total as f64 * recon_mod).floor() as i32
    }

    pub fn radius(&self) -> u8 {
        let min_radius = self
            .gears
            .values()
            .map(|gear| gear.radius)
            .min()
            .unwrap_or_default();

        let recon_max_radius = self
            .gears
            .values()
            .filter(|gear| gear.has_attr(GearAttr::Recon))
            .map(|gear| gear.radius)
            .max()
            .unwrap_or_default();

        if recon_max_radius > 0 {
            let bonus = ((recon_max_radius - min_radius) as f64)
                .sqrt()
                .min(3.0)
                .round() as u8;

            min_radius + bonus
        } else {
            min_radius
        }
    }
}
