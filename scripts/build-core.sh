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
wasm-pack build "$BUILD_PATH" --target bundler --no-pack -- --locked
wasm-pack build "$BUILD_PATH" --target nodejs --out-dir node --no-pack -- --locked
bun run oxfmt "$BUILD_PATH"/{pkg,node}/fleethub_core.d.ts

# wasm-pack's catch-all .gitignore would make npm pack drop the build output.
rm -f "$BUILD_PATH"/{pkg,node}/.gitignore
