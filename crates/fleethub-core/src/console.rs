use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[allow(unused_macros)]
macro_rules! log {
  ($($t:tt)*) => (web_sys::console::log_1(&wasm_bindgen::JsValue::from(format_args!($($t)*).to_string())))
}

#[allow(unused_macros)]
macro_rules! error {
  ($($t:tt)*) => (web_sys::console::error_1(&wasm_bindgen::JsValue::from(format_args!($($t)*).to_string())))
}

#[allow(unused_imports)]
pub(crate) use {error, log};
