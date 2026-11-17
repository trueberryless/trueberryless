import { describe, expect, test } from "vitest";

import { cropSnake, recolorSnake } from "../../src/snake.ts";

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

describe("recolorSnake", () => {
  test("replaces the color variables", () => {
    expect(
      recolorSnake(
        "<svg><style>:root{--cb:#1b1f230a;--cs:purple;--ce:#161b22}.c{fill:var(--ce)}</style></svg>",
        {
          c0: "#000",
          c1: "#111",
          c2: "#222",
          c3: "#333",
          c4: "#444",
          cb: "#555",
          ce: "#666",
          cs: "#777",
        }
      )
    ).toBe(
      "<svg><style>:root{--c0:#000;--c1:#111;--c2:#222;--c3:#333;--c4:#444;--cb:#555;--ce:#666;--cs:#777}.c{fill:var(--ce)}</style></svg>"
    );
  });
});
