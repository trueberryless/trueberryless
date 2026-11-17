import AxeBuilder from "@axe-core/playwright";
import { test as base } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { pathToFileURL } from "node:url";

import type { ThemeName } from "../../src/theme.ts";

const PREVIEW_URL = pathToFileURL(
  new URL("../../dist/index.html", import.meta.url).pathname
).href;

export const test = base.extend<{ previewPage: PreviewPage }>({
  previewPage: async ({ page }, use) => {
    const previewPage = new PreviewPage(page);
    await previewPage.goto();
    await use(previewPage);
  },
});

export { expect } from "@playwright/test";

class PreviewPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(PREVIEW_URL);
  }

  analyzeAccessibility() {
    return new AxeBuilder({ page: this.page }).analyze();
  }

  getProfile(themeName: ThemeName): Locator {
    return this.page.getByRole("img", { name: `Profile in ${themeName} mode` });
  }

  async getNaturalWidth(themeName: ThemeName) {
    return this.getProfile(themeName).evaluate(
      (image: HTMLImageElement) => image.naturalWidth
    );
  }

  captureProfile(themeName: ThemeName) {
    return this.getProfile(themeName).screenshot({ animations: "allow" });
  }
}
