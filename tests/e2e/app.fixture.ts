import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { test as base, expect, type Page } from "@playwright/test";

const defaultMasterDataJSON = readFileSync(
  resolve(import.meta.dirname, "fixtures/master-data.json"),
  "utf8",
);

export const languages = [
  { locale: "ja", label: "日本語" },
  { locale: "en", label: "English" },
  { locale: "ko", label: "한국어" },
  { locale: "zh-CN", label: "中文(简体)" },
  { locale: "zh-TW", label: "中文(繁體)" },
] as const;

export type Language = (typeof languages)[number];

type Translation = {
  CreateComp: string;
  CreateFolder: string;
  OpenFolderPage: string;
  FighterPower: string;
  Ship: string;
  meta: { title: string };
};

export function translations(locale: Language["locale"]): Translation {
  return JSON.parse(
    readFileSync(
      resolve(
        import.meta.dirname,
        "../../packages/site/public/locales",
        locale,
        "common.json",
      ),
      "utf8",
    ),
  ) as Translation;
}

type BrowserRuntime = {
  wasmResponses: number[];
  masterDataPaths: string[];
};

type BrowserOptions = {
  masterDataJSON: string;
};

type WasmWindow = Window & { __fleethubWasmInstantiations: number };

export const test = base.extend<BrowserOptions & { runtime: BrowserRuntime }>({
  masterDataJSON: [defaultMasterDataJSON, { option: true }],
  runtime: [
    async ({ context, page, baseURL, masterDataJSON }, use) => {
      const runtime: BrowserRuntime = {
        wasmResponses: [],
        masterDataPaths: [],
      };
      const errors: string[] = [];
      const unstableSelectorWarnings: string[] = [];
      const unexpectedExternalRequests: string[] = [];
      const origin = new URL(baseURL!).origin;

      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
        if (
          message.type() === "warning" &&
          /Selector .+ returned a different result when called with the same parameters/.test(
            message.text(),
          )
        ) {
          unstableSelectorWarnings.push(message.text());
        }
      });
      page.on("response", (response) => {
        if (new URL(response.url()).pathname.endsWith(".wasm")) {
          runtime.wasmResponses.push(response.status());
        }
      });

      await context.addInitScript(() => {
        const runtimeWindow = window as unknown as WasmWindow;
        runtimeWindow.__fleethubWasmInstantiations = 0;
        const instantiate = WebAssembly.instantiate;
        WebAssembly.instantiate = ((
          ...args: Parameters<typeof WebAssembly.instantiate>
        ) =>
          instantiate(...args).then((result) => {
            runtimeWindow.__fleethubWasmInstantiations += 1;
            return result;
          })) as typeof instantiate;

        // This callback runs in Chromium; keep Bun's additional Wasm overloads out.
        type BrowserStreaming = (
          source: Response | PromiseLike<Response>,
          imports?: WebAssembly.Imports,
        ) => Promise<WebAssembly.WebAssemblyInstantiatedSource>;
        const instantiateStreaming: BrowserStreaming =
          WebAssembly.instantiateStreaming;
        WebAssembly.instantiateStreaming = ((
          ...args: Parameters<BrowserStreaming>
        ) =>
          instantiateStreaming(...args).then((result) => {
            runtimeWindow.__fleethubWasmInstantiations += 1;
            return result;
          })) as typeof WebAssembly.instantiateStreaming;
      });

      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin === origin) return route.continue();

        const corsHeaders = {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers":
            request.headers()["access-control-request-headers"] ?? "*",
        };

        if (
          url.hostname === "storage.googleapis.com" &&
          /^\/kcfleethub\/data\/master_data(?:\.dev)?\.json$/.test(url.pathname)
        ) {
          runtime.masterDataPaths.push(url.pathname);
          return route.fulfill({
            contentType: "application/json",
            headers: corsHeaders,
            body: masterDataJSON,
          });
        }
        if (
          url.hostname === "storage.googleapis.com" &&
          url.pathname === "/kcfleethub/data/ship_banners.json"
        ) {
          return route.fulfill({
            contentType: "application/json",
            headers: corsHeaders,
            body: "{}",
          });
        }

        // Satisfy analytics initialization without contacting or writing to a
        // service. Aborted requests would create unrelated browser errors.
        if (
          /(^|\.)(google-analytics\.com|googletagmanager\.com)$/.test(
            url.hostname,
          )
        ) {
          return route.fulfill({
            status: request.method() === "OPTIONS" ? 204 : 200,
            contentType: url.pathname.endsWith("/js")
              ? "application/javascript"
              : "text/plain",
            headers: corsHeaders,
            body: "",
          });
        }
        if (url.hostname === "firebase.googleapis.com") {
          return route.fulfill({
            contentType: "application/json",
            headers: corsHeaders,
            json: {
              appId: "1:154546542358:web:be495b1b23c20c66c82237",
              measurementId: "G-9F914T0225",
            },
          });
        }
        if (url.hostname === "firebaseinstallations.googleapis.com") {
          return route.fulfill({
            status: request.method() === "OPTIONS" ? 204 : 200,
            contentType: "application/json",
            headers: corsHeaders,
            json: {
              fid: "c1234567890123456789012",
              refreshToken: "e2e-refresh-token",
              authToken: { token: "e2e-token", expiresIn: "604800s" },
              token: "e2e-token",
              expiresIn: "604800s",
            },
          });
        }
        if (url.hostname === "firebaselogging-pa.googleapis.com") {
          return route.fulfill({
            contentType: "application/json",
            headers: corsHeaders,
            json: { nextRequestWaitMillis: 60_000 },
          });
        }

        unexpectedExternalRequests.push(`${request.method()} ${url.href}`);
        return route.fulfill({ status: 404, body: "Unexpected E2E request" });
      });

      await use(runtime);

      expect(
        unexpectedExternalRequests,
        "unhandled external browser requests",
      ).toEqual([]);
      expect(errors, "uncaught exceptions and console errors").toEqual([]);
      expect(
        unstableSelectorWarnings,
        "unstable Redux selector warnings",
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function expectLoaded(
  page: Page,
  language: Language,
  runtime: BrowserRuntime,
) {
  const text = translations(language.locale);
  await expect(
    page.getByRole("button", { name: language.label, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: text.CreateComp, exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", language.locale);
  await expect(page).toHaveTitle(new RegExp(escapeRegExp(text.meta.title)));
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as WasmWindow).__fleethubWasmInstantiations,
      ),
    )
    .toBeGreaterThan(0);
  expect(runtime.wasmResponses).toContain(200);
  const expectedMasterDataPath =
    process.env.E2E_MODE === "dev"
      ? "/kcfleethub/data/master_data.dev.json"
      : "/kcfleethub/data/master_data.json";
  expect(new Set(runtime.masterDataPaths)).toEqual(
    new Set([expectedMasterDataPath]),
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function hqLevelInput(page: Page) {
  // The existing HQ control has a visible adornment but no input label. Scope
  // to the first numeric field in the plan header, before ship/gear inputs.
  return page.locator('input[inputmode="numeric"]').first();
}

export async function setHqLevel(page: Page, value: string) {
  const input = hqLevelInput(page);
  await input.fill(value);
  await input.press("Tab");
}
