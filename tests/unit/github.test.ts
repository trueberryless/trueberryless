import { describe, expect, test } from "vitest";

import { getAvatarLogins, parseGitHubActivity } from "../../src/github.ts";
import type { GitHubData } from "../../src/github.ts";

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
    const { latestPullRequests } = parseGitHubActivity(
      createData([
        ["withastro", "2026-11-10"],
        ["withastro", "2026-11-17"],
        ["npmx-dev", "2026-11-12"],
        ["withastro", "2026-11-01"],
        ["bombshell-dev", "2026-11-15"],
      ])
    );

    expect(
      latestPullRequests.map(({ mergedAt, owner }) => `${owner} ${mergedAt}`)
    ).toEqual([
      "withastro 2026-11-17",
      "bombshell-dev 2026-11-15",
      "npmx-dev 2026-11-12",
      "withastro 2026-11-10",
    ]);
  });

  test("counts merged pull requests by owner", () => {
    const { topOwners } = parseGitHubActivity(
      createData([
        ["npmx-dev", "2026-11-01"],
        ["withastro", "2026-11-02"],
        ["withastro", "2026-11-03"],
        ["bombshell-dev", "2026-11-04"],
      ])
    );

    expect(topOwners).toEqual([
      { login: "withastro", mergedPullRequests: 2 },
      { login: "bombshell-dev", mergedPullRequests: 1 },
      { login: "npmx-dev", mergedPullRequests: 1 },
    ]);
  });

  test("leaves out personal organizations from the memberships", () => {
    const data = createData([]);
    data.organizations = [
      { login: "npmx-dev" },
      { login: "trueberryless-org" },
    ];

    expect(parseGitHubActivity(data).memberships).toEqual(["npmx-dev"]);
  });
});

describe("getAvatarLogins", () => {
  test("lists every shown login once", () => {
    const activity = parseGitHubActivity({
      ...createData([
        ["withastro", "2026-11-01"],
        ["npmx-dev", "2026-11-02"],
      ]),
      organizations: [{ login: "npmx-dev" }, { login: "nuxt" }],
    });

    expect(getAvatarLogins(activity)).toEqual([
      "npmx-dev",
      "nuxt",
      "withastro",
    ]);
  });
});

function createData(
  pullRequests: Array<[owner: string, mergedAt: string]>
): GitHubData {
  return {
    organizations: [],
    pullRequests: pullRequests.map(([owner, mergedAt], index) => ({
      mergedAt,
      number: index + 1,
      repository: { name: "repo", owner: { login: owner } },
      title: `Pull request ${index + 1}`,
    })),
    stats: {
      merged: { issueCount: 1211 },
      reviewed: { issueCount: 974 },
      user: {
        contributionsCollection: {
          contributionCalendar: { totalContributions: 3079 },
        },
        repositoriesContributedTo: { totalCount: 89 },
      },
    },
  };
}
