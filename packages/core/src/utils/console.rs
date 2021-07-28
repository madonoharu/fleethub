#[macro_export]
macro_rules! log {
  ($($t:tt)*) => (web_sys::console::log_1(&wasm_bindgen::JsValue::from(format_args!($($t)*).to_string())))
}

#[macro_export]
macro_rules! warn {
  ($($t:tt)*) => (web_sys::console::warn_1(&wasm_bindgen::JsValue::from(format_args!($($t)*).to_string())))
}

#[macro_export]
macro_rules! error {
  ($($t:tt)*) => (web_sys::console::error_1(&wasm_bindgen::JsValue::from(format_args!($($t)*).to_string())))
}
