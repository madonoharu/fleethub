use std::collections::HashMap;

fn main() {
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let path = format!("{out_dir}/master_data.json");
    let res =
        ureq::get("https://storage.googleapis.com/kcfleethub.appspot.com/data/master_data.json")
            .call()
            .unwrap();

    let string = res.into_string().unwrap();
    std::fs::write(path, &string).unwrap();
    write_attack_tests();
}

fn write_attack_tests() {
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let out_path = format!("{out_dir}/attack_tests.json");

    let map = walkdir::WalkDir::new("src/attack_tests")
        .into_iter()
        .filter_map(|e| {
            let entry = e.ok()?;
            let path = entry.path();

            if path.extension().map(|e| e == "toml").unwrap_or_default() {
                let buf = std::fs::read(path).unwrap();
                let path = path.to_path_buf();
                let contents = String::from_utf8(buf).unwrap();
                Some((path, contents))
            } else {
                None
            }
        })
        .collect::<HashMap<_, _>>();

    let contents = format!("{map:?}");
    std::fs::write(out_path, &contents).unwrap();
}
