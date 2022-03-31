use std::{fs, path::Path};

use fleethub_core::types::MasterData;

#[tokio::test]
async fn test() -> anyhow::Result<()> {
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

    let _: MasterData = serde_json::from_slice(&bytes)?;

    Ok(())
}
