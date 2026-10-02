import { describe, expect, it } from "bun:test";
import type { Start2 } from "kc-tools";

import type { SpreadsheetTable } from "./SpreadsheetTable";
import { NationalityMap } from "./nationality";
import { ExprParser } from "./parser";
import { createShipData } from "./ship";

const emptyTable: SpreadsheetTable = { sheetId: 7, headerValues: [], rows: [] };

function createShips(remodels: [shipId: number, nextShipId?: number][]) {
  const start2 = {
    api_mst_ship: remodels.map(([id, nextId]) => ({
      api_id: id,
      api_name: `Ship ${id}`,
      api_yomi: "",
      api_sort_id: id,
      api_stype: 2,
      api_ctype: 0,
      api_slot_num: 0,
      api_soku: 10,
      api_taik: [10, 10],
      api_houg: [0, 0],
      api_raig: [0, 0],
      api_tyku: [0, 0],
      api_souk: [0, 0],
      api_luck: [0, 0],
      api_leng: 1,
      api_fuel_max: 10,
      api_bull_max: 10,
      api_aftershipid: String(nextId ?? 0),
      api_afterlv: nextId ? 20 : 0,
    })),
  } as unknown as Start2;
  const before = structuredClone(start2);
  const parser = new ExprParser(start2, [], new NationalityMap(emptyTable));
  const result = createShipData(parser, {
    ships: emptyTable,
    ship_attrs: emptyTable,
    nationalities: emptyTable,
  });

  expect(start2).toEqual(before);
  return result.ships;
}

describe("ship remodel classification", () => {
  it("keeps terminal, zero-target and unresolved remodel chains irreversible", () => {
    const ships = createShips([[1, 2], [2, 3], [3], [4, 999], [5, 0]]);

    expect(ships.map((ship) => ship.useful)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(ships.map((ship) => ship.next_id)).toEqual([2, 3, undefined, 999, undefined]);
  });

  it("marks only cycle members, preserving input order across separate cycles", () => {
    const ships = createShips([
      [2, 3],
      [9, 9],
      [3, 4],
      [1, 2],
      [4, 3],
    ]);

    expect(ships.filter((ship) => ship.useful).map((ship) => ship.ship_id)).toEqual([9, 3, 4]);
    expect(ships.map((ship) => ship.ship_id)).toEqual([2, 9, 3, 1, 4]);
  });

  it("does not mark a prefix entering an already classified cycle", () => {
    const ships = createShips([
      [3, 4],
      [4, 3],
      [2, 3],
      [1, 2],
    ]);

    expect(ships.map((ship) => ship.useful)).toEqual([true, true, undefined, undefined]);
  });

  it("resolves duplicate master IDs to the first row without merging object identities", () => {
    const ships = createShips([
      [1, 2],
      [2, 1],
      [2, 0],
      [3, 2],
    ]);

    expect(ships.map((ship) => ship.useful)).toEqual([true, true, undefined, undefined]);
    expect(ships.map((ship) => ship.ship_id)).toEqual([1, 2, 2, 3]);
  });
});
