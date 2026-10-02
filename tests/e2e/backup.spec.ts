import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

import { test, expect, expectLoaded, languages, hqLevelInput, setHqLevel } from "./app.fixture";

async function createPlan(page: Page, name: string) {
  await page.getByRole("button", { name: "編成を作成", exact: true }).first().click();
  const input = page.getByPlaceholder("name", { exact: true });
  await input.fill(name);
  await input.press("Tab");
  await setHqLevel(page, "100");
}

async function downloadBackup(page: Page) {
  await page.getByRole("button", { name: "設定", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "ダウンロード", exact: true }).click();
  const download = await downloaded;
  const path = await download.path();
  if (!path) throw new Error("Backup download is missing");
  return readFileSync(path, "utf8");
}

async function restoreBackup(page: Page, content: string) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(content),
  });
  await page.getByRole("dialog").getByRole("button", { name: "OK", exact: true }).click();
}

async function persistedEntities(page: Page) {
  return page.evaluate(
    () =>
      new Promise<unknown>((resolve, reject) => {
        const open = indexedDB.open("localforage");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const transaction = db.transaction("keyvaluepairs", "readonly");
          const request = transaction.objectStore("keyvaluepairs").get("persist:root");
          request.onsuccess = () => resolve(request.result?.entities);
          request.onerror = () => reject(request.error);
          transaction.oncomplete = () => db.close();
        };
      }),
  );
}

test("a downloaded backup restores the original plan and persists across reload", async ({
  page,
  runtime,
}) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  const name = "Backup original plan";
  await createPlan(page, name);
  await page.getByRole("button", { name: "艦娘", exact: true }).last().click();
  const selection = page.getByRole("dialog");
  await selection.getByRole("textbox").fill("id277");
  await selection.getByRole("textbox").press("Tab");
  await selection.getByRole("button", { name: "赤城改", exact: true }).click();
  await expect(selection).not.toBeVisible();
  const backup = await downloadBackup(page);
  const original = JSON.parse(backup) as { entities: unknown };

  await page.getByRole("treeitem").getByText(name, { exact: true }).click();
  await page.getByPlaceholder("name", { exact: true }).fill("Changed after backup");
  await page.getByPlaceholder("name", { exact: true }).press("Tab");
  await setHqLevel(page, "120");
  await page.getByRole("button", { name: "設定", exact: true }).click();
  await restoreBackup(page, backup);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect.poll(() => persistedEntities(page)).toEqual(original.entities);

  await page.reload();
  await expectLoaded(page, languages[0], runtime);
  await page.getByRole("treeitem").getByText(name, { exact: true }).click();
  await expect(page.getByPlaceholder("name", { exact: true })).toHaveValue(name);
  await expect(hqLevelInput(page)).toHaveValue("100");
  await expect(page.getByRole("paragraph").filter({ hasText: /^赤城改$/ })).toBeVisible();
});

test("invalid backup files leave the saved plans intact after reload", async ({
  page,
  runtime,
}) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  const name = "Keep this saved plan";
  await createPlan(page, name);
  const backup = JSON.parse(await downloadBackup(page)) as { entities: unknown };

  await restoreBackup(page, JSON.stringify({ ...backup, entities: {} }));
  await expect(page.getByRole("alert").filter({ hasText: "データが適合しません" })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("treeitem").getByText(name, { exact: true })).toBeVisible();
  expect(await persistedEntities(page)).toEqual(backup.entities);

  await page.reload();
  await expectLoaded(page, languages[0], runtime);
  await page.getByRole("treeitem").getByText(name, { exact: true }).click();
  await expect(page.getByPlaceholder("name", { exact: true })).toHaveValue(name);
  await expect(hqLevelInput(page)).toHaveValue("100");
  expect(await persistedEntities(page)).toEqual(backup.entities);
});
