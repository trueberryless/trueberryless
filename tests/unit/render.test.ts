import { describe, expect, test } from "vitest";

import { createProfileData } from "../../src/data.ts";
import { loadFonts } from "../../src/font.ts";
import { inlineSvg, renderProfile } from "../../src/render.ts";
import { loadFixtureSources } from "../../src/sources.ts";

describe("inlineSvg", () => {
  test("places an SVG into the given rectangle and keeps its view box", () => {
    expect(
      inlineSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -20 880 148"><rect/></svg>',
        { height: 136, width: 808, x: 16, y: 860 }
      )
    ).toBe(
      '<svg x="16" y="860" width="808" height="136" viewBox="-16 -20 880 148" preserveAspectRatio="xMidYMid meet"><rect/></svg>'
    );
  });

  test("derives the view box from the size when there is none", () => {
    expect(
      inlineSvg('<svg width="18" height="14"><rect/></svg>', {
        height: 14,
        width: 18,
        x: 1,
        y: 2,
      })
    ).toContain('viewBox="0 0 18 14"');
  });
});

describe("renderProfile", () => {
  test("flattens the static parts and keeps the animations as vectors", async () => {
    const [data, fonts] = await Promise.all([
      loadFixtureSources().then(createProfileData),
      loadFonts(),
    ]);

    const svg = await renderProfile(data, "dark", fonts);

    expect(svg).toMatch(
      /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="840"/
    );
    expect(svg).toContain(
      `<title id="title">${data.bluesky.displayName} (trueberryless) on GitHub</title>`
    );
    expect(svg.match(/data:image\/webp;base64,/g)).toHaveLength(1);
    expect(svg).toContain("Generated with https://github.com/Platane/snk");
    expect(svg).not.toContain("<foreignObject");
    expect(svg).not.toContain("<filter");
    expect(svg).not.toContain("<mask");
  }, 60_000);
});
