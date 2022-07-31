use js_sys::Uint8Array;
use toml_edit::easy::{from_slice, Value};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(extends = Uint8Array)]
    #[derive(Clone, Debug)]
    type Buffer;
}

#[wasm_bindgen(module = "fs")]
extern "C" {
    #[wasm_bindgen(js_name = readFileSync, catch)]
    fn js_read_file(path: &str) -> Result<Buffer, JsValue>;
}

pub fn read_file(path: &str) -> anyhow::Result<Vec<u8>> {
    Ok(js_read_file(path)
        .map_err(|err| anyhow::anyhow!("{err:?}"))?
        .to_vec())
}

pub fn read_toml(path: &str) -> anyhow::Result<Value> {
    let buf = read_file(path)?;
    Ok(from_slice(&buf)?)
}
