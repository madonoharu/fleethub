import { sheets_v4 } from "googleapis";

export type CellValue = string | number | boolean | undefined;
export type SpreadsheetRow = Record<string, CellValue>;

export type SpreadsheetTable = {
  sheetId: number;
  headerValues: string[];
  rows: SpreadsheetRow[];
};

export const SHEET_DATA = [
  { sheetId: 2088927150, key: "ships" },
  { sheetId: 934954887, key: "ship_types" },
  { sheetId: 363641447, key: "ship_classes" },
  { sheetId: 832802435, key: "nationalities" },
  { sheetId: 1341468138, key: "ship_attrs" },
  { sheetId: 1972078575, key: "gears" },
  { sheetId: 1687646863, key: "gear_types" },
  { sheetId: 1192109753, key: "gear_attrs" },
  { sheetId: 1560992895, key: "equippability" },

  { sheetId: 1430282016, key: "historical_bonuses" },

  { sheetId: 347061403, key: "shelling_power" },
  { sheetId: 593793628, key: "shelling_accuracy" },
  { sheetId: 1341171814, key: "shelling_aerial_power" },
  { sheetId: 950662376, key: "torpedo_power" },
  { sheetId: 883691242, key: "torpedo_accuracy" },
  { sheetId: 1671132346, key: "torpedo_evasion" },
  { sheetId: 829203398, key: "night_power" },
  { sheetId: 46966362, key: "night_accuracy" },
  { sheetId: 390865843, key: "night_aerial_power" },
  { sheetId: 1989582365, key: "asw_power" },
  { sheetId: 1473639382, key: "asw_accuracy" },
  { sheetId: 667921219, key: "defense_power" },
  { sheetId: 1845135187, key: "contact_selection" },
  { sheetId: 139440268, key: "fighter_power" },
  { sheetId: 1148954527, key: "ship_anti_air" },
  { sheetId: 7973442, key: "fleet_anti_air" },
  { sheetId: 195030457, key: "elos" },

  { sheetId: 1827664524, key: "anti_air_cutin" },
  { sheetId: 370851605, key: "day_cutin" },
  { sheetId: 1863042385, key: "night_cutin" },
  { sheetId: 1930975556, key: "formation" },
] as const;

export type SheetKey = typeof SHEET_DATA[number]["key"];

export function fromValueRange(
  valueRange: sheets_v4.Schema$MatchedValueRange
): SpreadsheetTable {
  const sheetId = valueRange.dataFilters?.[0].gridRange?.sheetId;

  if (!sheetId) {
    throw new Error(`sheetId is ${String(sheetId)}`);
  }

  const values = valueRange.valueRange?.values || [];
  const [headerValues = [], ...restValues] = values as [
    string[] | undefined,
    ...unknown[][]
  ];

  const rows = restValues.map((rowValues) => {
    const row: Record<string, CellValue> = {};

    headerValues.forEach((key, i) => {
      row[key] = intoCellValue(rowValues[i]);
    });

    return row;
  });

  return {
    sheetId,
    headerValues,
    rows,
  };
}

export function intoCellValue(input: unknown): CellValue {
  if (input === "" || input === undefined || input === null) {
    return undefined;
  }

  switch (typeof input) {
    case "number":
    case "string":
    case "boolean":
      return input;
  }

  return String(input);
}

export function getSheetId(key: SheetKey): number {
  const found = SHEET_DATA.find((sheet) => sheet.key === key);

  if (!found) {
    throw new Error(`Sheet is not found: key ${key}`);
  }

  return found.sheetId;
}

export function getKey(sheetId: number): string {
  const found = SHEET_DATA.find((sheet) => sheet.sheetId === sheetId);

  if (!found) {
    throw new Error(`Sheet is not found: sheetId ${sheetId}`);
  }

  return found.key;
}
