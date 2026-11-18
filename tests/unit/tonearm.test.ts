import { describe, expect, test } from "vitest";

import { createTonearmSvg } from "../../src/tonearm.ts";

const CARD = { height: 232, width: 352, x: 16, y: 376 };
const VINYL = { height: 196, width: 196, x: 215, y: 394 };
const ARM_RE =
  /<g transform="rotate\(([\d.-]+) ([\d.]+) ([\d.]+)\)">(?:<line[^>]*\/>)<line x1="[\d.]+" y1="[\d.]+" x2="([\d.]+)" y2="([\d.]+)"/;

describe("createTonearmSvg", () => {
  test("rests the needle on the record inside the card while the track plays", () => {
    const [, rotation, pivotX = "0", , needleX = "0", needleY = "0"] =
      ARM_RE.exec(createTonearmSvg(CARD, VINYL, { isPlaying: true })) ?? [];
    const center = {
      x: VINYL.x - CARD.x + VINYL.width / 2,
      y: VINYL.y - CARD.y + VINYL.height / 2,
    };

    expect(rotation).toBe("0");
    expect(Number(needleX)).toBeLessThan(CARD.width);
    expect(Number(needleY)).toBeLessThan(CARD.height);
    expect(
      Math.hypot(Number(needleX) - center.x, Number(needleY) - center.y)
    ).toBeCloseTo((VINYL.width / 2) * 0.64, 0);
    expect(Number(pivotX)).toBeGreaterThan(CARD.width);
  });

  test("swings the arm away from the record otherwise", () => {
    const [, rotation] =
      ARM_RE.exec(createTonearmSvg(CARD, VINYL, { isPlaying: false })) ?? [];

    expect(Number(rotation)).not.toBe(0);
  });

  test("uses no filters", () => {
    expect(createTonearmSvg(CARD, VINYL, { isPlaying: true })).not.toContain(
      "<filter"
    );
  });
});
