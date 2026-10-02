import { test, expect, expectLoaded, languages } from "./app.fixture";
import masterData from "./fixtures/master-data.json";
import gearCategories from "./fixtures/gear-categories.json";

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
  masterDataJSON: JSON.stringify({ ...masterData, gears: gearCategories }),
});

test("wrapped equipment categories leave the search tab usable on a narrow touch screen", async ({
  page,
  runtime,
}) => {
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
  await page.getByRole("button", { name: "装備", exact: true }).tap();
  const dialog = page.getByRole("dialog");
  // One real master record per category reproduces the toolbar wrapping that
  // the three-aircraft baseline fixture cannot exercise.
  for (const category of [
    "MainGun",
    "Secondary",
    "Torpedo",
    "AntiSub",
    "Radar",
    "Landing",
    "Ration",
    "LandBased",
    "Misc",
  ]) {
    await expect(dialog.getByRole("button", { name: category, exact: true })).toBeVisible();
  }
  const searchTab = dialog.getByRole("tab", { name: "検索", exact: true });
  await searchTab.tap();
  await expect(searchTab).toHaveAttribute("aria-selected", "true");
  const search = dialog.getByRole("textbox");
  await search.fill("id21");
  await search.press("Tab");
  await expect(dialog.getByRole("button").filter({ hasText: /^零式艦戦52型$/ })).toBeVisible();
  await dialog.getByRole("tab", { name: "List", exact: true }).tap();
  await dialog.getByRole("button", { name: "LandBased", exact: true }).tap();
  await expect(dialog.getByRole("button").filter({ hasText: /^九六式陸攻$/ })).toBeVisible();
});
