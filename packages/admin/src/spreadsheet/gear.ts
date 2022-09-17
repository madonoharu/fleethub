import { nonNullable } from "@fh/utils";
import {
  GearAttr,
  MasterAttrRule,
  MasterData,
  MasterGear,
  MasterIBonuses,
} from "fleethub-core";
import { Start2 } from "kc-tools";

import { parseHistoricalAircraftGroup, ExprParser } from "./parser";
import { deleteFalsyValues, toCellString, SpreadsheetTable } from "./utils";

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
      ship_anti_air_resist: Number(row?.ship_anti_air_resist),
      fleet_anti_air_resist: Number(row?.fleet_anti_air_resist),
      historical_aircraft_group: parseHistoricalAircraftGroup(
        row?.historical_aircraft_group
      ),
    };

    deleteFalsyValues(next);

    return next;
  });

  return gears;
}

function createGearAttrs(
  table: SpreadsheetTable,
  parser: ExprParser
): MasterAttrRule<GearAttr>[] {
  return table.rows.map((row) => {
    const expr = parser.parseGear(toCellString(row.expr));

    return {
      tag: toCellString(row.tag) as GearAttr,
      name: toCellString(row.name),
      expr,
    };
  });
}

const IBONUS_KEYS: (keyof MasterIBonuses)[] = [
  "shelling_power",
  "shelling_accuracy",
  "shelling_aerial_power",
  "torpedo_power",
  "torpedo_accuracy",
  "torpedo_evasion",
  "night_power",
  "night_accuracy",
  "night_aerial_power",
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
  parser: ExprParser
): MasterIBonuses {
  const result = {} as MasterIBonuses;

  IBONUS_KEYS.forEach((key) => {
    const table = tables[key];

    const rules = table.rows
      .map(({ expr, formula }) => {
        if (!expr || !formula) {
          return undefined;
        }

        return {
          expr: parser.parseGear(toCellString(expr)),
          formula: toCellString(formula),
        };
      })
      .filter(nonNullable);

    result[key] = rules;
  });

  return result;
}

export function createGearData(
  parser: ExprParser,
  tables: Record<
    "gears" | "gear_attrs" | keyof MasterIBonuses,
    SpreadsheetTable
  >
): Pick<MasterData, "gears" | "gear_attrs" | "ibonuses"> {
  const gears = createGears(tables.gears, parser.start2);
  const gear_attrs = createGearAttrs(tables.gear_attrs, parser);
  const ibonuses = createMasterIBonuses(tables, parser);

  return {
    gears,
    gear_attrs,
    ibonuses,
  };
}
