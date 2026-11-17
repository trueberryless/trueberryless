import { describe, expect, test } from "vitest";

import { getMilestoneProgress } from "../../src/milestone.ts";

describe("getMilestoneProgress", () => {
  test("measures the way to the next milestone", () => {
    expect(getMilestoneProgress(354)).toEqual({
      milestone: 500,
      progress: 0.708,
    });
    expect(getMilestoneProgress(46)).toEqual({ milestone: 50, progress: 0.92 });
  });

  test("moves on to the next milestone once one is reached", () => {
    expect(getMilestoneProgress(50)).toEqual({ milestone: 100, progress: 0.5 });
  });

  test("keeps counting in steps of 10,000 past the last milestone", () => {
    expect(getMilestoneProgress(12_000).milestone).toBe(20_000);
  });
});
