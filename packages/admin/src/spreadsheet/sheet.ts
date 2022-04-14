import { MasterData } from "fleethub-core";
import { google } from "googleapis";

import { getServiceAccount } from "../credentials";

import { SpreadsheetClient } from "./client";
import { createUpdateRowsRequests, SpreadsheetTable } from "./utils";

const SHEET_DATA = [
  { sheetId: 2088927150, key: "ships" },
  { sheetId: 934954887, key: "ship_types" },
  { sheetId: 363641447, key: "ship_classes" },
  { sheetId: 1341468138, key: "ship_attrs" },
  { sheetId: 1972078575, key: "gears" },
  { sheetId: 1687646863, key: "gear_types" },
  { sheetId: 1192109753, key: "gear_attrs" },
  { sheetId: 347061403, key: "shelling_power" },
  { sheetId: 1341171814, key: "carrier_shelling_power" },
  { sheetId: 593793628, key: "shelling_accuracy" },
  { sheetId: 950662376, key: "torpedo_power" },
  { sheetId: 883691242, key: "torpedo_accuracy" },
  { sheetId: 1671132346, key: "torpedo_evasion" },
  { sheetId: 829203398, key: "night_power" },
  { sheetId: 46966362, key: "night_accuracy" },
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

const SPREADSHEET_ID = "1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA";

function getSheetId(key: SheetKey): number {
  const found = SHEET_DATA.find((sheet) => sheet.key === key);

  if (!found) {
    throw new Error(`Sheet is not found: key ${key}`);
  }

  return found.sheetId;
}

function getKey(sheetId: number): string {
  const found = SHEET_DATA.find((sheet) => sheet.sheetId === sheetId);

  if (!found) {
    throw new Error(`Sheet is not found: sheetId ${sheetId}`);
  }

  return found.key;
}

export class MasterDataSpreadsheet {
  public client: SpreadsheetClient;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: getServiceAccount(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.client = new SpreadsheetClient(SPREADSHEET_ID, auth);
  }

  async readTable(key: SheetKey): Promise<SpreadsheetTable> {
    const tables = await this.client.readTables([getSheetId(key)]);
    return tables[0];
  }

  async readTables(): Promise<Record<SheetKey, SpreadsheetTable>>;
  async readTables<K extends SheetKey>(
    keys: K[]
  ): Promise<Record<K, SpreadsheetTable>>;
  async readTables(
    arg?: SheetKey[]
  ): Promise<Record<SheetKey, SpreadsheetTable>> {
    let keys: SheetKey[];

    if (arg) {
      keys = arg;
    } else {
      keys = SHEET_DATA.map((sheet) => sheet.key);
    }

    const sheetIds = keys.map(getSheetId);
    const tables = await this.client.readTables(sheetIds);
    const entries = tables.map((table) => {
      const key = getKey(table.sheetId);
      return [key, table];
    });

    return Object.fromEntries(entries) as Record<SheetKey, SpreadsheetTable>;
  }

  async updateTable(table: SpreadsheetTable, data: object[]): Promise<void> {
    const requests = createUpdateRowsRequests(table, data);

    if (requests.length) {
      await this.client.batchUpdate({
        requests,
      });
    }
  }

  async writeMasterData(
    tables: Record<"ships" | "gears", SpreadsheetTable>,
    md: MasterData
  ) {
    const keys = ["ships", "gears"] as const;

    const requests = keys.flatMap((key) => {
      const data = md[key];
      const table = tables[key];

      const requests = createUpdateRowsRequests(table, data);

      return requests;
    });

    if (requests.length) {
      await this.client.batchUpdate({
        requests,
      });
    }
  }
}
