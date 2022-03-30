use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::{AttackPower, Damage, DefenseParams, HitRate, HitType},
    types::DamageState,
    utils::NumMap,
};

#[derive(Debug, Serialize, Deserialize, Tsify)]
pub struct DamageInfo {
    pub miss_damage_min: u16,
    pub miss_damage_max: u16,
    pub normal_damage_min: u16,
    pub normal_damage_max: u16,
    pub critical_damage_min: u16,
    pub critical_damage_max: u16,
    pub normal_scratch_rate: f64,
    pub critical_scratch_rate: f64,
    pub damage_map: NumMap<u16, f64>,
    pub damage_state_map: NumMap<DamageState, f64>,
}

struct Inner<'a> {
    attack_power: &'a AttackPower,
    hit_rate: &'a HitRate,
    defense_params: &'a DefenseParams,
    is_cutin: bool,
    hits: f64,
}

impl<'a> Inner<'a> {
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

    fn damage_map(&self) -> NumMap<u16, f64> {
        let current_hp = self.defense_params.current_hp;
        let mut map1 = self.once(current_hp);

        if self.hits <= 1.0 {
            return map1;
        }

        let max_hits = self.hits.ceil() as usize;
        let max_hits_rate = self.hits.fract();

        for h in 1..max_hits {
            let map2 = map1
                .iter()
                .flat_map(|(&damage_value1, rate1)| {
                    let map2 = self.once(current_hp.saturating_sub(damage_value1));

                    map2.into_iter().map(move |(damage_value2, rate2)| {
                        (damage_value1 + damage_value2, rate1 * rate2)
                    })
                })
                .collect::<NumMap<u16, f64>>();

            if h == max_hits && max_hits_rate > 0.0 {
                map1 = map1 * (1.0 - max_hits_rate) + map2 * max_hits_rate;
            } else {
                map1 = map2
            }
        }

        map1
    }
}

pub struct DamageAnalyzer<'a> {
    pub attack_power: Option<&'a AttackPower>,
    pub hit_rate: Option<&'a HitRate>,
    pub defense_params: Option<&'a DefenseParams>,
    pub is_cutin: bool,
    pub hits: f64,
}

impl<'a> DamageAnalyzer<'a> {
    pub fn analyze(&self) -> Option<DamageInfo> {
        let is_cutin = self.is_cutin;
        let attack_power = self.attack_power?;
        let defense_params = self.defense_params?;

        let get_damage = |hit_type: HitType| Damage {
            hit_type,
            attack_power: attack_power.clone(),
            defense_params: defense_params.clone(),
            is_cutin,
        };

        let miss = get_damage(HitType::Miss);
        let normal = get_damage(HitType::Normal);
        let critical = get_damage(HitType::Critical);

        let miss_damage_min = miss.min();
        let miss_damage_max = miss.max();
        let normal_damage_min = normal.min();
        let normal_damage_max = normal.max();
        let critical_damage_min = critical.min();
        let critical_damage_max = critical.max();

        let normal_scratch_rate = normal.scratch_rate();
        let critical_scratch_rate = critical.scratch_rate();

        let damage_map = self
            .hit_rate
            .map(|hit_rate| {
                Inner {
                    attack_power,
                    defense_params,
                    hit_rate,
                    hits: self.hits,
                    is_cutin: self.is_cutin,
                }
                .damage_map()
            })
            .unwrap_or_default();

        let &DefenseParams {
            current_hp, max_hp, ..
        } = defense_params;

        let damage_state_map = damage_map
            .iter()
            .map(|(damage, rate)| {
                (
                    DamageState::new(max_hp, current_hp.saturating_sub(*damage)),
                    *rate,
                )
            })
            .collect::<NumMap<DamageState, f64>>();

        Some(DamageInfo {
            miss_damage_min,
            miss_damage_max,
            normal_damage_min,
            normal_damage_max,
            critical_damage_min,
            critical_damage_max,
            normal_scratch_rate,
            critical_scratch_rate,
            damage_map,
            damage_state_map,
        })
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_damage_analyzer() {
        let attack_power = AttackPower {
            normal: 1000.0,
            critical: 1500.0,
            remaining_ammo_mod: 1.0,
            ..Default::default()
        };

        let analyzer = DamageAnalyzer {
            attack_power: Some(&attack_power),
            defense_params: Some(&DefenseParams {
                basic_defense_power: 500.0,
                current_hp: 1000,
                max_hp: 1000,
                sinkable: true,
                overkill_protection: false,
            }),
            hit_rate: Some(&HitRate {
                normal: 0.2,
                critical: 0.1,
                total: 0.3,
            }),
            hits: 2.0,
            is_cutin: false,
        };

        let result = analyzer.analyze().unwrap();

        assert!(result.damage_map.iter().count() < 3000);

        assert_eq!(result.critical_damage_min, (1500.0 - 500.0 * 1.3) as u16);
        assert_eq!(result.critical_damage_max, (1500.0 - 500.0 * 0.7) as u16);
        assert_eq!(result.normal_damage_min, (1000.0 - 500.0 * 1.3) as u16);
        assert_eq!(result.normal_damage_max, (1000.0 - 500.0 * 0.7) as u16);
    }
}
