import { MasterDataInput } from "@fleethub/core/types";
import child_process from "child_process";
import fs from "fs-extra";
import path from "path";
import { promisify } from "util";

import { readMasterData } from "./data/storage";

const RS_GEAR_PATH = path.resolve("packages/core/src/types/gear.rs");
const RS_SHIP_PATH = path.resolve("packages/core/src/types/ship.rs");
const RS_CONST_ID_PATH = path.resolve("packages/core/src/types/const_id.rs");

const TS_PATH = path.resolve("packages/utils/src/constants.ts");

const exec = promisify(child_process.exec);

type EnumItem = {
  tag: string;
  id?: number;
};

type EnumConfig = {
  name: string;
  items: EnumItem[];
  unknown?: boolean;
};

const createEnum = ({ name, items, unknown }: EnumConfig) => {
  const lines = items.map(({ id, tag }) =>
    id === undefined ? tag : `${tag} = ${id}`
  );

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

const updateRs = async (md: MasterDataInput) => {
  const updateShipId = (src: string): string => {
    const inner = md.ships
      .filter((ship) => ship.ship_id < 1500)
      .map((ship) => `("${ship.name}") => { ${ship.ship_id} };`)
      .join("\n");

    const macroName = "ship_id";
    const macro = `macro_rules! ${macroName} { ${inner} }`;

    const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s");

    return src.replace(regex, macro);
  };

  const updateGearId = (src: string): string => {
    const inner = md.gears
      .filter((gear) => gear.gear_id < 500)
      .map((gear) => `("${gear.name}") => { ${gear.gear_id} };`)
      .join("\n");

    const macroName = "gear_id";
    const macro = `macro_rules! ${macroName} { ${inner} }`;

    const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s");

    return src.replace(regex, macro);
  };

  await updateFile(
    RS_GEAR_PATH,
    replaceEnum({
      name: "GearType",
      items: md.gear_types,
      unknown: true,
    }),
    replaceEnum({
      name: "GearAttr",
      items: md.gear_attrs,
    })
  );

  await updateFile(
    RS_SHIP_PATH,
    replaceEnum({
      name: "ShipType",
      items: md.ship_types,
      unknown: true,
    }),
    replaceEnum({
      name: "ShipClass",
      items: md.ship_classes,
      unknown: true,
    }),
    replaceEnum({
      name: "ShipAttr",
      items: md.ship_attrs,
    })
  );

  await updateFile(RS_CONST_ID_PATH, updateShipId, updateGearId);

  await exec(
    `rustfmt ${[RS_GEAR_PATH, RS_SHIP_PATH, RS_CONST_ID_PATH].join(" ")}`
  );
};

const updateTs = async (md: MasterDataInput) => {
  await updateFile(
    TS_PATH,
    replaceEnum({
      name: "GearType",
      items: md.gear_types,
      unknown: true,
    }),
    replaceEnum({
      name: "GearAttr",
      items: md.gear_attrs,
    }),
    replaceEnum({
      name: "ShipType",
      items: md.ship_types,
      unknown: true,
    }),
    replaceEnum({
      name: "ShipClass",
      items: md.ship_classes,
      unknown: true,
    }),
    replaceEnum({
      name: "ShipAttr",
      items: md.ship_attrs,
    })
  );

  await exec(`prettier --write ${TS_PATH}`);
};

const main = async () => {
  const md = await readMasterData();
  await Promise.all([updateRs(md), updateTs(md)]);
};

main().catch((err) => console.error(err));
