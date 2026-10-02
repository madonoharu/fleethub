import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { brotliDecompressSync } from "node:zlib";
import type { SaveOptions } from "@google-cloud/storage";
import type { App } from "firebase-admin/app";
import type { MasterData, MasterShip } from "fleethub-core";

import enemyShip from "../../../tests/e2e/fixtures/enemy-1501.json";
import masterData from "../../../tests/e2e/fixtures/master-data.json";
import type { KcnavEnemyShip } from "./kcnav";

const defaultApp = { name: "[DEFAULT]" } as App;
const firebaseApp = {
  cert: mock<typeof import("firebase-admin/app").cert>(),
  getApp: mock<typeof import("firebase-admin/app").getApp>(),
  getApps: mock<() => App[]>(),
  initializeApp: mock<typeof import("firebase-admin/app").initializeApp>(),
};
const firebaseStorage = {
  getStorage: mock<typeof import("firebase-admin/storage").getStorage>(),
};
const got = {
  get: mock<(url: string) => { json: () => Promise<unknown> }>(),
};
const sheets = {
  read: mock<() => Promise<unknown>>(),
  write: mock<(request: unknown) => Promise<unknown>>(),
};
await mock.module("firebase-admin/app", () => firebaseApp);
await mock.module("firebase-admin/storage", () => firebaseStorage);
await mock.module("got", () => ({ default: got }));
await mock.module("googleapis", () => ({
  google: {
    auth: { GoogleAuth: class {} },
    sheets: () => ({
      spreadsheets: {
        values: { batchGetByDataFilter: sheets.read },
        batchUpdate: sheets.write,
      },
    }),
  },
}));

const testEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  KCS_SCRIPT: "",
  SITE_VERSION: "test",
  CORE_VERSION: "test",
  MASTER_DATA_PATH: "data/master_data.json",
  KCNAV_TOKEN: "test-token",
  SERVICE_ACCOUNT_CLIENT_EMAIL: "test@example.invalid",
  SERVICE_ACCOUNT_PRIVATE_KEY: "test-key",
};
const uploads: { path: string; data: string | Buffer; options: SaveOptions }[] =
  [];
let originalEnvironment: NodeJS.ProcessEnv;
let operations: typeof import("./map");

beforeAll(async () => {
  const environment = process.env;
  process.env = { ...testEnvironment };
  try {
    operations = await import("./map");
  } finally {
    process.env = environment;
  }
});

beforeEach(() => {
  originalEnvironment = process.env;
  process.env = { ...testEnvironment };
  for (const method of Object.values(firebaseApp)) method.mockReset();
  firebaseApp.getApps.mockReturnValue([defaultApp]);
  firebaseApp.getApp.mockReturnValue(defaultApp);
  firebaseStorage.getStorage.mockReset();
  got.get.mockReset();
  sheets.read.mockReset();
  sheets.write.mockReset().mockResolvedValue({ data: {} });
  uploads.length = 0;
  spyOn(console, "log").mockImplementation(() => {});
  spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  process.env = originalEnvironment;
  mock.restore();
});

function createMasterData(): MasterData {
  return {
    ...(structuredClone(masterData) as unknown as MasterData),
    ships: [
      {
        ...(structuredClone(enemyShip) as unknown as MasterShip),
        stock: [
          { gear_id: 24, stars: 3 },
          { gear_id: 25, stars: 4 },
        ],
      },
    ],
  };
}

function createEnemyShip(
  overrides: Partial<KcnavEnemyShip> = {},
): KcnavEnemyShip {
  return {
    id: 1501,
    name: "駆逐イ級",
    name_en: "Destroyer I-Class",
    lvl: 1,
    hp: 20,
    fp: 5,
    torp: 15,
    aa: 6,
    armor: 5,
    equips: [24, 25, 0, 0, 0],
    ...overrides,
  };
}

