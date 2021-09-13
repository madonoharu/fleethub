// #![cfg(target_arch = "wasm32")]

use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

use fh_core::{org::Org, types::OrgType};

#[wasm_bindgen_test]
fn pass() {
    let org = Org::default();
    assert_eq!(org.org_type, OrgType::Single);
}
