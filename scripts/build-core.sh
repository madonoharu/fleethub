#!/usr/bin/env bash

set -e

PREFIX=packages/fleethub-core
PKG_DIR=$PREFIX/pkg
NODE_DIR=$PREFIX/node

export WASM_BINDGEN_WEAKREF=1
wasm-pack build crates/fleethub-core -d "$(realpath $PKG_DIR)"
wasm-pack build crates/fleethub-core -d "$(realpath $NODE_DIR)" -t nodejs
cargo run ts-gen $PREFIX/bindings.d.ts

rm -rf {$PKG_DIR,$NODE_DIR}/{package.json,README.md,.gitignore}

VERSION=$(cargo metadata --format-version=1 --no-deps | jq '.packages[] | select(.name == "fleethub-core") | .version')
cat $PREFIX/package.json | jq ".version |= ${VERSION}" > $PREFIX/package.json.tmp
mv $PREFIX/package.json.tmp $PREFIX/package.json