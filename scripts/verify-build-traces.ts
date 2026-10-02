import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(
  resolve(dirname(fileURLToPath(import.meta.url)), ".."),
);
const inside = (base: string, file: string) => {
  const rel = relative(base, file);
  assert(
    rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel),
    `Path escapes trace tree: ${file}`,
  );
};
const walk = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
assert(process.versions["bun"], "Run this verifier with Bun");
const manifests = walk(join(root, "packages/site/.next/server/pages")).filter(
  (file) => file.endsWith(".nft.json"),
);
assert(manifests.length, "Build Next.js before verifying its page traces");
const files = new Set<string>();
for (const manifest of manifests) {
  const trace = JSON.parse(readFileSync(manifest, "utf8")) as {
    files: string[];
  };
  assert(
    Array.isArray(trace.files) &&
      trace.files.every((file) => typeof file === "string"),
    `Invalid trace: ${manifest}`,
  );
  // Next removes fully static page modules after emitting their localized HTML.
  const entrypoint = manifest.slice(0, -".nft.json".length);
  if (existsSync(entrypoint)) files.add(entrypoint);
  for (const file of trace.files) files.add(resolve(dirname(manifest), file));
}
const isolated = realpathSync(mkdtempSync(join(tmpdir(), "fleethub-traces-")));
try {
  const entries = [...files].sort().map((source) => {
    inside(root, source);
    inside(root, realpathSync(source));
    return {
      source,
      target: join(isolated, relative(root, source)),
      stat: lstatSync(source),
    };
  });
  // Create relative workspace/package symlinks before copying their traced targets.
  for (const { source, target } of entries.filter((entry) =>
    entry.stat.isSymbolicLink(),
  )) {
    const link = readlinkSync(source);
    assert(!isAbsolute(link), `Absolute traced symlink: ${source}`);
    inside(root, resolve(dirname(source), link));
    inside(isolated, resolve(dirname(target), link));
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(link, target);
  }
  for (const { source, target, stat } of entries.filter(
    (entry) => !entry.stat.isSymbolicLink(),
  )) {
    assert(stat.isFile(), `Unsupported traced path: ${source}`);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
  for (const { target } of entries) {
    assert(existsSync(target), `Missing copied trace: ${target}`);
    inside(isolated, realpathSync(target));
  }
  console.log(
    `Verifying ${files.size} trace paths from ${manifests.length} page manifests`,
  );
  const probe = `
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const route = await require("./.next/server/pages/index.js");
assert.equal(typeof route.getStaticProps, "function");
const corePath = require.resolve("fleethub-core");
assert.ok(require.cache[corePath], "The built page did not load its traced Wasm wrapper");
for (const locale of ["ja", "en", "ko", "zh-CN", "zh-TW"]) {
  const result = await route.getStaticProps({ locale, revalidateReason: "stale" });
  assert.equal(result.revalidate, 3600);
  assert.equal(result.props._nextI18Next.initialLocale, locale);
  const store = result.props._nextI18Next.initialI18nStore[locale];
  for (const ns of ["common", "gears", "gear_types", "ships", "stype", "ctype"]) {
    const expected = JSON.parse(fs.readFileSync("./public/locales/" + locale + "/" + ns + ".json", "utf8"));
    assert.deepEqual(store[ns], { ...expected }, locale + "/" + ns);
  }
  assert.ok(Object.keys(store.common).length > 0);
  assert.ok(Object.keys(result.props.generationMap).length > 0);
  console.log("Verified regeneration and six translation namespaces: " + locale);
}
const response = await fetch("https://storage.googleapis.com/kcfleethub/data/master_data.json");
assert.ok(response.ok, "Could not read public master data");
const core = new (require("fleethub-core").FhCore)(await response.json());
assert.ok(core.create_all_ships().length > 0);
const analyzer = core.create_analyzer();
analyzer.free(); core.free();
const base = path.resolve(process.cwd(), "../..") + path.sep;
const loaded = Object.keys(require.cache);
assert.ok(loaded.length > 0);
assert.deepEqual(loaded.filter(file => !file.startsWith(base) || !fs.realpathSync(file).startsWith(base)), []);
console.log("Wasm initializes and all loaded modules stay inside the isolated trace tree");
`;
  // The site's required ProcessEnv fields are inlined by Next at build time.
  // This probe deliberately starts with only runtime variables, no credentials.
  const runtimeEnv: Partial<NodeJS.ProcessEnv> = {
    PATH: process.env["PATH"] || "",
    NODE_ENV: "production",
    NODE_PATH: "",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  const result = spawnSync(
    process.execPath,
    ["--no-env-file", "--eval", probe],
    {
      cwd: join(isolated, "packages/site"),
      stdio: "inherit",
      timeout: 60_000,
      env: runtimeEnv as NodeJS.ProcessEnv,
    },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(isolated, { recursive: true, force: true });
}
