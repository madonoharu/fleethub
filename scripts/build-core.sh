#!/usr/bin/env bash

set -e

PKG_DIR=packages/fleethub-core/pkg
NODE_DIR=packages/fleethub-core/node

export WASM_BINDGEN_WEAKREF=1
wasm-pack build crates/fh-core -d $(realpath $PKG_DIR)
wasm-pack build crates/fh-core -d $(realpath $NODE_DIR) -t nodejs

rm -f $PKG_DIR/package.json
rm -f $PKG_DIR/README.md
rm -f $PKG_DIR/.gitignore
rm -f $NODE_DIR/package.json
rm -f $NODE_DIR/README.md
rm -f $NODE_DIR/.gitignore