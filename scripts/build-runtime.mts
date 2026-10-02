import { spawnSync } from "node:child_process";
import { join } from "node:path";

const probe = `
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const route = await require("./.next/server/pages/index.js");
assert.equal(typeof route.getStaticProps, "function");
// Turbopack traces a hashed external link instead of the bare package link.
// Inspect the wrapper actually loaded by the page, independent of the bundler.
const corePaths = Object.keys(require.cache).filter(file => path.basename(file) === "fleethub_core.js");
assert.equal(corePaths.length, 1, "The built page must load exactly one traced Wasm wrapper");
const corePath = corePaths[0];
assert.ok(corePath.split(path.sep).includes("node_modules"), "The built page must use the installed npm Wasm package");
const corePackage = JSON.parse(fs.readFileSync(path.join(path.dirname(corePath), "../package.json"), "utf8"));
assert.equal(corePackage.name, "fleethub-core");
const { FhCore } = require.cache[corePath].exports;
assert.equal(typeof FhCore, "function", "The traced Wasm wrapper must export FhCore");
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
const core = new FhCore(await response.json());
assert.ok(core.create_all_ships().length > 0);
const analyzer = core.create_analyzer();
analyzer.free(); core.free();
const base = path.resolve(process.cwd(), "../..") + path.sep;
const loaded = Object.keys(require.cache);
assert.ok(loaded.length > 0);
assert.deepEqual(loaded.filter(file => !file.startsWith(base) || !fs.realpathSync(file).startsWith(base)), []);
console.log("Wasm initializes and all loaded modules stay inside the isolated trace tree");
`;

/** Run the real built page under Bun without inheriting credentials or module paths. */
export function probeBuildRuntime(directory: string, stdio: "inherit" | "pipe" = "pipe") {
  const runtimeEnv: Partial<NodeJS.ProcessEnv> = {
    PATH: process.env["PATH"] || "",
    NODE_ENV: "production",
    NODE_PATH: "",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  const result = spawnSync(
    process.versions["bun"] ? process.execPath : "bun",
    ["--no-env-file", "--eval", probe],
    {
      cwd: join(directory, "packages/site"),
      stdio,
      encoding: "utf8",
      timeout: 60_000,
      // Next inlines the site's required ProcessEnv fields when it builds.
      env: runtimeEnv as NodeJS.ProcessEnv,
    },
  );
  if (result.error) throw result.error;
  return result;
}
