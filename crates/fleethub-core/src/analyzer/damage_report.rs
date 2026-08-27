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

        let (miss_damage_min, miss_damage_max) = miss.minmax();
        let (normal_damage_min, normal_damage_max) = normal.minmax();
        let (critical_damage_min, critical_damage_max) = critical.minmax();

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

    /// 1回ぶんの攻撃のダメージ分布を、ダメージ値を添字とする密な配列に書き出す。
    ///
    /// 多段攻撃では被弾するたびに残耐久が変わり、割合ダメージと撃沈保護ダメージが
    /// 残耐久に比例するため、段ごとに引き直す必要がある。
    fn once_dense(&self, current_hp: u16, out: &mut Vec<f64>) {
        out.clear();

        for (hit_type, rate) in self.hit_rate.iter() {
            if rate == 0.0 {
                continue;
            }

            self.to_damage(hit_type, current_hp)
                .add_density_to(out, rate);
        }
    }

    fn density(&self) -> Histogram<u16, f64> {
        let hp1 = self.defense_params.current_hp;

        // ダメージ値は 0 から連続しているので、畳み込みはハッシュマップではなく
        // 密な配列で行う。
        let mut density1 = Vec::new();
        self.once_dense(hp1, &mut density1);

        if self.hits > 1.0 {
            let max_hits = self.hits.ceil() as usize;
            let max_hits_rate = self.hits.fract();
            let mut once_buf = Vec::new();

            for h in 1..max_hits {
                let mut density2 = vec![0.0; density1.len()];

                for damage_value1 in 0..density1.len() {
                    let rate1 = density1[damage_value1];

                    if rate1 == 0.0 {
                        continue;
                    }

                    let hp2 = hp1.saturating_sub(damage_value1 as u16);
                    self.once_dense(hp2, &mut once_buf);

                    let required = damage_value1 + once_buf.len();
                    if density2.len() < required {
                        density2.resize(required, 0.0);
                    }

                    for (damage_value2, rate2) in once_buf.iter().enumerate() {
                        if *rate2 != 0.0 {
                            density2[damage_value1 + damage_value2] += rate1 * rate2;
                        }
                    }
                }

                // hits が端数のときは、切り捨て回数と切り上げ回数を小数部の比率で混ぜる。
                // 例: hits = 1.65 なら 1回が 35%、2回が 65%。
                // ここは最後の畳み込みでのみ行う。
                if h == max_hits - 1 && max_hits_rate > 0.0 {
                    if density1.len() < density2.len() {
                        density1.resize(density2.len(), 0.0);
                    }

                    for (index, rate) in density1.iter_mut().enumerate() {
                        let fewer = *rate * (1.0 - max_hits_rate);
                        let more = density2.get(index).copied().unwrap_or(0.0) * max_hits_rate;
                        *rate = fewer + more;
                    }
                } else {
                    density1 = density2;
                }
            }
        }

        density1
            .into_iter()
            .enumerate()
            .filter(|(_, rate)| *rate != 0.0)
            .map(|(value, rate)| (value as u16, rate))
            .collect()
    }
}

#[cfg(test)]
mod test {
    use super::*;

    fn attack(hits: f64, current_hp: u16) -> Attack {
        Attack {
            attack_power: Some(AttackPower {
                normal: 1000.0,
                critical: 1500.0,
                remaining_ammo_mod: 1.0,
                ..Default::default()
            }),
            defense_params: Some(DefenseParams {
                basic_defense_power: 500.0,
                current_hp,
                max_hp: current_hp,
                sinkable: true,
                overkill_protection: false,
            }),
            hit_rate: Some(HitRate {
                normal: 0.2,
                critical: 0.1,
                total: 0.3,
            }),
            hits,
            is_cutin: true,
        }
    }

    fn density_of(hits: f64, current_hp: u16) -> Histogram<u16, f64> {
        DamageReport::new(&attack(hits, current_hp))
            .unwrap()
            .damage_density
    }

    fn assert_close(left: &Histogram<u16, f64>, right: &Histogram<u16, f64>, label: &str) {
        let keys = left.keys().chain(right.keys()).copied().collect::<Vec<_>>();

        for key in keys {
            let a = left.get(&key).copied().unwrap_or(0.0);
            let b = right.get(&key).copied().unwrap_or(0.0);
            assert!((a - b).abs() < 1e-12, "{label}: damage {key} で {a} != {b}");
        }
    }

    /// 最適化前の実装（ハッシュマップで畳み込む）。等価性の検証と速度比較に使う。
    fn naive(analyzer: &DamageAnalyzer) -> Histogram<u16, f64> {
        let hp1 = analyzer.defense_params.current_hp;

        let once = |current_hp: u16| -> Histogram<u16, f64> {
            analyzer
                .hit_rate
                .iter()
                .map(|(hit_type, rate)| analyzer.to_damage(hit_type, current_hp).density() * rate)
                .sum()
        };

        let mut density1 = once(hp1);

        if analyzer.hits <= 1.0 {
            return density1;
        }

        let max_hits = analyzer.hits.ceil() as usize;
        let max_hits_rate = analyzer.hits.fract();

        for h in 1..max_hits {
            let density2 = density1
                .iter()
                .flat_map(|(&damage_value1, rate1)| {
                    let hp2 = hp1.saturating_sub(damage_value1);

                    once(hp2).into_iter().map(move |(damage_value2, rate2)| {
                        (damage_value1 + damage_value2, rate1 * rate2)
                    })
                })
                .collect::<Histogram<u16, f64>>();

            if h == max_hits - 1 && max_hits_rate > 0.0 {
                density1 = density1 * (1.0 - max_hits_rate) + density2 * max_hits_rate;
            } else {
                density1 = density2;
            }
        }

        density1
    }

