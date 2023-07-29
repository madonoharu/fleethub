fn main() {
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let path = format!("{out_dir}/master_data.json");
    let res = ureq::get(
        "https://storage.googleapis.com/kcfleethub.appspot.com/data/master_data.dev.json",
    )
    .call()
    .unwrap();

    let string = res.into_string().unwrap();
    std::fs::write(path, string).unwrap();
}
