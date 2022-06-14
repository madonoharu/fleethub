use enumset::EnumSetType;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, EnumSetType, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum FleetCutin {
    NelsonTouch,
    NagatoCutin,
    ColoradoCutin,
    KongouCutin,
    Yamato2ShipCutin,
    Yamato3ShipCutin,
}

impl FleetCutin {
    pub fn ship_index_vec(&self) -> Vec<usize> {
        match self {
            FleetCutin::NelsonTouch => vec![0, 2, 4],
            FleetCutin::NagatoCutin => vec![0, 0, 1],
            FleetCutin::ColoradoCutin => vec![0, 1, 2],
            FleetCutin::KongouCutin => vec![0, 1],
            FleetCutin::Yamato2ShipCutin => vec![0, 0, 1],
            FleetCutin::Yamato3ShipCutin => vec![0, 1, 2],
        }
    }
}
