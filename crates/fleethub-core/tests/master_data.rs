use std::{fs, path::Path};

use fleethub_core::{master_data::MasterData, ship::Ship, types::ShipState};
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
    Ok(md)
}

pub static MASTER_DATA: Lazy<MasterData> = Lazy::new(|| {
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(init_master_data()).unwrap()
});

#[test]
fn test() {
    use fleethub_core::{factory::Factory, types::EBonusFn};

    use serde_json::json;

    fn create_ship(json: serde_json::Value) -> Ship {
        let factory = Factory {
            master_data: MASTER_DATA.clone(),
            ebonus_fn: EBonusFn { js: None },
        };

        let input: ShipState = serde_json::from_value(json).unwrap();

        factory.create_ship(Some(input)).unwrap()
    }

    macro_rules! ship {
        ($input:tt) => {
            create_ship(json!($input))
        };
    }

    let s = ship!({ "ship_id": 1 });
    assert_eq!(s.name(), "睦月");
}
