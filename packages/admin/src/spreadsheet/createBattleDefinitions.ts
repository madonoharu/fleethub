import {
  AntiAirCutinDef,
  DayCutinDef,
  Formation,
  FormationDef,
  NightCutinDef,
  NestedFormationDef,
  MasterBattleDefinitions,
  HistoricalBonusDef,
} from "fleethub-core";
import { set } from "es-toolkit/compat";

import { SpreadsheetRow, SpreadsheetTable } from "./SpreadsheetTable";

function createDefinition<T extends object>(
  { headerValues }: SpreadsheetTable,
  row: SpreadsheetRow,
): T {
  const def = {} as T;

  headerValues.forEach((header) => {
    set(def, header, row[header] ?? null);
  });

  return def;
}

function getDefinitions<T extends object>(table: SpreadsheetTable): T[] {
  return table.rows.map((row) => createDefinition<T>(table, row));
}

function getFormationDefs(table: SpreadsheetTable): FormationDef[] {
  const rec: Record<string, FormationDef> = {};

  table.rows.forEach((row) => {
    const def = createDefinition<Omit<NestedFormationDef, "tag"> & { tag: string }>(table, row);
    const tag = row.tag as string;

    def.tag = tag.replace(/\.(top_half|bottom_half)/, "") as Formation;
    set(rec, tag, def);
  });

  return Object.values(rec);
}

export function createBattleDefinitions(
  tables: Record<Exclude<keyof MasterBattleDefinitions, "historical_bonuses">, SpreadsheetTable>,
  historical_bonuses: HistoricalBonusDef[],
): MasterBattleDefinitions {
  return {
    anti_air_cutin: getDefinitions<AntiAirCutinDef>(tables.anti_air_cutin),
    day_cutin: getDefinitions<DayCutinDef>(tables.day_cutin),
    night_cutin: getDefinitions<NightCutinDef>(tables.night_cutin),
    formation: getFormationDefs(tables.formation),
    historical_bonuses,
  };
}
