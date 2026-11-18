import { THEME_NAMES } from "../../src/theme.ts";
import { expect, test } from "./fixtures.ts";

test("the preview has no accessibility violations", async ({ previewPage }) => {
  const results = await previewPage.analyzeAccessibility();

  expect(results.violations).toEqual([]);
});

for (const themeName of THEME_NAMES) {
  test.describe(`the ${themeName} profile`, () => {
    test("loads as an image at its full width", async ({ previewPage }) => {
      await expect(previewPage.getProfile(themeName)).toBeVisible();

      await expect.poll(() => previewPage.getNaturalWidth(themeName)).toBe(840);
    });

    test("plays its animations", async ({ previewPage }) => {
      await expect(previewPage.getProfile(themeName)).toBeVisible();
      const firstFrame = await previewPage.captureProfile(themeName);

      await expect
        .poll(
          async () =>
            (await previewPage.captureProfile(themeName)).equals(firstFrame),
          { timeout: 10_000 }
        )
        .toBe(false);
    });
  });
}
