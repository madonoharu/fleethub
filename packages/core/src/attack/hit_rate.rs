#[derive(Debug)]
pub struct HitRateParams {
    pub accuracy_term: i32,
    pub evasion_term: i32,
    pub morale_mod: f64,
    pub hit_rate_bonus: f64,
    pub critical_rate_multiplier: f64,
    pub critical_rate_bonus: f64,
}

pub struct HitRate {
    pub total: f64,
    pub normal: f64,
    pub critical: f64,
}

impl HitRateParams {
    fn calc_basis(&self) -> f64 {
        let value = (self.accuracy_term - self.evasion_term) as f64 * self.morale_mod;
        value.clamp(10., 96.)
    }

    pub fn calc(&self) -> HitRate {
        let basis = self.calc_basis();

        let hit_percent = (basis + 1. + self.hit_rate_bonus).floor();
        let critical_percent =
            (basis.sqrt() * self.critical_rate_multiplier + 1. + self.critical_rate_bonus * 100.)
                .floor();

        let total = (hit_percent / 100.).min(1.);
        let critical = (critical_percent / 100.).min(1.);
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
            accuracy_term: 0,
            evasion_term: 0,
            morale_mod: 1.,
            critical_rate_bonus: 0.,
            critical_rate_multiplier: 1.,
            hit_rate_bonus: 0.,
        };

        let max = HitRateParams {
            accuracy_term: 100,
            hit_rate_bonus: 10.,
            ..min
        };

        assert_eq!(min.calc_basis(), 10.);
        assert_eq!(max.calc_basis(), 96.);
        assert_eq!(max.calc().total, 1.);

        let hit_rate = HitRateParams {
            accuracy_term: 60,
            evasion_term: 10,
            morale_mod: 1.2,
            hit_rate_bonus: 9.,
            critical_rate_multiplier: 1.3,
            critical_rate_bonus: 0.12,
        }
        .calc();

        assert_eq!(hit_rate.total, 0.7);
        assert_eq!(hit_rate.critical, 0.23);
        assert_eq!(hit_rate.normal, 0.7 - 0.23)
    }
}
