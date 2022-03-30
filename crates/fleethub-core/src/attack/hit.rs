use rand::Rng;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HitType {
    Miss,
    Normal,
    Critical,
}

#[derive(Debug, Default, Serialize, Deserialize, Tsify)]
pub struct HitRateParams {
    pub accuracy_term: f64,
    pub evasion_term: f64,
    pub target_morale_mod: f64,
    pub critical_rate_constant: f64,
    pub critical_percentage_bonus: f64,
    pub hit_percentage_bonus: f64,
}

#[derive(Debug, Default, Serialize, Deserialize, Tsify)]
pub struct HitRate {
    pub total: f64,
    pub normal: f64,
    pub critical: f64,
}

impl HitRate {
    pub fn gen<R: Rng + ?Sized>(&self, rng: &mut R) -> HitType {
        let x = rng.gen_range(0.0..1.0);

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
    fn calc_basis(&self) -> f64 {
        let value = (self.accuracy_term - self.evasion_term) * self.target_morale_mod;
        value.clamp(10.0, 96.0)
    }

    pub fn calc(&self) -> HitRate {
        let basis = self.calc_basis();

        let critical_percent =
            (basis.sqrt() * self.critical_rate_constant + 1.0 + self.critical_percentage_bonus)
                .floor();

        let hit_percent = (basis + 1.0 + self.hit_percentage_bonus)
            .floor()
            .max(critical_percent);

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
    use super::HitRateParams;

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

        assert_eq!(min.calc_basis(), 10.0);
        assert_eq!(max.calc_basis(), 96.0);
        assert_eq!(max.calc().total, 1.0);

        let hit_rate = HitRateParams {
            accuracy_term: 60.0,
            evasion_term: 10.0,
            target_morale_mod: 1.2,
            critical_rate_constant: 1.3,
            critical_percentage_bonus: 12.0,
            hit_percentage_bonus: 9.0,
        }
        .calc();

        assert_eq!(hit_rate.total, 0.7);
        assert_eq!(hit_rate.critical, 0.23);
        assert_eq!(hit_rate.normal, 0.7 - 0.23)
    }
}
