import { nonNullable } from "@fh/utils";
import {
  GearAttr,
  MasterAttrRule,
  MasterData,
  MasterGear,
  MasterIBonuses,
} from "fleethub-core";
import { Start2 } from "kc-tools";

import {
  deleteFalsyValues,
  cellValueToString,
  SpreadsheetTable,
} from "./utils";

function createGears(table: SpreadsheetTable, start2: Start2): MasterGear[] {
  const { rows } = table;

  const gears = start2.api_mst_slotitem.map((mst) => {
    const row = rows.find((row) => Number(row.gear_id) === mst.api_id);

    const next: MasterGear = {
      gear_id: mst.api_id,
      types: mst.api_type,
      name: mst.api_name,
      max_hp: mst.api_taik,
      armor: mst.api_souk,
      firepower: mst.api_houg,
      torpedo: mst.api_raig,
      speed: mst.api_soku,
      bombing: mst.api_baku,
      anti_air: mst.api_tyku,
      asw: mst.api_tais,
      los: mst.api_saku,
      luck: mst.api_luck,
      accuracy: mst.api_houm,
      evasion: mst.api_houk,
      range: mst.api_leng,
      radius: mst.api_distance || 0,
      cost: mst.api_cost || 0,

      improvable: Boolean(row?.improvable),
      special_type: Number(row?.special_type),
      ship_anti_air_resistance: Number(row?.ship_anti_air_resistance),
      fleet_anti_air_resistance: Number(row?.fleet_anti_air_resistance),
    };

    deleteFalsyValues(next);

    return next;
  });

  return gears;
}

function makeReplaceGearExpr(
  start2: Start2,
  gear_attrs: MasterAttrRule<GearAttr>[]
): (str: string) => string {
  const replaceType = (str: string) =>
    start2.api_mst_slotitem_equiptype.reduce(
      (current, type) =>
        current.replace(`"${type.api_name}"`, type.api_id.toString()),
      str
    );

  const replaceName = (str: string) =>
    start2.api_mst_slotitem.reduce(
      (current, gear) =>
        current.replace(`"${gear.api_name}"`, gear.api_id.toString()),
      str
    );

  const replaceAttr = (str: string) =>
    gear_attrs.reduce(
      (current, attr) =>
        current.replace(RegExp(`\\b${attr.tag}\\b`, "g"), attr.expr),
      str
    );

  return (str: string) =>
    replaceAttr(str)
      .replace(/gear_type == "[^"]+"/g, replaceType)
      .replace(/gear_type_in\(\s*("[^"]+",?\s*)+\)/gs, replaceType)
      .replace(/name == "[^"]+"/g, replaceName)
      .replace(/name_in\(\s*("[^"]+",?\s*)+\)/gs, replaceName)
      .replace(/\bname/g, "gear_id")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ");
}

function createGearAttrs(
  table: SpreadsheetTable,
  start2: Start2
): MasterAttrRule<GearAttr>[] {
  const gear_attrs: MasterAttrRule<GearAttr>[] = [];
  const replaceExpr = makeReplaceGearExpr(start2, gear_attrs);

  table.rows.forEach((row) => {
    const expr = replaceExpr(row.expr as string);

    gear_attrs.push({
      tag: cellValueToString(row.tag) as GearAttr,
      name: cellValueToString(row.name),
      expr,
    });
  });

  return gear_attrs;
}

const IBONUS_KEYS: (keyof MasterIBonuses)[] = [
  "shelling_power",
  "shelling_accuracy",
  "carrier_shelling_power",
  "torpedo_power",
  "torpedo_accuracy",
  "torpedo_evasion",
  "night_power",
  "night_accuracy",
  "asw_power",
  "asw_accuracy",
  "defense_power",
  "contact_selection",
  "fighter_power",
  "ship_anti_air",
  "fleet_anti_air",
  "elos",
];

function createMasterIBonuses(
  tables: Record<keyof MasterIBonuses, SpreadsheetTable>,
  start2: Start2,
  gear_attrs: MasterAttrRule<GearAttr>[]
): MasterIBonuses {
  const replaceExpr = makeReplaceGearExpr(start2, gear_attrs);

  const result = {} as MasterIBonuses;

  IBONUS_KEYS.forEach((key) => {
    const table = tables[key];

    const rules = table.rows
      .map(({ expr, formula }) => {
        if (!expr || !formula) {
          return undefined;
        }
        return {
          expr: replaceExpr(cellValueToString(expr)),
          formula: cellValueToString(formula),
        };
      })
      .filter(nonNullable);

    result[key] = rules;
  });

  return result;
}

export function createGearData(
  tables: Record<
    "gears" | "gear_attrs" | keyof MasterIBonuses,
    SpreadsheetTable
  >,
  start2: Start2
): Pick<MasterData, "gears" | "gear_attrs" | "ibonuses"> {
  const gears = createGears(tables.gears, start2);
  const gear_attrs = createGearAttrs(tables.gear_attrs, start2);
  const ibonuses = createMasterIBonuses(tables, start2, gear_attrs);

  return {
    gears,
    gear_attrs,
    ibonuses,
  };
}
