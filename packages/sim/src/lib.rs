#![feature(concat_idents)]

mod const_id;
mod constants;
mod factory;
mod gear;
mod master;
mod ship;

use wasm_bindgen::prelude::*;
use web_sys::console::log_1;

#[wasm_bindgen]
pub fn greet() {
    log_1(&JsValue::from("Hello, sim!".to_string()));
}
