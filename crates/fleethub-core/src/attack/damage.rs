use rand::prelude::*;

use crate::{
    ship::Ship,
    types::{DefensePower, MoraleState, Side},
    utils::{Density, Histogram},
};

use super::{AttackPower, HitType};

/// `add_density_to` が何を書き出すか。
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum DensityMode {
    All,
    /// 装甲を貫通しなかった結果だけ。ミスと割合ダメージが残る。
    NoPenetration,
}

impl DensityMode {
    fn keeps_penetration(self) -> bool {
        self == Self::All
    }
}

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, PartialOrd, Ord)]
enum DamageType {
    Actual(u16),
    Scratch,
    OverkillProtection,
}

/// `(a * hp + b * v) as u16` (v ∈ [0, hp.max(1))) の値ごとの出現回数を昇順に返す。
///
/// 割合ダメージも撃沈保護ダメージも v に対して単調非減少なので、同じ値を取る v は
/// 必ず連続する。その区間長を直接求めることで、v を全走査せずに済ませる。
/// 素朴に走査した場合と結果は完全に一致する。
///
/// 計算量が「異なる値の個数」に比例するのは、刻み幅 b が値の飽和を招かない
/// 範囲に限る。b が大きく全域が u16 の上限へ張り付く場合、異なる値は1個でも
/// 補正ループが末尾まで走る。実際の呼び出しは (0.06, 0.08) と (0.5, 0.3) の
/// 2通りだけで、どちらも飽和しない。
fn step_counts(hp: u16, a: f64, b: f64) -> Vec<(u16, usize)> {
    let mut out = Vec::new();
    for_each_step(hp, a, b, |value, count| out.push((value, count)));
    out
}

/// `step_counts` と同じ刻みを、Vec を作らずに順に渡す。
///
/// 多段攻撃の畳み込みでは段ごとに残耐久が変わるので、この列挙が
/// 1回の解析で数百回走る。そのたびに Vec を確保すると割に合わない。
fn for_each_step(hp: u16, a: f64, b: f64, mut f: impl FnMut(u16, usize)) {
    debug_assert!(b > 0.0);

    let n = hp.max(1) as u32;
    let base = a * hp as f64;
    let value_at = |v: u32| (base + v as f64 * b) as u16;

    let mut v = 0_u32;

    while v < n {
        let d = value_at(v);

        // 値が d + 1 以上になる最初の v を見積もり、丸め誤差ぶんを実測で補正する。
        let estimated = ((d as f64 + 1.0 - base) / b).ceil();
        let mut next = if estimated.is_finite() && estimated > 0.0 {
            (estimated as u32).clamp(v + 1, n)
        } else {
            v + 1
        };

        while next > v + 1 && value_at(next - 1) > d {
            next -= 1;
        }
        while next < n && value_at(next) <= d {
            next += 1;
        }

        f(d, (next - v) as usize);
        v = next;
    }
}

/// `for_each_step` の刻みを確率に直して密な配列へ加算する。
///
/// 出現回数の総和は必ず `hp.max(1)` なので、数え上げ直さない。
fn add_steps(out: &mut Vec<f64>, hp: u16, a: f64, b: f64, weight: f64) {
    let total = hp.max(1) as f64;

    for_each_step(hp, a, b, |value, count| {
        add_at(out, value, count as f64 / total * weight);
    });
}

pub(crate) fn add_at(out: &mut Vec<f64>, value: u16, rate: f64) {
    let index = value as usize;
    if out.len() <= index {
        out.resize(index + 1, 0.0);
    }
    out[index] += rate;
}

