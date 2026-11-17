import { describe, expect, test } from "vitest";

import { parseGitHubActivity } from "../../src/github.ts";
import type { GraphQLData } from "../../src/github.ts";

describe("parseGitHubActivity", () => {
  test("maps the stats", () => {
    expect(parseGitHubActivity(createData([])).stats).toEqual({
      contributedRepositories: 89,
      contributions: 3079,
      mergedPullRequests: 1211,
      reviewedPullRequests: 974,
    });
  });

  test("keeps the four most recently merged pull requests", () => {
    const { pullRequests } = parseGitHubActivity(
      createData([
        "2026-11-10",
        "2026-11-17",
        "2026-11-12",
        "2026-11-01",
        "2026-11-15",
      ])
    );

    expect(pullRequests.map(({ mergedAt }) => mergedAt)).toEqual([
      "2026-11-17",
      "2026-11-15",
      "2026-11-12",
      "2026-11-10",
    ]);
  });

  test("skips search results that are not pull requests", () => {
    const data = createData(["2026-11-17"]);
    data.latest.nodes.push({});

    expect(parseGitHubActivity(data).pullRequests).toHaveLength(1);
  });
});

function createData(mergedDates: string[]): GraphQLData {
  return {
    latest: {
      nodes: mergedDates.map((mergedAt, index) => ({
        mergedAt,
        number: index + 1,
        repository: { nameWithOwner: "withastro/starlight" },
        title: `Pull request ${index + 1}`,
      })),
    },
    merged: { issueCount: 1211 },
    reviewed: { issueCount: 974 },
    user: {
      contributionsCollection: {
        contributionCalendar: { totalContributions: 3079 },
      },
      repositoriesContributedTo: { totalCount: 89 },
    },
  };
}
