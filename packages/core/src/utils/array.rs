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

#[derive(Debug, Clone, Default)]
pub struct OptionalArray<T: Debug + Default + Clone, const N: usize>(pub ArrayVec<Option<T>, N>);

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

    pub fn new() -> Self {
        Self(ArrayVec::new())
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

    pub fn push(&mut self, value: T) {
        self.0.push(Some(value))
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

impl<T, const CAP: usize> std::iter::FromIterator<Option<T>> for OptionalArray<T, CAP>
where
    T: Debug + Default + Clone,
{
    fn from_iter<I: IntoIterator<Item = Option<T>>>(iter: I) -> Self {
        let mut array = ArrayVec::new();
        array.extend(iter);
        Self(array)
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

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_optional_array() {
        let mut arr = OptionalArray::<i32, 6>::default();

        assert_eq!(arr.get(0), None);

        arr.push(5);
        assert_eq!(arr.get(0), Some(&5));

        arr.push(6);
        assert_eq!(arr.sum_by(|&v| v), 5 + 6);
    }
}
