import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { brotliDecompressSync } from "node:zlib";
import type { SaveOptions as GcsSaveOptions } from "@google-cloud/storage";
import type { App } from "firebase-admin/app";

import type { SaveOptions } from "./storage";

const app = {
  cert: mock<typeof import("firebase-admin/app").cert>(),
  getApp: mock<typeof import("firebase-admin/app").getApp>(),
  getApps: mock<() => App[]>(() => []),
  initializeApp: mock<typeof import("firebase-admin/app").initializeApp>(),
};
const storage = {
  getStorage: mock<typeof import("firebase-admin/storage").getStorage>(),
};
const got = { get: mock<typeof import("got").default.get>() };
await mock.module("firebase-admin/app", () => app);
await mock.module("firebase-admin/storage", () => storage);
await mock.module("got", () => ({ default: got }));

function load(apps: App[] = []) {
  app.getApps.mockReturnValue(apps);
  return { app, storage, got, operations };
}

const testEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  KCS_SCRIPT: "",
  SITE_VERSION: "test",
  CORE_VERSION: "test",
  MASTER_DATA_PATH: "data/master_data.json",
};
let originalEnvironment: NodeJS.ProcessEnv;
let operations: typeof import("./storage");

beforeAll(async () => {
  const environment = process.env;
  process.env = { ...testEnvironment };
  app.getApps.mockReturnValue([{ name: "another-app" } as App]);
  try {
    operations = await import("./storage");
    expect(app.getApps).not.toHaveBeenCalled();
    expect(app.initializeApp).not.toHaveBeenCalled();
    expect(storage.getStorage).not.toHaveBeenCalled();
  } finally {
    process.env = environment;
  }
});

beforeEach(() => {
  for (const method of Object.values(app)) method.mockReset();
  app.getApps.mockReturnValue([]);
  storage.getStorage.mockReset();
  got.get.mockReset();
  originalEnvironment = process.env;
  process.env = { ...testEnvironment };
});

afterEach(() => {
  process.env = originalEnvironment;
  mock.restore();
});

describe("storage authentication boundary", () => {
  it("imports and reads public JSON without initializing authenticated storage", async () => {
    const { app, storage, got, operations } = load([
      { name: "another-app" } as App,
    ]);
    const data = { revision: 7 };
    const json = mock().mockResolvedValue(data);
    got.get.mockReturnValue({ json } as unknown as ReturnType<typeof got.get>);

    expect(app.getApps).not.toHaveBeenCalled();
    expect(storage.getStorage).not.toHaveBeenCalled();
    expect(await operations.readJson<typeof data>("data/public.json")).toEqual(
      data,
    );
    expect(got.get).toHaveBeenCalledTimes(1);
    expect(got.get).toHaveBeenCalledWith(
      "https://storage.googleapis.com/kcfleethub/data/public.json",
    );
    expect(app.getApps).not.toHaveBeenCalled();
    expect(app.cert).not.toHaveBeenCalled();
    expect(storage.getStorage).not.toHaveBeenCalled();
  });

  it("requires credentials before the first authenticated storage operation", () => {
    const { app, storage, operations } = load();

    expect(() => operations.exists("data/private.json")).toThrow(
      "client_emailが存在しません",
    );
    expect(app.initializeApp).not.toHaveBeenCalled();
    expect(storage.getStorage).not.toHaveBeenCalled();
  });

  it("passes the existing default app to storage and unwraps file existence", async () => {
    const { app, storage, operations } = load();
    const defaultApp = { name: "[DEFAULT]" } as App;
    app.getApps.mockReturnValue([defaultApp]);
    app.getApp.mockReturnValue(defaultApp);
    const exists = mock().mockResolvedValue([true]);
    const file = mock(() => ({ exists }));
    const bucket = mock(() => ({ file }));
    storage.getStorage.mockReturnValue({
      bucket,
    } as unknown as ReturnType<typeof storage.getStorage>);

    expect(await operations.exists("data/known.json")).toBe(true);
    exists.mockResolvedValue([false]);
    expect(await operations.exists("data/missing.json")).toBe(false);
    expect(storage.getStorage).toHaveBeenNthCalledWith(1, defaultApp);
    expect(storage.getStorage).toHaveBeenNthCalledWith(2, defaultApp);
    expect(file).toHaveBeenNthCalledWith(1, "data/known.json");
    expect(file).toHaveBeenNthCalledWith(2, "data/missing.json");
    expect(app.cert).not.toHaveBeenCalled();
    expect(app.initializeApp).not.toHaveBeenCalled();
  });

  it("initializes the default app on the first write and reuses it for later writes", async () => {
    const { app, storage, operations } = load();
    process.env.SERVICE_ACCOUNT_CLIENT_EMAIL = "test@example.invalid";
    process.env.SERVICE_ACCOUNT_PRIVATE_KEY = "line one\\nline two";
    const defaultApp = { name: "[DEFAULT]" } as App;
    const apps: App[] = [];
    app.getApps.mockImplementation(() => apps);
    app.getApp.mockReturnValue(defaultApp);
    app.initializeApp.mockImplementation(() => {
      apps.push(defaultApp);
      return defaultApp;
    });
    const save = mock().mockResolvedValue(undefined);
    const file = mock(() => ({ save }));
    storage.getStorage.mockReturnValue({
      bucket: () => ({ file }),
    } as unknown as ReturnType<typeof storage.getStorage>);

    expect(app.initializeApp).not.toHaveBeenCalled();
    await operations.write("data/first.json", "first");
    await operations.write("data/second.json", "second");

    expect(app.initializeApp).toHaveBeenCalledTimes(1);
    expect(app.cert).toHaveBeenCalledWith({
      projectId: "kcfleethub",
      clientEmail: "test@example.invalid",
      privateKey: "line one\nline two",
    });
    expect(app.getApp).toHaveBeenCalledTimes(1);
    expect(storage.getStorage).toHaveBeenNthCalledWith(1, defaultApp);
    expect(storage.getStorage).toHaveBeenNthCalledWith(2, defaultApp);
    expect(file).toHaveBeenNthCalledWith(1, "data/first.json");
    expect(file).toHaveBeenNthCalledWith(2, "data/second.json");
    expect(save).toHaveBeenNthCalledWith(1, "first", { metadata: {} });
    expect(save).toHaveBeenNthCalledWith(2, "second", { metadata: {} });
  });
});

