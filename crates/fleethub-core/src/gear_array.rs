use crate::{
    gear::Gear,
    types::{GearAttr, GearType},
    utils::OptionalArray,
};

pub type GearArray = OptionalArray<Gear, 6>;

impl GearArray {
    pub const EXSLOT_INDEX: usize = Self::CAPACITY - 1;

    pub fn without_ex(&self) -> impl Iterator<Item = (usize, &Gear)> {
        self.iter().filter(|(i, _)| *i < Self::EXSLOT_INDEX)
    }

    pub fn has(&self, id: u16) -> bool {
        self.has_by(|g| g.gear_id == id)
    }

    pub fn count(&self, id: u16) -> usize {
        self.count_by(|g| g.gear_id == id)
    }

    pub fn has_attr(&self, attr: GearAttr) -> bool {
        self.has_by(|g| g.has_attr(attr))
    }

    pub fn count_attr(&self, attr: GearAttr) -> usize {
        self.count_by(|g| g.has_attr(attr))
    }

    pub fn has_type(&self, gear_type: GearType) -> bool {
        self.has_by(|g| g.gear_type == gear_type)
    }

    pub fn count_type(&self, gear_type: GearType) -> usize {
        self.count_by(|g| g.gear_type == gear_type)
    }

    pub fn get_by_gear_key(&self, key: &str) -> Option<&Gear> {
        gear_key_to_index(key).and_then(|index| self.get(index))
    }
}

pub fn gear_key_to_index(key: &str) -> Option<usize> {
    Some(match key {
        "g1" => 0,
        "g2" => 1,
        "g3" => 2,
        "g4" => 3,
        "g5" => 4,
        "gx" => GearArray::EXSLOT_INDEX,
        _ => return None,
    })
}

pub fn into_gear_key(index: usize) -> Option<&'static str> {
    Some(match index {
        0 => "g1",
        1 => "g2",
        2 => "g3",
        3 => "g4",
        4 => "g5",
        GearArray::EXSLOT_INDEX => "gx",
        _ => return None,
    })
}
