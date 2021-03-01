use std::hash::Hash;

use counter::Counter;

use crate::utils::{NumMap, RandomRange};

pub trait ToDistribution<T: Hash + Eq> {
    fn to_distribution(self) -> NumMap<T, f64>;
}

impl<I, T> ToDistribution<T> for I
where
    I: Iterator<Item = T>,
    T: Hash + Eq,
{
    fn to_distribution(self) -> NumMap<T, f64> {
        let counter: Counter<T> = self.collect();
        let p = counter.values().sum::<usize>();

        counter
            .into_map()
            .into_iter()
            .map(|(v, count)| (v, count as f64 / p as f64))
            .collect()
    }
}
