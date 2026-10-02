import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "bun:test";
import { fileURLToPath } from "node:url";

const sectionName = "__wasm_bindgen_unstable";

function assertPortableBindings(binary: Uint8Array) {
  const sections = WebAssembly.Module.customSections(
    new WebAssembly.Module(Uint8Array.from(binary)),
    sectionName,
  );
  assert(
    sections.length > 0,
    "Inspect Cargo's raw Wasm, before wasm-bindgen removes its binding metadata",
  );
  const metadata = sections
    .map((section) => Buffer.from(section).toString("utf8"))
    .join("");
  assert(
    metadata.includes("equipment-bonus"),
    "The actual npm binding must be covered",
  );
  assert(
    !metadata.includes("package.json"),
    "Wasm bindings embed a build-worktree manifest path",
  );
}

test("the real Cargo Wasm has no build-worktree manifest dependency", () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const cargo = JSON.parse(
    execFileSync(
      "cargo",
      ["metadata", "--locked", "--format-version=1", "--no-deps"],
      { cwd: root, encoding: "utf8" },
    ),
  ) as { target_directory: string };
  const file = join(
    cargo.target_directory,
    "wasm32-unknown-unknown/release/fleethub_core.wasm",
  );
  assertPortableBindings(readFileSync(file));
});

test("the metadata check rejects the historical manifest-path regression", () => {
  const name = Buffer.from(sectionName);
  const metadata = Buffer.from(
    "equipment-bonus\0/home/other-worktree/crates/fleethub-core/package.json",
  );
  const payload = Buffer.concat([Buffer.from([name.length]), name, metadata]);
  assert(payload.length < 128, "Fixture uses a single-byte LEB128 length");
  const binary = Buffer.concat([
    Buffer.from([0, 97, 115, 109, 1, 0, 0, 0, 0, payload.length]),
    payload,
  ]);
  assert.throws(
    () => assertPortableBindings(binary),
    /build-worktree manifest path/,
  );
});
