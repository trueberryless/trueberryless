import { describe, expect, test } from "vitest";

import { formatNumber, formatShortDate } from "../../src/format.ts";

describe("formatNumber", () => {
  test("groups thousands", () => {
    expect(formatNumber(89)).toBe("89");
    expect(formatNumber(3079)).toBe("3,079");
  });
});

describe("formatShortDate", () => {
  test("formats the day in UTC", () => {
    expect(formatShortDate("2026-11-17T23:30:00Z")).toBe("17 Nov");
    expect(formatShortDate("2026-01-02T00:10:00Z")).toBe("2 Jan");
  });
});
