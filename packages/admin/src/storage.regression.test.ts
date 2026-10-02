/** @jest-environment node */

import type { App } from "firebase-admin/app";

jest.mock("firebase-admin/app", () => ({
  cert: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
}));
jest.mock("firebase-admin/storage", () => ({ getStorage: jest.fn() }));
jest.mock("got", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

function load(apps: App[] = []) {
  const app = jest.mocked(
    jest.requireMock<typeof import("firebase-admin/app")>("firebase-admin/app"),
  );
  app.getApps.mockReturnValue(apps);
  const storage = jest.mocked(
    jest.requireMock<typeof import("firebase-admin/storage")>(
      "firebase-admin/storage",
    ),
  );
  const got = jest.mocked(
    jest.requireMock<typeof import("got")>("got").default,
  );
  const operations = require("./storage") as typeof import("./storage");
  return { app, storage, got, operations };
}

beforeEach(() => {
  jest.resetModules();
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

describe("storage authentication boundary", () => {
  it("imports and reads public JSON without initializing authenticated storage", async () => {
    const { app, storage, got, operations } = load([
      { name: "another-app" } as App,
    ]);
    const data = { revision: 7 };
    const json = jest.fn().mockResolvedValue(data);
    got.get.mockReturnValue({ json } as unknown as ReturnType<typeof got.get>);

    expect(app.getApps).not.toHaveBeenCalled();
    expect(storage.getStorage).not.toHaveBeenCalled();
    await expect(operations.readJson("data/public.json")).resolves.toEqual(
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
    const exists = jest.fn().mockResolvedValue([true]);
    const file = jest.fn(() => ({ exists }));
    const bucket = jest.fn(() => ({ file }));
    storage.getStorage.mockReturnValue({
      bucket,
    } as unknown as ReturnType<typeof storage.getStorage>);

    await expect(operations.exists("data/known.json")).resolves.toBe(true);
    exists.mockResolvedValue([false]);
    await expect(operations.exists("data/missing.json")).resolves.toBe(false);
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
    const save = jest.fn().mockResolvedValue(undefined);
    const file = jest.fn(() => ({ save }));
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
