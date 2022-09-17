import { sheets_v4 } from "googleapis";
import get from "lodash/get";

import { CellValue, intoCellValue, SpreadsheetTable } from "./SpreadsheetTable";

type Requests = NonNullable<
  sheets_v4.Schema$BatchUpdateSpreadsheetRequest["requests"]
>;

export function toCellString(cellValue: CellValue): string {
  switch (typeof cellValue) {
    case "boolean":
      return cellValue ? "TRUE" : "FALSE";
    case "undefined":
      return "";
  }

  return String(cellValue);
}

export function deleteFalsyValues(obj: object): void {
  Object.entries(obj).forEach(([key, value]) => {
    if (!value) {
      delete (obj as Record<string, unknown>)[key];
    }
  });
}

function toEnteredValue(value: unknown): sheets_v4.Schema$ExtendedValue {
  const cellValue = intoCellValue(value);

  switch (typeof cellValue) {
    case "string":
      return { stringValue: cellValue };
    case "boolean":
      return { boolValue: cellValue };
    case "number":
      return { numberValue: cellValue };
    case "undefined":
      return { stringValue: "" };
  }
}

function equalCellValue(v1: unknown, v2: unknown): boolean {
  return intoCellValue(v1) === intoCellValue(v2);
}

function createAppendRowsRequests(
  sheetId: number,
  headerValues: string[],
  data: object[]
): Requests {
  if (!data.length) {
    return [];
  }

  const rows = data.map((row) => {
    const values: sheets_v4.Schema$CellData[] = headerValues.map((key) => {
      const value: unknown = get(row, key);

      return {
        userEnteredValue: toEnteredValue(value),
      };
    });

    return {
      values,
    };
  });

  return [
    {
      appendCells: {
        sheetId,
        fields: "userEnteredValue",
        rows,
      },
    },
    {
      sortRange: {
        range: {
          sheetId,
          startRowIndex: 1,
        },
        sortSpecs: [
          {
            sortOrder: "ASCENDING",
            dimensionIndex: 0,
          },
        ],
      },
    },
  ];
}

function createUpdateCellRequests(
  sheetId: number,
  rowIndex: number,
  columnIndex: number,
  value: unknown
): Requests {
  return [
    {
      updateCells: {
        start: {
          sheetId,
          rowIndex,
          columnIndex,
        },
        fields: "userEnteredValue",
        rows: [
          {
            values: [
              {
                userEnteredValue: toEnteredValue(value),
              },
            ],
          },
        ],
      },
    },
  ];
}

export function createUpdateRowsRequests(
  table: SpreadsheetTable,
  data: object[]
): Requests {
  const { sheetId, headerValues, rows: currentRows } = table;
  const idAttribute = headerValues[0];

  const getId = (row: object) => Number(get(row, idAttribute));

  const getRowById = (rows: object[], id: number) => {
    return rows.find((row) => getId(row) === id);
  };

  const updateCellRequests = currentRows.flatMap((currentRow, index) => {
    const rowIndex = index + 1;
    const id = getId(currentRow);
    const nextRow = getRowById(data, id);

    if (!nextRow) {
      return [];
    }

    return headerValues.flatMap((key, columnIndex) => {
      const currentValue = get(currentRow, key);
      const nextValue: unknown = get(nextRow, key);

      if (equalCellValue(currentValue, nextValue)) {
        return [];
      } else {
        return createUpdateCellRequests(
          sheetId,
          rowIndex,
          columnIndex,
          nextValue
        );
      }
    });
  });

  const currentIds = currentRows.map(getId);
  const newRows = data.filter((next) => {
    const id = getId(next);
    return !currentIds.includes(id);
  });
  const appendRowsRequests = createAppendRowsRequests(
    sheetId,
    headerValues,
    newRows
  );

  return [...updateCellRequests, ...appendRowsRequests];
}
