import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { afterEach, test } from "bun:test";

import { withIsolatedBuildTraces } from "../../scripts/build-traces.mts";

const fixtures: string[] = [];
afterEach(() => {
  for (const directory of fixtures.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "fleethub-trace-test-"));
  fixtures.push(directory);
  const root = join(directory, "source");
  const pages = join(root, "packages/site/.next/server/pages");
  mkdirSync(pages, { recursive: true });
  const write = (file: string, data: string | Uint8Array) => {
    const path = join(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, data);
    return path;
  };
  const trace = (files: string[], name = "index") => {
    write(
      `packages/site/.next/server/pages/${name}.js.nft.json`,
      JSON.stringify({
        version: 1,
        files: files.map((file) => relative(pages, file)),
      }),
    );
  };
  return { directory, root, pages, write, trace };
}

test("copies only traced files, deduplicates manifests, and accepts prerendered pages", async () => {
  const { root, write, trace } = fixture();
  const translation = write(
    "packages/site/public/locales/ja/common.json",
    '{"title":"作戦室"}',
  );
  write("packages/site/.next/server/pages/index.js", "module.exports = {};");
  write("untraced.txt", "not deployed");
  trace([translation, translation]);
  trace([translation], "help"); // Fully static page module was removed by Next.
  let copied = "";
  await withIsolatedBuildTraces(root, async (build) => {
    copied = build.directory;
    assert.equal(build.pathCount, 2);
    assert.equal(build.manifestCount, 2);
    assert.equal(
      readFileSync(
        join(copied, "packages/site/public/locales/ja/common.json"),
        "utf8",
      ),
      '{"title":"作戦室"}',
    );
    assert(!existsSync(join(copied, "untraced.txt")));
    await Promise.resolve();
    assert(
      existsSync(copied),
      "The copy was cleaned before asynchronous verification finished",
    );
  });
  assert(!existsSync(copied));
  assert(existsSync(root), "Verification must leave source artifacts intact");
});

test("preserves workspace links and a real module's adjacent Wasm", async () => {
  const { root, write, trace } = fixture();
  const main = write(
    "packages/site/.next/server/pages/index.js",
    'module.exports = require("core");',
  );
  const metadata = write(
    "packages/core/package.json",
    '{"main":"node/index.js"}',
  );
  const wrapper = write(
    "packages/core/node/index.js",
    'const fs = require("node:fs"), path = require("node:path"); const wasm = new WebAssembly.Module(fs.readFileSync(path.join(__dirname,"core.wasm"))); module.exports = {answer: new WebAssembly.Instance(wasm).exports.answer(), file: __filename};',
  );
  const wasm = write(
    "packages/core/node/core.wasm",
    Uint8Array.from([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 127, 3, 2, 1, 0, 7, 10, 1,
      6, 97, 110, 115, 119, 101, 114, 0, 0, 10, 6, 1, 4, 0, 65, 42, 11,
    ]),
  );
  mkdirSync(join(root, "node_modules"));
  const link = join(root, "node_modules/core");
  symlinkSync("../packages/core", link);
  trace([main, metadata, wrapper, wasm, link]);
  await withIsolatedBuildTraces(root, ({ directory }) => {
    const result = spawnSync(
      process.execPath,
      [
        "--eval",
        'console.log(JSON.stringify(require("./.next/server/pages/index.js")))',
      ],
      {
        cwd: join(directory, "packages/site"),
        encoding: "utf8",
        env: { ...process.env, NODE_PATH: "" },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const value = JSON.parse(result.stdout) as { answer: number; file: string };
    assert.equal(value.answer, 42);
    assert(value.file.startsWith(directory));
    assert(!value.file.startsWith(root));
  });
});

test("removes the isolated copy and propagates verification failures", async () => {
  const { root, write, trace } = fixture();
  trace([write("asset.txt", "asset")]);
  let copied = "";
  const failure = new Error("regeneration failed");
  await assert.rejects(
    withIsolatedBuildTraces(root, async ({ directory }) => {
      copied = directory;
      await Promise.resolve();
      throw failure;
    }),
    (error) => error === failure,
  );
  assert(!existsSync(copied));
});

for (const files of [null, {}, ["asset.txt", 42]]) {
  test(`rejects a malformed trace files value: ${JSON.stringify(files)}`, async () => {
    const { root, write } = fixture();
    write(
      "packages/site/.next/server/pages/index.js.nft.json",
      JSON.stringify({ files }),
    );
    await assert.rejects(
      withIsolatedBuildTraces(root, () =>
        assert.fail("Must not verify invalid trace"),
      ),
      /Invalid trace:/,
    );
  });
}

test("rejects a missing traced target", async () => {
  const { root, trace } = fixture();
  trace([join(root, "missing.wasm")]);
  await assert.rejects(
    withIsolatedBuildTraces(root, () =>
      assert.fail("Must not verify incomplete copy"),
    ),
    /ENOENT.*missing\.wasm/,
  );
});

test("rejects trace paths that escape the workspace", async () => {
  const { directory, root, trace } = fixture();
  const outside = join(directory, "outside.txt");
  writeFileSync(outside, "outside");
  trace([outside]);
  await assert.rejects(
    withIsolatedBuildTraces(root, () =>
      assert.fail("Must not copy outside files"),
    ),
    /Path escapes trace tree:/,
  );
});

test("rejects absolute symlinks even when their target is inside the workspace", async () => {
  const { root, write, trace } = fixture();
  const target = write("asset.txt", "asset");
  const link = join(root, "absolute.txt");
  symlinkSync(target, link);
  trace([target, link]);
  await assert.rejects(
    withIsolatedBuildTraces(root, () =>
      assert.fail("Must reject nonportable links"),
    ),
    /Absolute traced symlink:/,
  );
});

test("rejects an escaping symlink chain", async () => {
  const { directory, root, trace } = fixture();
  writeFileSync(join(directory, "outside.txt"), "outside");
  symlinkSync("../outside.txt", join(root, "second.txt"));
  symlinkSync("second.txt", join(root, "first.txt"));
  trace([join(root, "first.txt")]);
  await assert.rejects(
    withIsolatedBuildTraces(root, () =>
      assert.fail("Must reject link-chain escapes"),
    ),
    /Path escapes trace tree:/,
  );
});

test("rejects directories in a file trace", async () => {
  const { root, trace } = fixture();
  const directory = join(root, "not-a-file");
  mkdirSync(directory);
  trace([directory]);
  await assert.rejects(
    withIsolatedBuildTraces(root, () => assert.fail("Must reject directories")),
    /Unsupported traced path:/,
  );
});

test("reports a missing build instead of succeeding without checks", async () => {
  const { root } = fixture();
  await assert.rejects(
    withIsolatedBuildTraces(root, () =>
      assert.fail("Must reject absent manifests"),
    ),
    /Build Next\.js before verifying/,
  );
});
