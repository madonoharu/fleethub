use std::collections::BTreeMap;

use fleethub_core::{
    analyzer::{AttackAnalysis, AttackAnalyzer, AttackAnalyzerConfig},
    types::{AirState, Engagement},
};

use serde::Deserialize;
use toml_edit::easy::{from_str, Value};
use wasm_bindgen_test::*;

use crate::*;

#[derive(Debug, Deserialize)]
struct AttackAnalyzerTestCase {
    #[serde(skip)]
    path: String,
    #[serde(default)]
    description: String,
    #[serde(default)]
    air_state: AirState,
    #[serde(default)]
    engagement: Engagement,
    attacker: TestShip,
    target: TestShip,
    expected: Value,
}

impl AttackAnalyzerTestCase {
    fn new(path: String, toml: String) -> Self {
        Self {
            path,
            ..from_str(&toml).unwrap()
        }
    }

    fn attack_analyzer_config(&self) -> AttackAnalyzerConfig {
        AttackAnalyzerConfig {
            air_state: self.air_state,
            engagement: self.engagement,
            attacker: self.attacker.config.clone(),
            target: self.target.config.clone(),
        }
    }

    fn analyze(&self) -> AttackAnalysis {
        let analyzer = AttackAnalyzer {
            battle_defs: &battle_definitions(),
            config: self.attack_analyzer_config(),
            attacker: &self.attacker.ship,
            target: &self.target.ship,
        };

        analyzer.analyze()
    }

    fn check(&self) {
        use assert_json_diff::{CompareMode, Config, NumericMode};

        assert_ne!(self.attacker.side(), self.target.side());

        let actual = self.analyze();

        if let Err(error) = assert_json_diff::assert_json_matches_no_panic(
            &actual,
            &self.expected,
            Config::new(CompareMode::Inclusive).numeric_mode(NumericMode::AssumeFloat),
        ) {
            let path = &self.path;
            let description = &self.description;

            panic!("\n{path}\n{description}\n{error}\n\n");
        }
    }
}

#[wasm_bindgen_test]
fn test_day_phase_attacks() {
    let map: BTreeMap<String, String> =
        serde_json::from_str(fleethub_core_test::ATTACK_TESTS).unwrap();

    map.into_iter().for_each(|(path, toml)| {
        AttackAnalyzerTestCase::new(path, toml).check();
    });
}
