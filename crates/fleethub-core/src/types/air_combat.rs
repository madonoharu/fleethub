use fleethub_macro::FhAbi;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS, FhAbi)]
pub enum AirWaveType {
    Jet,
    LandBase,
    Carrier,
}
