import { describe, expect, test } from "vitest";

import { createProgressRingSvg } from "../../src/ring.ts";

describe("createProgressRingSvg", () => {
  test("fills the ring up to the progress", () => {
    const svg = createProgressRingSvg(100, 0.5, {
      color: "#a371f7",
      track: "#333",
    });
    const circumference = 2 * Math.PI * 48.5;

    expect(svg).toContain(
      `stroke-dasharray="${(circumference / 2).toFixed(2)} ${circumference.toFixed(2)}"`
    );
  });

  test("clamps progress outside of 0 to 1", () => {
    expect(
      createProgressRingSvg(100, 2, { color: "#fff", track: "#000" })
    ).toContain(`stroke-dasharray="${(2 * Math.PI * 48.5).toFixed(2)}`);
    expect(
      createProgressRingSvg(100, -1, { color: "#fff", track: "#000" })
    ).toContain('stroke-dasharray="0.00 ');
  });
});
