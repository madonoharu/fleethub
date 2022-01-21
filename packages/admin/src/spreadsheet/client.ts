import { google, sheets_v4 } from "googleapis";

import { CellValue, intoCellValue, SpreadsheetTable } from "./utils";

export class SpreadsheetClient {
  inner: sheets_v4.Resource$Spreadsheets;

  constructor(
    public spreadsheetId: string,
    public auth: sheets_v4.Options["auth"]
  ) {
    this.inner = google.sheets({
      version: "v4",
      auth,
    }).spreadsheets;
  }

  batchUpdate(requestBody: sheets_v4.Schema$BatchUpdateSpreadsheetRequest) {
    return this.inner.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody,
    });
  }

  async readTables(sheetIds: number[]): Promise<SpreadsheetTable[]> {
    const res = await this.inner.values.batchGetByDataFilter({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        dataFilters: sheetIds.map((sheetId) => ({
          gridRange: { sheetId },
        })),
        valueRenderOption: "UNFORMATTED_VALUE",
      },
    });

    const { valueRanges } = res.data;

    if (!valueRanges) {
      throw new Error(res.statusText);
    }

    const tables = valueRanges.map((valueRange) => {
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
    });

    return tables;
  }
}
