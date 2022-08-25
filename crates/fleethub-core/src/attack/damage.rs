use rand::prelude::*;

use crate::{
    ship::Ship,
    types::{DefensePower, MoraleState, Side},
    utils::{Density, Histogram},
};

use super::{AttackPower, HitType};

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, PartialOrd, Ord)]
enum DamageType {
    Actual(u16),
    Scratch,
    OverkillProtection,
}

struct ScratchDamage {
    current_hp: u16,
}

impl ScratchDamage {
    fn iter(&self) -> impl DoubleEndedIterator<Item = u16> {
        let current_hp = self.current_hp;
        let range = 0..current_hp.max(1);
        range.map(move |v| (current_hp as f64 * 0.06 + v as f64 * 0.08) as u16)
    }

    fn choose<R: Rng + ?Sized>(&self, rng: &mut R) -> u16 {
        self.iter().choose(rng).unwrap_or_default()
    }

    fn min(&self) -> u16 {
        self.iter().next().unwrap_or_default()
    }

    fn max(&self) -> u16 {
        self.iter().next_back().unwrap_or_default()
    }
}

struct OverkillProtectionDamage {
    current_hp: u16,
}

impl OverkillProtectionDamage {
    fn iter(&self) -> impl DoubleEndedIterator<Item = u16> {
        let current_hp = self.current_hp;
        let range = 0..current_hp.max(1);
        range.map(move |v| (current_hp as f64 * 0.5 + v as f64 * 0.3) as u16)
    }

    fn choose<R: Rng + ?Sized>(&self, rng: &mut R) -> u16 {
        self.iter().choose(rng).unwrap_or_default()
    }

    fn min(&self) -> u16 {
        self.iter().next().unwrap_or_default()
    }

    fn max(&self) -> u16 {
        self.iter().next_back().unwrap_or_default()
    }
}

#[derive(Debug, Clone, Default)]
pub struct DefenseParams {
    pub max_hp: u16,
    pub current_hp: u16,
    pub basic_defense_power: f64,
    pub overkill_protection: bool,
    pub sinkable: bool,
}

impl DefenseParams {
    pub fn from_target(target: &Ship, side: Side, armor_penetration: f64) -> Option<Self> {
        let overkill_protection = side.is_player() && target.morale_state() != MoraleState::Red;
        let sinkable = side.is_enemy();

        Some(Self {
            basic_defense_power: target.basic_defense_power(armor_penetration)?,
            max_hp: target.max_hp()?,
            current_hp: target.current_hp,
            overkill_protection,
            sinkable,
        })
    }
}

pub struct Damage {
    pub hit_type: HitType,
    pub attack_term: f64,
    pub remaining_ammo_mod: f64,
    pub current_hp: u16,
    pub basic_defense_power: f64,
    pub overkill_protection: bool,
    pub sinkable: bool,
    pub is_cutin: bool,
}

impl Damage {
    pub fn new(
        hit_type: HitType,
        attack_power: AttackPower,
        defense_params: DefenseParams,
        is_cutin: bool,
    ) -> Self {
        let attack_term = match hit_type {
            HitType::Miss => 0.0,
            HitType::Normal => attack_power.normal,
            HitType::Critical => attack_power.critical,
        };

        let DefenseParams {
            current_hp,
            basic_defense_power,
            overkill_protection,
            sinkable,
            ..
        } = defense_params;

        Self {
            hit_type,
            attack_term,
            remaining_ammo_mod: attack_power.remaining_ammo_mod,
            current_hp,
            basic_defense_power,
            overkill_protection,
            sinkable,
            is_cutin,
        }
    }

    fn calc_damage_type(&self, defense_power: f64) -> DamageType {
        if self.hit_type == HitType::Miss {
            return if self.is_cutin {
                DamageType::Scratch
            } else {
                DamageType::Actual(0)
            };
        }

        let effective_defense_power = defense_power.max(1.0);
        let value = ((self.attack_term - effective_defense_power) * self.remaining_ammo_mod)
            .floor()
            .max(0.0) as u16;

        let current_hp = self.current_hp;

        if 0 == value {
            DamageType::Scratch
        } else if value < current_hp {
            DamageType::Actual(value)
        } else if self.overkill_protection {
            DamageType::OverkillProtection
        } else if self.sinkable {
            DamageType::Actual(value)
        } else if current_hp <= 1 {
            DamageType::Actual(0)
        } else {
            DamageType::Actual(current_hp - 1)
        }
    }

    fn defense_power(&self) -> DefensePower {
        DefensePower::new(self.basic_defense_power)
    }

    fn scratch_damage(&self) -> ScratchDamage {
        ScratchDamage {
            current_hp: self.current_hp,
        }
    }

    fn overkill_protection_damage(&self) -> OverkillProtectionDamage {
        OverkillProtectionDamage {
            current_hp: self.current_hp,
        }
    }

