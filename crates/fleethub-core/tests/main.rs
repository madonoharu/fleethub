mod analyzer;
mod common;

use common::*;

#[test]
fn main() {
    let output = std::process::Command::new("wasm-pack")
        .args(["test", "--node", "--color", "always"])
        .output()
        .unwrap();

    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(output.status.success(), "{stderr}");
}
