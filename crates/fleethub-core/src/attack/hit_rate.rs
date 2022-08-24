use enumset::{EnumSet, EnumSetType};
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[allow(clippy::derive_hash_xor_eq)]
#[derive(Debug, Hash, EnumSetType)]
pub enum HitType {
    Miss,
    Normal,
    Critical,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
pub struct HitRateParams {
    pub accuracy_term: f64,
    pub evasion_term: f64,
    pub target_morale_mod: f64,
    pub critical_rate_constant: f64,
    pub critical_percentage_bonus: f64,
    pub hit_percentage_bonus: f64,
}

#[derive(Debug, Default, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct HitRate {
    pub normal: f64,
    pub critical: f64,
    pub total: f64,
}

impl HitRate {
    pub fn iter(&self) -> impl Iterator<Item = (HitType, f64)> + '_ {
        EnumSet::<HitType>::all().into_iter().map(|hit_type| {
            let rate = match hit_type {
                HitType::Miss => 1.0 - self.total,
                HitType::Normal => self.normal,
                HitType::Critical => self.critical,
            };

            (hit_type, rate)
        })
    }
}

impl Distribution<HitType> for HitRate {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> HitType {
        let x: f64 = rng.gen();

        if x < self.critical {
            HitType::Critical
        } else if x < self.total {
            HitType::Normal
        } else {
            HitType::Miss
        }
    }
}

impl HitRateParams {
    /// キャップ後命中率
    fn calc_capped(&self) -> f64 {
        let value = (self.accuracy_term - self.evasion_term) * self.target_morale_mod;
        value.clamp(10.0, 96.0)
    }

    pub fn calc(&self) -> HitRate {
        let capped = self.calc_capped();
        let postcap = capped + self.hit_percentage_bonus;

        let critical_percent =
            (postcap.sqrt() * self.critical_rate_constant + self.critical_percentage_bonus + 1.0)
                .floor();

        let hit_percent = (postcap + 1.0).floor().max(critical_percent);

        let total = (hit_percent / 100.0).min(1.0);
        let critical = (critical_percent / 100.0).min(1.0);
        let normal = total - critical;

        HitRate {
            total,
            normal,
            critical,
        }
    }
}

#[cfg(test)]
mod test {
    use itertools::Itertools;

    use super::*;

    #[test]
    fn test_hit_rate() {
        let min = HitRateParams {
            accuracy_term: 0.0,
            evasion_term: 0.0,
            target_morale_mod: 1.0,
            critical_rate_constant: 1.0,
            critical_percentage_bonus: 0.0,
            hit_percentage_bonus: 0.0,
        };

        let max = HitRateParams {
            accuracy_term: 100.0,
            hit_percentage_bonus: 10.0,
            ..min
        };

        assert_eq!(min.calc_capped(), 10.0);
        assert_eq!(
            min.calc(),
            HitRate {
                normal: 0.07,
                critical: 0.04,
                total: 0.11
            }
        );

        assert_eq!(max.calc_capped(), 96.0);
        assert_eq!(
            max.calc(),
            HitRate {
                normal: 0.89,
                critical: 0.11,
                total: 1.0
            }
        );

        let hit_rate = HitRateParams {
            accuracy_term: 60.0,
            evasion_term: 10.0,
            target_morale_mod: 1.2,
            critical_rate_constant: 1.3,
            critical_percentage_bonus: 12.0,
            hit_percentage_bonus: 9.0,
        }
        .calc();

        assert_eq!(
            hit_rate,
            HitRate {
                normal: 0.47,
                critical: 0.23,
                total: 0.7
            }
        );

        let counts = (&hit_rate)
            .sample_iter(&mut crate::test::rng(0))
            .take(1000)
            .counts();

        assert_eq!(counts[&HitType::Miss], 302);
        assert_eq!(counts[&HitType::Normal], 479);
        assert_eq!(counts[&HitType::Critical], 219);
    }
}
