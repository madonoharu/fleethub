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
import set from "lodash/set";

import { SpreadsheetTable } from "./SpreadsheetTable";
import { ExprParser } from "./parser";

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

function getHistoricalBonusDefs(
  parser: ExprParser,
  table: SpreadsheetTable
): HistoricalBonusDef[] {
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
  tables: Record<keyof MasterBattleDefinitions, SpreadsheetTable>
): MasterBattleDefinitions {
  return {
    anti_air_cutin: getAntiAirCutinDefs(tables.anti_air_cutin),
    day_cutin: getDayCutinDefs(tables.day_cutin),
    night_cutin: getNightCutinDefs(tables.night_cutin),
    formation: getFormationDefs(tables.formation),
    historical_bonuses: getHistoricalBonusDefs(
      parser,
      tables.historical_bonuses
    ),
  };
}
