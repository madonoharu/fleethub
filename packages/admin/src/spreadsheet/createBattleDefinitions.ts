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
import { ExprParser } from "./parser";

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

function getHistoricalBonusDefs(parser: ExprParser, table: SpreadsheetTable): HistoricalBonusDef[] {
  const { headerValues, rows } = table;

  return rows
    .map((row) => {
      const def: HistoricalBonusDef = {};

      headerValues.forEach((h) => {
        const cellValue = row[h];
        if (cellValue) {
          set(def, h, cellValue);
        }
      });

      if (def.ship) {
        def.ship = parser.parseHistoricalBonusesShip(def.ship);
      }
      if (def.enemy) {
        def.enemy = parser.parseHistoricalBonusesShip(def.enemy);
      }

      return def;
    })
    .filter((def) => Boolean(def.map));
}

export function createBattleDefinitions(
  parser: ExprParser,
  tables: Record<keyof MasterBattleDefinitions, SpreadsheetTable>,
): MasterBattleDefinitions {
  return {
    anti_air_cutin: getDefinitions<AntiAirCutinDef>(tables.anti_air_cutin),
    day_cutin: getDefinitions<DayCutinDef>(tables.day_cutin),
    night_cutin: getDefinitions<NightCutinDef>(tables.night_cutin),
    formation: getFormationDefs(tables.formation),
    historical_bonuses: getHistoricalBonusDefs(parser, tables.historical_bonuses),
  };
}
