set -e -o pipefail

PROJ_NAME=$(cat Cargo.toml | grep -E "^name" | sed -E 's/name[[:space:]]=[[:space:]]"(.*)"/\1/g' | sed -E 's/-/_/g')
rm -rf target/debug/deps/${PROJ_NAME}-*

export CARGO_INCREMENTAL=0
export RUSTFLAGS="-Zprofile -Ccodegen-units=1 -Copt-level=0 -Coverflow-checks=off -Zpanic_abort_tests"

cargo +nightly build
cargo +nightly test

grcov . -s . -t html --branch --ignore-not-existing -o ./target/debug/coverage/