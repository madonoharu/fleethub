#!/usr/bin/env bash

set -euo pipefail

BUILD_PATH=crates/fleethub-core
PACKAGE_PATH="$BUILD_PATH/package.json"
PACKAGE_BACKUP=$(mktemp)
cp "$PACKAGE_PATH" "$PACKAGE_BACKUP"

restore_package() {
  cp "$PACKAGE_BACKUP" "$PACKAGE_PATH"
  rm -f "$PACKAGE_BACKUP"
}
trap restore_package EXIT

VERSION=$(cargo metadata --locked --format-version=1 --no-deps | jq -r '.packages[] | select(.name == "fleethub-core") | .version')
jq --arg version "$VERSION" '.version = $version' "$PACKAGE_BACKUP" > "$PACKAGE_PATH"
cp "$PACKAGE_PATH" "$PACKAGE_BACKUP"
# https://github.com/drager/wasm-pack/issues/1420#issuecomment-2593727112
jq 'del(.dependencies)' "$PACKAGE_BACKUP" > "$PACKAGE_PATH"

wasm-pack build "$BUILD_PATH" --target bundler -- --locked
wasm-pack build "$BUILD_PATH" --target nodejs --out-dir node -- --locked
yarn prettier -w "$BUILD_PATH"/{pkg,node}/fleethub_core.d.ts

rm -f "$BUILD_PATH"/{pkg,node}/{package.json,README.md,.gitignore}
