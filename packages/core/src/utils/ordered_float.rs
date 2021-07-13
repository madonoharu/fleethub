use std::{collections::HashMap, str::FromStr};

use arrayvec::ArrayVec;
use enumset::EnumSet;
use fasteval::bool_to_f64;
use num_derive::FromPrimitive;
use ordered_float::{Float, OrderedFloat};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, FromPrimitive,
)]
pub struct OrderedF64(OrderedFloat<f64>);

impl TS for OrderedF64 {
    fn name() -> String {
        f64::name()
    }

    fn inline(indent: usize) -> String {
        f64::inline(indent)
    }

    fn dependencies() -> Vec<(std::any::TypeId, String)> {
        f64::dependencies()
    }

    fn transparent() -> bool {
        f64::transparent()
    }
}

impl From<f64> for OrderedF64 {
    fn from(val: f64) -> Self {
        Self(val.into())
    }
}

impl From<OrderedF64> for f64 {
    fn from(val: OrderedF64) -> Self {
        val.0.into()
    }
}

#[test]
fn t() {
    use num_traits::FromPrimitive;
    let value = OrderedF64::from(1.0);
    let a = f64::from(value);
}
