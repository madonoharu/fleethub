#![allow(dead_code)]

pub mod node;

use fleethub_core::{
    analyzer::AttackAnalyzerShipConfig,
    comp::Comp,
    fleet::Fleet,
    master_data::MasterData,
    ship::Ship,
    types::{BattleDefinitions, OrgType, Side},
    FhCore,
};

use once_cell::sync::Lazy;
use rand::prelude::*;
use serde::Deserialize;
use toml_edit::easy::{toml, Value};

pub fn rng(seed: u64) -> SmallRng {
    SmallRng::seed_from_u64(seed)
}

pub static FH_CORE: Lazy<FhCore> = Lazy::new(|| {
    let master_data: MasterData =
        serde_json::from_str(fleethub_core_test::MASTER_DATA_STR).unwrap();
    FhCore::from_master_data(master_data.init())
});

fn walk<F: FnMut(&mut Value)>(input: &mut Value, f: &mut F) {
    use Value::*;

    f(input);

    match input {
        Array(array) => array.iter_mut().for_each(|value| walk(value, f)),
        Table(table) => table.iter_mut().for_each(|(_, value)| walk(value, f)),
        _ => (),
    }
}

fn set_ship_id(value: &mut Value) {
    if let Some(name) = value.get("ship_id").and_then(|v| v.as_str()) {
        let id = FH_CORE
            .master_data()
            .ships
            .iter()
            .find_map(|ship| (ship.name == name).then(|| ship.ship_id as u32))
            .unwrap_or_else(|| panic!("\"{name}\" does not exist"));

        value["ship_id"] = id.into();
    }
}

fn set_gear_id(value: &mut Value) {
    fn get_id(field: &Value) -> Option<i64> {
        match field {
            Value::String(name) => {
                if name.is_empty() {
                    return Some(0);
                }

                let id = FH_CORE
                    .master_data()
                    .gears
                    .iter()
                    .find_map(|gear| (&gear.name == name).then(|| gear.gear_id))
                    .unwrap_or_else(|| panic!("\"{name}\" does not exist"))
                    as i64;

                Some(id)
            }
            &Value::Integer(id) => Some(id),
            _ => None,
        }
    }

    for key in ["g1", "g2", "g3", "g4", "g5", "gx"] {
        if let Some(id) = value.get(key).and_then(get_id) {
            value[key] = toml! {
                gear_id = id
            };
        }
    }

    if let Some(id) = value.get("gear_id").and_then(get_id) {
        value["gear_id"] = id.into();
    }
}

#[allow(dead_code)]
pub fn ship_from_toml(mut toml: Value) -> Ship {
    walk(&mut toml, &mut set_ship_id);
    walk(&mut toml, &mut set_gear_id);
    let state = toml.try_into().unwrap();
    FH_CORE.create_ship(Some(state)).unwrap()
}

#[allow(dead_code)]
pub fn fleet_from_toml(mut toml: Value) -> Fleet {
    walk(&mut toml, &mut set_ship_id);
    walk(&mut toml, &mut set_gear_id);
    let state = toml.try_into().unwrap();
    FH_CORE.create_fleet(Some(state))
}

#[allow(dead_code)]
pub fn comp_from_toml(mut toml: Value) -> Comp {
    walk(&mut toml, &mut set_ship_id);
    walk(&mut toml, &mut set_gear_id);
    let state = toml.try_into().unwrap();
    let org = FH_CORE.create_org(state).unwrap();
    org.create_comp()
}

#[allow(dead_code)]
pub fn battle_definitions() -> BattleDefinitions {
    FH_CORE.master_data().battle_definitions()
}

#[macro_export]
macro_rules! ship {
    ($($toml:tt)+) => {
        common::ship_from_toml(toml_edit::easy::toml!($($toml)+))
    };
}

fn deserialize_ship<'de, D>(deserializer: D) -> Result<Ship, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let toml = Value::deserialize(deserializer)?;
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
