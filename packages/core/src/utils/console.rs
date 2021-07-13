use wasm_bindgen::JsValue;
use web_sys::console;

macro_rules! format_js {
  ($($t:tt)*) => (JsValue::from(format_args!($($t)*).to_string()))
}

#[macro_export]
macro_rules! log {
  ($($t:tt)*) => (console::log_1(&format_js($($t)*)))
}

#[macro_export]
macro_rules! warn {
  ($($t:tt)*) => (console::warn_1(&format_js($($t)*)))
}

#[macro_export]
macro_rules! error {
  ($($t:tt)*) => (console::error_1(&format_js($($t)*)))
}
