import assert from "node:assert/strict";
import { existsSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "bun:test";
import { fileURLToPath } from "node:url";

import { probeBuildRuntime } from "../../scripts/build-runtime.mts";
import { withIsolatedBuildTraces } from "../../scripts/build-traces.mts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("the real traced build regenerates all five locales and initializes external Wasm", async () => {
  let copied = "";
  await withIsolatedBuildTraces(root, ({ directory }) => {
    copied = directory;
    const result = probeBuildRuntime(directory);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    for (const locale of ["ja", "en", "ko", "zh-CN", "zh-TW"]) {
      assert(
        result.stdout.includes(
          `Verified regeneration and six translation namespaces: ${locale}`,
        ),
      );
    }
    assert(
      result.stdout.includes(
        "Wasm initializes and all loaded modules stay inside the isolated trace tree",
      ),
    );
  });
  assert(!existsSync(copied));
}, 65_000);

const missingArtifacts = [
  {
    file: "packages/site/next-i18next.config.js",
    error: /Cannot find module.*next-i18next\.config\.js/s,
  },
  {
    file: "packages/site/public/locales/ja/common.json",
    error: /ENOENT.*public\/locales\/ja\/common\.json/s,
  },
  {
    file: "crates/fleethub-core/node/fleethub_core_bg.wasm",
    error: /ENOENT.*fleethub_core_bg\.wasm/s,
  },
];

for (const { file, error } of missingArtifacts) {
  test(`the real probe fails when deployment omits ${file}`, async () => {
    let copied = "";
    await withIsolatedBuildTraces(root, ({ directory }) => {
      copied = directory;
      assert(
        existsSync(join(root, file)),
        "Source artifact must remain present to detect workspace fallback",
      );
      unlinkSync(join(directory, file));
      const result = probeBuildRuntime(directory);
      assert.notEqual(
        result.status,
        0,
        "An incomplete deployment incorrectly passed verification",
      );
      assert.match(`${result.stdout}\n${result.stderr}`, error);
      assert(
        existsSync(join(root, file)),
        "Negative controls must never change source artifacts",
      );
    });
    assert(
      !existsSync(copied),
      "A failed child must not leave deployment copies behind",
    );
  }, 65_000);
}
