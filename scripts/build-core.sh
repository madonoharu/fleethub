#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

for tool in bun cargo jq wasm-pack; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Required tool is missing: $tool" >&2
    exit 1
  fi
done

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
# https://github.com/drager/wasm-pack/issues/1420#issuecomment-2593727112
jq --arg version "$VERSION" '.version = $version | del(.dependencies)' "$PACKAGE_BACKUP" > "$PACKAGE_PATH"

wasm-pack build "$BUILD_PATH" --target bundler -- --locked
wasm-pack build "$BUILD_PATH" --target nodejs --out-dir node -- --locked
bun run prettier --write "$BUILD_PATH"/{pkg,node}/fleethub_core.d.ts

rm -f "$BUILD_PATH"/{pkg,node}/{package.json,README.md,.gitignore}
