const MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10_000];

export function getMilestoneProgress(count: number): MilestoneProgress {
  const milestone =
    MILESTONES.find((value) => value > count) ??
    Math.ceil((count + 1) / 10_000) * 10_000;

  return { milestone, progress: count / milestone };
}

export interface MilestoneProgress {
  milestone: number;
  progress: number;
}
