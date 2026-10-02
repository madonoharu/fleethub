use std::{error::Error, path::PathBuf};

fn main() -> Result<(), Box<dyn Error>> {
    let out_dir = PathBuf::from(std::env::var_os("OUT_DIR").expect("Cargo must set OUT_DIR"));
    let master_data = ureq::get("https://storage.googleapis.com/kcfleethub/data/master_data.json")
        .call()?
        .into_body()
        .read_to_string()?;

    std::fs::write(out_dir.join("master_data.json"), master_data)?;
    Ok(())
}
