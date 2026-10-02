import assert from "node:assert/strict";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, resolve, sep, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const siteManifest = join(root, "packages/site/package.json");
const siteRequire = createRequire(siteManifest);
const coreEntry = realpathSync(siteRequire.resolve("fleethub-core"));
const coreDirectory = resolve(dirname(coreEntry), "..");
const lock = Bun.JSONC.parse(readFileSync(join(root, "bun.lock"), "utf8")) as {
  packages: Record<string, [string, ...unknown[]]>;
};

test("the application resolves the locked latest npm core instead of the Rust workspace", () => {
  const site = JSON.parse(readFileSync(siteManifest, "utf8")) as {
    dependencies: { "fleethub-core": string };
  };
  const core = JSON.parse(readFileSync(join(coreDirectory, "package.json"), "utf8")) as {
    name: string;
    version: string;
  };
  assert.equal(site.dependencies["fleethub-core"], "latest");
  assert.equal(core.name, "fleethub-core");
  assert.equal(lock.packages["fleethub-core"]?.[0], `fleethub-core@${core.version}`);
  assert(
    coreEntry.split(sep).includes("node_modules"),
    "The application still resolves its local Rust workspace",
  );
  assert.equal(typeof siteRequire("fleethub-core").FhCore, "function");
});

test("the npm core and application share locked equipment bonuses satisfying the core peer range", () => {
  const site = JSON.parse(readFileSync(siteManifest, "utf8")) as {
    dependencies: { "equipment-bonus": string };
  };
  const core = JSON.parse(readFileSync(join(coreDirectory, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  const peerRange = core.peerDependencies?.["equipment-bonus"];
  assert(peerRange, "The npm core must declare equipment-bonus as a peer dependency");
  assert.equal(core.dependencies?.["equipment-bonus"], undefined);
  assert.equal(site.dependencies["equipment-bonus"], "latest");

  const coreRequire = createRequire(coreEntry);
  assert.equal(
    realpathSync(coreRequire.resolve("equipment-bonus")),
    realpathSync(siteRequire.resolve("equipment-bonus")),
    "The core and application must resolve the same equipment-bonus instance",
  );
  for (const require of [siteRequire, coreRequire]) {
    const bonus = JSON.parse(
      readFileSync(require.resolve("equipment-bonus/package.json"), "utf8"),
    ) as { version: string };
    assert.equal(lock.packages["equipment-bonus"]?.[0], `equipment-bonus@${bonus.version}`);
    assert(
      Bun.semver.satisfies(bonus.version, peerRange),
      `equipment-bonus@${bonus.version} does not satisfy the core peer range ${peerRange}`,
    );
  }
});

for (const target of ["node", "pkg"]) {
  test(`the npm package includes valid ${target} Wasm, bindings and types`, () => {
    const directory = join(coreDirectory, target);
    const wasmModule = new WebAssembly.Module(
      Uint8Array.from(readFileSync(join(directory, "fleethub_core_bg.wasm"))),
    );
    const exports = WebAssembly.Module.exports(wasmModule);
    assert(exports.some(({ name, kind }) => name === "memory" && kind === "memory"));
    assert(exports.some(({ name }) => name === "fhcore_new"));
    for (const { module: dependency } of WebAssembly.Module.imports(wasmModule)) {
      assert(
        !isAbsolute(dependency) && !win32.isAbsolute(dependency),
        `Wasm imports a build-machine path: ${dependency}`,
      );
    }
    assert(existsSync(join(directory, "fleethub_core.js")));
    assert(existsSync(join(directory, "fleethub_core.d.ts")));
  });
}
