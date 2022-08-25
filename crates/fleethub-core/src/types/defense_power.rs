use rand::prelude::*;

pub struct DefensePower {
    // 最小1.0
    basic_defense_power: f64,
}

impl DefensePower {
    pub fn new(basic_defense_power: f64) -> Self {
        debug_assert!(basic_defense_power >= 1.0);

        Self {
            basic_defense_power,
        }
    }

    pub fn iter(&self) -> impl DoubleEndedIterator<Item = f64> {
        let min = self.basic_defense_power * 0.7;
        let end = self.basic_defense_power as usize;
        (0..end).map(move |v| min + v as f64 * 0.6)
    }

    pub fn to_vec(&self) -> Vec<f64> {
        self.iter().collect()
    }

    pub fn choose<R: Rng + ?Sized>(&self, rng: &mut R) -> f64 {
        self.iter().choose(rng).unwrap_or_default()
    }

    pub fn min(&self) -> f64 {
        self.iter().next().unwrap_or_default()
    }

    pub fn max(&self) -> f64 {
        self.iter().next_back().unwrap_or_default()
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_defense_power() {
        let d1 = DefensePower::new(1.0);
        assert_eq!(d1.to_vec(), vec![0.7]);
        assert_eq!(d1.min(), 0.7);
        assert_eq!(d1.max(), 0.7);

        let d10 = DefensePower::new(10.0);
        assert_eq!(
            d10.to_vec(),
            vec![
                7.0,
                7.6,
                8.2,
                8.8,
                9.4,
                10.0,
                10.6,
                11.2,
                11.8,
                12.399999999999999
            ]
        );
        assert_eq!(d10.min(), 7.0);
        assert_eq!(d10.max(), 12.399999999999999);
        assert_eq!(d10.choose(&mut crate::test::rng(0)), 9.4);
    }
}
