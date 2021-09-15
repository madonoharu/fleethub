import { nonNullable } from "@fh/utils/src";
import { MasterAttrRule, MasterGearInput, MasterIBonuses } from "@fh/core";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { Start2 } from "kc-tools";

import { deleteFalsyValues, updateRows } from "./utils";

const createGears = (
  rows: GoogleSpreadsheetRow[],
  start2: Start2
): MasterGearInput[] => {
  const gears = start2.api_mst_slotitem.map((mst) => {
    const row = rows.find((row) => Number(row.gear_id) === mst.api_id);

    const next: MasterGearInput = {
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

const readGearAttrs = async (
  sheet: GoogleSpreadsheetWorksheet,
  start2: Start2
) => {
  const rows = await sheet.getRows();

  const gear_attrs: MasterAttrRule[] = [];
  const replaceExpr = makeReplaceGearExpr(start2, gear_attrs);

  rows.forEach((row) => {
    const expr = replaceExpr(row.expr);
    gear_attrs.push({ tag: row.tag, name: row.name, expr });
  });

  return gear_attrs;
};

const readIBonuses = async (
  doc: GoogleSpreadsheet,
  start2: Start2,
  gear_attrs: MasterAttrRule[]
): Promise<MasterIBonuses> => {
  const sheets: Record<keyof MasterIBonuses, GoogleSpreadsheetWorksheet> = {
    shelling_power: doc.sheetsByTitle["改修砲撃攻撃力"],
    shelling_accuracy: doc.sheetsByTitle["改修砲撃命中"],
    torpedo_power: doc.sheetsByTitle["改修雷撃攻撃力"],
    torpedo_accuracy: doc.sheetsByTitle["改修雷撃命中"],
    torpedo_evasion: doc.sheetsByTitle["改修雷撃回避"],
    night_power: doc.sheetsByTitle["改修夜戦攻撃力"],
    night_accuracy: doc.sheetsByTitle["改修夜戦命中"],
    asw_power: doc.sheetsByTitle["改修対潜攻撃力"],
    asw_accuracy: doc.sheetsByTitle["改修対潜命中"],
    defense_power: doc.sheetsByTitle["改修防御力"],
    contact_selection: doc.sheetsByTitle["改修触接選択率"],
    fighter_power: doc.sheetsByTitle["改修制空"],
    adjusted_anti_air: doc.sheetsByTitle["改修加重対空"],
    fleet_anti_air: doc.sheetsByTitle["改修艦隊対空"],
    elos: doc.sheetsByTitle["改修マップ索敵"],
  };

  const replaceExpr = makeReplaceGearExpr(start2, gear_attrs);

  const promises = Object.entries(sheets).map(async ([key, sheet]) => {
    const rows = await sheet.getRows();
    const rules = rows
      .map(({ expr, formula }) => {
        if (!expr || !formula) return undefined;
        return { expr: replaceExpr(expr), formula };
      })
      .filter(nonNullable);

    return [key, rules];
  });

  const entries = await Promise.all(promises);
  return Object.fromEntries(entries) as MasterIBonuses;
};

export const updateGearData = async (
  doc: GoogleSpreadsheet,
  start2: Start2
) => {
  const sheets = {
    gears: doc.sheetsByTitle["装備"],
    gear_types: doc.sheetsByTitle["装備種"],
    gear_attrs: doc.sheetsByTitle["装備属性"],
  };

  const [gears, gear_types] = await Promise.all([
    updateRows(sheets.gears, (rows) => createGears(rows, start2)),
    updateRows(sheets.gear_types, (rows) => createGearTypes(rows, start2)),
  ]);

  const gear_attrs = await readGearAttrs(sheets.gear_attrs, start2);
  const ibonuses = await readIBonuses(doc, start2, gear_attrs);

  const data = {
    gears,
    gear_types,
    gear_attrs,
    ibonuses,
  };

  return data;
};
