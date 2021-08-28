use serde::Serialize;
use ts_rs::TS;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HitType {
    Miss,
    Normal,
    Critical,
}

#[derive(Debug, Default, Serialize, TS)]
pub struct HitRateParams {
    pub accuracy_term: f64,
    pub evasion_term: f64,
    pub morale_mod: f64,
    pub critical_rate_multiplier: f64,
    pub critical_percent_bonus: f64,
    pub hit_percent_bonus: f64,
}

#[derive(Debug, Default, Serialize, TS)]
pub struct HitRate {
    pub total: f64,
    pub normal: f64,
    pub critical: f64,
}

impl HitRateParams {
    fn calc_basis(&self) -> f64 {
        let value = (self.accuracy_term - self.evasion_term) * self.morale_mod;
        value.clamp(10.0, 96.0)
    }

    pub fn calc(&self) -> HitRate {
        let basis = self.calc_basis();

        let critical_percent =
            (basis.sqrt() * self.critical_rate_multiplier + 1.0 + self.critical_percent_bonus)
                .floor();

        let hit_percent = (basis + 1.0 + self.hit_percent_bonus)
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
            morale_mod: 1.0,
            critical_rate_multiplier: 1.0,
            critical_percent_bonus: 0.0,
            hit_percent_bonus: 0.0,
        };

        let max = HitRateParams {
            accuracy_term: 100.0,
            hit_percent_bonus: 10.0,
            ..min
        };

        assert_eq!(min.calc_basis(), 10.0);
        assert_eq!(max.calc_basis(), 96.0);
        assert_eq!(max.calc().total, 1.0);

        let hit_rate = HitRateParams {
            accuracy_term: 60.0,
            evasion_term: 10.0,
            morale_mod: 1.2,
            critical_rate_multiplier: 1.3,
            critical_percent_bonus: 12.0,
            hit_percent_bonus: 9.0,
        }
        .calc();

        assert_eq!(hit_rate.total, 0.7);
        assert_eq!(hit_rate.critical, 0.23);
        assert_eq!(hit_rate.normal, 0.7 - 0.23)
    }
}
