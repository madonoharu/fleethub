import {
  test,
  expect,
  expectLoaded,
  languages,
  translations,
  hqLevelInput,
  setHqLevel,
} from "./app.fixture";

test("real Rust fleet LOS updates and HQ input clamps both bounds", async ({
  page,
  runtime,
}) => {
  const text = translations("ja");
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page
    .getByRole("button", { name: text.CreateComp, exact: true })
    .first()
    .click();

  // For an empty fleet Rust computes 12 - ceil(0.4 * HQ) for each of the
  // four node factors. These exact values exercise core execution, not only
  // fetching or instantiating the Wasm module.
  await expect(
    page.getByText(`${text.FighterPower} 0`, { exact: true }),
  ).toBeVisible();
  const input = hqLevelInput(page);
  await setHqLevel(page, "100");
  await expect(input).toHaveValue("100");
  await expect(page.getByText("-28.00", { exact: true })).toHaveCount(4);

  await setHqLevel(page, "999");
  await expect(input).toHaveValue("120");
  await expect(page.getByText("-36.00", { exact: true })).toHaveCount(4);
  await input.hover();
  await page
    .getByRole("button", { name: "increase", exact: true })
    .first()
    .click();
  await expect(input).toHaveValue("120");
  await page
    .getByRole("button", { name: "decrease", exact: true })
    .first()
    .click();
  await expect(input).toHaveValue("119");

  await setHqLevel(page, "0");
  await expect(input).toHaveValue("1");
  await expect(page.getByText("11.00", { exact: true })).toHaveCount(4);
  await input.hover();
  await page
    .getByRole("button", { name: "decrease", exact: true })
    .first()
    .click();
  await expect(input).toHaveValue("1");
  await page
    .getByRole("button", { name: "increase", exact: true })
    .first()
    .click();
  await expect(input).toHaveValue("2");
});

test("selecting a real ship changes the Rust-generated fleet LOS", async ({
  page,
  runtime,
}) => {
  const text = translations("ja");
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await page
    .getByRole("button", { name: text.CreateComp, exact: true })
    .first()
    .click();
  await setHqLevel(page, "100");
  await expect(page.getByText("-28.00", { exact: true })).toHaveCount(4);

  await page
    .getByRole("button", { name: text.Ship, exact: true })
    .last()
    .click();
  const selection = page.getByRole("dialog");
  const search = selection.getByRole("textbox");
  await search.fill("id277");
  await search.press("Tab");
  await selection.getByRole("button", { name: "赤城改", exact: true }).click();
  await expect(selection).not.toBeVisible();
  await expect(
    page.getByRole("paragraph").filter({ hasText: /^赤城改$/ }),
  ).toBeVisible();

  // The snapshot's Akagi Kai has naked LOS 89 at its default level 99.
  // All four factors produce sqrt(89) - 2 + 12 - ceil(0.4 * 100).
  await expect(page.getByText("-20.57", { exact: true })).toHaveCount(4);
});
