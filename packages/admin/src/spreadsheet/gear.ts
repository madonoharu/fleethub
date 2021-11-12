import { mapValues, nonNullable } from "@fh/utils";
import { MasterAttrRule, MasterGear, MasterIBonuses } from "fleethub-core";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { Start2 } from "kc-tools";

import { deleteFalsyValues } from "../utils";
import { MasterDataSpreadsheet } from "./sheet";

const createGears = (
  rows: GoogleSpreadsheetRow[],
  start2: Start2
): MasterGear[] => {
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

      improvable: row?.improvable === "TRUE",
      special_type: Number(row?.special_type),
      adjusted_anti_air_resistance: Number(row?.adjusted_anti_air_resistance),
      fleet_anti_air_resistance: Number(row?.fleet_anti_air_resistance),
    };

    deleteFalsyValues(next);

    return next;
  });

  return gears;
};

const createGearTypes = (rows: GoogleSpreadsheetRow[], start2: Start2) =>
  start2.api_mst_slotitem_equiptype.map((mst) => ({
    id: mst.api_id,
    name: mst.api_name,
    tag: rows.find((row) => Number(row.id) === mst.api_id)?.tag || "",
  }));

const makeReplaceGearExpr = (start2: Start2, gear_attrs: MasterAttrRule[]) => {
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
};

const createGearAttrs = (rows: GoogleSpreadsheetRow[], start2: Start2) => {
  const gear_attrs: MasterAttrRule[] = [];
  const replaceExpr = makeReplaceGearExpr(start2, gear_attrs);

  rows.forEach((row) => {
    const expr = replaceExpr(row.expr as string);
    gear_attrs.push({ tag: row.tag, name: row.name, expr });
  });

  return gear_attrs;
};

const createMasterIBonuses = (
  map: Record<keyof MasterIBonuses, GoogleSpreadsheetRow[]>,
  start2: Start2,
  gear_attrs: MasterAttrRule[]
): MasterIBonuses => {
  const replaceExpr = makeReplaceGearExpr(start2, gear_attrs);

  return mapValues(map, (rows) => {
    const rules = rows
      .map(({ expr, formula }) => {
        if (!expr || !formula) return undefined;
        return { expr: replaceExpr(expr as string), formula };
      })
      .filter(nonNullable);

    return rules;
  });
};

export const createGearData = (
  mdSheet: MasterDataSpreadsheet,
  start2: Start2
) => {
  const sheets = mdSheet.pickSheets(["gears", "gear_types", "gear_attrs"]);

  const ibonusesSheets = mdSheet.pickSheets([
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
    "adjusted_anti_air",
    "fleet_anti_air",
    "elos",
  ]);

  const gears = createGears(sheets.gears.rows, start2);
  const gear_types = createGearTypes(sheets.gear_types.rows, start2);
  const gear_attrs = createGearAttrs(sheets.gear_attrs.rows, start2);

  const ibonuses = createMasterIBonuses(
    mapValues(ibonusesSheets, (sheet) => sheet.rows),
    start2,
    gear_attrs
  );

  return {
    gears,
    gear_types,
    gear_attrs,
    ibonuses,
  };
};
