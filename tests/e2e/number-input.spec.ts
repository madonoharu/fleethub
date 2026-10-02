import { test, expect, expectLoaded, hqLevelInput, languages, translations } from "./app.fixture";
import masterData from "./fixtures/master-data.json";

test.use({
  masterDataJSON: JSON.stringify({
    ...masterData,
    gears: [
      ...masterData.gears,
      {
        gear_id: 1,
        types: [1, 1, 1, 1, 0],
        name: "12cm単装砲",
        firepower: 1,
        anti_air: 1,
        range: 1,
        improvable: true,
      },
    ],
  }),
});

test("headquarters input normalizes integer values and works with keyboard step buttons", async ({
  page,
  runtime,
}) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page
    .getByRole("button", { name: translations("ja").CreateComp, exact: true })
    .first()
    .click();
  const level = hqLevelInput(page);
  await level.fill("120");
  await level.press("Tab");
  await level.fill("999");
  await level.press("Tab");
  await expect(level).toHaveValue("120");
  // Type each character so fractional intermediate results cannot rewrite
  // the expression before the user finishes entering it.
  await level.fill("");
  await level.pressSequentially("10/4*2");
  await expect(level).toHaveValue("10/4*2");
  await expect(page.getByText("10.00", { exact: true })).toHaveCount(4);
  await level.press("Tab");
  await expect(level).toHaveValue("10/4*2");
  await level.fill("12+");
  await level.press("Tab");
  await expect(level).toHaveValue("5");
  await level.fill("99.5");
  await level.press("Tab");
  await expect(level).toHaveValue("99");
  await expect(page.getByText("編成データが不正です", { exact: true })).toHaveCount(0);

  await level.focus();
  await page.mouse.move(0, 0);
  const increase = level.locator("..").getByRole("button", { name: "increase", exact: true });
  await expect(increase).toBeVisible();
  await level.press("Tab");
  await expect(increase).toBeFocused();
  await increase.press("Space");
  await expect(level).toHaveValue("100");
  await increase.press("Enter");
  await expect(level).toHaveValue("101");

  await level.fill("101.5");
  await increase.click();
  await expect(level).toHaveValue("102");
  await level.fill("120");
  await level.press("Tab");
  await level.fill("999");
  await level.locator("..").getByRole("button", { name: "decrease", exact: true }).click();
  await expect(level).toHaveValue("119");

  // Observe the committed value in localforage before replacing the document.
  // redux-persist writes asynchronously after the field displays the new value.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const persisted = await new Promise<unknown>((resolve, reject) => {
          const open = indexedDB.open("localforage");
          open.onerror = () => reject(open.error);
          open.onsuccess = () => {
            const db = open.result;
            const transaction = db.transaction("keyvaluepairs", "readonly");
            const request = transaction.objectStore("keyvaluepairs").get("persist:root");
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => db.close();
          };
        });
        if (!persisted || typeof persisted !== "object") return undefined;
        const state = persisted as {
          app: { fileId?: string };
          entities: {
            files: { entities: Record<string, { org?: string }> };
            orgs: { entities: Record<string, { hq_level?: number }> };
          };
        };
        const orgId = state.entities.files.entities[state.app.fileId ?? ""]?.org;
        return orgId ? state.entities.orgs.entities[orgId]?.hq_level : undefined;
      }),
    )
    .toBe(119);

  await page.reload();
  await expectLoaded(page, languages[0], runtime);
  await expect(hqLevelInput(page)).toHaveValue("119");
});

test("non-aircraft equipment has a disabled slot size control", async ({ page, runtime }) => {
  await page.route(
    "https://res.cloudinary.com/djg1epjdj/image/upload/**/gear_icons/*.png",
    (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
      }),
  );
  const text = translations("ja");
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page.getByRole("button", { name: text.CreateComp, exact: true }).first().click();
  await page.getByRole("button", { name: text.Ship, exact: true }).nth(1).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox").fill("id277");
  await dialog.getByRole("textbox").press("Tab");
  await dialog.getByRole("button", { name: "赤城改", exact: true }).click();
  const card = page
    .getByRole("paragraph")
    .filter({ hasText: /^赤城改$/ })
    .locator("../..");
  const slot = card.locator(".GearBox").first();
  await slot.getByRole("button").first().click();
  await dialog.getByRole("tab", { name: "検索", exact: true }).click();
  await dialog.getByRole("textbox").fill("id1");
  await dialog.getByRole("textbox").press("Tab");
  await dialog
    .getByRole("button")
    .filter({ hasText: /^12cm単装砲$/ })
    .click();
  await expect(slot.getByText("12cm単装砲", { exact: true })).toBeVisible();
  await expect(slot.locator("..").locator(".SlotSizeButton")).toBeDisabled();
});
