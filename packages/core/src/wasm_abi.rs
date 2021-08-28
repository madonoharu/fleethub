use wasm_bindgen::{
    convert::{FromWasmAbi, IntoWasmAbi, OptionIntoWasmAbi},
    describe::WasmDescribe,
    prelude::*,
};

use crate::{
    analyzer::ShellingAttackAnalysis,
    attack::WarfareContext,
    types::{AirState, Engagement, Formation, OrgType, Role, Side},
};

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

    #[wasm_bindgen(typescript_type = "bindings.ShipAttr")]
    pub type JsShipAttr;

    #[wasm_bindgen(typescript_type = "bindings.NightCutinFleetState")]
    pub type JsNightCutinFleetState;

    #[wasm_bindgen(typescript_type = "bindings.WarfareContext")]
    pub type JsWarfareContext;
}

macro_rules! impl_wasm_abi_as_string {
    ($( $name:ident ),+ $(,)?) => {
        $(
            paste::paste! {
                #[wasm_bindgen]
                extern "C" {
                    #[wasm_bindgen(typescript_type = "bindings." $name "")]
                    pub type [<__ $name>];
                }

                impl WasmDescribe for $name {
                    fn describe() {
                        [<__ $name>]::describe();
                    }
                }

                impl IntoWasmAbi for $name {
                    type Abi = <[<__ $name>] as IntoWasmAbi>::Abi;

                    #[inline]
                    fn into_abi(self) -> Self::Abi {
                        let string = serde_json::to_string(&self).unwrap_throw();
                        JsValue::from_str(string.trim_matches('"')).into_abi()
                    }
                }

                impl FromWasmAbi for $name {
                    type Abi = <[<__ $name>] as FromWasmAbi>::Abi;

                    #[inline]
                    unsafe fn from_abi(js: Self::Abi) -> Self {
                        let string = [<__ $name>]::from_abi(js).as_string().unwrap_throw();

                        let mut json = String::with_capacity(string.len() + 2);
                        json.push('"');
                        json.push_str(&string);
                        json.push('"');

                        serde_json::from_str::<$name>(&json).unwrap_throw()
                    }
                }
            }
        )+
    };
}

macro_rules! impl_from_wasm_abi {
    ($( $name:ident ),+ $(,)?) => {
        $(
            paste::paste! {
                #[wasm_bindgen]
                extern "C" {
                    #[wasm_bindgen(typescript_type = "bindings." $name "")]
                    pub type [<__ $name>];
                }

                impl WasmDescribe for $name {
                    fn describe() {
                        [<__ $name>]::describe();
                    }
                }

                impl FromWasmAbi for $name {
                    type Abi = <[<__ $name>] as FromWasmAbi>::Abi;
                    #[inline]
                    unsafe fn from_abi(js: Self::Abi) -> Self {
                        [<__ $name>]::from_abi(js).into_serde().unwrap_throw()
                    }
                }
            }
        )+
    };
}

macro_rules! impl_into_wasm_abi {
    ($( $name:ident ),+ $(,)?) => {
        $(
            paste::paste! {
                #[wasm_bindgen]
                extern "C" {
                    #[wasm_bindgen(typescript_type = "bindings." $name "")]
                    pub type [<__ $name>];
                }

                impl WasmDescribe for $name {
                    fn describe() {
                        [<__ $name>]::describe();
                    }
                }

                impl IntoWasmAbi for $name {
                    type Abi = <[<__ $name>] as IntoWasmAbi>::Abi;
                    #[inline]
                    fn into_abi(self) -> Self::Abi {
                        JsValue::from_serde(&self).unwrap_throw().into_abi()
                    }
                }

                impl OptionIntoWasmAbi for $name {
                    fn none() -> Self::Abi {
                        [<__ $name>]::none()
                    }
                }
            }
        )+
    };
}

impl_wasm_abi_as_string!(AirState, Engagement, Formation, OrgType, Role, Side);
impl_from_wasm_abi!(WarfareContext);
impl_into_wasm_abi!(ShellingAttackAnalysis);
