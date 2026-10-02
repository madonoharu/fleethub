use std::hint::black_box;

use criterion::{Criterion, criterion_group, criterion_main};
use fleethub_core::types::DefensePower;
use rand::{SeedableRng, rngs::SmallRng};

fn bench_defense_power(c: &mut Criterion) {
    let defense_power = DefensePower::new(100.0);
    let mut rng = SmallRng::seed_from_u64(0);

    c.bench_function("defense_power_choose", |b| {
        b.iter(|| black_box(defense_power.choose(&mut rng)));
    });
}

criterion_group!(benches, bench_defense_power);
criterion_main!(benches);
