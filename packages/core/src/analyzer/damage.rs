use serde::Serialize;
use ts_rs::TS;

use crate::{
    attack::{AttackPower, Damage, DefenseParams, HitRate, HitType},
    types::DamageState,
    utils::NumMap,
};

#[derive(Debug, Serialize, TS)]
pub struct DamageAnalysis {
    pub miss_damage_min: u16,
    pub miss_damage_max: u16,
    pub normal_damage_min: u16,
    pub normal_damage_max: u16,
    pub critical_damage_min: u16,
    pub critical_damage_max: u16,
    pub damage_map: NumMap<u16, f64>,
    pub damage_state_map: NumMap<DamageState, f64>,
}

pub struct DamageAnalyzer<'a> {
    pub attack_power: &'a AttackPower,
    pub defense_params: &'a DefenseParams,
    pub hit_rate: &'a HitRate,
    pub is_cutin: bool,
    pub hits: usize,
}

impl<'a> DamageAnalyzer<'a> {
    fn damage_by(&self, hit_type: HitType, current_hp: u16) -> Damage {
        let attack_power = self.attack_power;

        let defense_params = DefenseParams {
            current_hp,
            ..self.defense_params.clone()
        };

        let is_cutin = self.is_cutin;

        Damage {
            hit_type,
            attack_power: attack_power.clone(),
            defense_params,
            is_cutin,
        }
    }

    fn once(&self, current_hp: u16) -> NumMap<u16, f64> {
        let miss_damage = self.damage_by(HitType::Miss, current_hp);
        let normal_damage = self.damage_by(HitType::Normal, current_hp);
        let critical_damage = self.damage_by(HitType::Critical, current_hp);

        let miss_damage_distribution = miss_damage.to_distribution();
        let normal_damage_distribution = normal_damage.to_distribution();
        let critical_damage_distribution = critical_damage.to_distribution();

        let miss_rate = 1.0 - self.hit_rate.total;

        let result: NumMap<u16, f64> = miss_damage_distribution * miss_rate
            + normal_damage_distribution * self.hit_rate.normal
            + critical_damage_distribution * self.hit_rate.critical;

        result
    }

    fn distribution(&self) -> NumMap<u16, f64> {
        let current_hp = self.defense_params.current_hp;
        let mut map1 = self.once(current_hp);

        if self.hits <= 0 {
            return map1;
        }

        for _ in 1..self.hits {
            map1 = map1
                .into_iter()
                .flat_map(|(damage_value1, rate1)| {
                    let map2 = self.once(current_hp.saturating_sub(damage_value1));

                    map2.into_iter().map(move |(damage_value2, rate2)| {
                        (damage_value1 + damage_value2, rate1 * rate2)
                    })
                })
                .collect()
        }

        map1
    }

    pub fn analyze(&self) -> DamageAnalysis {
        let max_hp = self.defense_params.max_hp;
        let current_hp = self.defense_params.current_hp;

        let miss = self.damage_by(HitType::Miss, current_hp);
        let normal = self.damage_by(HitType::Normal, current_hp);
        let critical = self.damage_by(HitType::Critical, current_hp);

        let miss_damage_min = miss.min();
        let miss_damage_max = miss.max();
        let normal_damage_min = normal.min();
        let normal_damage_max = normal.max();
        let critical_damage_min = critical.min();
        let critical_damage_max = critical.max();

        let damage_map = self.distribution();

        let damage_state_map = damage_map
            .iter()
            .map(|(damage, rate)| {
                (
                    DamageState::new(max_hp, current_hp.saturating_sub(*damage)),
                    *rate,
                )
            })
            .collect::<NumMap<DamageState, f64>>();

        DamageAnalysis {
            miss_damage_min,
            miss_damage_max,
            normal_damage_min,
            normal_damage_max,
            critical_damage_min,
            critical_damage_max,
            damage_map,
            damage_state_map,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_damage_analyzer() {
        let analyzer = DamageAnalyzer {
            attack_power: &AttackPower {
                normal: 1000.0,
                critical: 1500.0,
                remaining_ammo_mod: 1.0,

                ..Default::default()
            },
            defense_params: &DefenseParams {
                basic_defense_power: 500.0,
                current_hp: 1000,
                max_hp: 1000,
                sinkable: true,
                overkill_protection: false,
            },
            hit_rate: &HitRate {
                normal: 0.2,
                critical: 0.1,
                total: 0.3,
            },
            hits: 2,
            is_cutin: false,
        };

        let result = analyzer.analyze();

        assert!(result.damage_map.iter().count() < 3000);

        assert_eq!(result.critical_damage_min, (1500.0 - 500.0 * 1.3) as u16);
        assert_eq!(result.critical_damage_max, (1500.0 - 500.0 * 0.7) as u16);
        assert_eq!(result.normal_damage_min, (1000.0 - 500.0 * 1.3) as u16);
        assert_eq!(result.normal_damage_max, (1000.0 - 500.0 * 0.7) as u16);
    }
}
