use std::ops::Range;

use rand::prelude::*;

pub trait RandomRange<T> {
    fn gen(&self, random_value: i32) -> T;

    fn range(&self) -> Range<i32>;

    fn choose<R: Rng + ?Sized>(&self, rng: &mut R) -> T {
        let random_value = self.range().choose(rng).unwrap_or_default();
        self.gen(random_value)
    }

    fn to_vec(&self) -> Vec<T> {
        self.range().map(|v| self.gen(v)).collect()
    }
}
