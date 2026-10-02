use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, Tsify)]
pub enum AirWaveType {
    Jet,
    LandBase,
    Carrier,
}
