use std::{fs, path::Path};

use fleethub_core::{
    master_data::MasterData,
    types::{GearAttr, GearState, ShipAttr, ShipOverrides, ShipState},
    FhCore,
};
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

macro_rules! create_ship {
    ($input:tt) => {{
        let value = serde_json::json!($input);
        let state: ShipState = serde_json::from_value(value).unwrap();
        FH_CORE.create_ship(Some(state)).unwrap()
    }};
}

#[test]
fn test_ship() {
    let ship = create_ship!({ "ship_id": 883 });

    assert_eq!(ship.name(), "龍鳳改二戊");
    assert_eq!(ship.master.attrs, ShipAttr::NightCarrier | ShipAttr::Kai2);
}

#[test]
fn test_gear() {
    let hedgehog = FH_CORE
        .create_gear(Some(GearState {
            gear_id: 439,
            ..Default::default()
        }))
        .unwrap();

    assert!(hedgehog.has_attr(GearAttr::SynergisticDepthCharge));
}

#[test]
fn test_overrides() {
    let state = ShipState {
        ship_id: 1,
        overrides: Some(ShipOverrides {
            naked_max_hp: Some(1),
            naked_luck: Some(2),
            naked_evasion: Some(3),
            naked_asw: Some(4),
            naked_los: Some(5),
        }),
        ..Default::default()
    };

    let ship = FH_CORE.create_ship(Some(state)).unwrap();

    assert_eq!(ship.max_hp(), Some(1));
    assert_eq!(ship.luck(), Some(2));
    assert_eq!(ship.naked_evasion(), Some(3));
    assert_eq!(ship.naked_asw(), Some(4));
    assert_eq!(ship.naked_los(), Some(5));
}
