import { describe, expect, it } from "bun:test";

import type { SpreadsheetTable } from "./SpreadsheetTable";
import { createUpdateRowsRequests } from "./utils";

describe("master data spreadsheet updates", () => {
  it("compares literal sheet headers with nested master-data paths", () => {
    const table: SpreadsheetTable = {
      sheetId: 7,
      headerValues: [
        "ship_id",
        "max_hp[0]",
        "special.modifier",
        "enabled",
        "historical_aircraft_group",
      ],
      rows: [
        {
          ship_id: 1,
          "max_hp[0]": 0,
          "special.modifier": 1,
          enabled: false,
          historical_aircraft_group: 7,
        },
      ],
    };
    const data = [
      {
        ship_id: 1,
        max_hp: [0, 9],
        special: { modifier: 2 },
        enabled: false,
        historical_aircraft_group: 8,
      },
    ];
    const before = structuredClone({ table, data });

    expect(createUpdateRowsRequests(table, data)).toEqual([
      {
        updateCells: {
          start: { sheetId: 7, rowIndex: 1, columnIndex: 2 },
          fields: "userEnteredValue",
          rows: [{ values: [{ userEnteredValue: { numberValue: 2 } }] }],
        },
      },
    ]);
    expect({ table, data }).toEqual(before);
  });

  it("appends array paths, literal dotted keys, and false-valued cells", () => {
    const table: SpreadsheetTable = {
      sheetId: 7,
      headerValues: ["ship_id", "stock[0].gear_id", "max_hp[1]", "meta.label", "enabled"],
      rows: [],
    };
    const data = [
      {
        ship_id: 2,
        stock: [{ gear_id: 111 }],
        max_hp: [55, null],
        "meta.label": "Literal",
        meta: { label: "Nested" },
        enabled: false,
      },
    ];

    expect(createUpdateRowsRequests(table, data)).toEqual([
      {
        appendCells: {
          sheetId: 7,
          fields: "userEnteredValue",
          rows: [
            {
              values: [
                { userEnteredValue: { numberValue: 2 } },
                { userEnteredValue: { numberValue: 111 } },
                { userEnteredValue: { stringValue: "" } },
                { userEnteredValue: { stringValue: "Literal" } },
                { userEnteredValue: { boolValue: false } },
              ],
            },
          ],
        },
      },
      {
        sortRange: {
          range: { sheetId: 7, startRowIndex: 1 },
          sortSpecs: [{ sortOrder: "ASCENDING", dimensionIndex: 0 }],
        },
      },
    ]);
  });

  it("clears a sheet cell when the nested master-data value becomes missing", () => {
    const table: SpreadsheetTable = {
      sheetId: 7,
      headerValues: ["ship_id", "stats.armor"],
      rows: [{ ship_id: 1, "stats.armor": 3 }],
    };

    expect(createUpdateRowsRequests(table, [{ ship_id: 1, stats: {} }])).toEqual([
      {
        updateCells: {
          start: { sheetId: 7, rowIndex: 1, columnIndex: 1 },
          fields: "userEnteredValue",
          rows: [{ values: [{ userEnteredValue: { stringValue: "" } }] }],
        },
      },
    ]);
  });
});
