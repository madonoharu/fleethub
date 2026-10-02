fn main() {
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let path = format!("{out_dir}/master_data.json");
    let mut res = ureq::get("https://storage.googleapis.com/kcfleethub/data/master_data.json")
        .call()
        .unwrap();

    let string = res.body_mut().read_to_string().unwrap();
    std::fs::write(path, string).unwrap();
}
