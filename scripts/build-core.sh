#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

for tool in bun cargo wasm-pack; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Required tool is missing: $tool" >&2
    exit 1
  fi
done

BUILD_PATH=crates/fleethub-core
# A failed earlier build can leave manifests that wasm-pack tries to merge.
rm -f "$BUILD_PATH"/{pkg,node}/package.json

wasm-pack build "$BUILD_PATH" --target bundler -- --locked
wasm-pack build "$BUILD_PATH" --target nodejs --out-dir node -- --locked
bun run prettier --write "$BUILD_PATH"/{pkg,node}/fleethub_core.d.ts

rm -f "$BUILD_PATH"/{pkg,node}/{package.json,README.md,.gitignore}