    /// 密な配列による畳み込みが、素朴なハッシュマップ実装と一致すること。
    #[test]
    fn test_density_matches_naive() {
        let cases = [
            (1.0, 400u16),
            (1.5, 99),
            (1.65, 99),
            (2.0, 99),
            (2.5, 12),
            (3.0, 12),
        ];

        for (hits, current_hp) in cases {
            {
                let a = attack(hits, current_hp);
                let attack_power = a.attack_power.as_ref().unwrap();
                let defense_params = a.defense_params.as_ref().unwrap();
                let hit_rate = a.hit_rate.as_ref().unwrap();

                let analyzer = DamageAnalyzer {
                    attack_power,
                    defense_params,
                    hit_rate,
                    hits,
                    is_cutin: false,
                };

                assert_close(
                    &analyzer.density(),
                    &naive(&analyzer),
                    &format!("hits={hits} hp={current_hp}"),
                );
            }
        }
    }

    /// 端数 hits は「切り捨て回数」と「切り上げ回数」の混合になること。
    ///
    /// 例えば主魚電カットイン (hits = 1.65) は 1回が 35%、2回が 65%。
    /// 作戦室のチップも `1 (35%) ~ 2 (65%)` と表示している。
    #[test]
    fn test_fractional_hits_is_a_mixture() {
        for (hits, lower, upper) in [(1.5, 1.0, 2.0), (1.65, 1.0, 2.0), (2.25, 2.0, 3.0)] {
            let current_hp = 400;
            let rate = hits - lower;

            let actual = density_of(hits, current_hp);
            let lower_density = density_of(lower, current_hp);
            let upper_density = density_of(upper, current_hp);

            let expected = lower_density.clone() * (1.0 - rate) + upper_density * rate;

            assert_close(&actual, &expected, &format!("hits={hits}"));

            // 回帰テスト: 端数が無視されて切り上げ回数だけで計算されていないこと。
            // 以前は混合の分岐が到達不能で、hits = 1.65 が hits = 2.0 と同じ分布になっていた。
            let upper_density = density_of(upper, current_hp);
            let diff = lower_density
                .keys()
                .chain(upper_density.keys())
                .map(|key| {
                    let a = actual.get(key).copied().unwrap_or(0.0);
                    let b = upper_density.get(key).copied().unwrap_or(0.0);
                    (a - b).abs()
                })
                .fold(0.0_f64, f64::max);

            assert!(
                diff > 1e-9,
                "hits={hits} の分布が {upper} 回ぶんと同一になっている (最大差 {diff})"
            );
        }
    }

    /// 速度比較。`cargo test -p fleethub-core --release -- --ignored --nocapture` で実行する。
    #[test]
    #[ignore = "ベンチマーク"]
    fn bench_density() {
        use std::time::Instant;

        // 実データから採取したパラメータ（大和改二重の連撃 → 各ボス）
        let cases: [(&str, u16, f64, f64, f64); 3] = [
            ("戦艦棲姫", 400, 118.0, 252.0, 378.0),
            ("港湾夏姫II", 1550, 173.0, 252.0, 378.0),
            ("集積地棲姫III-壊", 6000, 222.86, 252.0, 378.0),
        ];

        for (name, current_hp, basic_defense_power, normal, critical) in cases {
            let a = Attack {
                attack_power: Some(AttackPower {
                    normal,
                    critical,
                    remaining_ammo_mod: 1.0,
                    ..Default::default()
                }),
                defense_params: Some(DefenseParams {
                    basic_defense_power,
                    current_hp,
                    max_hp: current_hp,
                    sinkable: true,
                    overkill_protection: false,
                }),
                hit_rate: Some(HitRate {
                    normal: 0.63,
                    critical: 0.14,
                    total: 0.77,
                }),
                hits: 2.0,
                is_cutin: false,
            };

            let analyzer = DamageAnalyzer {
                attack_power: a.attack_power.as_ref().unwrap(),
                defense_params: a.defense_params.as_ref().unwrap(),
                hit_rate: a.hit_rate.as_ref().unwrap(),
                hits: a.hits,
                is_cutin: a.is_cutin,
            };

            let points = analyzer.density().len();

            let run = |label: &str, f: &dyn Fn() -> Histogram<u16, f64>, times: u32| {
                f();
                let start = Instant::now();
                for _ in 0..times {
                    std::hint::black_box(f());
                }
                let ms = start.elapsed().as_secs_f64() * 1000.0 / times as f64;
                println!("    {label:<10} {ms:>9.2} ms");
                ms
            };

            println!("\n=== {name} (残耐久 {current_hp}, 点数 {points}) ===");
            let before = run("最適化前", &|| naive(&analyzer), 3);
            let after = run("最適化後", &|| analyzer.density(), 20);
            println!("    短縮率     {:>9.1} 倍", before / after);
        }
    }

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
