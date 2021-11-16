import {
  AntiAirCutinDef,
  DayCutinDef,
  Formation,
  FormationDef,
  NightCutinDef,
  NestedFormationDef,
  BattleConfig,
} from "fleethub-core";
import set from "lodash/set";

import { MasterDataSpreadsheet, Sheet } from "./sheet";

const maybeNumber = (val: unknown): number | null => {
  if (val === "") return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
};

const getAntiAirCutinDefs = (sheet: Sheet): AntiAirCutinDef[] => {
  const rows = sheet.rows;
  const headerValues = sheet.headerValues();

  return rows.map((row) => {
    const def = {} as AntiAirCutinDef;

    headerValues.forEach((h) => {
      const value = row[h];
      if (h === "sequential") {
        set(def, h, value === "TRUE");
      } else {
        set(def, h, maybeNumber(value));
      }
    });

    return def;
  });
};

const getFormationDefs = (sheet: Sheet) => {
  const rec: Record<string, FormationDef> = {};
  const rows = sheet.rows;
  const headerValues = sheet.headerValues();

  rows.forEach((row) => {
    const def = {} as Omit<NestedFormationDef, "tag"> & { tag: string };
    const tag = row.tag as string;

    headerValues.forEach((h) => {
      const value = row[h];

      if (h === "tag") {
        set(def, h, value);
      } else {
        set(def, h, maybeNumber(value));
      }
    });

    def.tag = tag.replace(/\.(top_half|bottom_half)/, "") as Formation;
    set(rec, tag, def);
  });

  return Object.values(rec);
};

const getDayCutinDefs = (sheet: Sheet) => {
  const rows = sheet.rows;
  const headerValues = sheet.headerValues();

  return rows.map((row) => {
    const def = {} as DayCutinDef;
    headerValues.forEach((h) => {
      const value = row[h];

      if (h === "tag" || h === "name") {
        set(def, h, value);
      } else {
        set(def, h, maybeNumber(value));
      }
    });

    return def;
  });
};

const getNaightCutinDefs = (sheet: Sheet) => {
  const rows = sheet.rows;
  const headerValues = sheet.headerValues();

  return rows.map((row) => {
    const def = {} as NightCutinDef;
    headerValues.forEach((h) => {
      const value = row[h];

      if (h === "tag" || h === "name") {
        set(def, h, value);
      } else {
        set(def, h, maybeNumber(value));
      }
    });

    return def;
  });
};

export const createConfig = (mdSheet: MasterDataSpreadsheet): BattleConfig => {
  const sheets = mdSheet.pickSheets([
    "anti_air_cutin",
    "day_cutin",
    "night_cutin",
    "formation",
  ]);

  return {
    anti_air_cutin: getAntiAirCutinDefs(sheets.anti_air_cutin),
    day_cutin: getDayCutinDefs(sheets.day_cutin),
    night_cutin: getNaightCutinDefs(sheets.night_cutin),
    formation: getFormationDefs(sheets.formation),
  };
};
