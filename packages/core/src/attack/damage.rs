use std::{hash::Hash, ops::Range};

use rand::prelude::*;

use crate::utils::{NumMap, RandomRange, RandomRangeToDistribution, ToDistribution};

use super::{AttackPower, HitType};

#[derive(Debug, Hash, Clone, Copy, PartialEq, Eq)]
enum DamageType {
    Effective,
    Scratch,
    Overkill,
}

struct DefensePowerRange {
    // 最小1.0
    basic_defense_power: f64,
}

impl DefensePowerRange {
    pub fn min(&self) -> f64 {
        self.start()
    }

    pub fn max(&self) -> f64 {
        self.last().unwrap_or(self.start())
    }
}

impl RandomRange<u16, f64> for DefensePowerRange {
    fn gen(&self, random_value: u16) -> f64 {
        let min = self.basic_defense_power * 0.7;
        min + random_value as f64 * 0.6
    }

    fn range(&self) -> Range<u16> {
        0..(self.basic_defense_power.floor() as u16)
    }
}

pub struct ScratchDamageRange {
    current_hp: u16,
}

impl ScratchDamageRange {
    pub fn new(current_hp: u16) -> Self {
        Self { current_hp }
    }

    pub fn min(&self) -> u16 {
        self.start()
    }

    pub fn max(&self) -> u16 {
        self.last().unwrap_or_default()
    }
}

impl RandomRange<u16, u16> for ScratchDamageRange {
    fn gen(&self, random_value: u16) -> u16 {
        (self.current_hp as f64 * 0.06 + random_value as f64 * 0.08).floor() as u16
    }

    fn range(&self) -> Range<u16> {
        if self.current_hp == 0 {
            0..1
        } else {
            0..self.current_hp
        }
    }
}

pub struct OverkillProtectionDamageRange {
    current_hp: u16,
}

impl OverkillProtectionDamageRange {
    pub fn new(current_hp: u16) -> Self {
        Self { current_hp }
    }

    pub fn min(&self) -> u16 {
        self.start()
    }

    pub fn max(&self) -> u16 {
        self.last().unwrap_or_default()
    }
}

impl RandomRange<u16, u16> for OverkillProtectionDamageRange {
    fn gen(&self, random_value: u16) -> u16 {
        (self.current_hp as f64 * 0.5 + random_value as f64 * 0.3).floor() as u16
    }

    fn range(&self) -> Range<u16> {
        0..self.current_hp
    }
}

#[derive(Debug, Clone)]
pub struct DefenseParams {
    pub max_hp: u16,
    pub current_hp: u16,
    pub basic_defense_power: f64,
    pub overkill_protection: bool,
    pub sinkable: bool,
}

impl DefenseParams {
    fn defense_power_range(&self) -> DefensePowerRange {
        DefensePowerRange {
            basic_defense_power: self.basic_defense_power,
        }
    }
}

pub struct Damage {
    pub hit_type: HitType,
    pub attack_power: AttackPower,
    pub defense_params: DefenseParams,
    pub is_cutin: bool,
}

impl Damage {
    fn attack_term(&self) -> f64 {
        match self.hit_type {
            HitType::Miss => 0.0,
            HitType::Normal => self.attack_power.normal,
            HitType::Critical => self.attack_power.critical,
        }
    }

    fn calc_typed_damage(&self, defense_power: f64) -> (u16, DamageType) {
        if self.hit_type == HitType::Miss {
            return if self.is_cutin {
                (0, DamageType::Scratch)
            } else {
                (0, DamageType::Effective)
            };
        }

        let effective_defense_power = defense_power.max(1.0);
        let value = ((self.attack_term() - effective_defense_power)
            * self.attack_power.remaining_ammo_mod)
            .floor()
            .max(0.0) as u16;

        let damage_type = if 0 == value {
            DamageType::Scratch
        } else if value >= self.defense_params.current_hp {
            DamageType::Overkill
        } else {
            DamageType::Effective
        };

        (value, damage_type)
    }

    pub fn scratch_damage_range(&self) -> ScratchDamageRange {
        ScratchDamageRange::new(self.defense_params.current_hp)
    }

    pub fn overkill_protection_damage_range(&self) -> OverkillProtectionDamageRange {
        OverkillProtectionDamageRange::new(self.defense_params.current_hp)
    }

    pub fn min(&self) -> u16 {
        let max_defense_power = self.defense_params.defense_power_range().max();
        let (value, damage_type) = self.calc_typed_damage(max_defense_power);

        match damage_type {
            DamageType::Effective => value,
            DamageType::Scratch => self.scratch_damage_range().min(),
            DamageType::Overkill => {
                if self.defense_params.overkill_protection {
                    self.overkill_protection_damage_range().min()
                } else if self.defense_params.sinkable {
                    value
                } else {
                    self.defense_params.current_hp - 1
                }
            }
        }
    }

    pub fn max(&self) -> u16 {
        let min_defense_power = self.defense_params.defense_power_range().min();
        let (value, damage_type) = self.calc_typed_damage(min_defense_power);

        match damage_type {
            DamageType::Effective => value,
            DamageType::Scratch => self.scratch_damage_range().max(),
            DamageType::Overkill => {
                if self.defense_params.overkill_protection {
                    self.overkill_protection_damage_range().max()
                } else if self.defense_params.sinkable {
                    value
                } else {
                    self.defense_params.current_hp - 1
                }
            }
        }
    }

