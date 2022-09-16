use std::path::Path;

use fleethub_core::{
    analyzer::{AttackAnalysis, AttackAnalyzer, AttackAnalyzerConfig},
    types::{AirState, Engagement, NodeState},
};

use serde::Deserialize;
use toml_edit::easy::{from_slice, Value};

use crate::*;

#[derive(Debug, Deserialize)]
struct AttackTestCase {
    #[serde(skip)]
    path: String,
    #[serde(default)]
    description: String,
    #[serde(default)]
    node_state: NodeState,
    #[serde(default)]
    air_state: AirState,
    #[serde(default)]
    engagement: Engagement,
    attacker: TestShip,
    target: TestShip,
    expected: Value,
}

impl AttackTestCase {
    fn new(path: &Path) -> Self {
        let contents = std::fs::read(path).unwrap();

        Self {
            path: path.to_string_lossy().to_string(),
            ..from_slice(&contents).unwrap()
        }
    }

    fn attack_analyzer_config(&self) -> AttackAnalyzerConfig {
        AttackAnalyzerConfig {
            air_state: self.air_state,
            engagement: self.engagement,
            node_state: self.node_state.clone(),
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

#[test]
fn test_attacks() {
    let vec = walkdir::WalkDir::new("tests/analyzer/attack_tests")
        .into_iter()
        .filter_map(|e| {
            let entry = e.ok()?;
            let path = entry.path();

            if matches!(path.extension(), Some(e) if e == "toml") {
                Some(AttackTestCase::new(path))
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

    assert!(!vec.is_empty());

    vec.into_iter().for_each(|case| case.check());
}
