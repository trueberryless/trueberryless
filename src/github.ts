export const GITHUB_LOGIN = "trueberryless";

const GRAPHQL_URL = "https://api.github.com/graphql";
const PULL_REQUEST_COUNT = 4;

// `sort:updated-desc` is the closest the search API gets to "recently merged", so we
// fetch a few more and sort them by their merge date ourselves.
const QUERY = `query ($login: String!, $merged: String!, $reviewed: String!, $latest: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
      }
    }
    repositoriesContributedTo(
      contributionTypes: [COMMIT, PULL_REQUEST, PULL_REQUEST_REVIEW]
      includeUserRepositories: false
    ) {
      totalCount
    }
  }
  merged: search(query: $merged, type: ISSUE) {
    issueCount
  }
  reviewed: search(query: $reviewed, type: ISSUE) {
    issueCount
  }
  latest: search(query: $latest, type: ISSUE, first: 20) {
    nodes {
      ... on PullRequest {
        mergedAt
        number
        repository {
          nameWithOwner
        }
        title
      }
    }
  }
}`;

/**
 * Fetches the contribution stats and the latest pull requests merged into other people's
 * repositories. The token only needs to read public data, so the workflow's `GITHUB_TOKEN`
 * is enough.
 */
export async function fetchGitHubActivity(
  token: string
): Promise<GitHubActivity> {
  const response = await fetch(GRAPHQL_URL, {
    body: JSON.stringify({
      query: QUERY,
      variables: {
        latest: `author:${GITHUB_LOGIN} is:pr is:merged -user:${GITHUB_LOGIN} sort:updated-desc`,
        login: GITHUB_LOGIN,
        merged: `author:${GITHUB_LOGIN} is:pr is:merged`,
        reviewed: `reviewed-by:${GITHUB_LOGIN} is:pr -author:${GITHUB_LOGIN}`,
      },
    }),
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json",
      "user-agent": `${GITHUB_LOGIN}-profile`,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `[profile] The GitHub API answered with \`${response.status} ${response.statusText}\`.`
    );
  }

  const { data, errors } = (await response.json()) as GraphQLResponse;
  if (!data || errors?.length) {
    throw new Error(
      `[profile] The GitHub API returned errors: ${errors?.map(({ message }) => message).join(" ") ?? "no data"}`
    );
  }

  return parseGitHubActivity(data);
}

export function parseGitHubActivity(data: GraphQLData): GitHubActivity {
  const pullRequests = data.latest.nodes
    .filter((node): node is PullRequestNode => Boolean(node.mergedAt))
    .toSorted((a, b) => b.mergedAt.localeCompare(a.mergedAt))
    .slice(0, PULL_REQUEST_COUNT)
    .map(({ mergedAt, number, repository, title }) => ({
      mergedAt,
      number,
      repository: repository.nameWithOwner,
      title,
    }));

  return {
    pullRequests,
    stats: {
      contributedRepositories: data.user.repositoriesContributedTo.totalCount,
      contributions:
        data.user.contributionsCollection.contributionCalendar
          .totalContributions,
      mergedPullRequests: data.merged.issueCount,
      reviewedPullRequests: data.reviewed.issueCount,
    },
  };
}

export interface GitHubActivity {
  pullRequests: MergedPullRequest[];
  stats: GitHubStats;
}

interface GitHubStats {
  contributedRepositories: number;
  contributions: number;
  mergedPullRequests: number;
  reviewedPullRequests: number;
}

export interface MergedPullRequest {
  mergedAt: string;
  number: number;
  repository: string;
  title: string;
}

export interface GraphQLData {
  latest: { nodes: Array<PullRequestNode | Record<string, never>> };
  merged: { issueCount: number };
  reviewed: { issueCount: number };
  user: {
    contributionsCollection: {
      contributionCalendar: { totalContributions: number };
    };
    repositoriesContributedTo: { totalCount: number };
  };
}

interface GraphQLResponse {
  data?: GraphQLData;
  errors?: Array<{ message: string }>;
}

interface PullRequestNode {
  mergedAt: string;
  number: number;
  repository: { nameWithOwner: string };
  title: string;
}