    pub fn min(&self) -> u16 {
        let max_defense_power = self.defense_power().max();
        let damage_type = self.calc_damage_type(max_defense_power);

        match damage_type {
            DamageType::Actual(value) => value,
            DamageType::Scratch => self.scratch_damage().min(),
            DamageType::OverkillProtection => self.overkill_protection_damage().min(),
        }
    }

    pub fn max(&self) -> u16 {
        let min_defense_power = self.defense_power().min();
        let damage_type = self.calc_damage_type(min_defense_power);

        match damage_type {
            DamageType::Actual(value) => value,
            DamageType::Scratch => self.scratch_damage().max(),
            DamageType::OverkillProtection => self.overkill_protection_damage().max(),
        }
    }

    pub fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> u16 {
        let defense_power = self.defense_power().choose(rng);
        let damage_type = self.calc_damage_type(defense_power);

        match damage_type {
            DamageType::Actual(value) => value,
            DamageType::Scratch => self.scratch_damage().choose(rng),
            DamageType::OverkillProtection => self.overkill_protection_damage().choose(rng),
        }
    }

    pub fn scratch_rate(&self) -> f64 {
        let defense_power_vec = self.defense_power().to_vec();

        let len = defense_power_vec.len() as f64;

        let scratch_count = defense_power_vec
            .into_iter()
            .filter(|defense_power| {
                let damage_type = self.calc_damage_type(*defense_power);
                damage_type == DamageType::Scratch
            })
            .count() as f64;

        scratch_count / len
    }

    fn damage_type_density(&self) -> Histogram<DamageType, f64> {
        if self.hit_type == HitType::Miss {
            if self.is_cutin {
                Some(DamageType::Scratch).density()
            } else {
                Some(DamageType::Actual(0)).density()
            }
        } else {
            self.defense_power()
                .iter()
                .map(|defense_power| self.calc_damage_type(defense_power))
                .density()
        }
    }

    pub fn density(&self) -> Histogram<u16, f64> {
        let damage_type_density = self.damage_type_density();

        damage_type_density
            .into_iter()
            .map(|(damage_type, rate)| {
                let current_density = match damage_type {
                    DamageType::Actual(value) => Some(value).density(),
                    DamageType::Scratch => self.scratch_damage().iter().density(),
                    DamageType::OverkillProtection => {
                        self.overkill_protection_damage().iter().density()
                    }
                };

                current_density * rate
            })
            .sum()
    }
}

#[cfg(test)]
mod test {
    use crate::{histogram, test::rng};

    use super::*;

    #[test]
    fn test_internal_scratch_damage() {
        let hp0_damage = ScratchDamage { current_hp: 0 };
        assert!(hp0_damage.iter().collect::<Vec<_>>() == vec![0]);
        assert_eq!(hp0_damage.choose(&mut rng(0)), 0);

        let hp100_damage = ScratchDamage { current_hp: 100 };

        assert_eq!(
            hp100_damage.iter().collect::<Vec<_>>(),
            vec![
                6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8,
                8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10,
                10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
                12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13,
                13, 13, 13, 13
            ]
        );

        assert_eq!(hp100_damage.choose(&mut rng(0)), 9);
        assert_eq!(hp100_damage.choose(&mut rng(1)), 11);
    }

    #[test]
    fn test_internal_overkill_protection_damage() {
        let hp0_damage = OverkillProtectionDamage { current_hp: 0 };
        assert_eq!(hp0_damage.iter().collect::<Vec<_>>(), vec![0]);
        assert_eq!(hp0_damage.choose(&mut rng(0)), 0);

        let hp1_damage = OverkillProtectionDamage { current_hp: 1 };
        assert_eq!(hp1_damage.iter().collect::<Vec<_>>(), vec![0]);
        assert_eq!(hp1_damage.choose(&mut rng(0)), 0);

        let hp100_damage = OverkillProtectionDamage { current_hp: 100 };

        assert_eq!(
            hp100_damage.iter().collect::<Vec<_>>(),
            vec![
                50, 50, 50, 50, 51, 51, 51, 52, 52, 52, 53, 53, 53, 53, 54, 54, 54, 55, 55, 55, 56,
                56, 56, 56, 57, 57, 57, 58, 58, 58, 59, 59, 59, 59, 60, 60, 60, 61, 61, 61, 62, 62,
                62, 62, 63, 63, 63, 64, 64, 64, 65, 65, 65, 65, 66, 66, 66, 67, 67, 67, 68, 68, 68,
                68, 69, 69, 69, 70, 70, 70, 71, 71, 71, 71, 72, 72, 72, 73, 73, 73, 74, 74, 74, 74,
                75, 75, 75, 76, 76, 76, 77, 77, 77, 77, 78, 78, 78, 79, 79, 79
            ]
        );

        assert_eq!(hp100_damage.choose(&mut rng(0)), 63);
    }

