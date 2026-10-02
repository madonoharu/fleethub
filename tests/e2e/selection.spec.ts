import { test, expect, expectLoaded, hqLevelInput, languages, translations } from "./app.fixture";

test("ship search accepts immediate typing and restores focus after closing", async ({
  page,
  runtime,
}) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);

  const openShips = page.getByRole("button", {
    name: translations("ja").Ship,
    exact: true,
  });
  const dialog = page.getByRole("dialog");
  const search = dialog.getByRole("textbox");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await openShips.click();
    await expect(search).toBeFocused();
    await expect(search).toHaveValue("");
    await page.keyboard.type("id277");
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "赤城改", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(openShips).toBeFocused();
  }
});

test("search clear control appears on hover and dialogs retain desktop and narrow sizes", async ({
  page,
  runtime,
}) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page.getByRole("button", { name: translations("ja").Ship, exact: true }).click();
  const dialog = page.getByRole("dialog");
  const search = dialog.getByRole("textbox");
  await expect(dialog).toHaveCSS("width", "1200px");
  await expect(dialog).toHaveCSS("height", "1016px");

  await search.fill("id277");
  await search.press("Tab");
  await page.mouse.move(0, 0);
  const clear = dialog.locator(".ClearButton");
  await expect(clear).toBeHidden();
  await search.hover();
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(search).toHaveValue("");
  await page.mouse.move(0, 0);
  await expect(clear).toBeHidden();

  await page.setViewportSize({ width: 390, height: 1080 });
  await expect(dialog).toHaveCSS("width", "326px");
  await expect(dialog).toHaveCSS("height", "1016px");
  await expect.poll(async () => (await dialog.boundingBox())?.x).toBe(32);
});

test.describe("touch controls", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("tapping inputs reveals usable clear and number controls without a hover-capable pointer", async ({
    page,
    runtime,
  }) => {
    await page.goto("/");
    await expectLoaded(page, languages[0], runtime);
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);

    await page.getByRole("button", { name: translations("ja").Ship, exact: true }).tap();
    const dialog = page.getByRole("dialog");
    const search = dialog.getByRole("textbox");
    await search.fill("id277");
    await search.tap();
    // Touch :hover can disappear between taps. Focus must keep the control
    // usable without adding an artificial delay or forcing a click.
    const clear = dialog.locator(".ClearButton");
    await expect(clear).toBeVisible();
    await clear.tap();
    await expect(search).toHaveValue("");
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    await page
      .getByRole("button", { name: translations("ja").CreateComp, exact: true })
      .first()
      .tap();
    await page
      .locator(".MuiDrawer-paper")
      .getByRole("button", { name: translations("ja").Close, exact: true })
      .tap();
    const level = hqLevelInput(page);
    await level.fill("99");
    await level.tap();
    const field = level.locator("..");
    const increase = field.getByRole("button", {
      name: "increase",
      exact: true,
    });
    const decrease = field.getByRole("button", {
      name: "decrease",
      exact: true,
    });
    await expect(increase).toBeVisible();
    await expect(decrease).toBeVisible();
    await increase.tap();
    await expect(level).toHaveValue("100");
  });

  test("tapping an equipment name preserves it and touch change opens the picker", async ({
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
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
    const text = translations("ja");
    await page.getByRole("button", { name: text.CreateComp, exact: true }).first().tap();
    await page
      .locator(".MuiDrawer-paper")
      .getByRole("button", { name: text.Close, exact: true })
      .tap();
    await page.getByRole("button", { name: text.Ship, exact: true }).nth(1).tap();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("id277");
    await dialog.getByRole("textbox").press("Tab");
    await dialog.getByRole("button", { name: "赤城改", exact: true }).tap();
    await expect(dialog).not.toBeVisible();

    const card = page
      .getByRole("paragraph")
      .filter({ hasText: /^赤城改$/ })
      .locator("../..");
    const slot = card.locator(".GearBox").first();
    await slot.getByRole("button").first().tap();
    await dialog.getByRole("tab", { name: "検索", exact: true }).tap();
    await dialog.getByRole("textbox").fill("id21");
    await dialog.getByRole("textbox").press("Tab");
    await dialog
      .getByRole("button")
      .filter({ hasText: /^零式艦戦52型$/ })
      .tap();
    await expect(dialog).not.toBeVisible();

    const name = slot.getByText("零式艦戦52型", { exact: true });
    await name.scrollIntoViewIfNeeded();
    await expect(name).toBeVisible();
    // Native touch generates compatibility mouse events. Showing actions and
    // hiding the name on that synthetic hover used to move Delete under the tap.
    await name.tap();
    await expect(name).toHaveCount(1);
    await expect(name).toBeVisible();

    const change = slot.getByRole("button", { name: "変更する", exact: true });
    await expect(change).toBeVisible();
    await expect(slot.getByRole("button", { name: "削除する", exact: true })).toBeVisible();
    await change.tap();
    await expect(dialog.getByRole("tab", { name: "List", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(name).toBeVisible();
  });
});
