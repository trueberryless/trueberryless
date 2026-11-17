import { describe, expect, test } from "vitest";

import { createProfileData } from "../../src/data.ts";
import { loadFonts } from "../../src/font.ts";
import { toDataUri } from "../../src/image.ts";
import { inlineAnimatedImages, renderProfile } from "../../src/render.ts";
import { loadFixtureSources } from "../../src/sources.ts";

describe("inlineAnimatedImages", () => {
  test("inlines an animated SVG image and keeps its clipping", () => {
    const animated = toDataUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><style>@keyframes a{}</style><rect/></svg>',
      "image/svg+xml"
    );

    expect(
      inlineAnimatedImages(
        `<svg><image x="4" y="8" width="20" height="20" href="${animated}" clip-path="url(#c)"/></svg>`
      )
    ).toBe(
      '<svg><g clip-path="url(#c)"><svg height="20" width="20" x="4" y="8" viewBox="0 0 10 10" preserveAspectRatio="xMidYMid meet"><style>@keyframes a{}</style><rect/></svg></g></svg>'
    );
  });

  test("leaves static images alone", () => {
    const image = `<image x="0" y="0" width="1" height="1" href="${toDataUri("<svg><rect/></svg>", "image/svg+xml")}"/>`;

    expect(inlineAnimatedImages(image)).toBe(image);
  });
});

describe("renderProfile", () => {
  test("renders the fixtures with animations inlined", async () => {
    const [data, fonts] = await Promise.all([
      loadFixtureSources().then(createProfileData),
      loadFonts(),
    ]);

    const svg = await renderProfile(data, "dark", fonts);

    expect(data.astro.contributions).toBeDefined();
    expect(data.track).toBeDefined();

    expect(svg).toMatch(/^<svg width="840" height="\d+"/);
    expect(svg).toContain(
      '<title id="title">Felix Schneider (trueberryless) on GitHub</title>'
    );
    expect(svg).toContain("@keyframes eq-bounce");
    expect(svg).toContain("Generated with https://github.com/Platane/snk");
    expect(svg).not.toContain("<foreignObject");
  }, 30_000);
});