fn counts_to_density(counts: Vec<(u16, usize)>) -> Histogram<u16, f64> {
    let total: usize = counts.iter().map(|(_, count)| *count).sum();
    let total = total as f64;

    counts
        .into_iter()
        .map(|(value, count)| (value, count as f64 / total))
        .collect()
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

    fn counts(&self) -> Vec<(u16, usize)> {
        step_counts(self.current_hp, 0.06, 0.08)
    }

    fn density(&self) -> Histogram<u16, f64> {
        counts_to_density(self.counts())
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

    fn counts(&self) -> Vec<(u16, usize)> {
        step_counts(self.current_hp, 0.5, 0.3)
    }

    fn density(&self) -> Histogram<u16, f64> {
        counts_to_density(self.counts())
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

    pub fn minmax(&self) -> (u16, u16) {
        let min_defense_power = self.defense_power().min();
        let max_defense_power = self.defense_power().max();

        let d1 = match self.calc_damage_type(max_defense_power) {
            DamageType::Actual(value) => value,
            DamageType::Scratch => self.scratch_damage().min(),
            DamageType::OverkillProtection => self.overkill_protection_damage().min(),
        };
        let d2 = match self.calc_damage_type(min_defense_power) {
            DamageType::Actual(value) => value,
            DamageType::Scratch => self.scratch_damage().max(),
            DamageType::OverkillProtection => self.overkill_protection_damage().max(),
        };

        if d1 <= d2 {
            (d1, d2)
        } else {
            (d2, d1)
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

    pub(crate) fn add_scratch_density_to(&self, out: &mut Vec<f64>, weight: f64) {
        if weight == 0.0 {
            return;
        }

        add_steps(out, self.current_hp, 0.06, 0.08, weight);
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

    /// 分類は `calc_damage_type` を `density()` と共有しているが、割合ダメージと
    /// 撃沈保護ダメージの振り分けは二重に書き下している。両者が一致することは
    /// `analyzer::damage_report` の `test_density_matches_naive` が見ている。
    pub(crate) fn add_density_to(&self, out: &mut Vec<f64>, weight: f64, mode: DensityMode) {
        if weight == 0.0 {
            return;
        }

        if self.hit_type == HitType::Miss {
            if self.is_cutin {
                self.add_scratch_density_to(out, weight);
            } else {
                add_at(out, 0, weight);
            }
            return;
        }

        let keeps_penetration = mode.keeps_penetration();

        // 中間の `Histogram<DamageType, f64>` を作らず、防御力サンプルを直接振り分ける。
        // 判定は `calc_damage_type` のままなので分類規則は一箇所に保たれる。
        let defense_power = self.defense_power();
        let unit = weight / defense_power.iter().len() as f64;

        let mut scratch = 0_usize;
        let mut overkill_protection = 0_usize;

        for value in defense_power.iter() {
            match self.calc_damage_type(value) {
                DamageType::Actual(value) => {
                    if keeps_penetration {
                        add_at(out, value, unit)
                    }
                }
                DamageType::Scratch => scratch += 1,
                DamageType::OverkillProtection => overkill_protection += 1,
            }
        }

        if scratch > 0 {
            self.add_scratch_density_to(out, unit * scratch as f64);
        }

        if overkill_protection > 0 && keeps_penetration {
            add_steps(
                out,
                self.current_hp,
                0.5,
                0.3,
                unit * overkill_protection as f64,
            );
        }
    }

    pub fn density(&self) -> Histogram<u16, f64> {
        let damage_type_density = self.damage_type_density();

        damage_type_density
            .into_iter()
            .map(|(damage_type, rate)| {
                let current_density = match damage_type {
                    DamageType::Actual(value) => Some(value).density(),
                    DamageType::Scratch => self.scratch_damage().density(),
                    DamageType::OverkillProtection => self.overkill_protection_damage().density(),
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

    /// 閉形式の数え上げが、v を全走査した場合と完全に一致すること。
    #[test]
    fn test_step_counts_matches_naive() {
        fn naive(hp: u16, a: f64, b: f64) -> Vec<(u16, usize)> {
            let mut counts: Vec<(u16, usize)> = Vec::new();
            for v in 0..hp.max(1) {
                let value = (a * hp as f64 + v as f64 * b) as u16;
                match counts.last_mut() {
                    Some((last, count)) if *last == value => *count += 1,
                    _ => counts.push((value, 1)),
                }
            }
            counts
        }

        let hps = (0..=300u16)
            .chain([399, 400, 401, 999, 1000, 1550, 2000, 5999, 6000, 9800])
            .collect::<Vec<_>>();

        for hp in hps {
            // 割合ダメージ
            assert_eq!(
                step_counts(hp, 0.06, 0.08),
                naive(hp, 0.06, 0.08),
                "scratch hp={hp}"
            );
            // 撃沈保護ダメージ
            assert_eq!(
                step_counts(hp, 0.5, 0.3),
                naive(hp, 0.5, 0.3),
                "overkill hp={hp}"
            );
        }
    }

    /// 閉形式から作った確率分布が、既存の `Density` 実装と一致すること。
    #[test]
    fn test_scratch_density_matches_iter() {
        for hp in [0u16, 1, 2, 12, 99, 100, 400, 1550, 6000] {
            let scratch = ScratchDamage { current_hp: hp };
            assert_eq!(
                scratch.density(),
                scratch.iter().density(),
                "scratch hp={hp}"
            );

            let overkill = OverkillProtectionDamage { current_hp: hp };
            assert_eq!(
                overkill.density(),
                overkill.iter().density(),
                "overkill hp={hp}"
            );
        }
    }

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
