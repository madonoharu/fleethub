use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::{Attack, AttackPower, HitRate},
    attack::{Damage, DefenseParams, DensityMode, HitType},
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
    /// 全弾が割合ダメージ（カスダメ）だった場合の分布。総和はその確率なので 1 未満。
    ///
    /// `damage_density` から引けば、貫通が1発でも混ざった分と分けられる。
    /// 割合ダメージを 0 ダメージ扱いにした分布との差では取り出せない。多段攻撃で
    /// 「割合＋貫通」の結果が貫通ぶんだけ大きなダメージ値へ動くためで、
    /// その位置まで割合として数えてしまう。
    pub damage_density_scratch_only: Histogram<u16, f64>,
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

        let analyze = |mode: DensityMode| {
            attack
                .hit_rate
                .as_ref()
                .map(|hit_rate| {
                    DamageAnalyzer {
                        attack_power,
                        defense_params,
                        hit_rate,
                        hits,
                        is_cutin,
                        mode,
                    }
                    .density()
                })
                .unwrap_or_default()
        };

        let damage_density = analyze(DensityMode::All);
        let damage_density_scratch_only = analyze(DensityMode::ScratchOnly);

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
            damage_density_scratch_only,
            damage_state_density,
        })
    }
}

/// 1段ぶんの分布を何から書き出すか。
#[derive(Debug, Clone, Copy)]
enum StepSource {
    /// 命中種別ごとに防御力サンプルを振り分ける。
    HitRate,
    /// 割合ダメージの値だけを、あらかじめ求めた確率で書き出す。
    ScratchWeight(f64),
}

