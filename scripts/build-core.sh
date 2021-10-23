#!/usr/bin/env bash

set -e

PKG_DIR=packages/fleethub-core/pkg
NODE_DIR=packages/fleethub-core/node

export WASM_BINDGEN_WEAKREF=1
wasm-pack build crates/fh-core -d "$(realpath $PKG_DIR)"
wasm-pack build crates/fh-core -d "$(realpath $NODE_DIR)" -t nodejs
cargo run ts-gen

rm -rf {$PKG_DIR,$NODE_DIR}/{package.json,README.md,.gitignore}