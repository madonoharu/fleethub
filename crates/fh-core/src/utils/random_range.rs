use std::hash::Hash;
use std::ops::Range;

use rand::prelude::*;

use super::{NumMap, ToDistribution};

pub trait RandomRange<Idx, T>
where
    Idx: Default,
    Range<Idx>: DoubleEndedIterator<Item = Idx>,
{
    fn gen(&self, random_value: Idx) -> T;

    fn range(&self) -> Range<Idx>;

    fn start(&self) -> T {
        self.gen(self.range().start)
    }

    fn last(&self) -> Option<T> {
        Some(self.gen(self.range().next_back()?))
    }

    fn choose<R: Rng + ?Sized>(&self, rng: &mut R) -> T {
        let random_value = self.range().choose(rng).unwrap_or_default();
        self.gen(random_value)
    }

    fn to_vec(&self) -> Vec<T> {
        self.range().map(|v| self.gen(v)).collect()
    }
}

struct RandomRangeIterator<Idx, T, F>
where
    Range<Idx>: Iterator<Item = Idx>,
    F: FnMut(Idx) -> T,
{
    range: Range<Idx>,
    f: F,
}

impl<Idx, T, F> Iterator for RandomRangeIterator<Idx, T, F>
where
    Range<Idx>: Iterator<Item = Idx>,
    F: FnMut(Idx) -> T,
{
    type Item = T;

    fn next(&mut self) -> Option<Self::Item> {
        let random_value = self.range.next()?;
        Some((self.f)(random_value))
    }
}

pub trait RandomRangeToDistribution<T: Hash + Eq> {
    fn to_distribution(&self) -> NumMap<T, f64>;
}

impl<T, R> RandomRangeToDistribution<T> for R
where
    T: Hash + Eq,
    R: RandomRange<u16, T>,
{
    fn to_distribution(&self) -> NumMap<T, f64> {
        self.range().map(|v| self.gen(v)).to_distribution()
    }
}

#[cfg(test)]
mod test {
    use super::*;

    struct TestStruct {
        base: i32,
    }

    impl RandomRange<i32, i32> for TestStruct {
        fn gen(&self, random_value: i32) -> i32 {
            random_value + 1
        }

        fn range(&self) -> Range<i32> {
            0..self.base
        }
    }

    #[test]
    fn test_random_range() {
        let obj = TestStruct { base: 4 };
        let mut rng = SmallRng::seed_from_u64(0);
        assert_eq!(obj.to_vec(), vec![1, 2, 3, 4]);
        assert_eq!(obj.choose(&mut rng), 3);
    }
}
