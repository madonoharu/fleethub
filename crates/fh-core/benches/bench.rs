use criterion::{criterion_group, criterion_main, Criterion};

fn bm1(c: &mut Criterion) {
    c.bench_function("My Answer", |b| b.iter(|| 10 / 3));
}

fn bm2(c: &mut Criterion) {
    c.bench_function("Comp Answer", |b| {
        b.iter(|| ((10 as f64) / (3 as f64)) as u16)
    });
}

criterion_group!(benches, bm1, bm2);
criterion_main!(benches);
