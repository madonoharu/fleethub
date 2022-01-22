use fleethub_macro::FhAbi;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, TS, FhAbi)]
pub enum FleetCutin {
    NelsonTouch,
    NagatoCutin,
    ColoradoCutin,
    KongouCutin,
}

impl FleetCutin {
    pub fn ship_index_vec(&self) -> Vec<usize> {
        match self {
            FleetCutin::NelsonTouch => vec![0, 2, 4],
            FleetCutin::NagatoCutin => vec![0, 0, 1],
            FleetCutin::ColoradoCutin => vec![0, 1, 2],
            FleetCutin::KongouCutin => vec![0, 1],
        }
    }
}
