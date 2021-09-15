import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import got from "got";
import { Start2 } from "kc-tools";
import get from "lodash/get";

type Row = Record<string, unknown>;

export const fetchStart2 = async (): Promise<Start2> => {
  return got
    .get(
      "https://raw.githubusercontent.com/Tibowl/api_start2/master/start2.json"
    )
    .json();
};

export const deleteFalsyValues = (obj: Record<string, unknown>) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (!value) {
      delete obj[key];
    }
  });
};

export const toCellValue = (value: unknown) => {
  if (value === null) return "";

  switch (typeof value) {
    case "object":
      return JSON.stringify(value);
    case "number":
    case "string":
    case "boolean":
      return value;
  }

  return "";
};

const toCellString = (value: unknown): string => {
  const cellValue = toCellValue(value);
  if (typeof cellValue === "boolean") {
    return cellValue === true ? "TRUE" : "FALSE";
  }
  return cellValue.toString();
};

const equalCellValue = (v1: unknown, v2: unknown) => {
  const s1 = toCellString(v1);
  const s2 = toCellString(v2);
  return s1 === s2 || (s1 || "FALSE") === (s2 || "FALSE");
};

export const equalRows = (keys: string[], rows1: Row[], rows2: Row[]) => {
  if (rows1.length !== rows2.length) return false;

  return rows1.every((row1, index) => {
    const row2 = rows2[index];
    if (!row2) return false;

    return keys.every((key) => equalCellValue(get(row1, key), get(row2, key)));
  });
};

export const writeRows = async (
  sheet: GoogleSpreadsheetWorksheet,
  rows: Record<string, unknown>[]
) => {
  const rowCount = rows.length + 1;
  if (sheet.gridProperties.rowCount !== rowCount) {
    await sheet.resize({ ...sheet.gridProperties, rowCount });
  }

  await sheet.loadCells({
    startRowIndex: 0,
    startColumnIndex: 0,
    endRowIndex: rowCount,
    endColumnIndex: sheet.headerValues.length,
  });

  rows.forEach((row, i) => {
    const rowIndex = i + 1;
    sheet.headerValues.forEach((key, columnIndex) => {
      const cell = sheet.getCell(rowIndex, columnIndex);
      const next = toCellValue(get(row, key));

      if (equalCellValue(cell.value, next)) return;
      cell.value = next;
    });
  });

  await sheet.saveUpdatedCells();
};

export const updateRows = async <T extends Record<string, unknown>[]>(
  sheet: GoogleSpreadsheetWorksheet,
  cb: (rows: GoogleSpreadsheetRow[], sheet: GoogleSpreadsheetWorksheet) => T
): Promise<T> => {
  const rows = await sheet.getRows();
  const next = cb(rows, sheet);

  if (equalRows(sheet.headerValues, rows, next)) {
    console.log(`skip ${sheet.a1SheetName}`);
  } else {
    await writeRows(sheet, next);
  }

  return next;
};
