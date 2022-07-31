#![allow(unused)]

use std::hash::{Hash, Hasher};

use criterion::{criterion_group, criterion_main, Criterion};
use fleethub_core::types::{Role, ShipState};
use rand::prelude::*;

fn bm1(c: &mut Criterion) {
    todo!()
}

fn config() -> Criterion {
    Criterion::default().sample_size(10000)
}

criterion_group! {
    name = benches;
    config = config();
    targets = bm1
}
criterion_main!(benches);