describe("storage upload options", () => {
  function captureWrites() {
    const defaultApp = { name: "[DEFAULT]" } as App;
    app.getApps.mockReturnValue([defaultApp]);
    app.getApp.mockReturnValue(defaultApp);
    const save =
      mock<
        (data: string | Buffer, options: GcsSaveOptions) => Promise<void>
      >().mockResolvedValue(undefined);
    storage.getStorage.mockReturnValue({
      bucket: () => ({ file: () => ({ save }) }),
    } as unknown as ReturnType<typeof storage.getStorage>);
    return save;
  }

  it("reuses caller metadata across immutable, Brotli and plain writes without leaking derived options", async () => {
    const save = captureWrites();
    const metadata = {
      cacheControl: "private, max-age=60",
      contentEncoding: "identity",
      custom: "retained",
    };
    const options: SaveOptions = {
      contentType: "text/plain",
      resumable: false,
      gzip: true,
      metadata,
    };
    const before = structuredClone(options);

    await operations.write("data/immutable.txt", "immutable", {
      ...options,
      immutable: true,
    });
    await operations.write("data/brotli.txt", "brotli", {
      ...options,
      brotli: true,
    });
    await operations.write("data/plain.txt", "plain", options);

    expect(options).toEqual(before);
    expect(save.mock.calls[0]).toEqual([
      "immutable",
      {
        ...options,
        metadata: {
          ...metadata,
          cacheControl: "public, immutable, max-age=365000000",
        },
      },
    ]);
    const [compressed, compressedOptions] = save.mock.calls[1]!;
    expect(compressed).toBeInstanceOf(Buffer);
    expect(brotliDecompressSync(compressed as Buffer).toString()).toBe(
      "brotli",
    );
    expect(compressedOptions).toEqual({
      ...options,
      gzip: false,
      metadata: { ...metadata, contentEncoding: "br" },
    });
    expect(save.mock.calls[2]).toEqual(["plain", before]);
  });

  it("accepts frozen metadata while retaining caller JSON content type and applying Brotli encoding", async () => {
    const save = captureWrites();
    const metadata = Object.freeze({ cacheControl: "private", custom: "kept" });
    const options = Object.freeze({
      metadata,
      contentType: "application/vnd.fleethub+json",
      brotli: true,
      immutable: true,
      gzip: true,
    });
    const data = { value: 0, enabled: false };

    expect(await operations.writeJson("data/frozen.json", data, options)).toBe(
      data,
    );
    const [compressed, uploadedOptions] = save.mock.calls[0]!;
    expect(compressed).toBeInstanceOf(Buffer);
    expect(
      JSON.parse(brotliDecompressSync(compressed as Buffer).toString()),
    ).toEqual(data);
    expect(uploadedOptions).toEqual({
      contentType: "application/vnd.fleethub+json",
      gzip: false,
      metadata: {
        cacheControl: "public, immutable, max-age=365000000",
        custom: "kept",
        contentEncoding: "br",
      },
    });
    expect(metadata).toEqual({ cacheControl: "private", custom: "kept" });
  });

  it.each([
    [false, null],
    [undefined, undefined],
  ])(
    "preserves explicit compression overrides and normalizes absent metadata (%s)",
    async (brotli, metadata) => {
      const save = captureWrites();
      const data = { value: 0 };
      const options = {
        brotli,
        immutable: false,
        gzip: true,
        contentType: "application/vnd.fleethub+json",
        metadata,
      };

      expect(
        await operations.writeJson(
          "data/uncompressed.json",
          data,
          options as SaveOptions,
        ),
      ).toBe(data);
      expect(save).toHaveBeenCalledWith(JSON.stringify(data), {
        contentType: "application/vnd.fleethub+json",
        gzip: true,
        metadata: {},
      });
      expect(options.metadata).toBe(metadata);
    },
  );
});
