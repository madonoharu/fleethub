import {
  test,
  expect,
  expectLoaded,
  languages,
  translations,
} from "./app.fixture";
import enemy from "./fixtures/enemy-1501.json";
import mapData from "./fixtures/map-11.json";
import baseMasterData from "./fixtures/master-data.json";

test.use({
  masterDataJSON: JSON.stringify({
    ...baseMasterData,
    ships: [...baseMasterData.ships, enemy],
  }),
});

test("damage distribution renders real Wasm analysis and finite D3 geometry", async ({
  page,
  runtime,
}) => {
  // Equipment icons are presentation assets; the application, charts and
  // Wasm analysis remain real. Limit this response to the known icon path.
  await page.route(
    "https://res.cloudinary.com/djg1epjdj/image/upload/**/gear_icons/*.png",
    (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
      }),
  );
  await page.route(
    (url) =>
      url.origin === "https://storage.googleapis.com" &&
      url.pathname === "/kcfleethub/data/maps/11.json",
    (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        json: mapData,
      }),
  );

  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  const text = translations("ja");
  await page
    .getByRole("button", { name: text.CreateComp, exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: text.Ship, exact: true })
    .last()
    .click();
  const ships = page.getByRole("dialog");
  await ships.getByRole("textbox").fill("id277");
  await ships.getByRole("textbox").press("Tab");
  await ships.getByRole("button", { name: "赤城改", exact: true }).click();
  await expect(ships).not.toBeVisible();

  // The existing empty equipment button has no accessible label.
  await page.locator(".GearBox").first().getByRole("button").click();
  const gears = page.getByRole("dialog");
  await gears.getByRole("tab", { name: "検索", exact: true }).click();
  await gears.getByRole("textbox").fill("id24");
  await gears.getByRole("textbox").press("Tab");
  await gears.getByRole("button", { name: /彗星/ }).click();
  await expect(gears).not.toBeVisible();

  await page.getByRole("tab", { name: "ダメージ計算機", exact: true }).click();
  await page
    .getByRole("button", { name: "マップから入力", exact: true })
    .click();
  const map = page.getByRole("dialog");
  await map.getByRole("button", { name: "単縦陣", exact: true }).click();
  await expect(map).not.toBeVisible();

  // This pinned ship/bomber/enemy setup produces these exact ranges in Rust.
  // Assert the rendered report as well as successful Wasm instantiation.
  await expect(page.getByText(/^146\s*~\s*148$/).first()).toBeVisible();
  await expect(page.getByText(/^267\s*~\s*269$/).first()).toBeVisible();
  const showDistribution = page.getByRole("checkbox", {
    name: "ダメージ分布",
    exact: true,
  });
  await expect(showDistribution).not.toBeChecked();
  await showDistribution.check();
  await expect(showDistribution).toBeChecked();

  const chart = page.locator(".recharts-wrapper").first();
  await expect(chart).toBeVisible();
  // Large distributions use Area instead of Bar. Both must paint a finite,
  // nonempty probability distribution from the real Rust attack report.
  const distribution = chart.locator(
    ".recharts-bar-rectangle path, .recharts-area-area",
  );
  await expect.poll(() => distribution.count()).toBeGreaterThan(0);
  await expect
    .poll(() =>
      distribution.evaluateAll((elements) =>
        elements.some((element) => {
          const bounds = (element as SVGGraphicsElement).getBBox();
          return (
            [bounds.x, bounds.y, bounds.width, bounds.height].every(
              Number.isFinite,
            ) &&
            bounds.width > 0 &&
            bounds.height > 0
          );
        }),
      ),
    )
    .toBe(true);
  await expect(chart.locator(".recharts-xAxis-tick-labels")).toBeVisible();
  const axisText = await chart
    .locator(".recharts-cartesian-axis-tick-value")
    .allTextContents();
  expect(axisText.length).toBeGreaterThan(2);
  expect(axisText.join(" ")).not.toMatch(/NaN|Infinity/);

  const noPenetration = page
    .getByRole("checkbox", { name: "装甲貫通なし", exact: true })
    .first();
  await expect(noPenetration).toBeChecked();
  await noPenetration.uncheck();
  await expect(noPenetration).not.toBeChecked();
  await expect(chart).toBeVisible();
  await expect.poll(() => distribution.count()).toBeGreaterThan(0);
});
