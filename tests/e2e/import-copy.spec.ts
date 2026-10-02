import { test, expect, expectLoaded, languages } from "./app.fixture";
import enemy from "./fixtures/enemy-1501.json";
import mapData from "./fixtures/map-11.json";
import baseMasterData from "./fixtures/master-data.json";

test.use({
  masterDataJSON: JSON.stringify({ ...baseMasterData, ships: [...baseMasterData.ships, enemy] }),
});

test("pasted deck JSON tolerates surrounding whitespace", async ({ page, runtime }) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page.getByRole("button", { name: "編成を読み込む", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  const deck = { version: 4, hqlv: 100, f1: { s1: { id: 277, lv: 99 } } };
  await dialog
    .getByRole("textbox")
    .first()
    .fill(`  ${JSON.stringify(deck)}  `);
  await dialog
    .locator(".MuiTextField-root")
    .first()
    .locator("..")
    .getByRole("button")
    .last()
    .click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("paragraph").filter({ hasText: /^赤城改$/ })).toBeVisible();
});

test("legacy transfer survives unrelated messages and repeated activation without duplicates", async ({
  page,
  runtime,
}) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  // Keep this test local; exercise receipt of a fixture without opening the old site.
  await page.evaluate(() => {
    window.open = () => null;
  });
  const transfer = page.getByRole("button", { name: "Jervis ORからデータを引き継ぐ", exact: true });
  await transfer.click();
  await transfer.click();
  await page.evaluate(() => {
    window.dispatchEvent(new MessageEvent("message", { origin: "https://example.test", data: {} }));
    window.dispatchEvent(
      new MessageEvent("message", { origin: "https://kcjervis.github.io", data: {} }),
    );
  });
  await expect(page.getByRole("alert").filter({ hasText: "データが適合しません" })).toBeVisible();
  const data = {
    operations: [
      {
        name: "Transferred plan",
        hqLevel: 100,
        side: "Player",
        fleetType: "Single",
        fleets: [],
        landBase: [],
      },
    ],
  };
  await page.evaluate((payload) => {
    window.dispatchEvent(
      new MessageEvent("message", { origin: "https://kcjervis.github.io", data: payload }),
    );
  }, data);
  await expect(page.getByPlaceholder("name", { exact: true })).toHaveValue("Jervis OR");
  await expect(
    page
      .locator(".MuiDrawer-paper .MuiTreeItem-content")
      .filter({ has: page.getByText("Jervis OR", { exact: true }) }),
  ).toHaveCount(1);
  await expect(
    page.locator(".MuiListItemButton-root").getByText("Transferred plan", { exact: true }),
  ).toBeVisible();
});

test("a copied plan keeps its active node selected and removing it clears the analysis", async ({
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
  await page.route(
    (url) =>
      url.hostname === "storage.googleapis.com" && url.pathname === "/kcfleethub/data/maps/11.json",
    (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        json: mapData,
      }),
  );
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page.getByRole("button", { name: "編成を作成", exact: true }).first().click();
  const name = "Plan with node";
  await page.getByPlaceholder("name", { exact: true }).fill(name);
  await page.getByPlaceholder("name", { exact: true }).press("Tab");
  await page.getByRole("button", { name: "艦娘", exact: true }).last().click();
  const ships = page.getByRole("dialog");
  await ships.getByRole("textbox").fill("id277");
  await ships.getByRole("textbox").press("Tab");
  await ships.getByRole("button", { name: "赤城改", exact: true }).click();
  await page.getByRole("tab", { name: "ダメージ計算機", exact: true }).click();
  await page.getByRole("button", { name: "マップから入力", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "単縦陣", exact: true }).click();
  await page.getByRole("button", { name: "メニューを開く", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "コピー", exact: true }).click();
  const plans = page.getByRole("treeitem").getByText(name, { exact: true });
  await expect(plans).toHaveCount(2);
  await plans.last().click();
  await page.getByRole("tab", { name: "ダメージ計算機", exact: true }).click();
  const node = page.getByRole("tab", { name: /^1-1 A/ });
  await expect(node).toHaveAttribute("aria-selected", "true");
  await node.getByRole("button").click();
  await expect(node).toHaveCount(0);
  await expect(page.getByText(/ID:1501/)).toHaveCount(0);
  await plans.first().click();
  await expect(page.getByRole("tab", { name: /^1-1 A/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText(/ID:1501/).first()).toBeVisible();
});
