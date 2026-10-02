import { describe, expect, it } from "bun:test";
import type { MasterBattleDefinitions } from "fleethub-core";
import type { Start2 } from "kc-tools";

import type { SpreadsheetTable } from "./SpreadsheetTable";
import { createBattleDefinitions } from "./createBattleDefinitions";
import { NationalityMap } from "./nationality";
import { ExprParser } from "./parser";
import { createShipData } from "./ship";

const emptyTable: SpreadsheetTable = { sheetId: 7, headerValues: [], rows: [] };
const start2 = {
  api_mst_ship: [],
  api_mst_slotitem: [],
  api_mst_stype: [],
  api_mst_slotitem_equiptype: [],
} as unknown as Start2;
const parser = new ExprParser(start2, [], new NationalityMap(emptyTable));

function definitions(
  tables: Partial<Record<keyof MasterBattleDefinitions, SpreadsheetTable>>,
) {
  return createBattleDefinitions(parser, {
    anti_air_cutin: emptyTable,
    day_cutin: emptyTable,
    night_cutin: emptyTable,
    formation: emptyTable,
    historical_bonuses: emptyTable,
    ...tables,
  });
}

describe("spreadsheet master definitions", () => {
  it("decodes all cut-in tables while retaining zero/false and nullable cells", () => {
    const result = definitions({
      anti_air_cutin: {
        sheetId: 7,
        headerValues: [
          "id",
          "type_factor",
          "multiplier",
          "guaranteed",
          "sequential",
        ],
        rows: [{ id: 1, type_factor: 0, multiplier: 1.5, sequential: false }],
      },
      day_cutin: {
        sheetId: 8,
        headerValues: [
          "tag",
          "hits",
          "type_factor",
          "power_mod",
          "accuracy_mod",
        ],
        rows: [
          { tag: "DoubleAttack", hits: 2, type_factor: 0, power_mod: 1.2 },
        ],
      },
      night_cutin: {
        sheetId: 9,
        headerValues: [
          "tag",
          "hits",
          "type_factor",
          "power_mod",
          "accuracy_mod",
        ],
        rows: [{ tag: "MainMainMain", hits: 3, accuracy_mod: 0 }],
      },
    });

    expect(result.anti_air_cutin).toEqual([
      {
        id: 1,
        type_factor: 0,
        multiplier: 1.5,
        guaranteed: null,
        sequential: false,
      },
    ]);
    expect(result.day_cutin).toEqual([
      {
        tag: "DoubleAttack",
        hits: 2,
        type_factor: 0,
        power_mod: 1.2,
        accuracy_mod: null,
      },
    ]);
    expect(result.night_cutin).toEqual([
      {
        tag: "MainMainMain",
        hits: 3,
        type_factor: null,
        power_mod: null,
        accuracy_mod: 0,
      },
    ]);
  });

  it("groups both fleet halves while decoding nested combat modifiers", () => {
    const rowModifiers = {
      fleet_anti_air_mod: 1,
      "asw.power_mod": 1,
      "night.power_mod": 1,
      "support_shelling.power_mod": 1,
    };
    const formation: SpreadsheetTable = {
      sheetId: 7,
      headerValues: [
        "tag",
        "protection_rate",
        "fleet_anti_air_mod",
        "shelling.power_mod",
        "torpedo.power_mod",
        "asw.power_mod",
        "night.power_mod",
        "support_shelling.power_mod",
      ],
      rows: [
        {
          ...rowModifiers,
          tag: "Cruising4.top_half",
          "shelling.power_mod": 1.2,
          "torpedo.power_mod": 1,
        },
        {
          ...rowModifiers,
          tag: "Cruising4.bottom_half",
          "shelling.power_mod": 0.8,
          "torpedo.power_mod": 0,
        },
      ],
    };
    const before = structuredClone(formation);
    const modifiers = {
      protection_rate: null,
      fleet_anti_air_mod: 1,
      asw: { power_mod: 1 },
      night: { power_mod: 1 },
      support_shelling: { power_mod: 1 },
    };

    expect(definitions({ formation }).formation).toEqual([
      {
        top_half: {
          ...modifiers,
          tag: "Cruising4",
          shelling: { power_mod: 1.2 },
          torpedo: { power_mod: 1 },
        },
        bottom_half: {
          ...modifiers,
          tag: "Cruising4",
          shelling: { power_mod: 0.8 },
          torpedo: { power_mod: 0 },
        },
      },
    ]);
    expect(formation).toEqual(before);
  });

  it("parses historical expressions and excludes records without a map", () => {
    expect(
      definitions({
        historical_bonuses: {
          sheetId: 7,
          headerValues: ["map", "ship", "enemy", "power_mod.a", "debuff"],
          rows: [
            {
              map: 51,
              ship: "ship_id == 1\n&& ctype == 2",
              enemy: "stype == 11",
              "power_mod.a": 1.2,
              debuff: false,
            },
            { ship: "ship_id == 1", "power_mod.a": 9 },
          ],
        },
      }).historical_bonuses,
    ).toEqual([
      {
        map: 51,
        ship: "ship_id == 1 && ctype == 2",
        enemy: "stype == 11",
        power_mod: { a: 1.2 },
      },
    ]);
  });

  it("applies ship array paths and zeroes while ignoring empty/false overrides", () => {
    const shipParser = new ExprParser(
      {
        ...start2,
        api_mst_ship: [
          {
            api_id: 1500,
            api_name: "Enemy",
            api_yomi: "enemy",
            api_sort_id: 1,
            api_stype: 2,
            api_ctype: 0,
            api_slot_num: 1,
            api_soku: 10,
          },
        ],
      } as unknown as Start2,
      [],
      new NationalityMap(emptyTable),
    );
    const ships: SpreadsheetTable = {
      sheetId: 7,
      headerValues: [
        "ship_id",
        "stock[0].gear_id",
        "max_hp[0]",
        "armor[0]",
        "speed",
        "name",
        "sort_id",
      ],
      rows: [
        {
          ship_id: 1500,
          "stock[0].gear_id": 111,
          "max_hp[0]": 55,
          "armor[0]": 0,
          speed: 0,
          name: "",
          sort_id: false,
        },
      ],
    };
    const before = structuredClone(ships);
    const result = createShipData(shipParser, {
      ships,
      ship_attrs: emptyTable,
      nationalities: emptyTable,
    });

    expect(result.ships[0]).toMatchObject({
      ship_id: 1500,
      name: "Enemy",
      sort_id: 1,
      speed: 0,
      stock: [{ gear_id: 111 }],
      max_hp: [55, null],
      armor: [0, null],
    });
    expect(ships).toEqual(before);
  });
});
