import { describe, expect, it } from "bun:test";
import type { MasterData } from "fleethub-core";

import fixture from "../../../../tests/e2e/fixtures/master-data.json";
import type { MasterDataOverrides } from "../store/configSlice";

import { mergeMasterData } from "./mergeMasterData";

function masterData(): MasterData {
  // JSON inference widens tuple arrays; browser tests also construct the real
  // Wasm core from this same public fixture.
  const data: unknown = structuredClone(fixture);
  return data as MasterData;
}

describe("master-data overrides", () => {
  it("merges partial arrays by index, retaining defaults for null and undefined", () => {
    const source = masterData();
    source.ships[0].firepower = [10, 50];
    source.ships[0].slots = [20, 30, 40, 5];
    source.ships[0].range = 2;
    const overrides: MasterDataOverrides = {
      ships: {
        [source.ships[0].ship_id]: {
          firepower: [null, 70],
          slots: [0, null],
          range: undefined,
        },
      },
    };
    const originalSource = structuredClone(source);
    const originalOverrides = structuredClone(overrides);

    const result = mergeMasterData(source, overrides);

    expect(result.ships[0]).toMatchObject({
      firepower: [10, 70],
      slots: [0, 30, 40, 5],
      range: 2,
    });
    expect(result.ships[1]).toBe(source.ships[1]);
    expect(source).toEqual(originalSource);
    expect(overrides).toEqual(originalOverrides);
  });

  it("applies every cutin group, including zero and false, without null erasing defaults", () => {
    const source = masterData();
    const day = source.day_cutin[0];
    const night = source.night_cutin[0];
    const antiAir = source.anti_air_cutin[0];
    const result = mergeMasterData(source, {
      day_cutin: { [day.tag]: { hits: 0, power_mod: null } },
      night_cutin: { [night.tag]: { accuracy_mod: 0, type_factor: null } },
      anti_air_cutin: {
        [antiAir.id]: { sequential: false, guaranteed: 0, multiplier: null },
      },
    });

    expect(result.day_cutin[0]).toMatchObject({
      hits: 0,
      power_mod: day.power_mod,
    });
    expect(result.night_cutin[0]).toMatchObject({
      accuracy_mod: 0,
      type_factor: night.type_factor,
    });
    expect(result.anti_air_cutin[0]).toMatchObject({
      sequential: false,
      guaranteed: 0,
      multiplier: antiAir.multiplier,
    });
  });

  it("retains empty strings from persisted overrides and ignores nonexistent IDs", () => {
    const source = masterData();
    const day = source.day_cutin[0];
    // Persisted configuration is JSON, so legacy values can be outside the
    // current TypeScript union. Preserve the existing merge behavior at load.
    const overrides = JSON.parse(
      JSON.stringify({
        day_cutin: { [day.tag]: { tag: "" } },
        ships: { 999999: { range: 0 } },
      }),
    ) as MasterDataOverrides;
    const result = mergeMasterData(source, overrides);

    expect<string>(result.day_cutin[0].tag).toBe("");
    expect(source.day_cutin[0].tag).toBe(day.tag);
    expect(result.ships).toBe(source.ships);
  });

  it("returns the original data when no override changes it", () => {
    const source = masterData();
    expect(mergeMasterData(source, {})).toBe(source);
  });
});
