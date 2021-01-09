use crate::gear::Gear;
use std::{
    iter::Sum,
    ops::{Index, IndexMut},
};

const GEAR_ARRAY_LEN: usize = 6;
const EXSLOT_INDEX: usize = GEAR_ARRAY_LEN - 1;

#[derive(Debug, Default, Clone)]
pub struct GearArray(pub [Option<Gear>; GEAR_ARRAY_LEN]);

impl GearArray {
    pub fn iter(&self) -> impl Iterator<Item = (usize, &Gear)> {
        self.0.iter().enumerate().filter_map(|(i, g)| match g {
            Some(g) => Some((i, g)),
            None => None,
        })
    }

    pub fn iter_without_ex(&self) -> impl Iterator<Item = (usize, &Gear)> {
        self.iter().filter(|(i, _)| *i < EXSLOT_INDEX)
    }

    pub fn values(&self) -> impl Iterator<Item = &Gear> {
        self.iter().map(|(_, g)| g)
    }

    pub fn sum_by<U: Sum, F: FnMut(&Gear) -> U>(&self, cb: F) -> U {
        self.values().map(cb).sum()
    }

    pub fn put(&mut self, index: usize, g: Gear) {
        self[index] = Some(g)
    }
}

impl Index<usize> for GearArray {
    type Output = Option<Gear>;

    fn index(&self, index: usize) -> &Self::Output {
        &self.0[index]
    }
}

impl IndexMut<usize> for GearArray {
    fn index_mut(&mut self, index: usize) -> &mut Self::Output {
        &mut self.0[index]
    }
}
