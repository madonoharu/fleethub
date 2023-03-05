#![allow(dead_code)]

mod toml;

use fleethub_core::{
    analyzer::AttackAnalyzerShipConfig,
    master_data::MasterData,
    ship::Ship,
    types::{BattleDefinitions, OrgType, Side},
    FhCore,
};

use once_cell::sync::Lazy;
use rand::prelude::*;
use serde::Deserialize;

pub use self::toml::*;

pub fn rng(seed: u64) -> SmallRng {
    SmallRng::seed_from_u64(seed)
}

pub static FH_CORE: Lazy<FhCore> = Lazy::new(|| {
    let master_data: MasterData =
        serde_json::from_str(fleethub_core_test::MASTER_DATA_STR).unwrap();
    FhCore::from_master_data(master_data)
});

pub fn battle_definitions() -> BattleDefinitions {
    FH_CORE.master_data().battle_definitions()
}

fn deserialize_ship<'de, D>(deserializer: D) -> Result<Ship, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let toml = ::toml::Value::deserialize(deserializer)?;
    Ok(ship_from_toml(toml))
}

#[derive(Debug, Default, Deserialize)]
struct TestShipDef {
    #[serde(flatten, deserialize_with = "deserialize_ship")]
    pub ship: Ship,
    #[serde(flatten)]
    pub config: AttackAnalyzerShipConfig,
}

impl From<TestShipDef> for TestShip {
    fn from(def: TestShipDef) -> Self {
        let TestShipDef { ship, mut config } = def;

        if ship.is_abyssal() && config.side().is_player() {
            config.conditions.position.org_type = OrgType::EnemySingle;
        }

        Self { ship, config }
    }
}

#[derive(Debug, Default, Deserialize)]
#[serde(from = "TestShipDef")]
pub struct TestShip {
    pub ship: Ship,
    pub config: AttackAnalyzerShipConfig,
}

impl TestShip {
    pub fn side(&self) -> Side {
        self.config.conditions.side()
    }
}
