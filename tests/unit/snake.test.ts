import { describe, expect, test } from "vitest";

import { cropSnake } from "../../src/snake.ts";

describe("cropSnake", () => {
  test("crops the view box to the grid and its margin", () => {
    expect(
      cropSnake(
        '<svg viewBox="-16 -32 880 192" width="880" height="192" xmlns="http://www.w3.org/2000/svg"><rect/></svg>'
      )
    ).toBe(
      '<svg viewBox="-16 -20 880 148" width="880" height="148" xmlns="http://www.w3.org/2000/svg"><rect/></svg>'
    );
  });

  test("leaves an SVG without a view box alone", () => {
    expect(cropSnake("<svg><rect/></svg>")).toBe("<svg><rect/></svg>");
  });
});
