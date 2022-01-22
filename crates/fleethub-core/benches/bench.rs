use criterion::{criterion_group, criterion_main, Criterion};
use fleethub_core::{ship::Ship, types::ShipState};

fn bm1(c: &mut Criterion) {
    let ship = Ship::default();
    c.bench_function("clone", |b| {
        b.iter(|| {
            let _ = ship.clone();
        })
    });
}

fn bm2(c: &mut Criterion) {
    let state = ShipState::default();

    c.bench_function("JsValue", |b| {
        b.iter(|| {
            let _ = serde_json::to_string(&state);
        })
    });
}

criterion_group!(benches, bm1, bm2);
criterion_main!(benches);
