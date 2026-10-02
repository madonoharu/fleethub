/** @jest-environment node */

import { KcnavClient } from "./kcnav";

const graph = { route: {}, spots: {} };
const enemycomps = { entries: [] };

beforeEach(() => {
  jest.replaceProperty(process, "env", {
    NODE_ENV: "test",
    KCS_SCRIPT: "",
    SITE_VERSION: "test",
    CORE_VERSION: "test",
    MASTER_DATA_PATH: "data/master_data.json",
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Kcnav requests with real Ky", () => {
  it("joins the maps prefix and parses map keys returned by the all endpoint", async () => {
    const fetch = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () =>
        Response.json({ result: ["1-1", "74-3"] }),
      );

    await expect(new KcnavClient(null).all()).resolves.toEqual([11, 743]);
    const request = fetch.mock.calls[0][0] as Request;
    expect(request.url).toBe("https://tsunkit.net/api/routing/maps/all");
    expect(request.method).toBe("GET");
  });

  it.each([
    ["getGraph", "74-3", graph],
    ["getLbasdistance", "74-3/lbasdistance", { A: [] }],
  ] as const)(
    "%s requests the map-specific endpoint and unwraps the result",
    async (method, suffix, result) => {
      const fetch = jest
        .spyOn(globalThis, "fetch")
        .mockImplementation(async () => Response.json({ result }));

      await expect(new KcnavClient(null)[method](743)).resolves.toEqual(result);
      const request = fetch.mock.calls[0][0] as Request;
      expect(request.url).toBe(
        `https://tsunkit.net/api/routing/maps/${suffix}`,
      );
    },
  );

  it("requires a token for enemy compositions before making a request", () => {
    const fetch = jest
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Unexpected network request"));

    expect(() => new KcnavClient(null).getEnemycomps(743)).toThrow(
      "Token not found",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the bearer token and invalidates cached active-event compositions", async () => {
    process.env.KCNAV_TOKEN = "test-token";
    const cache = new Map<unknown, unknown>([
      ["74-3/nodes/all/enemycomps", { entries: [{ stale: true }] }],
    ]);
    const fetch = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => Response.json({ result: enemycomps }));
    const client = new KcnavClient(74, cache);

    await expect(client.getEnemycomps(743)).resolves.toEqual(enemycomps);
    await expect(client.getEnemycomps(743)).resolves.toEqual(enemycomps);
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [input] of fetch.mock.calls) {
      const request = input as Request;
      expect(request.url).toBe(
        "https://tsunkit.net/api/routing/maps/74-3/nodes/all/enemycomps",
      );
      expect(request.headers.get("Authorization")).toBe("Bearer test-token");
    }
  });

  it("reuses historical graph results without a second network request", async () => {
    const fetch = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => Response.json({ result: graph }));
    jest.spyOn(console, "log").mockImplementation(() => {});
    const client = new KcnavClient(null, new Map());

    await expect(client.getGraph(11)).resolves.toEqual(graph);
    await expect(client.getGraph(11)).resolves.toEqual(graph);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
