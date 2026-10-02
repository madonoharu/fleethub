import assert from "node:assert/strict";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

function inside(base: string, file: string) {
  const rel = relative(base, file);
  assert(
    rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel),
    `Path escapes trace tree: ${file}`,
  );
}

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
}

export interface IsolatedBuild {
  directory: string;
  pathCount: number;
  manifestCount: number;
}

/** Verify a build using only its traced files; remove the copy even on failure. */
export async function withIsolatedBuildTraces<T>(
  rootDirectory: string,
  verify: (build: IsolatedBuild) => T | Promise<T>,
): Promise<T> {
  const root = realpathSync(rootDirectory);
  const pages = join(root, "packages/site/.next/server/pages");
  assert(existsSync(pages), "Build Next.js before verifying its page traces");
  const manifests = walk(pages).filter((file) => file.endsWith(".nft.json"));
  assert(manifests.length, "Build Next.js before verifying its page traces");
  const files = new Set<string>();
  for (const manifest of manifests) {
    const trace = JSON.parse(readFileSync(manifest, "utf8")) as {
      files: unknown;
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
  const isolated = realpathSync(
    mkdtempSync(join(tmpdir(), "fleethub-traces-")),
  );
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
    return await verify({
      directory: isolated,
      pathCount: files.size,
      manifestCount: manifests.length,
    });
  } finally {
    rmSync(isolated, { recursive: true, force: true });
  }
}
