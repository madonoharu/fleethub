use wasm_bindgen_test::*;

use fh_macro::FhAbi;
use serde::{Deserialize, Serialize};
use wasm_bindgen::convert::{FromWasmAbi, IntoWasmAbi};
use wasm_bindgen::JsValue;

macro_rules! test_json {
    ($type:ident, $json:tt, $expected:expr) => {
        let json_value = serde_json::json!($json);
        let abi = JsValue::from_serde(&json_value).unwrap().into_abi();
        let value = unsafe { $type::from_abi(abi) };
        assert_eq!(value, $expected);

        let expected_abi = unsafe { JsValue::from_abi($expected.into_abi()) };
        assert_eq!(
            json_value,
            expected_abi.into_serde::<serde_json::Value>().unwrap(),
        );
    };
}

#[wasm_bindgen_test]
fn test_enum() {
    #[derive(Debug, PartialEq, Serialize, Deserialize, FhAbi)]
    enum E {
        A,
        B,
        C(i8),
        D(String),
    }

    test_json!(E, "A", E::A);
    test_json!(E, "B", E::B);
    test_json!(E, {"C": 2}, E::C(2));
    test_json!(E, {"D": "Foo"}, E::D("Foo".to_string()));
}

#[wasm_bindgen_test]
fn test_struct() {
    #[derive(Debug, PartialEq, Serialize, Deserialize, FhAbi)]
    struct S {
        a: i32,
    }

    test_json!(S, {"a": 1}, S {a:1});
    test_json!(S, {"a": 2}, S {a:2});
}
