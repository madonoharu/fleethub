use std::{hash::Hash, ops::Range};

use rand::prelude::*;

use crate::utils::{NumMap, RandomRange, ToDistribution};

#[derive(Debug, Hash, Clone, Copy, PartialEq, Eq)]
enum DamageType {
    Normal,
    Scratch,
    Overkill,
}

struct DefenseTermRange {
    base: f64,
}

impl RandomRange<f64> for DefenseTermRange {
    fn gen(&self, random_value: i32) -> f64 {
        let min = self.base.max(1.) * 0.7;
        min + random_value as f64 * 0.6
    }

    fn range(&self) -> Range<i32> {
        0..(self.base.floor() as i32)
    }
}

struct ScratchDamageRange {
    pub current_hp: i32,
}

impl RandomRange<i32> for ScratchDamageRange {
    fn gen(&self, random_value: i32) -> i32 {
        (self.current_hp as f64 * 0.06 + random_value as f64 * 0.08).floor() as i32
    }

    fn range(&self) -> Range<i32> {
        0..self.current_hp
    }
}

struct OverkillProtectionDamageRange {
    pub current_hp: i32,
}

impl RandomRange<i32> for OverkillProtectionDamageRange {
    fn gen(&self, random_value: i32) -> i32 {
        (self.current_hp as f64 * 0.5 + random_value as f64 * 0.3).floor() as i32
    }

    fn range(&self) -> Range<i32> {
        0..self.current_hp
    }
}

pub struct DamageAttackerParams {
    pub attack_term: f64,
    pub remaining_ammo_mod: f64,
    pub armor_penetration: f64,
}

#[derive(Debug, Clone)]
pub struct DamageTargetParams {
    pub armor: i32,
    pub ibonus: f64,

    pub max_hp: i32,
    pub current_hp: i32,
    pub overkill_protection: bool,
    pub sinkable: bool,
}

impl DamageTargetParams {
    fn to_defense_term_range(&self) -> DefenseTermRange {
        let base = self.armor as f64 + self.ibonus;
        DefenseTermRange { base }
    }
}

pub struct DamageParams {
    pub attacker: DamageAttackerParams,
    pub target: DamageTargetParams,
}

impl DamageParams {
    fn calc_typed_damage(&self, defense_term: f64) -> (i32, DamageType) {
        let effective_defense_term = (defense_term - self.attacker.armor_penetration).max(1.);
        let value = ((self.attacker.attack_term - effective_defense_term)
            * self.attacker.remaining_ammo_mod)
            .floor()
            .max(0.) as i32;

        let damage_type = if 0 < value {
            DamageType::Scratch
        } else if value >= self.target.current_hp {
            DamageType::Overkill
        } else {
            DamageType::Normal
        };

        (value, damage_type)
    }

    pub fn choose<R: Rng + ?Sized>(&self, rng: &mut R) -> i32 {
        let defense_term = self.target.to_defense_term_range().choose(rng);
        let (value, damage_type) = self.calc_typed_damage(defense_term);

        match damage_type {
            DamageType::Normal => value,

            DamageType::Scratch => ScratchDamageRange {
                current_hp: self.target.current_hp,
            }
            .choose(rng),

            DamageType::Overkill => {
                if self.target.overkill_protection {
                    OverkillProtectionDamageRange {
                        current_hp: self.target.current_hp,
                    }
                    .choose(rng)
                } else if self.target.sinkable {
                    value
                } else {
                    self.target.current_hp - 1
                }
            }
        }
    }

    pub fn to_distribution(&self) -> NumMap<i32, f64> {
        let current_hp = 100;

        let mut normal_damages: Vec<i32> = Vec::new();
        let mut scratch_damages: Vec<i32> = Vec::new();
        let mut overkill_damages: Vec<i32> = Vec::new();

        self.target
            .to_defense_term_range()
            .to_vec()
            .into_iter()
            .for_each(|defense_term| {
                let (value, damage_type) = self.calc_typed_damage(defense_term);

                match damage_type {
                    DamageType::Normal => normal_damages.push(value),
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

        let scratch_distribution = ScratchDamageRange { current_hp }
            .to_vec()
            .into_iter()
            .to_distribution();

        let overkill_distribution: NumMap<i32, f64> = if self.target.sinkable {
            overkill_damages.into_iter().to_distribution()
        } else if self.target.overkill_protection {
            OverkillProtectionDamageRange { current_hp }
                .to_vec()
                .into_iter()
                .to_distribution()
        } else {
            [(current_hp - 1, 1.)].into()
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

        assert!(hp0_damage.to_vec().is_empty());
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

        assert_eq!(hp100_damage.choose(&mut rng), 8);
        assert_eq!(hp100_damage.choose(&mut rng), 9);
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
