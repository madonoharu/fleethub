import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

import { test, expect, expectLoaded, languages } from "./app.fixture";
import masterData from "./fixtures/master-data.json";
import enemy from "./fixtures/enemy-1501.json";
import legacy from "../../packages/site/src/store/entities/fixtures/legacy-cloned-plan.json";

test.use({
  masterDataJSON: JSON.stringify({ ...masterData, ships: [...masterData.ships, enemy] }),
});

async function savedSelection(page: Page) {
  return page.evaluate(
    (fileId) =>
      new Promise<unknown>((resolve, reject) => {
        const open = indexedDB.open("localforage");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const transaction = db.transaction("keyvaluepairs", "readonly");
          const request = transaction.objectStore("keyvaluepairs").get("persist:root");
          request.onsuccess = () => {
            const state = request.result as
              | {
                  entities: {
                    files: { entities: Record<string, { activeStep?: string; steps: string[] }> };
                    steps: {
                      entities: Record<
                        string,
                        { org: string; config?: { right?: { formation?: string } } }
                      >;
                    };
                    orgs: { entities: Record<string, { f1?: string }> };
                    fleets: { entities: Record<string, { s1?: string }> };
                    ships: { entities: Record<string, { current_hp?: number }> };
                  };
                }
              | undefined;
            const entities = state?.entities;
            const file = entities?.files.entities[fileId];
            const step = entities?.steps.entities[file?.activeStep ?? ""];
            const fleetId = entities?.orgs.entities[step?.org ?? ""]?.f1;
            const shipId = entities?.fleets.entities[fleetId ?? ""]?.s1;
            resolve({
              steps: file?.steps,
              active: file?.activeStep,
              formation: step?.config?.right?.formation,
              hp: entities?.ships.entities[shipId ?? ""]?.current_hp,
            });
          };
          request.onerror = () => reject(request.error);
          transaction.oncomplete = () => db.close();
        };
      }),
    legacy.result,
  );
}

test("restoring an old copied plan preserves its edited node through reload, deletion and undo", async ({
  page,
  runtime,
}, testInfo) => {
  await page.route(
    "https://res.cloudinary.com/djg1epjdj/image/upload/**/gear_icons/*.png",
    (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
      }),
  );
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page.getByRole("button", { name: "設定", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "ダウンロード", exact: true }).click();
  const path = await (await downloaded).path();
  if (!path) throw new Error("Backup download is missing");
  const backup = JSON.parse(readFileSync(path, "utf8")) as {
    app: { fileId?: string; configOpen?: boolean };
    entities: Record<
      string,
      { ids: string[]; entities: object; rootIds?: string[]; tempIds?: string[] }
    >;
  };
  // Preserve the current backup format/preferences and substitute the actual
  // old cloner's graph, including its separately edited active node.
  for (const [key, table] of Object.entries(backup.entities)) {
    const dict = (legacy.entities as Record<string, object>)[key] ?? {};
    table.ids = Object.keys(dict);
    table.entities = dict;
  }
  backup.entities.files.rootIds = [legacy.result];
  backup.entities.files.tempIds = [];
  backup.app.fileId = legacy.result;
  backup.app.configOpen = false;
  await page.locator('input[type="file"]').setInputFiles({
    name: "legacy-copy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.getByRole("dialog").getByRole("button", { name: "OK", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByPlaceholder("name", { exact: true })).toHaveValue("Legacy copy");

  const selectedNode = page.getByRole("tab", { name: /^1-1 B/ });
  const checkEditedNode = async () => {
    await page.getByRole("tab", { name: "ダメージ計算機", exact: true }).click();
    await expect(selectedNode).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("combobox", { name: "陣形", exact: true }).last()).toHaveText(
      "単横陣",
    );
    const edit = page.getByRole("button", { name: "その他のステータスを編集", exact: true });
    await edit.hover();
    await edit.click();
    await expect(page.getByRole("dialog").getByRole("textbox").first()).toHaveValue("12");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  };
  await checkEditedNode();
  await testInfo.attach("legacy-restored", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await expect
    .poll(() => savedSelection(page))
    .toEqual({
      steps: ["legacy-2", "legacy-8"],
      active: "legacy-8",
      formation: "LineAbreast",
      hp: 12,
    });

  await page.reload();
  await expectLoaded(page, languages[0], runtime);
  await checkEditedNode();
  await selectedNode.getByRole("button").click();
  await expect(selectedNode).toHaveCount(0);
  await expect(page.getByRole("tab", { name: /^1-1 A/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText(/ID:1501/)).toHaveCount(0);
  await page.getByRole("button", { name: "取り消す", exact: true }).click();
  await checkEditedNode();
  await testInfo.attach("legacy-delete-undone", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});
