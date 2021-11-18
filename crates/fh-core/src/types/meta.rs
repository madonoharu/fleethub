use std::collections::HashMap;

use fh_macro::FhAbi;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::FleetType;

#[derive(Debug, Default, Clone, Serialize, Deserialize, FhAbi, TS)]
pub struct ShipMeta {
    pub id: String,
    pub ship_id: u16,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, FhAbi, TS)]
pub struct FleetMeta {
    pub id: String,
    pub len: usize,
    pub ships: Vec<(String, Option<ShipMeta>)>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, FhAbi, TS)]
pub struct CompMeta {
    pub fleets: HashMap<FleetType, FleetMeta>,
}
