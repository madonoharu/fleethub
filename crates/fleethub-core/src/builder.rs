use wasm_bindgen::prelude::*;

use crate::{analyzer::AttackAnalyzerConfig, types::ShipConditions};

#[wasm_bindgen]
pub struct AttackAnalyzerConfigBuilder {
    config: AttackAnalyzerConfig,
}

#[wasm_bindgen]
impl AttackAnalyzerConfigBuilder {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            config: Default::default(),
        }
    }

    pub fn build(&self) -> AttackAnalyzerConfig {
        self.config.clone()
    }
}

#[wasm_bindgen]
pub fn parse_ship_conditions(value: ShipConditions) -> ShipConditions {
    value
}
