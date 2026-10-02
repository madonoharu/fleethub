import {
  test,
  expect,
  expectLoaded,
  languages,
  translations,
} from "./app.fixture";

for (const language of languages) {
  test(`direct ${language.locale} route initializes translated UI and real Wasm`, async ({
    page,
    runtime,
  }) => {
    const path = language.locale === "ja" ? "/" : `/${language.locale}`;
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const html = await response!.text();
    expect(html).toMatch(new RegExp(`<html[^>]*\\blang="${language.locale}"`));
    const serverTitle = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
    expect(serverTitle).toContain(translations(language.locale).meta.title);
    await expectLoaded(page, language, runtime);
  });
}

test("language menu navigates all five locales and returns to Japanese", async ({
  page,
  runtime,
}) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);

  let current = languages[0].label as string;
  for (const language of [...languages.slice(1), languages[0]]) {
    await page.getByRole("button", { name: current, exact: true }).click();
    await page
      .getByRole("menuitem", { name: language.label, exact: true })
      .click();
    await expectLoaded(page, language, runtime);
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(language.locale === "ja" ? "/" : `/${language.locale}`);
    current = language.label;
  }
});
