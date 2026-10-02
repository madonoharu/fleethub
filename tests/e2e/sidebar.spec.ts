import { test, expect, expectLoaded, languages } from "./app.fixture";

test("sidebar scrolls the tree without scrolling individual rows or its header", async ({
  page,
  runtime,
}) => {
  await page.setViewportSize({ width: 390, height: 360 });
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);

  const drawer = page.locator(".MuiDrawer-paper");
  const tree = drawer.getByRole("tree");
  const createFolder = drawer.getByRole("button", {
    name: "フォルダを作成",
    exact: true,
  });
  const headerBounds = await createFolder.boundingBox();

  await expect(tree).toHaveCSS("overflow-x", "auto");
  await expect(tree).toHaveCSS("overflow-y", "auto");
  for (let i = 0; i < 18; i++) await createFolder.click();

  // TreeView's root class is also present on TreeItem in MUI X 9. A broad
  // descendant selector would turn every row into a nested scroll area.
  await expect
    .poll(() =>
      tree.getByRole("treeitem").evaluateAll((items) =>
        items.every((item) => {
          const style = getComputedStyle(item);
          return style.overflowX === "visible" && style.overflowY === "visible";
        }),
      ),
    )
    .toBe(true);
  await expect.poll(() => tree.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  expect(await tree.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);

  await tree.hover({ position: { x: 200, y: 100 } });
  await page.mouse.wheel(0, 1000);
  await expect.poll(() => tree.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect(await createFolder.boundingBox()).toEqual(headerBounds);

  const lastFolder = tree
    .getByRole("treeitem")
    .filter({ has: page.getByText("Folder 18", { exact: true }) })
    .last();
  await lastFolder.getByText("Folder 18", { exact: true }).hover();
  // The folder's drop outline is painted outside its label bounds.
  await expect(lastFolder.locator(".MuiTreeItem-label")).toHaveCSS("overflow", "visible");
  await expect(lastFolder.getByRole("button")).toHaveCount(3);
  await expect(lastFolder.getByRole("button", { name: "メニュー", exact: true })).toBeVisible();
  expect(await createFolder.boundingBox()).toEqual(headerBounds);
});
