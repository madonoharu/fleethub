#!/usr/bin/env bash

set -e

PREFIX=packages/fleethub-core
PKG_DIR=$PREFIX/pkg
NODE_DIR=$PREFIX/node

export WASM_BINDGEN_WEAKREF=1
wasm-pack build crates/fh-core -d "$(realpath $PKG_DIR)"
wasm-pack build crates/fh-core -d "$(realpath $NODE_DIR)" -t nodejs
cargo run ts-gen $PREFIX/bindings.d.ts

rm -rf {$PKG_DIR,$NODE_DIR}/{package.json,README.md,.gitignore}