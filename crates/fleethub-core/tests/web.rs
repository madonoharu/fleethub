// #![cfg(target_arch = "wasm32")]

mod master_data;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

use fleethub_core::{org::Org, types::OrgType};

#[wasm_bindgen_test]
fn pass() {
    let org = Org::default();
    assert_eq!(org.org_type, OrgType::Single);
}
