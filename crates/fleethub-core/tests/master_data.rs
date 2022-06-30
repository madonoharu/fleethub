use std::{fs, path::Path};

use fleethub_core::{fleet::Fleet, master_data::MasterData, ship::Ship, FhCore};
use once_cell::sync::Lazy;

async fn init_master_data() -> anyhow::Result<MasterData> {
    let manifest_dir: &str = std::env!("CARGO_MANIFEST_DIR");
    let tmp_dir = format!("{manifest_dir}/tmp");
    let md_path = format!("{tmp_dir}/master_data.json");
    let md_path = Path::new(&md_path);

    let bytes = match fs::read(md_path) {
        Ok(bytes) => bytes,
        Err(_) => {
            let _ = fs::create_dir(&tmp_dir);

            let bytes = reqwest::get(
                "https://storage.googleapis.com/kcfleethub.appspot.com/data/master_data.json",
            )
            .await?
            .bytes()
            .await?;

            fs::write(md_path, &bytes)?;

            bytes.to_vec()
        }
    };

    let md: MasterData = serde_json::from_slice(&bytes)?;
    Ok(md.init())
}

pub static FH_CORE: Lazy<FhCore> = Lazy::new(|| {
    let rt = tokio::runtime::Runtime::new().unwrap();
    let master_data = rt.block_on(init_master_data()).unwrap();
    FhCore::from_master_data(master_data)
});

fn walk<F: FnMut(&mut toml::Value)>(input: &mut toml::Value, f: &mut F) {
    use toml::Value::*;

    f(input);

    match input {
        Array(array) => array.iter_mut().for_each(|value| walk(value, f)),
        Table(table) => table.iter_mut().for_each(|(_, value)| walk(value, f)),
        _ => (),
    }
}

fn set_ship_id(value: &mut toml::Value) {
    if let Some(name) = value.get("ship_id").and_then(|v| v.as_str()) {
        let id = FH_CORE
            .master_data()
            .ships
            .iter()
            .find_map(|ship| (ship.name == name).then(|| ship.ship_id as u32))
            .expect(format!("\"{name}\" does not exist").as_str());

        value["ship_id"] = id.into();
    }
}

fn set_gear_id(value: &mut toml::Value) {
    if let Some(name) = value.get("gear_id").and_then(|v| v.as_str()) {
        let id = FH_CORE
            .master_data()
            .gears
            .iter()
            .find_map(|gear| (gear.name == name).then(|| gear.gear_id as u32))
            .expect(format!("\"{name}\" does not exist").as_str());

        value["gear_id"] = id.into();
    }
}

#[allow(dead_code)]
pub fn ship_from_toml(mut toml: toml::Value) -> Ship {
    walk(&mut toml, &mut set_ship_id);
    walk(&mut toml, &mut set_gear_id);
    let state = toml.try_into().unwrap();
    FH_CORE.create_ship(Some(state)).unwrap()
}

#[allow(dead_code)]
pub fn fleet_from_toml(mut toml: toml::Value) -> Fleet {
    walk(&mut toml, &mut set_ship_id);
    walk(&mut toml, &mut set_gear_id);
    let state = toml.try_into().unwrap();
    FH_CORE.create_fleet(Some(state))
}
