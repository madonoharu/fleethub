/** @jest-environment node */

import type { App, Credential } from "firebase-admin/app";

jest.mock("firebase-admin/app", () => ({
  cert: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
}));

const defaultApp = { name: "[DEFAULT]" } as App;
const credential: Credential = {
  getAccessToken: async () => ({
    access_token: "test-token",
    expires_in: 3600,
  }),
};

function load(apps: App[] = []) {
  const sdk = jest.mocked(
    jest.requireMock<typeof import("firebase-admin/app")>("firebase-admin/app"),
  );
  sdk.getApps.mockReturnValue(apps);
  const credentials =
    require("./credentials") as typeof import("./credentials");
  return { sdk, ...credentials };
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

describe("lazy Firebase credentials", () => {
  it("imports without credentials or initializing the Firebase SDK", () => {
    const { sdk, getApp } = load([{ name: "another-app" } as App]);

    expect(getApp).toBeInstanceOf(Function);
    expect(sdk.getApps).not.toHaveBeenCalled();
    expect(sdk.cert).not.toHaveBeenCalled();
    expect(sdk.initializeApp).not.toHaveBeenCalled();
  });

  it.each([
    [{}, "client_emailが存在しません"],
    [
      { SERVICE_ACCOUNT_CLIENT_EMAIL: "test@example.invalid" },
      "private_keyが存在しません",
    ],
  ])(
    "reports missing credentials only when the app is requested",
    (env, message) => {
      Object.assign(process.env, env);
      const { sdk, getApp } = load();

      expect(() => getApp()).toThrow(message);
      expect(sdk.cert).not.toHaveBeenCalled();
      expect(sdk.initializeApp).not.toHaveBeenCalled();
    },
  );

  it("initializes once, decodes escaped newlines, and reuses the default app", () => {
    process.env.SERVICE_ACCOUNT_CLIENT_EMAIL = "test@example.invalid";
    process.env.SERVICE_ACCOUNT_PRIVATE_KEY = "line one\\nline two\\n";
    const { sdk, getApp } = load();
    sdk.cert.mockReturnValue(credential);
    sdk.initializeApp.mockReturnValue(defaultApp);
    sdk.getApp.mockReturnValue(defaultApp);
    sdk.getApps.mockReturnValueOnce([]).mockReturnValue([defaultApp]);

    expect(getApp()).toBe(defaultApp);
    expect(getApp()).toBe(defaultApp);
    expect(sdk.cert).toHaveBeenCalledTimes(1);
    expect(sdk.cert).toHaveBeenCalledWith({
      projectId: "kcfleethub",
      clientEmail: "test@example.invalid",
      privateKey: "line one\nline two\n",
    });
    expect(sdk.initializeApp).toHaveBeenCalledTimes(1);
    expect(sdk.initializeApp).toHaveBeenCalledWith({
      credential,
      storageBucket: "kcfleethub",
    });
    expect(sdk.getApp).toHaveBeenCalledTimes(1);
  });

  it("uses an existing default app without requiring service-account variables", () => {
    const { sdk, getApp } = load();
    sdk.getApps.mockReturnValue([defaultApp]);
    sdk.getApp.mockReturnValue(defaultApp);

    expect(getApp()).toBe(defaultApp);
    expect(sdk.cert).not.toHaveBeenCalled();
    expect(sdk.initializeApp).not.toHaveBeenCalled();
  });

  it("does not mistake a named app for an initialized default app", () => {
    process.env.SERVICE_ACCOUNT_CLIENT_EMAIL = "test@example.invalid";
    process.env.SERVICE_ACCOUNT_PRIVATE_KEY = "test-key";
    const { sdk, getApp } = load();
    sdk.getApps.mockReturnValue([{ name: "another-app" } as App]);
    sdk.cert.mockReturnValue(credential);
    sdk.initializeApp.mockReturnValue(defaultApp);

    expect(getApp()).toBe(defaultApp);
    expect(sdk.initializeApp).toHaveBeenCalledTimes(1);
    expect(sdk.getApp).not.toHaveBeenCalled();
  });
});
