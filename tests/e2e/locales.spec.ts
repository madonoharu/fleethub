import { test, expect, expectLoaded, languages, translations } from "./app.fixture";

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
    const head = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? "";
    expect(head).toContain('name="emotion-insertion-point"');
    const layerOrder = [...head.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/g)].find(
      ([, attributes, css]) =>
        attributes.includes("data-emotion=") &&
        /^@layer theme,\s*base,\s*mui,\s*components,\s*utilities;$/.test(css.trim()),
    );
    // Emotion must hydrate the server's layer-order node along with MUI styles.
    expect(layerOrder?.[1]).toMatch(/data-emotion="css css-global /);
    const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ?? "";
    expect(body).not.toMatch(/<style\b[^>]*data-emotion=/);
    await expectLoaded(page, language, runtime);
    await expect(page.locator('meta[name="emotion-insertion-point"]')).toHaveCount(1);
    await expect(page.locator("body style[data-emotion]")).toHaveCount(0);
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
    await page.getByRole("menuitem", { name: language.label, exact: true }).click();
    await expectLoaded(page, language, runtime);
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(language.locale === "ja" ? "/" : `/${language.locale}`);
    current = language.label;
  }
});
