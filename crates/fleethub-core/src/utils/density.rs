use std::hash::Hash;

use super::Histogram;
pub trait Density<K>
where
    K: Eq + Hash,
{
    fn counts(self) -> Histogram<K, usize>;

    fn density(self) -> Histogram<K, f64>
    where
        Self: Sized,
    {
        let hist = self
            .counts()
            .into_iter()
            .map(|(k, v)| (k, v as f64))
            .collect::<Histogram<K, f64>>();

        let total: f64 = hist.values().sum();
        hist / total
    }
}

impl<K, I> Density<K> for I
where
    K: Eq + Hash,
    I: IntoIterator<Item = K>,
{
    fn counts(self) -> Histogram<K, usize> {
        let mut counts = Histogram::new();
        self.into_iter()
            .for_each(|item| *counts.entry(item).or_default() += 1);
        counts
    }
}

#[cfg(test)]
mod test {
    use crate::histogram;

    use super::*;

    #[test]
    fn test_density() {
        let empty_vec = Vec::<u8>::new();
        assert!(empty_vec.clone().counts().is_empty());
        assert!(empty_vec.density().is_empty());

        let chars = "cheeses".chars();

        assert_eq!(
            chars.clone().counts(),
            histogram! {
              'c' => 1,
              'h' => 1,
              'e' => 3,
              's' => 2,
            }
        );

        assert_eq!(
            chars.density(),
            histogram! {
              'c' => 1.0 / 7.0,
              'h' => 1.0 / 7.0,
              'e' => 3.0 / 7.0,
              's' => 2.0 / 7.0,
            }
        );
    }
}
