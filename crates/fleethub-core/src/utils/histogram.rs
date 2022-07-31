use std::{
    fmt::Debug,
    hash::Hash,
    iter::{FromIterator, Sum},
    ops::{Add, AddAssign, Deref, DerefMut, Div, Mul},
};

use hashbrown::hash_map::{HashMap, IntoIter};
use num_traits::Num;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
export type Histogram<K, V> = Partial<Record<K, V>>;
"#;

#[derive(Default, Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Histogram<K, V>
where
    K: Eq + Hash,
{
    map: HashMap<K, V>,
}

impl<K, V> Histogram<K, V>
where
    K: Eq + Hash,
{
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }

    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            map: HashMap::with_capacity(capacity),
        }
    }
}

impl<K, V> Debug for Histogram<K, V>
where
    K: Eq + Hash + Debug,
    V: Debug,
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.map.fmt(f)
    }
}

impl<K, V> PartialEq for Histogram<K, V>
where
    K: Eq + Hash,
    HashMap<K, V>: PartialEq,
{
    fn eq(&self, other: &Self) -> bool {
        self.map == other.map
    }
}

impl<K, V> Deref for Histogram<K, V>
where
    K: Eq + Hash,
{
    type Target = HashMap<K, V>;

    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.map
    }
}

impl<K, V> DerefMut for Histogram<K, V>
where
    K: Eq + Hash,
{
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.map
    }
}

impl<K, V> AddAssign<(K, V)> for Histogram<K, V>
where
    K: Eq + Hash,
    V: Num + Copy,
{
    fn add_assign(&mut self, (key, value): (K, V)) {
        if !value.is_zero() {
            let entry = self.entry(key).or_insert_with(V::zero);
            *entry = *entry + value;
        }
    }
}

impl<K, V> AddAssign for Histogram<K, V>
where
    K: Eq + Hash,
    V: Num + Copy,
{
    fn add_assign(&mut self, rhs: Self) {
        for kv in rhs.map.into_iter() {
            *self += kv;
        }
    }
}

impl<K, V> Add for Histogram<K, V>
where
    K: Eq + Hash,
    V: Num + Copy,
{
    type Output = Self;

    fn add(mut self, rhs: Self) -> Self::Output {
        self += rhs;
        self
    }
}

impl<K, V> Mul<V> for Histogram<K, V>
where
    K: Eq + Hash,
    V: Num + Copy,
{
    type Output = Histogram<K, V>;

    fn mul(mut self, rhs: V) -> Self::Output {
        if rhs.is_zero() {
            self.clear();
        } else {
            for v in self.values_mut() {
                *v = *v * rhs;
            }
        }

        self
    }
}

impl<K, V> Div<V> for Histogram<K, V>
where
    K: Eq + Hash,
    V: Num + Copy,
{
    type Output = Histogram<K, V>;

    fn div(self, rhs: V) -> Self::Output {
        self.into_iter()
            .map(|(k, v)| (k, v / rhs))
            .collect::<HashMap<K, V>>()
            .into()
    }
}

impl<K, V> Sum for Histogram<K, V>
where
    K: Eq + Hash,
    V: Num + Copy,
{
    fn sum<I: Iterator<Item = Self>>(iter: I) -> Self {
        iter.fold(Self::new(), |a, b| a + b)
    }
}

impl<K, V> IntoIterator for Histogram<K, V>
where
    K: Eq + Hash,
{
    type Item = (K, V);
    type IntoIter = IntoIter<K, V>;

    #[inline]
    fn into_iter(self) -> Self::IntoIter {
        self.map.into_iter()
    }
}

impl<K, V> FromIterator<(K, V)> for Histogram<K, V>
where
    K: Eq + Hash,
    V: Num,
    Self: AddAssign<(K, V)>,
{
    #[inline]
    fn from_iter<T: IntoIterator<Item = (K, V)>>(iter: T) -> Self {
        iter.into_iter().fold(Self::new(), |mut hist, kv| {
            hist += kv;
            hist
        })
    }
}

impl<K, V, T> From<T> for Histogram<K, V>
where
    K: Eq + Hash,
    T: Into<HashMap<K, V>>,
{
    #[inline]
    fn from(value: T) -> Self {
        Self { map: value.into() }
    }
}

impl<K, V> From<Histogram<K, V>> for std::collections::BTreeMap<K, V>
where
    K: Eq + Hash + Ord,
{
    #[inline]
    fn from(hist: Histogram<K, V>) -> Self {
        hist.into_iter().collect()
    }
}

#[macro_export]
macro_rules! histogram {
    (@single $($x:tt)*) => (());
    (@count $($rest:expr),*) => (<[()]>::len(&[$(histogram!(@single $rest)),*]));

    ($($key:expr => $value:expr,)+) => { histogram!($($key => $value),+) };
    ($($key:expr => $value:expr),*) => {
        {
            let _cap = histogram!(@count $($key),*);
            let mut hist = $crate::utils::Histogram::with_capacity(_cap);
            $(
                let _ = hist.insert($key, $value);
            )*
            hist
        }
    };
}

#[cfg(test)]
mod test {
    use super::*;

    #[allow(clippy::erasing_op)]
    #[test]
    fn test_histogram() {
        let hist0: Histogram<&str, f64> = [("a", 2.0), ("b", 3.0)].into();
        let hist1: Histogram<&str, f64> = [("b", 4.0), ("c", 5.0)].into();

        assert_eq!(
            hist0.clone() + hist1,
            [("a", 2.0), ("b", 7.0), ("c", 5.0)].into()
        );
        assert_eq!(hist0 * 3.0, [("a", 6.0), ("b", 9.0)].into());

        let mut hist2: Histogram<&str, i32> = [("x", 1), ("y", 2)].into();
        let hist3: Histogram<&str, i32> = [("x", 3), ("y", 4)].into();
        hist2 += hist3;

        assert_eq!(hist2, [("x", 4), ("y", 6)].into());
        assert!((hist2 * 0).is_empty());
    }
}
