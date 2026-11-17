import { describe, expect, test } from "vitest";

import { createProfileData } from "../../src/data.ts";
import { loadFonts } from "../../src/font.ts";
import { toDataUri } from "../../src/image.ts";
import {
  deduplicateImages,
  inlineAnimatedImages,
  renderProfile,
} from "../../src/render.ts";
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

describe("deduplicateImages", () => {
  test("defines a repeated image once and keeps the clipping on a group", () => {
    const href = "data:image/jpeg;base64,AAAA";

    expect(
      deduplicateImages(
        `<svg width="9"><image x="1" y="2" width="4" height="4" href="${href}" preserveAspectRatio="none" clip-path="url(#a)"/><image x="5" y="6" width="8" height="8" href="${href}" preserveAspectRatio="none" mask="url(#b)"/></svg>`
      )
    ).toBe(
      `<svg width="9"><defs><symbol id="image-0" viewBox="0 0 4 4" preserveAspectRatio="none"><image width="4" height="4" href="${href}" preserveAspectRatio="none"/></symbol></defs><g clip-path="url(#a)"><use href="#image-0" x="1" y="2" width="4" height="4"/></g><g mask="url(#b)"><use href="#image-0" x="5" y="6" width="8" height="8"/></g></svg>`
    );
  });

  test("leaves images that appear once alone", () => {
    const svg =
      '<svg><image x="0" y="0" width="1" height="1" href="data:image/jpeg;base64,AAAA"/></svg>';

    expect(deduplicateImages(svg)).toBe(svg);
  });
});

describe("renderProfile", () => {
  test("renders the fixtures with animations inlined", async () => {
    const [data, fonts] = await Promise.all([
      loadFixtureSources().then(createProfileData),
      loadFonts(),
    ]);

    const svg = await renderProfile(data, "dark", fonts);

    expect(data.music).toBeDefined();
    expect(svg).toMatch(/^<svg width="840" height="\d+"/);
    expect(svg).toContain(
      `<title id="title">${data.bluesky.displayName} (trueberryless) on GitHub</title>`
    );
    expect(svg).toContain("Generated with https://github.com/Platane/snk");
    expect(svg).toContain("@keyframes sheen-move");
    expect(svg).not.toContain("<foreignObject");
  }, 30_000);
});
