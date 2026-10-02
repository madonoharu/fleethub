import type { Page } from "@playwright/test";

import {
  test,
  expect,
  expectLoaded,
  languages,
  translations,
  hqLevelInput,
  setHqLevel,
} from "./app.fixture";

const folderName = "E2E persisted folder";
const planName = "E2E persisted plan";

function treeItem(page: Page, name: string) {
  return page
    .getByRole("treeitem")
    .filter({ has: page.getByText(name, { exact: true }) })
    .last();
}

test("folder and plan tree navigation survives a saved-state reload", async ({
  page,
  runtime,
}) => {
  const text = translations("ja");
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page
    .getByRole("button", { name: text.CreateFolder, exact: true })
    .first()
    .click();

  const folder = treeItem(page, "Folder 1");
  await folder.hover();
  await folder
    .getByRole("button", { name: text.OpenFolderPage, exact: true })
    .click();
  const nameInput = page.getByPlaceholder("name", { exact: true });
  await nameInput.fill(folderName);
  await nameInput.press("Tab");
  await expect(treeItem(page, folderName)).toBeVisible();

  await page
    .getByRole("button", { name: text.CreateComp, exact: true })
    .last()
    .click();
  await nameInput.fill(planName);
  await nameInput.press("Tab");
  await setHqLevel(page, "100");
  await expect(hqLevelInput(page)).toHaveValue("100");

  await page.getByRole("button", { name: "Home", exact: true }).click();
  const savedFolder = treeItem(page, folderName);
  await savedFolder.focus();
  if ((await savedFolder.getAttribute("aria-expanded")) === "true") {
    await savedFolder.press("ArrowLeft");
    await expect(savedFolder).toHaveAttribute("aria-expanded", "false");
  }
  await savedFolder.press("ArrowRight");
  await expect(savedFolder).toHaveAttribute("aria-expanded", "true");
  await treeItem(page, planName).getByText(planName, { exact: true }).click();
  await expect(nameInput).toHaveValue(planName);

  // redux-persist writes through localforage asynchronously. Observe the actual
  // IndexedDB record before reloading; there is no timing-based delay here.
  await expect
    .poll(() =>
      page.evaluate(
        async ({ folderName, planName }) => {
          const persisted = await new Promise<unknown>((resolve, reject) => {
            const open = indexedDB.open("localforage");
            open.onerror = () => reject(open.error);
            open.onsuccess = () => {
              const db = open.result;
              const transaction = db.transaction("keyvaluepairs", "readonly");
              const request = transaction
                .objectStore("keyvaluepairs")
                .get("persist:root");
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
              transaction.oncomplete = () => db.close();
            };
          });
          if (!persisted || typeof persisted !== "object") return false;
          const state = persisted as {
            app: { fileId?: string };
            entities: {
              files: {
                entities: Record<
                  string,
                  {
                    id: string;
                    name: string;
                    org?: string;
                    children?: string[];
                  }
                >;
              };
              orgs: { entities: Record<string, { hq_level?: number }> };
            };
          };
          const files = Object.values(state.entities.files.entities);
          const folder = files.find((file) => file.name === folderName);
          const plan = files.find((file) => file.name === planName);
          return Boolean(
            plan?.org &&
            folder?.children?.includes(plan.id) &&
            state.app.fileId === plan.id &&
            state.entities.orgs.entities[plan.org]?.hq_level === 100,
          );
        },
        { folderName, planName },
      ),
    )
    .toBe(true);

  await page.reload();
  await expectLoaded(page, languages[0], runtime);
  await expect(nameInput).toHaveValue(planName);
  await expect(hqLevelInput(page)).toHaveValue("100");
  await expect(page.getByText("-28.00", { exact: true })).toHaveCount(4);
  await expect(treeItem(page, folderName)).toBeVisible();
});
