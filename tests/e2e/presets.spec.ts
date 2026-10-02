import { test, expect, expectLoaded, languages, translations } from "./app.fixture";

test("deleting the selected preset shows the remaining editor and permits registering again", async ({
  page,
  runtime,
}) => {
  const text = translations("ja");
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page.getByRole("button", { name: text.CreateComp, exact: true }).first().click();
  await page.getByRole("button", { name: text.Ship, exact: true }).nth(1).click();
  const dialog = page.getByRole("dialog");
  const search = dialog.getByRole("textbox");
  await search.fill("id277");
  await search.press("Tab");
  await dialog.getByRole("button", { name: "赤城改", exact: true }).click();
  await expect(dialog).not.toBeVisible();

  const card = page
    .getByRole("paragraph")
    .filter({ hasText: /^赤城改$/ })
    .locator("..")
    .locator("..");
  await card.hover();
  await card.getByRole("button", { name: "プリセット", exact: true }).click();

  const register = dialog.getByRole("button", {
    name: "現在の装備をプリセットに登録",
    exact: true,
  });
  const name = dialog.getByRole("textbox", { name: "Name", exact: true });
  const row = (value: string) => dialog.getByRole("button", { name: value, exact: true });
  // The editor's header contains the Name field and ends with DeleteButton.
  // MUI removes icon data-testid attributes in optimized builds.
  const editor = name.locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]');
  const remove = editor.locator(":scope > div").first().getByRole("button").last();

  await expect(name).toHaveCount(0);
  await register.click();
  await expect(name).toHaveValue("赤城改");
  await name.fill("Preset A");
  await name.press("Tab");
  await expect(row("Preset A")).toBeVisible();

  await register.click();
  await row("赤城改").click();
  await expect(name).toHaveValue("赤城改");
  await name.fill("Preset B");
  await name.press("Tab");
  await expect(row("Preset B")).toBeVisible();
  await row("Preset A").click();
  await expect(name).toHaveValue("Preset A");
  await row("Preset B").click();
  await expect(name).toHaveValue("Preset B");

  await remove.click();
  await expect(row("Preset B")).toHaveCount(0);
  await expect(row("Preset A")).toBeVisible();
  await expect(name).toHaveValue("Preset A");
  await expect(row("Preset A")).toHaveClass(/MuiButton-contained/);

  await remove.click();
  await expect(row("Preset A")).toHaveCount(0);
  await expect(name).toHaveCount(0);

  await register.click();
  await expect(name).toHaveValue("赤城改");
  await expect(row("赤城改")).toHaveClass(/MuiButton-contained/);
  await name.fill("Preset C");
  await name.press("Tab");
  await expect(row("Preset C")).toBeVisible();
  await expect(name).toHaveValue("Preset C");
});