    pub fn choose<R: Rng + ?Sized>(&self, rng: &mut R) -> u16 {
        let defense_power = self.defense_params.defense_power_range().choose(rng);
        let (value, damage_type) = self.calc_typed_damage(defense_power);

        match damage_type {
            DamageType::Effective => value,

            DamageType::Scratch => self.scratch_damage_range().choose(rng),

            DamageType::Overkill => {
                if self.defense_params.overkill_protection {
                    self.overkill_protection_damage_range().choose(rng)
                } else if self.defense_params.sinkable {
                    value
                } else {
                    self.defense_params.current_hp - 1
                }
            }
        }
    }

    pub fn to_distribution(&self) -> NumMap<u16, f64> {
        if self.hit_type == HitType::Miss {
            return if self.is_cutin {
                self.scratch_damage_range().to_distribution()
            } else {
                Some((0, 1.0)).into_iter().collect()
            };
        }

        let mut normal_damages: Vec<u16> = Vec::new();
        let mut scratch_damages: Vec<u16> = Vec::new();
        let mut overkill_damages: Vec<u16> = Vec::new();

        self.defense_params
            .defense_power_range()
            .to_vec()
            .into_iter()
            .for_each(|defense_power| {
                let (value, damage_type) = self.calc_typed_damage(defense_power);

                match damage_type {
                    DamageType::Effective => normal_damages.push(value),
                    DamageType::Scratch => scratch_damages.push(value),
                    DamageType::Overkill => overkill_damages.push(value),
                }
            });

        let normal_count = normal_damages.len() as f64;
        let scratch_count = scratch_damages.len() as f64;
        let overkill_count = overkill_damages.len() as f64;
        let total_count = normal_count + scratch_count + overkill_count;

        let normal_rate = normal_count / total_count;
        let scratch_rate = scratch_count / total_count;
        let overkill_rate = overkill_count / total_count;

        let current_hp = self.defense_params.current_hp;

        let scratch_distribution = self.scratch_damage_range().to_distribution();

        let overkill_distribution: NumMap<u16, f64> = if self.defense_params.sinkable {
            overkill_damages.into_iter().to_distribution()
        } else if self.defense_params.overkill_protection {
            self.overkill_protection_damage_range().to_distribution()
        } else {
            Some((current_hp - 1, 1.0)).into_iter().collect()
        };

        let normal_distribution = normal_damages.into_iter().to_distribution();

        normal_distribution * normal_rate
            + scratch_distribution * scratch_rate
            + overkill_distribution * overkill_rate
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use rand_xoshiro::Xoshiro256PlusPlus;

    #[test]
    fn test_scratch_damage() {
        let mut rng = Xoshiro256PlusPlus::seed_from_u64(0);

        let hp0_damage = ScratchDamageRange { current_hp: 0 };

        assert!(hp0_damage.to_vec() == vec![0]);
        assert_eq!(hp0_damage.choose(&mut rng), 0);

        let hp100_damage = ScratchDamageRange { current_hp: 100 };

        assert_eq!(
            hp100_damage.to_vec(),
            vec![
                6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8,
                8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10,
                10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
                12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13
            ]
        );

        assert_eq!(hp100_damage.choose(&mut rng), 9);
        assert_eq!(hp100_damage.choose(&mut rng), 6);
    }

    #[test]
    fn test_overkill_protection_damage() {
        let mut rng = Xoshiro256PlusPlus::seed_from_u64(0);

        let hp0_damage = OverkillProtectionDamageRange { current_hp: 0 };

        assert!(hp0_damage.to_vec().is_empty());
        assert_eq!(hp0_damage.choose(&mut rng), 0);

        let hp100_damage = OverkillProtectionDamageRange { current_hp: 100 };

        assert_eq!(
            hp100_damage.to_vec(),
            vec![
                50, 50, 50, 50, 51, 51, 51, 52, 52, 52, 53, 53, 53, 53, 54, 54, 54, 55, 55, 55, 56,
                56, 56, 56, 57, 57, 57, 58, 58, 58, 59, 59, 59, 59, 60, 60, 60, 61, 61, 61, 62, 62,
                62, 62, 63, 63, 63, 64, 64, 64, 65, 65, 65, 65, 66, 66, 66, 67, 67, 67, 68, 68, 68,
                68, 69, 69, 69, 70, 70, 70, 71, 71, 71, 71, 72, 72, 72, 73, 73, 73, 74, 74, 74, 74,
                75, 75, 75, 76, 76, 76, 77, 77, 77, 77, 78, 78, 78, 79, 79, 79
            ]
        );

        assert_eq!(hp100_damage.choose(&mut rng), 59);
        assert_eq!(hp100_damage.choose(&mut rng), 61);
    }

    #[test]
    fn test_damage() {
        use rand::prelude::*;

        let mut rng = thread_rng();
        let range = OverkillProtectionDamageRange { current_hp: 10 };

        range.choose(&mut rng);
    }
}
