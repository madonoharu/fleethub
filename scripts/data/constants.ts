import {
  AntiAirCutinDef,
  DayCutinDef,
  Formation,
  FormationDef,
  MasterConstants,
  NightCutinDef,
  NormalFormationDef,
} from "@fleethub/core/types";
import { GoogleSpreadsheet } from "google-spreadsheet";
import set from "lodash/set";

const maybeNumber = (val: unknown): number | null => {
  if (val === "") return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
};

export const getAntiAirCutins = async (
  doc: GoogleSpreadsheet
): Promise<AntiAirCutinDef[]> => {
  const sheet = doc.sheetsByTitle["対空CI"];
  const rows = await sheet.getRows();
  const { headerValues } = sheet;

  return rows.map((row) => {
    const def = {} as AntiAirCutinDef;

    headerValues.forEach((h) => {
      const value = row[h];
      set(def, h, maybeNumber(value));
    });

    return def;
  });
};

export const getFormations = async (
  doc: GoogleSpreadsheet
): Promise<FormationDef[]> => {
  const sheet = doc.sheetsByTitle["陣形"];
  const rows = await sheet.getRows();
  const { headerValues } = sheet;

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

  const vanguardDef = rec["Vanguard"] as {
    top_half: NormalFormationDef;
    bottom_half: NormalFormationDef;
  };

  vanguardDef;

  return Object.values(rec);
};

export const getDayCutins = async (
  doc: GoogleSpreadsheet
): Promise<DayCutinDef[]> => {
  const sheet = doc.sheetsByTitle["昼戦CI"];
  const rows = await sheet.getRows();
  const { headerValues } = sheet;

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

export const getNaightCutins = async (
  doc: GoogleSpreadsheet
): Promise<NightCutinDef[]> => {
  const sheet = doc.sheetsByTitle["夜戦CI"];
  const rows = await sheet.getRows();
  const { headerValues } = sheet;

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

export const getConstants = async (
  doc: GoogleSpreadsheet
): Promise<MasterConstants> => {
  const [anti_air_cutins, day_cutins, night_cutins, formations] =
    await Promise.all([
      getAntiAirCutins(doc),
      getDayCutins(doc),
      getNaightCutins(doc),
      getFormations(doc),
    ]);

  return {
    anti_air_cutins,
    day_cutins,
    night_cutins,
    formations,
  };
};
