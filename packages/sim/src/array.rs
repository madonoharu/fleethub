use std::{fmt::Debug, iter::Sum};

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

    pub fn sum_by<U: Sum, F: FnMut(&T) -> U>(&self, cb: F) -> U {
        self.values().map(cb).sum()
    }
}

const GEAR_ARRAY_LEN: usize = 6;
const EXSLOT_INDEX: usize = GEAR_ARRAY_LEN - 1;

pub type GearArray = OptionalArray<Gear, GEAR_ARRAY_LEN>;

impl GearArray {
    pub fn iter_without_ex(&self) -> impl Iterator<Item = (usize, &Gear)> {
        self.iter().filter(|(i, _)| *i < EXSLOT_INDEX)
    }
}

const SLOT_SIZE_ARRAY_LEN: usize = 5;
pub type SlotSizeArray = ArrayVec<[Option<i32>; SLOT_SIZE_ARRAY_LEN]>;

const SHIP_ARRAY_LEN: usize = 7;
pub type ShipArray = OptionalArray<Ship, SHIP_ARRAY_LEN>;

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
