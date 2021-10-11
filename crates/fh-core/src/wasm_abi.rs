use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
import * as bindings from "../bindings";
import {
  AirSquadronParams,
  FleetParams,
  GearParams,
  OrgParams,
  ShipParams,
} from "../types";

export * from "../types";
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "GearParams")]
    pub type GearParams;
    #[wasm_bindgen(typescript_type = "ShipParams")]
    pub type ShipParams;
    #[wasm_bindgen(typescript_type = "FleetParams")]
    pub type FleetParams;
    #[wasm_bindgen(typescript_type = "AirSquadronParams")]
    pub type AirSquadronParams;
    #[wasm_bindgen(typescript_type = "OrgParams")]
    pub type OrgParams;
}
