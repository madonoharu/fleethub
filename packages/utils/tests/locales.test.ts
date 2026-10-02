import { describe, expect, it } from "bun:test";

import { mergeLocaleMessages } from "../src/locales";

describe("downloaded locale messages", () => {
  it.each(["", " ", null])(
    "keeps a translated cut-in name when the download contains %p",
    (downloaded) => {
      expect(
        mergeLocaleMessages(
          { DayCutin: { DoubleAttack: "連撃" } },
          { DayCutin: { DoubleAttack: downloaded } },
        ),
      ).toEqual({ DayCutin: { DoubleAttack: "連撃" } });
    },
  );

  it("keeps new untranslated keys when no existing message is available", () => {
    expect(
      mergeLocaleMessages({}, { DayCutin: { DoubleAttack: "", FBA: null } }),
    ).toEqual({ DayCutin: { DoubleAttack: "", FBA: null } });
  });

  it("accepts new translations and preserves the exact single-space rule", () => {
    expect(
      mergeLocaleMessages(
        { DayCutin: { DoubleAttack: "Old", FBA: "Old" } },
        { DayCutin: { DoubleAttack: "New", FBA: "  " } },
      ),
    ).toEqual({ DayCutin: { DoubleAttack: "New", FBA: "  " } });
  });

  it("ignores undefined downloaded messages without losing existing values", () => {
    expect(
      mergeLocaleMessages(
        { DayCutin: { DoubleAttack: "連撃", FBA: 0, BBA: false } },
        {
          DayCutin: { DoubleAttack: undefined, FBA: undefined, BBA: undefined },
        },
      ),
    ).toEqual({ DayCutin: { DoubleAttack: "連撃", FBA: 0, BBA: false } });
  });

  it("applies fallback only to truthy existing values", () => {
    expect(
      mergeLocaleMessages(
        { zero: 0, flag: false, empty: "" },
        { zero: "", flag: " ", empty: null },
      ),
    ).toEqual({ zero: "", flag: " ", empty: null });
  });

  it("merges nested messages without changing or aliasing either input", () => {
    const current = Object.freeze({
      DayCutin: Object.freeze({ DoubleAttack: "連撃", FBA: "FBA" }),
    });
    const incoming = Object.freeze({
      DayCutin: Object.freeze({ DoubleAttack: "Double attack", Zuiun: "瑞雲" }),
      nodeType: Object.freeze({ Boss: "Boss" }),
    });

    const result = mergeLocaleMessages(current, incoming);
    expect(result).toEqual({
      DayCutin: { DoubleAttack: "Double attack", FBA: "FBA", Zuiun: "瑞雲" },
      nodeType: { Boss: "Boss" },
    });
    (result.DayCutin as Record<string, unknown>).FBA = "Changed";
    (result.nodeType as Record<string, unknown>).Boss = "Changed";
    expect(current.DayCutin).toEqual({ DoubleAttack: "連撃", FBA: "FBA" });
    expect(incoming.nodeType).toEqual({ Boss: "Boss" });
  });

  it("overlays partial translated lists by index and leaves both inputs intact", () => {
    const current = Object.freeze({
      names: Object.freeze(["連撃", "FBA", "BBA"]),
    });
    const incoming = Object.freeze({ names: Object.freeze(["", "New FBA"]) });

    const result = mergeLocaleMessages(current, incoming);
    expect(result).toEqual({ names: ["連撃", "New FBA", "BBA"] });
    (result.names as string[]).push("New");
    expect(current.names).toEqual(["連撃", "FBA", "BBA"]);
    expect(incoming.names).toEqual(["", "New FBA"]);
  });
});
