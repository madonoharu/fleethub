import {
  AntiAirCutinDef,
  DayCutinDef,
  Formation,
  FormationDef,
  NightCutinDef,
  NestedFormationDef,
  MasterData,
} from "fleethub-core";
import set from "lodash/set";

import { SpreadsheetTable } from "./utils";

function getAntiAirCutinDefs(table: SpreadsheetTable): AntiAirCutinDef[] {
  const { headerValues, rows } = table;

  return rows.map((row) => {
    const def = {} as AntiAirCutinDef;

    headerValues.forEach((h) => {
      const cellValue = row[h];
      const value = cellValue === undefined ? null : cellValue;
      set(def, h, value);
    });

    return def;
  });
}

function getFormationDefs(table: SpreadsheetTable): FormationDef[] {
  const { headerValues, rows } = table;
  const rec: Record<string, FormationDef> = {};

  rows.forEach((row) => {
    const def = {} as Omit<NestedFormationDef, "tag"> & { tag: string };
    const tag = row.tag as string;

    headerValues.forEach((h) => {
      const cellValue = row[h];
      const value = cellValue === undefined ? null : cellValue;
      set(def, h, value);
    });

    def.tag = tag.replace(/\.(top_half|bottom_half)/, "") as Formation;
    set(rec, tag, def);
  });

  return Object.values(rec);
}

function getDayCutinDefs(table: SpreadsheetTable): DayCutinDef[] {
  const { headerValues, rows } = table;

  return rows.map((row) => {
    const def = {} as DayCutinDef;

    headerValues.forEach((h) => {
      const cellValue = row[h];
      const value = cellValue === undefined ? null : cellValue;
      set(def, h, value);
    });

    return def;
  });
}

function getNightCutinDefs(table: SpreadsheetTable): NightCutinDef[] {
  const { headerValues, rows } = table;

  return rows.map((row) => {
    const def = {} as NightCutinDef;

    headerValues.forEach((h) => {
      const cellValue = row[h];
      const value = cellValue === undefined ? null : cellValue;
      set(def, h, value);
    });

    return def;
  });
}

type ConfigKey = "anti_air_cutin" | "day_cutin" | "night_cutin" | "formation";

export function createConfig(
  tables: Record<ConfigKey, SpreadsheetTable>
): Pick<MasterData, ConfigKey> {
  return {
    anti_air_cutin: getAntiAirCutinDefs(tables.anti_air_cutin),
    day_cutin: getDayCutinDefs(tables.day_cutin),
    night_cutin: getNightCutinDefs(tables.night_cutin),
    formation: getFormationDefs(tables.formation),
  };
}
