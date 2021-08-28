// #![cfg(target_arch = "wasm32")]

use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

use fh_core::{org::Org, types::Role};

#[wasm_bindgen_test]
fn pass() {
    let org = Org::default();
}
