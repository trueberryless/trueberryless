// Each milestone is at most 2.5 times the one before, so the way to the next one is
// always at least 40% done and a ring never looks empty.
const MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10_000];

/** Finds the next milestone above a count and how far the count is on the way there. */
export function getMilestoneProgress(count: number): MilestoneProgress {
  const milestone =
    MILESTONES.find((value) => value > count) ??
    Math.ceil((count + 1) / 10_000) * 10_000;

  return { milestone, progress: count / milestone };
}

export interface MilestoneProgress {
  milestone: number;
  /** A value between 0 and 1. */
  progress: number;
}
