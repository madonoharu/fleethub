import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import type { DeckBuilder, DeckBuilderShip, generate as Generate } from "gkcoi";
import type { LoS, Ship, Speed, Theme } from "gkcoi/esm/type";

// Exercise both installed package entries, including the real parser and LoS
// calculation. Only rendering, image encoding and network I/O are replaced.
const rendered: { los: LoS; speed: Speed | string | undefined }[] = [];
const canvas = {
  width: 100,
  height: 100,
  toDataURL: () => "data:image/png;base64,test",
} as HTMLCanvasElement;
const renderFleet = async (
  _index: number | string,
  _ships: Ship[],
  los: LoS,
  _airPower: { min: number; max: number },
  speed?: Speed | string,
) => {
  rendered.push({ los, speed });
  return canvas;
};

for (const target of ["esm", "dist"]) {
  const renderers = {
    dark: {
      generateDarkFleetCanvasAsync: renderFleet,
      generateDarkParameterCanvasAsync: renderFleet,
      generateDarkExpeditionStatsCanvasAsync: renderFleet,
      generateDarkAirbaseCanvasAsync: renderFleet,
    },
    light: {
      generateLightFleetCanvasAsync: renderFleet,
      generateLightParameterCanvasAsync: renderFleet,
      generateLightExpeditionStatsCanvasAsync: renderFleet,
      generateLightAirbaseCanvasAsync: renderFleet,
    },
    flat: {
      generateFlatFleetCanvasAsync: renderFleet,
      generateFlatAirbaseCanvasAsync: renderFleet,
    },
    "74eoLC": { generate74eoLargeCardFleetCanvasAsync: renderFleet },
    "74eoMC": { generate74eoMediumCutinFleetCanvasAsync: renderFleet },
    "74eoSB": { generate74eoSmallBannerFleetCanvasAsync: renderFleet },
    official: { generateOfficialFleetCanvasAsync: renderFleet },
    white: { generateWhiteFleetCanvasAsync: renderFleet },
  };
  for (const [file, exports] of Object.entries(renderers)) {
    await mock.module(`gkcoi/${target}/theme/${file}`, () => exports);
  }
  await mock.module(`gkcoi/${target}/canvas`, () => ({
    createCanvas2D: () => ({ canvas, ctx: { drawImage: () => {} } }),
    fetchImage: () => Promise.resolve(canvas),
  }));
  await mock.module(`gkcoi/${target}/iutils`, () => ({ stick: () => canvas }));
}
await mock.module("ts-steganography", () => ({
  default: { encode: () => Promise.resolve("data:image/png;base64,test") },
}));

const generators: Record<string, typeof Generate> = {
  esm: (await import("gkcoi/esm/index")).generate,
  dist: (await import("gkcoi/dist/index")).generate,
};

function ship(id: number, los: number): DeckBuilderShip {
  return {
    id,
    lv: 99,
    items: {},
    hp: 77,
    fp: 55,
    tp: 0,
    aa: 79,
    ar: 79,
    asw: 0,
    ev: 69,
    los,
    luck: 12,
  };
}

const deck: DeckBuilder = {
  theme: "dark",
  lang: "jp",
  hqlv: 120,
  f1: { s1: ship(277, 100) },
  f2: { s1: ship(576, 25) },
};

beforeEach(() => {
  rendered.length = 0;
  spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({
      api_mst_ship: [
        { api_id: 277, api_name: "赤城改", api_soku: 10 },
        { api_id: 576, api_name: "Nelson改", api_soku: 5 },
      ].map((ship) => ({
        ...ship,
        api_yomi: "",
        api_stype: 9,
        api_ctype: 1,
        api_slot_num: 0,
        api_maxeq: [],
        api_leng: 3,
      })),
      api_mst_slotitem: [],
    }),
  );
});

for (const [entry, generate] of Object.entries(generators)) {
  describe(`gkcoi ${entry} fleet statistics`, () => {
    it.each(["dark", "light", "flat", "74lc", "74mc", "74sb"] as const)(
      "calculates each fleet's own values for %s",
      async (theme: Theme) => {
        await generate({ ...deck, theme });

        expect(rendered).toHaveLength(2);
        // With no equipment: sqrt(LoS) - ceil(120 * 0.4) + 2 * (6 - 1).
        expect(Object.values(rendered[0]!.los)).toEqual([-28, -28, -28, -28, -28]);
        expect(Object.values(rendered[1]!.los)).toEqual([-33, -33, -33, -33, -33]);
        if (["dark", "light", "flat"].includes(theme)) {
          expect(rendered.map((fleet) => fleet.speed)).toEqual([10, 5]);
        }
      },
    );

    it("retains caller overrides, including zero speed", async () => {
      const los: LoS = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
      await generate(deck, undefined, los, 0);

      expect(rendered).toEqual([
        { los, speed: 0 },
        { los, speed: 0 },
      ]);
    });
  });
}
