import { sheets_v4 } from "googleapis";
import got from "got";
import { Start2 } from "kc-tools";
import get from "lodash/get";

export function fetchStart2(): Promise<Start2> {
  return got
    .get(
      "https://raw.githubusercontent.com/Tibowl/api_start2/master/start2.json"
    )
    .json();
}

export function deleteFalsyValues(obj: object): void {
  Object.entries(obj).forEach(([key, value]) => {
    if (!value) {
      delete (obj as Record<string, unknown>)[key];
    }
  });
}

export function columnToLetter(column: number): string {
  let temp;
  let letter = "";
  let col = column;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}

function toCellValue(value: unknown): sheets_v4.Schema$ExtendedValue {
  switch (value) {
    case null:
    case undefined:
    case "":
      return { stringValue: "" };
    case "TRUE":
      return { boolValue: true };
    case "FALSE":
      return { boolValue: false };
  }

  const num = Number(value);
  if (!Number.isNaN(num)) {
    return { numberValue: num };
  }

  switch (typeof value) {
    case "object":
      return { stringValue: JSON.stringify(value) };
    case "boolean":
      return { boolValue: value };
    case "number":
      return { numberValue: value };
    default:
      return { stringValue: String(value) };
  }
}

function toCellString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  switch (typeof value) {
    case "object":
      return JSON.stringify(value);
    case "boolean":
      return value === true ? "TRUE" : "FALSE";
  }

  return String(value);
}

function equalCellValue(v1: unknown, v2: unknown): boolean {
  const s1 = toCellString(v1);
  const s2 = toCellString(v2);
  return s1 === s2 || (s1 || "FALSE") === (s2 || "FALSE");
}

type Requests = NonNullable<
  sheets_v4.Schema$BatchUpdateSpreadsheetRequest["requests"]
>;

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
      const value = get(row, key);

      return {
        userEnteredValue: toCellValue(value),
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
                userEnteredValue: toCellValue(value),
              },
            ],
          },
        ],
      },
    },
  ];
}

export function createUpdateRowsRequests(
  sheetId: number,
  headerValues: string[],
  currentRows: object[],
  nextRows: object[]
): Requests {
  const idAttribute = headerValues[0];

  const getId = (row: object) => Number(get(row, idAttribute));

  const getRowById = (rows: object[], id: number) => {
    return rows.find((row) => getId(row) === id);
  };

  const updateCellRequests = currentRows.flatMap((currentRow, index) => {
    const rowIndex = index + 1;
    const id = getId(currentRow);
    const nextRow = getRowById(nextRows, id);

    if (!nextRow) {
      return [];
    }

    return headerValues.flatMap((key, columnIndex) => {
      const currentValue = get(currentRow, key);
      const nextValue = get(nextRow, key);

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
  const newRows: object[] = nextRows.filter((next) => {
    const id = getId(next);
    return !currentIds.includes(id);
  });
  const apendRowsRequests = createAppendRowsRequests(
    sheetId,
    headerValues,
    newRows
  );

  return [...updateCellRequests, ...apendRowsRequests];
}
