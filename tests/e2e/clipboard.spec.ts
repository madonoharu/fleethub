import type { Locator } from "@playwright/test";

import { test, expect, expectLoaded, languages } from "./app.fixture";

type ClipboardTestWindow = Window & {
  __clipboardTest: {
    read: () => Promise<string>;
    write: (value: string) => Promise<void>;
    rejectedWrites: number;
  };
};

test("copy fallback writes to the native clipboard while dialogs retain focus", async ({
  page,
  context,
  runtime,
}) => {
  await page.goto("/");
  await expectLoaded(page, languages[0], runtime);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: new URL(page.url()).origin,
  });
  await page.bringToFront();
  await page.evaluate(() => {
    const state = {
      read: navigator.clipboard.readText.bind(navigator.clipboard),
      write: navigator.clipboard.writeText.bind(navigator.clipboard),
      rejectedWrites: 0,
    };
    (window as unknown as ClipboardTestWindow).__clipboardTest = state;
    // Keep native reading/writing for this test. Only the application's modern
    // write API fails; document.execCommand and copy events remain native.
    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value: async () => {
        state.rejectedWrites += 1;
        throw new DOMException("Fallback requested by E2E", "NotAllowedError");
      },
    });
  });

  const checkCopy = async (field: Locator, attempt: number, stripNewlines = false) => {
    const dialog = page.getByRole("dialog");
    const button = dialog.getByRole("button", {
      name: "クリップボードにコピー",
      exact: true,
    });
    const expected = await field.inputValue();
    expect(expected.length).toBeGreaterThan(0);

    // Seed fixture text before every read, so this test never inspects the
    // user's existing clipboard or mistakes an earlier copy for success.
    const sentinel = `clipboard-regression-sentinel-${attempt}`;
    await page.evaluate(
      (value) => (window as unknown as ClipboardTestWindow).__clipboardTest.write(value),
      sentinel,
    );
    expect(
      await page.evaluate(() => (window as unknown as ClipboardTestWindow).__clipboardTest.read()),
    ).toBe(sentinel);

    await button.click();
    await expect
      .poll(async () => {
        const actual = await page.evaluate(() =>
          (window as unknown as ClipboardTestWindow).__clipboardTest.read(),
        );
        // HTML input values omit the KCS source's trailing newline.
        return stripNewlines ? actual.replace(/[\r\n]/g, "") : actual;
      })
      .toBe(stripNewlines ? expected.replace(/[\r\n]/g, "") : expected);
    expect(
      await page.evaluate(
        () => (window as unknown as ClipboardTestWindow).__clipboardTest.rejectedWrites,
      ),
    ).toBe(attempt);
    await expect(dialog).toBeVisible();
    await expect(button).toBeFocused();
    await page.keyboard.press("Tab");
    await expect
      .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
  };

  await page.getByRole("button", { name: "編成を作成", exact: true }).first().click();
  await page.getByRole("button", { name: "メニューを開く", exact: true }).click();
  await checkCopy(
    page.getByRole("dialog").getByRole("textbox", { name: "デッキビルダー形式", exact: true }),
    1,
  );
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "編成を読み込む", exact: true }).first().click();
  const kcs = page.getByRole("dialog").getByRole("textbox").last();
  await expect(kcs).toHaveValue(/function/);
  await checkCopy(kcs, 2, true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
