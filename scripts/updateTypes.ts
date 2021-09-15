import "dotenv/config";

import child_process from "child_process";
import path from "path";
import { promisify } from "util";
import { Dict, mapValues, uniqBy } from "@fh/utils/src";
import fs from "fs-extra";
import { Start2 } from "kc-tools";

import { getGoogleSpreadsheet } from "./data/google";
import { fetchStart2 } from "./data/utils";

const RS_GEAR_PATH = path.resolve("packages/core/src/types/gear.rs");
const RS_SHIP_PATH = path.resolve("packages/core/src/types/ship.rs");
const RS_CONST_ID_PATH = path.resolve("packages/core/src/types/const_id.rs");

const TS_PATH = path.resolve("packages/utils/src/constants.ts");

const exec = promisify(child_process.exec);

const ENUM_NAMES = [
  "GearType",
  "GearAttr",
  "ShipType",
  "ShipClass",
  "ShipAttr",
] as const;

type EnumName = typeof ENUM_NAMES[number];

type EnumItem = {
  tag: string;
  id?: number;
  name?: string;
};

type EnumConfig = {
  name: string;
  items: EnumItem[];
  unknown?: boolean;
};

const createEnum = ({ name, items, unknown }: EnumConfig) => {
  const lines = items.map(({ id, tag, name }) => {
    const line = id === undefined ? tag : `${tag} = ${id}`;
    return name ? `\n/// ${name}\n${line}` : line;
  });

  if (unknown) {
    lines.unshift("Unknown = 0");
  }

  return `enum ${name} {${lines.join(",")}}\n`;
};

const replaceEnum = (config: EnumConfig) => (src: string) => {
  const text = createEnum(config);

  const regex = RegExp(`enum ${config.name} \\{.*?\\}(?!;)`, "s");
  return src.replace(regex, text);
};

const updateFile = async (
  path: string,
  ...updaters: ((src: string) => string)[]
) => {
  const src = (await fs.readFile(path)).toString();
  const out = updaters.reduce((current, fn) => fn(current), src);
  await fs.outputFile(path, out);
};

const updateRs = async (
  start2: Start2,
  configs: Record<EnumName, EnumConfig>
) => {
  const updateShipId = (src: string): string => {
    const inner = start2.api_mst_ship
      .filter((ship) => ship.api_id < 1500)
      .map((ship) => `("${ship.api_name}") => { ${ship.api_id} };`)
      .join("\n");

    const macroName = "ship_id";
    const macro = `macro_rules! ${macroName} { ${inner} }`;

    const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s");

    return src.replace(regex, macro);
  };

  const updateGearId = (src: string): string => {
    const inner = uniqBy(start2.api_mst_slotitem, (gear) => gear.api_name)
      .map((gear) => `("${gear.api_name}") => { ${gear.api_id} };`)
      .join("\n");

    const macroName = "gear_id";
    const macro = `macro_rules! ${macroName} { ${inner} }`;

    const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s");

    return src.replace(regex, macro);
  };

  await updateFile(
    RS_GEAR_PATH,
    replaceEnum(configs.GearType),
    replaceEnum(configs.GearAttr)
  );

  await updateFile(
    RS_SHIP_PATH,
    replaceEnum(configs.ShipType),
    replaceEnum(configs.ShipClass),
    replaceEnum(configs.ShipAttr)
  );

  await updateFile(RS_CONST_ID_PATH, updateShipId, updateGearId);

  await exec(
    `rustfmt ${[RS_GEAR_PATH, RS_SHIP_PATH, RS_CONST_ID_PATH].join(" ")}`
  );
};

const updateTs = async (configs: Record<EnumName, EnumConfig>) => {
  await updateFile(TS_PATH, ...Object.values(configs).map(replaceEnum));
  await exec(`prettier --write ${TS_PATH}`);
};

const createEnumItem = (row: Dict<string, unknown>): EnumItem => {
  const tag = row.tag;

  if (typeof tag !== "string") {
    throw new Error("tag is not found");
  }

  const name = "name" in row ? String(row.name) : undefined;
  const id = "id" in row ? Number(row.id) : undefined;

  return { tag, id, name };
};

const main = async () => {
  const [doc, start2] = await Promise.all([
    getGoogleSpreadsheet(),
    fetchStart2(),
  ]);

  const sheets = {
    GearType: await doc.sheetsByTitle["装備種"].getRows(),
    GearAttr: await doc.sheetsByTitle["装備属性"].getRows(),
    ShipType: await doc.sheetsByTitle["艦種"].getRows(),
    ShipClass: await doc.sheetsByTitle["艦級"].getRows(),
    ShipAttr: await doc.sheetsByTitle["艦娘属性"].getRows(),
  };

  const data = mapValues(sheets, (rows) => rows.map(createEnumItem));

  const configs: Record<EnumName, EnumConfig> = {
    GearType: {
      name: "GearType",
      items: data.GearType,
      unknown: true,
    },
    GearAttr: {
      name: "GearAttr",
      items: data.GearAttr,
    },
    ShipType: {
      name: "ShipType",
      items: data.ShipType,
      unknown: true,
    },
    ShipClass: {
      name: "ShipClass",
      items: data.ShipClass,
      unknown: true,
    },
    ShipAttr: {
      name: "ShipAttr",
      items: data.ShipAttr,
    },
  };

  await Promise.all([updateRs(start2, configs), updateTs(configs)]);
};

main().catch((err) => console.error(err));
