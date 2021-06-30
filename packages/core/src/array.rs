use std::{fmt::Debug, iter::Sum, ops::Index, slice::SliceIndex, usize};

use arrayvec::ArrayVec;

use crate::{gear::Gear, ship::Ship};

#[derive(Debug, Clone)]
pub struct OptionalArray<T: Debug + Default + Clone, const N: usize>(pub [Option<T>; N]);

macro_rules! impl_default {
    ($($n: expr),*) => {
        $(
            impl<T: Debug + Default + Clone> Default for OptionalArray<T, $n> {
                fn default() -> Self {
                    let array: [Option<T>; $n] = Default::default();
                    Self(array)
                }
            }
        )*
    }
}

impl_default!(6, 7);

impl<T, Idx, const N: usize> Index<Idx> for OptionalArray<T, N>
where
    T: Debug + Default + Clone,
    Idx: SliceIndex<[Option<T>]>,
{
    type Output = Idx::Output;

    fn index(&self, index: Idx) -> &Self::Output {
        &self.0[index]
    }
}

impl<T: Debug + Default + Clone, const N: usize> OptionalArray<T, N> {
    pub fn new(inner: [Option<T>; N]) -> Self {
        Self(inner)
    }

    pub fn iter(&self) -> impl Iterator<Item = (usize, &T)> {
        self.0
            .iter()
            .enumerate()
            .filter_map(|(index, item)| item.as_ref().map(|value| (index, value)))
    }

    pub fn values(&self) -> impl Iterator<Item = &T> {
        self.iter().map(|(_, item)| item)
    }

    pub fn put(&mut self, index: usize, value: T) {
        self.0[index] = Some(value)
    }

    pub fn get(&self, index: usize) -> Option<&T> {
        self.0.get(index)?.as_ref()
    }

    pub fn sum_by<U: Sum, F: FnMut(&T) -> U>(&self, cb: F) -> U {
        self.values().map(cb).sum()
    }

    pub fn has_by<F: FnMut(&T) -> bool>(&self, cb: F) -> bool {
        self.values().any(cb)
    }

    pub fn count_by<F: FnMut(&&T) -> bool>(&self, cb: F) -> usize {
        self.values().filter(cb).count()
    }
}

const GEAR_ARRAY_LEN: usize = 6;
const EXSLOT_INDEX: usize = GEAR_ARRAY_LEN - 1;

pub type GearArray = OptionalArray<Gear, GEAR_ARRAY_LEN>;

impl GearArray {
    pub fn without_ex(&self) -> impl Iterator<Item = (usize, &Gear)> {
        self.iter().filter(|(i, _)| *i < EXSLOT_INDEX)
    }

    pub fn has(&self, id: i32) -> bool {
        self.has_by(|g| g.gear_id == id)
    }

    pub fn count(&self, id: i32) -> usize {
        self.count_by(|g| g.gear_id == id)
    }

    pub fn get_by_gear_key(&self, key: &str) -> Option<&Gear> {
        match key {
            "g1" => self.get(0),
            "g2" => self.get(1),
            "g3" => self.get(2),
            "g4" => self.get(3),
            "g5" => self.get(4),
            "gx" => self.get(5),
            _ => None,
        }
    }
}

const SLOT_SIZE_ARRAY_LEN: usize = 5;
pub type SlotSizeArray = ArrayVec<Option<i32>, SLOT_SIZE_ARRAY_LEN>;

const SHIP_ARRAY_LEN: usize = 7;
pub type ShipArray = OptionalArray<Ship, SHIP_ARRAY_LEN>;

impl ShipArray {
    pub fn get_by_ship_key(&self, key: &str) -> Option<&Ship> {
        match key {
            "s1" => self.get(0),
            "s2" => self.get(1),
            "s3" => self.get(2),
            "s4" => self.get(3),
            "s5" => self.get(4),
            "s6" => self.get(5),
            "s7" => self.get(6),
            _ => None,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_optional_array() {
        let mut arr = OptionalArray::<i32, 6>::default();

        assert_eq!(arr.0, [None, None, None, None, None, None]);

        arr.put(1, 5);
        assert_eq!(arr.0[1], Some(5));

        arr.put(2, 6);
        assert_eq!(arr.sum_by(|&v| v), 5 + 6);
    }
}
