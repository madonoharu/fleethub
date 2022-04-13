use std::{
    collections::{hash_map, HashMap},
    hash::Hash,
    iter::{FromIterator, Sum},
    ops::{Add, AddAssign, Mul},
};

use counter::Counter;
use num_traits::Zero;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
export type NumMap<K, V> = Partial<Record<K, V>>;
"#;

#[derive(Debug, Default, Clone)]
pub struct NumMap<K, V> {
    map: HashMap<K, V>,
    zero: V,
}

impl<K, V> PartialEq for NumMap<K, V>
where
    HashMap<K, V>: PartialEq,
{
    fn eq(&self, other: &Self) -> bool {
        self.map == other.map
    }
}

#[allow(dead_code)]
impl<K, V> NumMap<K, V> {
    pub fn new() -> Self
    where
        V: Zero,
    {
        Self {
            map: HashMap::new(),
            zero: V::zero(),
        }
    }

    pub fn get(&self, k: &K) -> &V
    where
        K: Hash + Eq,
    {
        self.map.get(k).unwrap_or(&self.zero)
    }

    pub fn insert(&mut self, k: K, v: V) -> Option<V>
    where
        K: Eq + Hash,
    {
        self.map.insert(k, v)
    }

    pub fn entry(&mut self, k: K) -> hash_map::Entry<K, V>
    where
        K: Eq + Hash,
    {
        self.map.entry(k)
    }

    pub fn iter(&self) -> hash_map::Iter<K, V> {
        self.map.iter()
    }

    pub fn values(&self) -> hash_map::Values<K, V> {
        self.map.values()
    }

    pub fn is_empty(&self) -> bool {
        self.map.is_empty()
    }

    pub fn into_vec(self) -> Vec<(K, V)>
    where
        Self: IntoIterator<Item = (K, V)>,
    {
        self.into_iter().collect()
    }
}

impl<K, V> From<HashMap<K, V>> for NumMap<K, V>
where
    V: Zero,
{
    fn from(map: HashMap<K, V>) -> Self {
        Self {
            map,
            zero: V::zero(),
        }
    }
}

impl<K, V> FromIterator<(K, V)> for NumMap<K, V>
where
    Self: AddAssign<(K, V)>,
    V: Zero,
{
    fn from_iter<T: IntoIterator<Item = (K, V)>>(iter: T) -> Self {
        let mut result = Self::new();
        for kv in iter {
            result += kv;
        }
        result
    }
}

impl<K, V> IntoIterator for NumMap<K, V> {
    type Item = (K, V);
    type IntoIter = hash_map::IntoIter<K, V>;

    fn into_iter(self) -> Self::IntoIter {
        self.map.into_iter()
    }
}

impl<K, V, const N: usize> From<[(K, V); N]> for NumMap<K, V>
where
    Self: FromIterator<(K, V)>,
{
    fn from(array: [(K, V); N]) -> Self {
        array.into_iter().collect()
    }
}

impl<K> From<Counter<K>> for NumMap<K, usize>
where
    K: Eq + Hash,
{
    fn from(counter: Counter<K>) -> Self {
        counter.into_map().into()
    }
}

impl<K, V> AddAssign<(K, V)> for NumMap<K, V>
where
    K: Eq + Hash,
    V: AddAssign + Zero,
{
    fn add_assign(&mut self, (key, value): (K, V)) {
        let entry = self.entry(key).or_insert_with(V::zero);
        *entry += value;
    }
}

impl<K, V> AddAssign for NumMap<K, V>
where
    K: Eq + Hash,
    V: AddAssign + Zero,
{
    fn add_assign(&mut self, rhs: Self) {
        for item in rhs.map.into_iter() {
            self.add_assign(item)
        }
    }
}

impl<K, V> Add for NumMap<K, V>
where
    K: Eq + Hash,
    V: AddAssign + Zero,
{
    type Output = Self;

    fn add(mut self, rhs: Self) -> Self::Output {
        self += rhs;
        self
    }
}

impl<K, V> Mul<V> for NumMap<K, V>
where
    K: Eq + Hash,
    V: Clone + Mul<Output = V> + Zero,
{
    type Output = NumMap<K, V>;

    fn mul(self, rhs: V) -> Self::Output {
        self.into_iter()
            .map(|(k, v)| (k, v * rhs.clone()))
            .collect::<HashMap<K, V>>()
            .into()
    }
}

impl<K, V> Sum for NumMap<K, V>
where
    K: Hash + Eq,
    V: Zero + AddAssign,
{
    fn sum<I>(iter: I) -> Self
    where
        I: Iterator<Item = Self>,
    {
        iter.fold(Self::new(), |a, b| a + b)
    }
}

impl<K, V> Serialize for NumMap<K, V>
where
    HashMap<K, V>: Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        self.map.serialize(serializer)
    }
}

impl<'de, K, V> Deserialize<'de> for NumMap<K, V>
where
    HashMap<K, V>: Deserialize<'de>,
    V: Zero,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        HashMap::<K, V>::deserialize(deserializer).map(|map| map.into())
    }
}

#[cfg(test)]
mod test {
    use super::NumMap;

    #[test]
    fn test_num_map() {
        let map0: NumMap<&str, f64> = [("a", 2.), ("b", 3.)].into();
        let map1: NumMap<&str, f64> = [("b", 4.), ("c", 5.)].into();

        assert_eq!(
            map0.clone() + map1,
            [("a", 2.), ("b", 7.), ("c", 5.)].into()
        );
        assert_eq!(map0 * 3., [("a", 6.), ("b", 9.)].into());

        let mut map2: NumMap<&str, i32> = [("x", 1), ("y", 2)].into();
        let map3: NumMap<&str, i32> = [("x", 3), ("y", 4)].into();
        map2 += map3;

        assert_eq!(map2, [("x", 4), ("y", 6)].into());
    }
}
