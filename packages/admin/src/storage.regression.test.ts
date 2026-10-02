import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import type { App } from "firebase-admin/app";

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
