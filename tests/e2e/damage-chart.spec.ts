import { test, expect, expectLoaded, languages, translations } from "./app.fixture";
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
  await page.getByRole("button", { name: text.CreateComp, exact: true }).first().click();
  await page.getByRole("button", { name: text.Ship, exact: true }).last().click();
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
  await page.getByRole("button", { name: "マップから入力", exact: true }).click();
  const map = page.getByRole("dialog");
  await map.getByRole("button", { name: "詳細", exact: true }).first().click();
  const enemyDetails = page.getByRole("dialog").last();
  await expect(enemyDetails.getByRole("tab").first()).toBeVisible();
  // The close icon sits above the full-width tab list and must receive a
  // normal click. This shared icon currently has no accessible name.
  await enemyDetails.locator(":scope > button").first().click();
  await expect(map.getByRole("button", { name: "単縦陣", exact: true })).toBeVisible();
  await map.getByRole("button", { name: "単縦陣", exact: true }).click();
  await expect(map).not.toBeVisible();

  // Nested MUI tabs need their own compact size; the plan tab wrapper must
  // not control unrelated descendants through a broad CSS selector.
  for (const name of ["1-1 A", "昼戦"]) {
    const tab = page.getByRole("tab", { name, exact: true });
    await expect(tab).toHaveCSS("height", "32px");
    await expect(tab.locator("xpath=ancestor::*[contains(@class,'MuiTabs-root')][1]")).toHaveCSS(
      "height",
      "32px",
    );
  }
  await expect(page.getByRole("button", { name: "マップから入力", exact: true })).toHaveCSS(
    "height",
    "36.5px",
  );

  const customModifiers = page.getByRole("button", { name: "カスタム補正", exact: true }).first();
  const buttonBounds = await customModifiers.boundingBox();
  const iconBounds = await customModifiers.locator(".MuiButton-startIcon svg").boundingBox();
  expect(buttonBounds).not.toBeNull();
  expect(iconBounds).not.toBeNull();
  // The icon and label share one row, matching the production button. MUI's
  // icon pseudo-element must not add a second row to this grid button.
  expect(buttonBounds!.height).toBeCloseTo(36.5, 0);
  expect(iconBounds!.y + iconBounds!.height / 2).toBeCloseTo(
    buttonBounds!.y + buttonBounds!.height / 2,
    0,
  );

  // This pinned ship/bomber/enemy setup produces these exact ranges in Rust.
  // Assert the rendered report as well as successful Wasm instantiation.
  await expect(page.getByText(/^146\s*~\s*148$/).first()).toBeVisible();
  await expect(page.getByText(/^267\s*~\s*269$/).first()).toBeVisible();
  // Custom palette shades must retain the player/enemy distinction after
  // MUI upgrades; Typography's color prop does not resolve nested shades.
  const reportHeadings = page
    .locator("p")
    .filter({ has: page.getByText("赤城改", { exact: true }) })
    .filter({ has: page.getByText(/^ID:1501 /) });
  await expect(reportHeadings).toHaveCount(2);
  for (const heading of await reportHeadings.all()) {
    await expect(heading.getByText("赤城改", { exact: true })).toHaveCSS(
      "color",
      "rgb(100, 181, 246)",
    );
    await expect(heading.getByText(/^ID:1501 /)).toHaveCSS("color", "rgb(239, 102, 148)");
  }
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
  const distribution = chart.locator(".recharts-bar-rectangle path, .recharts-area-area");
  await expect.poll(() => distribution.count()).toBeGreaterThan(0);
  await expect
    .poll(() =>
      distribution.evaluateAll((elements) =>
        elements.some((element) => {
          const bounds = (element as SVGGraphicsElement).getBBox();
          return (
            [bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite) &&
            bounds.width > 0 &&
            bounds.height > 0
          );
        }),
      ),
    )
    .toBe(true);
  await expect(chart.locator(".recharts-xAxis-tick-labels")).toBeVisible();
  await expect
    .poll(() => chart.locator(".recharts-cartesian-grid-horizontal line").count())
    .toBeGreaterThan(2);
  const axisText = await chart.locator(".recharts-cartesian-axis-tick-value").allTextContents();
  expect(axisText.length).toBeGreaterThan(2);
  expect(axisText.join(" ")).not.toMatch(/NaN|Infinity/);

  await chart.hover({ position: { x: 200, y: 120 } });
  const tooltip = chart.locator(".recharts-tooltip-wrapper > div");
  await expect(tooltip).toBeVisible();
  // This visual regression needs the generated Tailwind CSS in a browser:
  // the tooltip must remain readable over the probability distribution.
  await expect(tooltip).toHaveCSS("background-color", "rgba(30, 20, 20, 0.85)");

  const legend = chart.locator(".recharts-legend-wrapper > div");
  await expect(legend).toHaveCSS("flex-wrap", "nowrap");
  await expect(legend).toHaveCSS("height", "22px");
  const legendItem = legend.getByRole("button").first();
  await legendItem.hover();
  await expect(legendItem).toHaveCSS("border-bottom-color", "rgb(255, 255, 255)");
  await legendItem.click();
  await expect(legendItem).toHaveAttribute("aria-pressed", "false");
  await expect(legendItem).toHaveCSS("opacity", "0.35");
  await expect(legend).toHaveCSS("height", "22px");
  await legendItem.click();
  await expect(legendItem).toHaveAttribute("aria-pressed", "true");
  await expect(legendItem).toHaveCSS("opacity", "1");

  const noPenetration = page.getByRole("checkbox", { name: "装甲貫通なし", exact: true }).first();
  await expect(noPenetration).toBeChecked();
  await noPenetration.uncheck();
  await expect(noPenetration).not.toBeChecked();
  await expect(chart).toBeVisible();
  await expect.poll(() => distribution.count()).toBeGreaterThan(0);

  // Force a capped attack through the real modifier UI so both the power
  // and damage ranges exercise the secondary palette shade.
  await customModifiers.click();
  const modifiers = page.getByRole("dialog");
  await modifiers.getByRole("textbox").first().fill("10");
  await modifiers.getByRole("textbox").first().press("Tab");
  await page.keyboard.press("Escape");
  const cappedReport = page.getByRole("table").first();
  for (const power of ["247", "444"]) {
    await expect(cappedReport.getByText(power, { exact: true })).toHaveCSS(
      "color",
      "rgb(239, 102, 148)",
    );
  }
  for (const damage of [/^241\s*~\s*243$/, /^438\s*~\s*440$/]) {
    await expect(cappedReport.getByText(damage)).toHaveCSS("color", "rgb(239, 102, 148)");
  }

  // The ship details comparison uses AttackTable instead of the node report.
  // Its distribution heading must keep the original 8px gap below the table.
  await page.getByRole("tab", { name: "F1", exact: true }).click();
  const playerCard = page
    .getByText("赤城改", { exact: true })
    .first()
    .locator("xpath=ancestor::*[contains(@class,'MuiPaper-root')][1]");
  await playerCard.hover();
  await playerCard.getByRole("button", { name: "詳細", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "敵を追加して攻撃力を計算する", exact: true })
    .click();
  const enemyPicker = page.getByRole("dialog").last();
  await enemyPicker.getByRole("textbox").fill("id1501");
  await enemyPicker.getByRole("textbox").press("Tab");
  await enemyPicker.getByRole("button", { name: /駆逐イ級$/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  const densityHeadings = page.getByRole("dialog").getByRole("heading", {
    name: "命中ダメージ分布",
    exact: true,
  });
  await expect(densityHeadings).toHaveCount(2);
  for (const heading of await densityHeadings.all()) {
    await expect(heading).toHaveCSS("margin-top", "8px");
    const tableGap = await heading.evaluate((element) => {
      const table = element.previousElementSibling!;
      return element.getBoundingClientRect().top - table.getBoundingClientRect().bottom;
    });
    expect(tableGap).toBeCloseTo(8, 1);
  }
});
