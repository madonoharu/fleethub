import { describe, expect, it } from "bun:test";
import type { MasterData } from "fleethub-core";

import fixture from "../../../../tests/e2e/fixtures/master-data.json";
import { parseImportText } from "./parseUrl";

const masterData = fixture as unknown as MasterData;
const deck = { version: 4, hqlv: 100, f1: { s1: { id: 277, lv: 99 } } };

describe("import text", () => {
  it("accepts pasted JSON surrounded by spaces, line breaks and a BOM", async () => {
    const imported = await parseImportText(masterData, `\uFEFF \n${JSON.stringify(deck)}\n `);
    expect(Object.values(imported.entities.ships)).toContainEqual(
      expect.objectContaining({ ship_id: 277, level: 99 }),
    );
    expect(Object.values(imported.entities.orgs)).toContainEqual(
      expect.objectContaining({ hq_level: 100 }),
    );
  });

  it("continues accepting URLs surrounded by whitespace", async () => {
    const url = new URL("https://example.test/deckbuilder.html");
    url.searchParams.set("predeck", JSON.stringify(deck));
    const imported = await parseImportText(masterData, ` ${url.href} `);
    expect(Object.values(imported.entities.ships)).toHaveLength(1);
  });

  it("rejects malformed data and can parse the following valid input", async () => {
    const rejected = await parseImportText(masterData, " {bad JSON").catch(
      (error: unknown) => error,
    );
    expect(rejected).toBeInstanceOf(SyntaxError);
    expect(await parseImportText(masterData, JSON.stringify(deck))).toHaveProperty("result");
  });
});
