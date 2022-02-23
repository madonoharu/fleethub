use std::{fmt::Debug, iter::Sum, ops::Index, slice::SliceIndex, usize};

use arrayvec::ArrayVec;

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

    pub fn iter_mut(&mut self) -> impl Iterator<Item = (usize, &mut T)> {
        self.0
            .iter_mut()
            .enumerate()
            .filter_map(|(index, item)| item.as_mut().map(|value| (index, value)))
    }

    pub fn values(&self) -> impl Iterator<Item = &T> {
        self.0.iter().filter_map(|item| item.as_ref())
    }

    pub fn values_mut(&mut self) -> impl Iterator<Item = &mut T> {
        self.0.iter_mut().filter_map(|item| item.as_mut())
    }

    pub fn push(&mut self, value: T) {
        self.0.push(Some(value))
    }

    pub fn get(&self, index: usize) -> Option<&T> {
        self.0.get(index)?.as_ref()
    }

    pub fn get_mut(&mut self, index: usize) -> Option<&mut T> {
        self.0.get_mut(index)?.as_mut()
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
