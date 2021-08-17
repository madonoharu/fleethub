use wasm_bindgen::prelude::*;

use crate::{gear::Gear, gear_array::GearArray, types::SlotSizeArray};

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct AirSquadron {
    #[wasm_bindgen(skip)]
    pub xxh3: u64,
    #[wasm_bindgen(skip)]
    pub id: String,

    #[wasm_bindgen(skip)]
    pub gears: GearArray,
    #[wasm_bindgen(skip)]
    pub slots: SlotSizeArray,
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

    pub fn get_gear(&self, key: &str) -> Option<Gear> {
        self.gears.get_by_gear_key(key).cloned()
    }

    pub fn get_slot_size(&self, index: usize) -> Result<u8, JsValue> {
        self.slots
            .get(index)
            .map(|v| v.unwrap_or(18))
            .ok_or_else(|| JsValue::from_str("get_air_squadron() argument must be 1 ~ 4"))
    }
}
