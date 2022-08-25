use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::{Attack, AttackPower, HitRate},
    attack::{Damage, DefenseParams, HitType},
    types::DamageState,
    utils::Histogram,
};

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct DamageReport {
    pub miss_damage_min: u16,
    pub miss_damage_max: u16,
    pub normal_damage_min: u16,
    pub normal_damage_max: u16,
    pub critical_damage_min: u16,
    pub critical_damage_max: u16,
    pub normal_scratch_rate: f64,
    pub critical_scratch_rate: f64,
    pub damage_density: Histogram<u16, f64>,
    pub damage_state_density: Histogram<DamageState, f64>,
}

impl DamageReport {
    pub fn new(attack: &Attack) -> Option<Self> {
        let hits = attack.hits;
        let is_cutin = attack.is_cutin;
        let attack_power = attack.attack_power.as_ref()?;
        let defense_params = attack.defense_params.as_ref()?;

        let get_damage = |hit_type: HitType| Damage {
            hit_type,
            attack_term: attack_power.get_attack_term(hit_type),
            remaining_ammo_mod: attack_power.remaining_ammo_mod,
            current_hp: defense_params.current_hp,
            basic_defense_power: defense_params.basic_defense_power,
            overkill_protection: defense_params.overkill_protection,
            sinkable: defense_params.sinkable,
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

        let damage_density = attack
            .hit_rate
            .as_ref()
            .map(|hit_rate| {
                DamageAnalyzer {
                    attack_power,
                    defense_params,
                    hit_rate,
                    hits,
                    is_cutin,
                }
                .density()
            })
            .unwrap_or_default();

        let &DefenseParams {
            current_hp, max_hp, ..
        } = defense_params;

        let damage_state_density = damage_density
            .iter()
            .map(|(damage, rate)| {
                (
                    DamageState::new(max_hp, current_hp.saturating_sub(*damage)),
                    *rate,
                )
            })
            .collect();

        Some(Self {
            miss_damage_min,
            miss_damage_max,
            normal_damage_min,
            normal_damage_max,
            critical_damage_min,
            critical_damage_max,
            normal_scratch_rate,
            critical_scratch_rate,
            damage_density,
            damage_state_density,
        })
    }
}

struct DamageAnalyzer<'a> {
    attack_power: &'a AttackPower,
    hit_rate: &'a HitRate,
    defense_params: &'a DefenseParams,
    is_cutin: bool,
    hits: f64,
}

impl<'a> DamageAnalyzer<'a> {
    fn to_damage(&self, hit_type: HitType, current_hp: u16) -> Damage {
        Damage {
            hit_type,
            attack_term: self.attack_power.get_attack_term(hit_type),
            remaining_ammo_mod: self.attack_power.remaining_ammo_mod,
            current_hp,
            basic_defense_power: self.defense_params.basic_defense_power,
            overkill_protection: self.defense_params.overkill_protection,
            sinkable: self.defense_params.sinkable,
            is_cutin: self.is_cutin,
        }
    }

    fn once(&self, current_hp: u16) -> Histogram<u16, f64> {
        self.hit_rate
            .iter()
            .map(|(hit_type, rate)| {
                let damage = self.to_damage(hit_type, current_hp);
                damage.density() * rate
            })
            .sum()
    }

    fn density(&self) -> Histogram<u16, f64> {
        let hp1 = self.defense_params.current_hp;
        let mut density1 = self.once(hp1);

        if self.hits <= 1.0 {
            return density1;
        }

        let max_hits = self.hits.ceil() as usize;
        let max_hits_rate = self.hits.fract();

        for h in 1..max_hits {
            let density2 = density1
                .iter()
                .flat_map(|(&damage_value1, rate1)| {
                    let hp2 = hp1.saturating_sub(damage_value1);
                    let density2 = self.once(hp2);

                    density2.into_iter().map(move |(damage_value2, rate2)| {
                        (damage_value1 + damage_value2, rate1 * rate2)
                    })
                })
                .collect::<Histogram<u16, f64>>();

            if h == max_hits && max_hits_rate > 0.0 {
                density1 = density1 * (1.0 - max_hits_rate) + density2 * max_hits_rate;
            } else {
                density1 = density2
            }
        }

        density1
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_damage_report() {
        let attack_power = AttackPower {
            normal: 1000.0,
            critical: 1500.0,
            remaining_ammo_mod: 1.0,
            ..Default::default()
        };

        let attack = Attack {
            attack_power: Some(attack_power),
            defense_params: Some(DefenseParams {
                basic_defense_power: 500.0,
                current_hp: 1000,
                max_hp: 1000,
                sinkable: true,
                overkill_protection: false,
            }),
            hit_rate: Some(HitRate {
                normal: 0.2,
                critical: 0.1,
                total: 0.3,
            }),
            hits: 2.0,
            is_cutin: false,
        };

        let result = DamageReport::new(&attack).unwrap();

        assert!(result.damage_density.iter().count() < 3000);

        assert_eq!(result.critical_damage_min, (1500.0 - 500.0 * 1.3) as u16);
        assert_eq!(result.critical_damage_max, (1500.0 - 500.0 * 0.7) as u16);
        assert_eq!(result.normal_damage_min, (1000.0 - 500.0 * 1.3) as u16);
        assert_eq!(result.normal_damage_max, (1000.0 - 500.0 * 0.7) as u16);
    }
}
