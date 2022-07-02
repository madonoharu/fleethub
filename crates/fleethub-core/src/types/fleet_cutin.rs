use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, EnumSetType, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum FleetCutin {
    NelsonTouch,
    NagatoClassCutin,
    ColoradoClassCutin,
    KongouClassCutin,
    Yamato2ShipCutin,
    Yamato3ShipCutin,
}