    const BASE_DAMAGE: Damage = Damage {
        attack_term: 17.0,
        hit_type: HitType::Normal,
        remaining_ammo_mod: 1.0,
        current_hp: 31,
        basic_defense_power: 13.0,
        overkill_protection: false,
        sinkable: false,
        is_cutin: false,
    };

    #[test]
    fn test_normal_damage() {
        assert_eq!(
            BASE_DAMAGE.damage_type_density(),
            histogram! {
                DamageType::Actual(1) => 0.15384615384615385,
                DamageType::Actual(2) => 0.07692307692307693,
                DamageType::Actual(3) => 0.15384615384615385,
                DamageType::Actual(4) => 0.15384615384615385,
                DamageType::Actual(5) => 0.07692307692307693,
                DamageType::Actual(6) => 0.15384615384615385,
                DamageType::Actual(7) => 0.15384615384615385,
                DamageType::Scratch => 0.07692307692307693,
            }
        );

        assert_eq!(
            BASE_DAMAGE.density(),
            histogram! {
                1 => 0.1588089330024814,
                2 => 0.10918114143920596,
                3 => 0.18362282878411912,
                4 => 0.16377171215880895,
                5 => 0.07692307692307693,
                6 => 0.15384615384615385,
                7 => 0.15384615384615385,
            }
        );
    }

    #[test]
    fn test_remaining_ammo_mod() {
        let damage = Damage {
            remaining_ammo_mod: 0.6,
            ..BASE_DAMAGE
        };

        assert_eq!(
            damage.damage_type_density(),
            histogram! {
                DamageType::Actual(1) => 0.23076923076923078,
                DamageType::Actual(2) => 0.23076923076923078,
                DamageType::Actual(3) => 0.15384615384615385,
                DamageType::Actual(4) => 0.23076923076923078,
                DamageType::Scratch => 0.15384615384615385,
            }
        );

        assert_eq!(
            damage.density(),
            histogram! {
                1 => 0.24069478908188588,
                2 => 0.29528535980148884,
                3 => 0.21339950372208438,
                4 => 0.250620347394541,
            }
        );
    }

    #[test]
    fn test_miss_damage() {
        let miss_damage = Damage {
            hit_type: HitType::Miss,
            ..BASE_DAMAGE
        };

        assert_eq!(
            miss_damage.damage_type_density(),
            histogram! {
                DamageType::Actual(0) => 1.0,
            }
        );

        let cutin = Damage {
            is_cutin: true,
            ..miss_damage
        };

        assert_eq!(
            cutin.damage_type_density(),
            histogram! {
                DamageType::Scratch => 1.0,
            }
        );

        assert_eq!(
            cutin.density(),
            histogram! {
                1 => 0.06451612903225806,
                2 => 0.41935483870967744,
                3 => 0.3870967741935484,
                4 => 0.12903225806451613,
            }
        );
    }

    #[test]
    fn test_overkill_protection() {
        let damage = Damage {
            attack_term: 45.0,
            overkill_protection: true,
            ..BASE_DAMAGE
        };

        assert_eq!(
            damage.damage_type_density(),
            histogram! {
                DamageType::Actual(29) => 0.15384615384615385,
                DamageType::Actual(30) => 0.07692307692307693,
                DamageType::Actual(28) => 0.07692307692307693,
                DamageType::OverkillProtection => 0.6923076923076923,
            }
        );

        assert_eq!(
            damage.density(),
            histogram! {
                15 => 0.04466501240694789,
                16 => 0.06699751861042183,
                17 => 0.08933002481389578,
                18 => 0.06699751861042183,
                19 => 0.06699751861042183,
                20 => 0.08933002481389578,
                21 => 0.06699751861042183,
                22 => 0.06699751861042183,
                23 => 0.08933002481389578,
                24 => 0.04466501240694789,
                28 => 0.07692307692307693,
                29 => 0.15384615384615385,
                30 => 0.07692307692307693,
            }
        );
    }

    #[test]
    fn test_sinkable_damage() {
        let damage = Damage {
            attack_term: 45.0,
            sinkable: true,
            ..BASE_DAMAGE
        };

        assert_eq!(
            damage.damage_type_density(),
            histogram! {
                DamageType::Actual(28) => 0.07692307692307693,
                DamageType::Actual(29) => 0.15384615384615385,
                DamageType::Actual(30) => 0.07692307692307693,
                DamageType::Actual(31) => 0.15384615384615385,
                DamageType::Actual(32) => 0.15384615384615385,
                DamageType::Actual(33) => 0.07692307692307693,
                DamageType::Actual(34) => 0.15384615384615385,
                DamageType::Actual(35) => 0.15384615384615385,
            }
        );

        assert_eq!(
            damage.density(),
            histogram! {
                28 => 0.07692307692307693,
                29 => 0.15384615384615385,
                30 => 0.07692307692307693,
                31 => 0.15384615384615385,
                32 => 0.15384615384615385,
                33 => 0.07692307692307693,
                34 => 0.15384615384615385,
                35 => 0.15384615384615385,
            }
        );
    }
}
