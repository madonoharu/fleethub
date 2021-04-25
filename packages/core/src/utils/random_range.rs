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

#[cfg(test)]
mod test {
    use super::*;
    use rand_xoshiro::Xoshiro256PlusPlus;

    struct TestStruct {
        base: i32,
    }

    impl RandomRange<i32> for TestStruct {
        fn gen(&self, random_value: i32) -> i32 {
            random_value + 1
        }

        fn range(&self) -> Range<i32> {
            0..self.base
        }
    }

    #[test]
    fn test_random_range() {
        use rand::prelude::*;

        let obj = TestStruct { base: 4 };
        let mut rng = Xoshiro256PlusPlus::seed_from_u64(0);
        assert_eq!(obj.to_vec(), vec![1, 2, 3, 4]);
        assert_eq!(obj.choose(&mut rng), 2);
    }
}
