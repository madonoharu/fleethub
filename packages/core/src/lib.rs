pub mod air_squadron;
pub mod array;
pub mod const_id;
pub mod constants;
pub mod factory;
pub mod fleet;
pub mod gear;
pub mod master;
pub mod org;
pub mod ship;

pub mod attack;
pub mod damage;
pub mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
