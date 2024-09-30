import child_process from "child_process";
import path from "path";
import { promisify } from "util";

import { MasterDataSpreadsheet, fetchStart2 } from "@fh/admin/src";
import { Dict, uniqBy } from "@fh/utils/src";
import fs from "fs-extra";
import { Start2 } from "kc-tools";

const CTYPE_NAMES_PATH = path.resolve(
  "packages/site/public/locales/ja/ctype.json",
);

const FLEETHUB_CORE_SRC_PREFIX = path.resolve("crates/fleethub-core/src");

const exec = promisify(child_process.exec);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ENUM_NAMES = ["GearType", "GearAttr", "ShipType", "ShipAttr"] as const;

type EnumName = (typeof ENUM_NAMES)[number];

type EnumItem = {
  tag: string;
  id?: number;
  name?: string;
};

type EnumConfig = {
  name: string;
  items: EnumItem[];
  unknown?: null | number;
  deriveDefault?: boolean;
};

function createEnum({
  name,
  items,
  unknown,
  deriveDefault,
}: EnumConfig): string {
  const lines = items.map(({ id, tag, name }) => {
    const line = id === undefined ? tag : `${tag} = ${id}`;
    return name ? `\n/// ${name}\n${line}` : line;
  });

  if (unknown === null) {
    lines.unshift(`Unknown`);
  } else if (typeof unknown === "number") {
    lines.unshift(`Unknown = ${unknown}`);
  }

  if (deriveDefault) {
    lines[0] = "#[default]\n" + lines[0];
  }

  return `enum ${name} {${lines.join(",")}}\n`;
}

function replaceEnum(config: EnumConfig): (src: string) => string {
  return (src) => {
    const text = createEnum(config);

    const regex = RegExp(`enum ${config.name} \\{.*?\\}(?!;)`, "s");
    return src.replace(regex, text);
  };
}

async function updateFile(
  path: string,
  ...updaters: ((src: string) => string)[]
) {
  const src = (await fs.readFile(path)).toString();
  const out = updaters.reduce((current, fn) => fn(current), src);
  await fs.outputFile(path, out);
}

function replaceMacro(
  src: string,
  macroName: string,
  entries: [string, string | number][],
): string {
  const inner = entries
    .map(([key, value]) => `    ("${key}") => { ${value} };`)
    .join("\n");

  const macro = `macro_rules! ${macroName} {\n${inner}\n}`;
  const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s");
  return src.replace(regex, macro);
}

async function updateRs(
  start2: Start2,
  ctypeNames: Record<string, string>,
  configs: Record<EnumName, EnumConfig>,
) {
  const updateShipId = (src: string): string => {
    const inner = start2.api_mst_ship
      .filter((ship) => ship.api_id < 1500)
      .map((ship): [string, number] => [ship.api_name, ship.api_id]);

    return replaceMacro(src, "ship_id", inner);
  };

  const updateGearId = (src: string): string => {
    const inner = uniqBy(start2.api_mst_slotitem, (gear) => gear.api_name).map(
      (gear): [string, number] => [gear.api_name, gear.api_id],
    );

    return replaceMacro(src, "gear_id", inner);
  };

  const updateCtype = (src: string): string => {
    const inner = Object.entries(ctypeNames).map(
      ([id, name]): [string, string] => [name, id],
    );

    return replaceMacro(src, "ctype", inner);
  };

  await updateFile(
    path.resolve(FLEETHUB_CORE_SRC_PREFIX, "types/gear_type.rs"),
    replaceEnum(configs.GearType),
  );

  await updateFile(
    path.resolve(FLEETHUB_CORE_SRC_PREFIX, "types/gear_attr.rs"),
    replaceEnum(configs.GearAttr),
  );

  await updateFile(
    path.resolve(FLEETHUB_CORE_SRC_PREFIX, "types/ship_type.rs"),
    replaceEnum(configs.ShipType),
  );

  await updateFile(
    path.resolve(FLEETHUB_CORE_SRC_PREFIX, "types/ship_attr.rs"),
    replaceEnum(configs.ShipAttr),
  );

  await updateFile(
    path.resolve(FLEETHUB_CORE_SRC_PREFIX, "types/const_id.rs"),
    updateShipId,
    updateGearId,
    updateCtype,
  );

  await exec(`rustfmt ${FLEETHUB_CORE_SRC_PREFIX}/*.rs`);
}

function createEnumItem(row: Dict<string, unknown>): EnumItem {
  const tag = row.tag;

  if (typeof tag !== "string") {
    throw new Error("tag is not found");
  }

  const name = "name" in row ? String(row.name) : undefined;
  const id = "id" in row ? Number(row.id) : undefined;

  return { tag, id, name };
}

async function main() {
  const spreadsheet = new MasterDataSpreadsheet();
  const [tables, start2, ctypeNames] = await Promise.all([
    spreadsheet.readTables([
      "gear_types",
      "gear_attrs",
      "ship_types",
      "ship_classes",
      "ship_attrs",
    ]),
    fetchStart2(),
    fs.readJSON(CTYPE_NAMES_PATH) as Promise<Record<string, string>>,
  ]);

  const configs: Record<EnumName, EnumConfig> = {
    GearType: {
      name: "GearType",
      items: tables.gear_types.rows.map(createEnumItem),
      unknown: 0,
      deriveDefault: true,
    },
    GearAttr: {
      name: "GearAttr",
      items: tables.gear_attrs.rows.map(createEnumItem),
      unknown: null,
    },
    ShipType: {
      name: "ShipType",
      items: tables.ship_types.rows.map(createEnumItem),
      unknown: 0,
    },
    ShipAttr: {
      name: "ShipAttr",
      items: tables.ship_attrs.rows.map(createEnumItem),
      unknown: null,
    },
  };

  await updateRs(start2, ctypeNames, configs);
  await spreadsheet.updateTable(
    tables.ship_classes,
    Object.entries(ctypeNames)
      .map(([key, name]) => ({ id: Number(key), name }))
      .filter((obj) => obj.id < 1000),
  );
}

main().catch((err) => console.error(err));
