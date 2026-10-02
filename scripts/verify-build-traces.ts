import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { probeBuildRuntime } from "./build-runtime.mts";
import { withIsolatedBuildTraces } from "./build-traces.mts";

assert(process.versions["bun"], "Run this verifier with Bun");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
await withIsolatedBuildTraces(
  root,
  ({ directory, pathCount, manifestCount }) => {
    console.log(
      `Verifying ${pathCount} trace paths from ${manifestCount} page manifests`,
    );
    const result = probeBuildRuntime(directory, "inherit");
    process.exitCode = result.status ?? 1;
  },
);