struct DamageAnalyzer<'a> {
    attack_power: &'a AttackPower,
    hit_rate: &'a HitRate,
    defense_params: &'a DefenseParams,
    is_cutin: bool,
    hits: f64,
    mode: DensityMode,
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

    fn write_step(&self, current_hp: u16, out: &mut Vec<f64>, source: StepSource) {
        out.clear();

        match source {
            StepSource::ScratchWeight(weight) => {
                self.to_damage(HitType::Normal, current_hp)
                    .add_scratch_density_to(out, weight);
            }
            StepSource::HitRate => {
                for (hit_type, rate) in self.hit_rate.iter() {
                    if rate == 0.0 {
                        continue;
                    }

                    self.to_damage(hit_type, current_hp)
                        .add_density_to(out, rate, self.mode);
                }
            }
        }
    }

    fn scratch_weight(&self, current_hp: u16) -> f64 {
        self.hit_rate
            .iter()
            .filter(|(_, rate)| *rate != 0.0)
            .map(|(hit_type, rate)| rate * self.to_damage(hit_type, current_hp).scratch_rate())
            .sum()
    }

    fn step_source(&self) -> StepSource {
        match self.mode {
            DensityMode::All => StepSource::HitRate,
            DensityMode::ScratchOnly => {
                StepSource::ScratchWeight(self.scratch_weight(self.defense_params.current_hp))
            }
        }
    }

    fn density(&self) -> Histogram<u16, f64> {
        self.density_from(self.step_source())
    }

    fn density_from(&self, source: StepSource) -> Histogram<u16, f64> {
        let hp1 = self.defense_params.current_hp;

        // 畳み込みはハッシュマップではなく密な配列で行う。ダメージ値をそのまま
        // 添字にできるので、要素ごとのハッシュ計算と再確保が要らない。
        //
        // 代わりにコストは非ゼロ要素の数ではなく `0..最大累積ダメージ` の長さに
        // 比例する。実データのように分布が密であれば速くなるが、攻撃力だけが
        // 極端に大きく分布が疎な場合は逆に遅くなる。1発あたりのダメージ値は
        // `calc_damage_type` の `as u16` で 65535 に飽和するため、配列長は
        // `ceil(hits) * 65536` (約 1.6MB) で頭打ちになる。
        let mut density1 = Vec::new();
        self.write_step(hp1, &mut density1, source);

        if self.hits > 1.0 {
            let max_hits = self.hits.ceil() as usize;
            let max_hits_rate = self.hits.fract();
            let mut step_buf = Vec::new();

            for h in 1..max_hits {
                let mut density2 = vec![0.0; density1.len()];

                for damage_value1 in 0..density1.len() {
                    let rate1 = density1[damage_value1];

                    if rate1 == 0.0 {
                        continue;
                    }

                    let hp2 = hp1.saturating_sub(damage_value1 as u16);
                    self.write_step(hp2, &mut step_buf, source);

                    let required = damage_value1 + step_buf.len();
                    if density2.len() < required {
                        density2.resize(required, 0.0);
                    }

                    for (damage_value2, rate2) in step_buf.iter().enumerate() {
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
            .map(|(value, rate)| {
                // 累積ダメージが u16 を超えるのはカスタム補正で極端な攻撃力を
                // 入れた場合だけ。release では最適化前の `u16 + u16` も wrap
                // していたので挙動は変えず、debug でだけ気付けるようにする。
                debug_assert!(value <= u16::MAX as usize, "累積ダメージが u16 を超えた");
                (value as u16, rate)
            })
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

    /// 装甲を抜けたり抜けなかったりする攻撃。割合ダメージと実ダメージが混ざる。
    fn mixed_attack(hits: f64, current_hp: u16) -> Attack {
        Attack {
            attack_power: Some(AttackPower {
                normal: 550.0,
                critical: 800.0,
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
                normal: 0.6,
                critical: 0.1,
                total: 0.7,
            }),
            hits,
            is_cutin: false,
        }
    }

    #[test]
    fn test_damage_density_scratch_only() {
        for hits in [1.0, 2.0, 1.65] {
            for current_hp in [99u16, 50, 10] {
                let report = DamageReport::new(&mixed_attack(hits, current_hp)).unwrap();
                let all = &report.damage_density;
                let scratch_only = &report.damage_density_scratch_only;

                let label = format!("hits={hits} hp={current_hp}");
                let probability = |h: &Histogram<u16, f64>| h.values().sum::<f64>();

                assert!(report.normal_scratch_rate > 0.0, "{label}");

                let all_scratch_probability = probability(scratch_only);
                assert!(all_scratch_probability > 0.0, "{label}");
                assert!(
                    all_scratch_probability < probability(all) - 1e-12,
                    "{label}"
                );

                // 図では合計の棒を割合ぶんで塗り分ける。食み出すと下の段が負になる。
                for (damage, rate) in scratch_only.iter() {
                    let total = all.get(damage).copied().unwrap_or(0.0);
                    assert!(*rate <= total + 1e-12, "{label} damage={damage}");
                }

                let once_max = |hp: u16| (hp as f64 * 0.06 + (hp.max(1) - 1) as f64 * 0.08) as u16;

                let mut all_scratch_max = 0_u16;
                let mut hp = current_hp;
                for _ in 0..hits.ceil() as usize {
                    let step = once_max(hp);
                    all_scratch_max += step;
                    hp = hp.saturating_sub(step);
                }

                let max_damage = scratch_only.keys().copied().max().unwrap_or(0);
                assert!(
                    max_damage <= all_scratch_max,
                    "{label} {max_damage} > {all_scratch_max}"
                );

                // 多段では「割合＋貫通」の結果がこの上限より右へ動く。だから合計を
                // 上限で切っても割合は取り出せず、専用の分布が要る。
                if hits > 1.0 {
                    let moved_beyond = all
                        .iter()
                        .any(|(damage, rate)| *damage > all_scratch_max && *rate > 1e-12);

                    assert!(moved_beyond, "{label}");
                }
            }
        }
    }

    /// 割合ダメージの近道が、防御力サンプルを毎段走査する一般の経路と一致すること。
    #[test]
    fn test_scratch_only_shortcut_matches_general_path() {
        for hits in [1.0, 2.0, 3.0, 1.65] {
            for current_hp in [6000u16, 400, 99, 17, 10, 1] {
                for is_cutin in [false, true] {
                    let mut attack = mixed_attack(hits, current_hp);
                    attack.is_cutin = is_cutin;

                    let analyzer = DamageAnalyzer {
                        attack_power: attack.attack_power.as_ref().unwrap(),
                        defense_params: attack.defense_params.as_ref().unwrap(),
                        hit_rate: attack.hit_rate.as_ref().unwrap(),
                        hits,
                        is_cutin,
                        mode: DensityMode::ScratchOnly,
                    };

                    let label = format!("hits={hits} hp={current_hp} cutin={is_cutin}");
                    assert_close(
                        &analyzer.density_from(analyzer.step_source()),
                        &analyzer.density_from(StepSource::HitRate),
                        &label,
                    );
                }
            }
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
    ///
    /// 復元しているのは畳み込みの部分だけで、呼び出す `Damage::density()` は
    /// 閉形式の数え上げを既に使っている。そちらが素朴な走査と一致することは
    /// `attack::damage` の `test_step_counts_matches_naive` が見ている。
    /// そのため `bench_density` の短縮率は畳み込みぶんだけで、最適化全体では
    /// これより大きい。
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

    /// 実データから採取したパラメータ（大和改二重の連撃 → 各ボス）。
    /// 最適化が効く規模なので、等価性の検証と速度比較の両方で使う。
    const BOSS_CASES: [(&str, u16, f64, f64, f64); 3] = [
        ("戦艦棲姫", 400, 118.0, 252.0, 378.0),
        ("港湾夏姫II", 1550, 173.0, 252.0, 378.0),
        ("集積地棲姫III-壊", 6000, 222.86, 252.0, 378.0),
    ];

    fn boss_attack(
        current_hp: u16,
        basic_defense_power: f64,
        normal: f64,
        critical: f64,
    ) -> Attack {
        Attack {
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
        }
    }

    /// 密な配列による畳み込みが、素朴なハッシュマップ実装と一致すること。
    ///
    /// `add_density_to` は命中種別ごとに Actual / Scratch / OverkillProtection へ
    /// 振り分ける。どれか一つでも通らない条件があると、その経路が旧実装と
    /// 比べられないままになるので、条件を組み合わせて全経路を通す。
    #[test]
    fn test_density_matches_naive() {
        // 素朴な実装は残耐久に対しておよそ2乗で効くので、組み合わせを広げる側は
        // 残耐久を小さくする。分岐を通すのに大きさは要らない。
        let branch_cases = [(1.0, 30u16), (1.65, 30), (2.0, 30)];

        // 貫通しかしない攻撃と、割合ダメージが混ざる攻撃の両方を通す。
        type Builder = fn(f64, u16) -> Attack;
        type Tweak = fn(&mut Attack);

        let builders: [(&str, Builder); 2] = [("貫通", attack), ("混在", mixed_attack)];

        let tweaks: [(&str, Tweak); 5] = [
            ("既定", |_| {}),
            // ミスが割合ダメージになる経路。
            ("cutin", |a| a.is_cutin = true),
            ("撃沈保護", |a| {
                a.defense_params.as_mut().unwrap().overkill_protection = true;
            }),
            ("非撃沈", |a| {
                a.defense_params.as_mut().unwrap().sinkable = false;
            }),
            // 命中率に 0 の成分があると、その種別を飛ばす分岐を通る。
            ("クリ0", |a| {
                let hit_rate = a.hit_rate.as_mut().unwrap();
                hit_rate.normal += hit_rate.critical;
                hit_rate.critical = 0.0;
            }),
        ];

        let check = |a: &Attack, hits: f64, label: &str| {
            let analyzer = DamageAnalyzer {
                attack_power: a.attack_power.as_ref().unwrap(),
                defense_params: a.defense_params.as_ref().unwrap(),
                hit_rate: a.hit_rate.as_ref().unwrap(),
                hits,
                is_cutin: a.is_cutin,
                mode: DensityMode::All,
            };

            let actual = analyzer.density();
            let expected = naive(&analyzer);

            // キー集合まで一致すること。密な配列側がゼロを残していないか。
            let mut actual_keys = actual.keys().copied().collect::<Vec<_>>();
            let mut expected_keys = expected.keys().copied().collect::<Vec<_>>();
            actual_keys.sort_unstable();
            expected_keys.sort_unstable();
            assert_eq!(actual_keys, expected_keys, "{label}: キー集合が違う");

            assert_close(&actual, &expected, label);
        };

        for (hits, current_hp) in branch_cases {
            for (build_label, build) in builders {
                for (tweak_label, tweak) in tweaks {
                    let mut a = build(hits, current_hp);
                    tweak(&mut a);
                    check(
                        &a,
                        hits,
                        &format!("{build_label}/{tweak_label} hits={hits}"),
                    );
                }
            }
        }

        // 段数と残耐久を変えた素の比較。
        for (hits, current_hp) in [
            (1.0, 400u16),
            (1.5, 99),
            (1.65, 99),
            (2.0, 99),
            (2.5, 12),
            (3.0, 12),
        ] {
            let a = attack(hits, current_hp);
            check(&a, hits, &format!("hits={hits} hp={current_hp}"));
        }

        // 最適化が効く規模でも一致すること。分岐の網羅は上の小さいケースが見ている。
        //
        // 素朴な実装は残耐久に対しておよそ2乗で効くので、debug では残耐久 6000 だけで
        // 分単位になる。そこは bench_density が同じ比較をしている。
        for (name, current_hp, basic_defense_power, normal, critical) in
            BOSS_CASES.into_iter().filter(|(_, hp, ..)| *hp <= 1550)
        {
            let a = boss_attack(current_hp, basic_defense_power, normal, critical);
            check(&a, a.hits, name);
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

            let expected = lower_density.clone() * (1.0 - rate) + upper_density.clone() * rate;

            assert_close(&actual, &expected, &format!("hits={hits}"));

            // 回帰テスト: 端数が無視されて切り上げ回数だけで計算されていないこと。
            // 以前は混合の分岐が到達不能で、hits = 1.65 が hits = 2.0 と同じ分布になっていた。
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

        for (name, current_hp, basic_defense_power, normal, critical) in BOSS_CASES {
            let a = boss_attack(current_hp, basic_defense_power, normal, critical);

            let analyzer = DamageAnalyzer {
                attack_power: a.attack_power.as_ref().unwrap(),
                defense_params: a.defense_params.as_ref().unwrap(),
                hit_rate: a.hit_rate.as_ref().unwrap(),
                hits: a.hits,
                is_cutin: a.is_cutin,
                mode: DensityMode::All,
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

            // 残耐久 6000 は debug では時間がかかりすぎて通常のテストに置けない。
            // ここでは release で両方を引くので、ついでに一致も見ておく。
            assert_close(&analyzer.density(), &naive(&analyzer), name);

            let before = run("最適化前", &|| naive(&analyzer), 3);
            let after = run("最適化後", &|| analyzer.density(), 20);
            println!("    短縮率     {:>9.1} 倍", before / after);

            // DamageReport::new は 2 モードぶん引くので、その内訳。
            let with_mode = |mode: DensityMode| DamageAnalyzer { mode, ..analyzer };
            run("うち All", &|| with_mode(DensityMode::All).density(), 20);
            run(
                "うち 割合のみ",
                &|| with_mode(DensityMode::ScratchOnly).density(),
                20,
            );
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
