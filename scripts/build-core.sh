#!/usr/bin/env bash

set -e

BUILD_PATH=crates/fleethub-core

VERSION=$(cargo metadata --format-version=1 --no-deps | jq '.packages[] | select(.name == "fleethub-core") | .version')
cat $BUILD_PATH/package.json | jq ".version |= ${VERSION}" > $BUILD_PATH/package.json.tmp
# https://github.com/drager/wasm-pack/issues/1420#issuecomment-2593727112
cat $BUILD_PATH/package.json.tmp | jq "del(.dependencies)" > $BUILD_PATH/package.json

export WASM_BINDGEN_WEAKREF=1
wasm-pack build $BUILD_PATH
wasm-pack build $BUILD_PATH -t nodejs -d node
yarn prettier -w $BUILD_PATH/{pkg,node}/fleethub_core.d.ts

rm -rf $BUILD_PATH/{pkg,node}/{package.json,README.md,.gitignore}
mv $BUILD_PATH/package.json.tmp $BUILD_PATH/package.json