function prepareUpstream(current: MasterData, ships: KcnavEnemyShip[]) {
  const map = { id: 11, nodes: [], links: [] };
  const graph = { route: {}, spots: {} };
  const enemycomps = {
    entries: [
      {
        map: "1-1",
        node: "A",
        mainFleet: ships,
        escortFleet: [],
        formation: 1,
        count: 1,
        airpower: [0, 0, 0, 0],
        lbasAirpower: [0, 0, 0, 0],
      },
    ],
  };
  const fetchResponse = Object.assign(
    async (input: Parameters<typeof fetch>[0]) => {
      const url = input instanceof Request ? input.url : String(input);
      const results: Record<string, unknown> = {
        "https://tsunkit.net/api/routing/maps/all": ["1-1"],
        "https://tsunkit.net/api/routing/maps/1-1": graph,
        "https://tsunkit.net/api/routing/maps/1-1/lbasdistance": {},
        "https://tsunkit.net/api/routing/maps/1-1/nodes/all/enemycomps":
          enemycomps,
      };
      if (!(url in results)) throw new Error(`Unexpected fetch: ${url}`);
      return Response.json({ result: results[url] });
    },
    { preconnect: mock<typeof fetch.preconnect>() },
  );
  spyOn(globalThis, "fetch").mockImplementation(fetchResponse);
  got.get.mockImplementation((input) => {
    const url = String(input);
    const result =
      url === "https://storage.googleapis.com/kcfleethub/data/master_data.json"
        ? current
        : url === "https://storage.googleapis.com/kcfleethub/data/maps/11.json"
          ? map
          : undefined;
    if (!result) throw new Error(`Unexpected GET: ${url}`);
    return { json: async () => result };
  });
  firebaseStorage.getStorage.mockReturnValue({
    bucket: () => ({
      file: (path: string) => ({
        exists: async () => [true],
        save: async (data: string | Buffer, options: SaveOptions) => {
          uploads.push({ path, data, options });
        },
      }),
    }),
  } as unknown as ReturnType<typeof firebaseStorage.getStorage>);
  sheets.read.mockResolvedValue({
    data: {
      valueRanges: [
        {
          dataFilters: [{ gridRange: { sheetId: 2088927150 } }],
          valueRange: {
            values: [
              [
                "ship_id",
                "max_hp[0]",
                "firepower[0]",
                "stock[0].gear_id",
                "stock[1].gear_id",
              ],
              ...current.ships.map((ship) => [
                ship.ship_id,
                ship.max_hp[0],
                ship.firepower[0],
                ship.stock[0]?.gear_id,
                ship.stock[1]?.gear_id,
              ]),
            ],
          },
        },
      ],
    },
  });
}

function uploadedMasterData(): MasterData {
  expect(uploads.map((upload) => upload.path)).toEqual([
    "data/master_data.json",
  ]);
  const upload = uploads[0]!;
  expect(upload.data).toBeInstanceOf(Buffer);
  expect(upload.options).toEqual({
    contentType: "application/json",
    public: true,
    gzip: false,
    metadata: {
      cacheControl: "public, immutable, max-age=365000000",
      contentEncoding: "br",
    },
  });
  return JSON.parse(
    brotliDecompressSync(upload.data as Buffer).toString(),
  ) as MasterData;
}

describe("Kcnav master-data synchronization", () => {
  it("uploads changed stats while preserving the read baseline and falling back to zero for missing stats", async () => {
    const current = createMasterData();
    const before = structuredClone(current);
    prepareUpstream(current, [
      createEnemyShip({ hp: 21, fp: 10, armor: undefined, aa: undefined }),
    ]);

    await operations.updateByKcnav(1);

    expect(uploadedMasterData().ships[0]).toMatchObject({
      max_hp: [21, 21],
      firepower: [10, 10],
      armor: [0, 0],
      anti_air: [0, 0],
      stock: before.ships[0].stock,
    });
    expect(current).toEqual(before);
    expect(sheets.write).toHaveBeenCalledTimes(1);
  });

  it("skips unchanged uploads and retains existing equipment metadata", async () => {
    const current = createMasterData();
    const before = structuredClone(current);
    prepareUpstream(current, [createEnemyShip()]);

    await operations.updateByKcnav(1);

    expect(uploads).toEqual([]);
    expect(sheets.write).not.toHaveBeenCalled();
    expect(current).toEqual(before);
  });

  it.each([
    [[0, 0, 0, 0, 0], []],
    [[24, 0, -1, 0, 0], [{ gear_id: 24 }]],
  ] as const)(
    "uploads authoritative equipment removal (%j)",
    async (equips, stock) => {
      const current = createMasterData();
      const before = structuredClone(current);
      prepareUpstream(current, [createEnemyShip({ equips: [...equips] })]);

      await operations.updateByKcnav(1);

      expect(uploadedMasterData().ships[0].stock).toEqual([...stock]);
      expect(current).toEqual(before);
      expect(sheets.write).toHaveBeenCalledTimes(1);
    },
  );

  it("keeps existing stats and equipment when the source has no hit points", async () => {
    const current = createMasterData();
    const before = structuredClone(current);
    prepareUpstream(current, [
      createEnemyShip({ hp: undefined, equips: [0, 0, 0, 0, 0] }),
    ]);

    await operations.updateByKcnav(1);

    expect(uploads).toEqual([]);
    expect(sheets.write).not.toHaveBeenCalled();
    expect(current).toEqual(before);
    expect(console.warn).toHaveBeenCalledWith(
      "[id:1501 駆逐イ級]",
      "hp is None",
    );
  });

  it("uses the last duplicate enemy record and retains authoritative equipment order", async () => {
    const current = createMasterData();
    const before = structuredClone(current);
    prepareUpstream(current, [
      createEnemyShip({ fp: 10 }),
      createEnemyShip({ fp: 12, equips: [25, 24, 0, 0, 0] }),
      createEnemyShip({ id: 9999, hp: 50 }),
    ]);

    await operations.updateByKcnav(1);

    const next = uploadedMasterData();
    expect(next.ships).toHaveLength(1);
    expect(next.ships[0]).toMatchObject({
      ship_id: 1501,
      firepower: [12, 12],
      stock: [{ gear_id: 25 }, { gear_id: 24 }],
    });
    expect(current).toEqual(before);
  });
});
