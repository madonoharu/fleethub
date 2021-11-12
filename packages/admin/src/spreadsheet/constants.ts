import {
  AntiAirCutinDef,
  DayCutinDef,
  Formation,
  FormationDef,
  NightCutinDef,
  NormalFormationDef,
} from "fleethub-core";
import set from "lodash/set";

import { MasterDataSpreadsheet, Sheet } from "./sheet";

const maybeNumber = (val: unknown): number | null => {
  if (val === "") return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
};

const getAntiAirCutins = (sheet: Sheet): AntiAirCutinDef[] => {
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

const getFormations = (sheet: Sheet) => {
  const rows = sheet.rows;
  const headerValues = sheet.headerValues();

  const normalDefs = rows.map((row) => {
    const def = {} as Omit<NormalFormationDef, "tag"> & { tag: string };

    headerValues.forEach((h) => {
      const value = row[h];

      if (h === "tag") {
        set(def, h, value);
      } else {
        set(def, h, maybeNumber(value));
      }
    });

    return def;
  });

  const rec: Record<string, FormationDef> = {};

  normalDefs.forEach((def) => {
    const { tag } = def;
    set(rec, tag, def);

    def.tag = tag.replace(/\.(top_half|bottom_half)/, "") as Formation;
  });

  return Object.values(rec);
};

const getDayCutins = (sheet: Sheet) => {
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

const getNaightCutins = (sheet: Sheet) => {
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

export const createConstants = (mdSheet: MasterDataSpreadsheet) => {
  const sheets = mdSheet.pickSheets([
    "anti_air_cutins",
    "day_cutins",
    "night_cutins",
    "formations",
  ]);

  return {
    anti_air_cutins: getAntiAirCutins(sheets.anti_air_cutins),
    day_cutins: getDayCutins(sheets.day_cutins),
    night_cutins: getNaightCutins(sheets.night_cutins),
    formations: getFormations(sheets.formations),
  };
};
