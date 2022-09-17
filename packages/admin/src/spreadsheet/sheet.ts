import { MasterData } from "fleethub-core";
import { google } from "googleapis";

import { getServiceAccount } from "../credentials";

import {
  getKey,
  getSheetId,
  SheetKey,
  SHEET_DATA,
  SpreadsheetTable,
} from "./SpreadsheetTable";
import { SpreadsheetClient } from "./client";
import { createUpdateRowsRequests } from "./utils";

const SPREADSHEET_ID = "1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA";

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

  async readTables(): Promise<
    Record<Exclude<SheetKey, "ship_classes">, SpreadsheetTable>
  >;
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
      keys = SHEET_DATA.map((sheet) => sheet.key).filter(
        (key) => key !== "ship_classes"
      );
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
