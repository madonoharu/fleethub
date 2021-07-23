use std::{
    fmt::Debug,
    iter::{FromIterator, Sum},
    ops::{Deref, DerefMut, Index},
    slice::SliceIndex,
    usize,
};

use arrayvec::ArrayVec;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    gear::Gear,
    ship::Ship,
    types::{GearAttr, GearType},
};

const GEAR_ARRAY_CAPACITY: usize = 6;

const SLOT_SIZE_ARRAY_CAPACITY: usize = 5;

const SHIP_ARRAY_CAPACITY: usize = 7;

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

impl_default!(GEAR_ARRAY_CAPACITY, SHIP_ARRAY_CAPACITY);

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
    pub const CAPACITY: usize = N;

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
        self.0.iter().filter_map(|item| item.as_ref())
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

    pub fn count_by<F: FnMut(&T) -> bool>(&self, mut cb: F) -> usize {
        self.values().filter(|item| cb(item)).count()
    }
}

pub type GearArray = OptionalArray<Gear, GEAR_ARRAY_CAPACITY>;

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

pub type ShipArray = OptionalArray<Ship, SHIP_ARRAY_CAPACITY>;

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

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct MyArrayVec<T, const CAP: usize>(ArrayVec<T, CAP>);

impl<T, const CAP: usize> Deref for MyArrayVec<T, CAP> {
    type Target = ArrayVec<T, CAP>;
    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<T, const CAP: usize> DerefMut for MyArrayVec<T, CAP> {
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl<T, const CAP: usize> FromIterator<T> for MyArrayVec<T, CAP> {
    fn from_iter<I: IntoIterator<Item = T>>(iter: I) -> Self {
        MyArrayVec(ArrayVec::from_iter(iter))
    }
}

impl<T, const CAP: usize> TS for MyArrayVec<T, CAP>
where
    T: TS,
{
    fn name() -> String {
        Vec::<T>::name()
    }

    fn inline(indent: usize) -> String {
        Vec::<T>::inline(indent)
    }

    fn dependencies() -> Vec<(std::any::TypeId, String)> {
        Vec::<T>::dependencies()
    }

    fn transparent() -> bool {
        Vec::<T>::transparent()
    }
}

pub type SlotSizeArray = MyArrayVec<Option<i32>, SLOT_SIZE_ARRAY_CAPACITY>;

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
