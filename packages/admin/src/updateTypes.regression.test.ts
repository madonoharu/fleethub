import { beforeAll, describe, expect, it, mock } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const coreSource = path.resolve(import.meta.dirname, "../../../crates/fleethub-core/src");
const writtenFiles = new Map<string, string>();
const readTables = mock(() =>
  Promise.resolve({
    gear_types: { rows: [{ tag: "MainGunSmall", id: 1 }] },
    gear_attrs: { rows: [{ tag: "HighAngleMount" }] },
    ship_types: { rows: [{ tag: "DD", id: 2 }] },
    ship_attrs: { rows: [{ tag: "NightCarrier" }] },
    ship_classes: { rows: [] },
  }),
);
const updateTable = mock(() => Promise.resolve());

await mock.module("@fh/admin/src", () => ({
  MasterDataSpreadsheet: class {
    readTables = readTables;
    updateTable = updateTable;
  },
  fetchStart2: () => Promise.resolve({ api_mst_ship: [], api_mst_slotitem: [] }),
}));
await mock.module("fs-extra", () => ({
  default: {
    readFile,
    readJSON: () => Promise.resolve({}),
    outputFile: (file: string, source: string) => {
      writtenFiles.set(file, source);
      return Promise.resolve();
    },
  },
}));
await mock.module("child_process", () => ({
  default: {
    exec: (_command: string, callback: (error: null, stdout: string) => void) => {
      callback(null, "");
    },
  },
}));

beforeAll(async () => {
  const { main } = await import("../../../scripts/updateTypes");
  expect(readTables).not.toHaveBeenCalled();
  expect(writtenFiles.size).toBe(0);
  await main();
});

describe("Rust enum regeneration", () => {
  it.each([
    ["GearType", "gear_type", "Unknown = 0", "MainGunSmall = 1"],
    ["GearAttr", "gear_attr", "Unknown", "HighAngleMount"],
    ["ShipType", "ship_type", "Unknown = 0", "DD = 2"],
    ["ShipAttr", "ship_attr", "Unknown", "NightCarrier"],
  ])("keeps %s's derived default when replacing its variants", (name, file, unknown, variant) => {
    const generated = writtenFiles.get(path.join(coreSource, `types/${file}.rs`));
    expect(generated).toBeDefined();
    expect(generated).toMatch(/#\[derive\([^\]]*\bDefault\b/);
    const body = generated?.match(new RegExp(`pub enum ${name} \\{([^}]*)\\}`))?.[1];
    expect(body).toMatch(new RegExp(`#\\[default\\]\\s*${unknown}\\s*,`));
    expect(body).toContain(variant);
    expect(body?.match(/#\[default\]/g)).toHaveLength(1);
  });
});
