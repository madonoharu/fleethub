use crate::fleet::{Fleet, FleetState};
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Debug, Default, Clone, Deserialize)]
pub struct PlanState {
    pub main: Option<FleetState>,
    pub escort: Option<FleetState>,
    pub route_sup: Option<FleetState>,
    pub boss_sup: Option<FleetState>,

    pub hq_level: Option<i32>,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Plan {
    #[wasm_bindgen(skip)]
    pub main: Fleet,
    #[wasm_bindgen(skip)]
    pub escort: Fleet,
    #[wasm_bindgen(skip)]
    pub route_sup: Fleet,
    #[wasm_bindgen(skip)]
    pub boss_sup: Fleet,

    pub hq_level: i32,
}
