import { describe, expect, it } from "bun:test";
import type { Start2 } from "kc-tools";

import { NationalityMap } from "./nationality";
import { ExprParser } from "./parser";

function createParser() {
  const start2 = {
    api_mst_slotitem: [
      { api_id: 24, api_name: "彗星" },
      { api_id: 99, api_name: "彗星(江草隊)" },
      { api_id: 124, api_name: "彗星" },
      { api_id: 999, api_name: "赤城改" },
    ],
    api_mst_slotitem_equiptype: [{ api_id: 7, api_name: "艦上爆撃機" }],
    api_mst_ship: [{ api_id: 277, api_name: "赤城改" }],
    api_mst_stype: [{ api_id: 11, api_name: "正規空母" }],
  } as unknown as Start2;
  const classes: string[] = [];
  classes[5] = "赤城型";
  const nationalities = new NationalityMap({
    sheetId: 7,
    headerValues: ["id", "name", "ctypes"],
    rows: [{ id: 1, name: "日本", ctypes: "5" }],
  });

  return new ExprParser(start2, classes, nationalities);
}

describe("spreadsheet expressions", () => {
  it("resolves quoted equipment in comparisons and supported functions using the first matching ID", () => {
    const parser = createParser();

    expect(
      parser.parseGear(
        'gear_id == "彗星"\n&& gear_id != "彗星(江草隊)" && gear_id_in("彗星", "彗星(江草隊)") && has("彗星") && has_any("彗星", "彗星(江草隊)") && count("彗星") && gear_type == "艦上爆撃機"',
      ),
    ).toBe(
      "gear_id == 24 && gear_id != 99 && gear_id_in(24, 99) && has(24) && has_any(24, 99) && count(24) && gear_type == 7",
    );
  });

  it("leaves equipment names outside recognized gear expressions unresolved", () => {
    const parser = createParser();

    expect(parser.parseGearName('note == "彗星" && has("彗星")')).toBe('note == "彗星" && has(24)');
    expect(() => parser.parseGear('note == "彗星"')).toThrow('Syntax error: note == "彗星"');
  });

  it("resolves ship name, type, class and nationality while retaining surrounding whitespace", () => {
    expect(
      createParser().parseShip(
        ' ship_id == "赤城改"\n\t&& stype == "正規空母" && ctype == "赤城型" && nationality == "日本" ',
      ),
    ).toBe(" ship_id == 277 && stype == 11 && ctype == 5 && nationality == 1 ");
  });

  it("combines historical equipment, ship and aircraft-group references in resolution order", () => {
    expect(
      createParser().parseHistoricalBonusesShip(
        'has("彗星") && ship_id == "赤城改" && stype == "正規空母" && ctype == "赤城型" && nationality == "日本"\n&& historical_aircraft_group == "A1"',
      ),
    ).toBe(
      "has(24) && ship_id == 277 && stype == 11 && ctype == 5 && nationality == 1 && historical_aircraft_group == 161",
    );
  });

  it("reports unresolved names with normalized expression text for every entrypoint", () => {
    const parser = createParser();

    for (const parse of [
      (str: string) => parser.parseGear(str),
      (str: string) => parser.parseShip(str),
      (str: string) => parser.parseHistoricalBonusesShip(str),
    ]) {
      expect(() => parse('id == "Unknown"\n\t&& true')).toThrow(
        'Syntax error: id == "Unknown" && true',
      );
      expect(parse("")).toBe("");
    }
  });
});
