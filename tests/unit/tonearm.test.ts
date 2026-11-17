import { describe, expect, test } from "vitest";

import { createTonearmSvg } from "../../src/tonearm.ts";

const CARD = { height: 232, width: 352, x: 16, y: 376 };
const VINYL = { height: 196, width: 196, x: 215, y: 394 };

describe("createTonearmSvg", () => {
  test("rests the needle on the record while the track plays", () => {
    expect(createTonearmSvg(CARD, VINYL, { isPlaying: true })).toContain(
      'transform="rotate(0 378 6)"'
    );
  });

  test("swings the arm up and away from the record otherwise", () => {
    expect(createTonearmSvg(CARD, VINYL, { isPlaying: false })).toContain(
      'transform="rotate(28 378 6)"'
    );
  });

  test("uses no filters, since it is drawn on top of the spinning record", () => {
    expect(createTonearmSvg(CARD, VINYL, { isPlaying: true })).not.toContain(
      "<filter"
    );
  });
});
