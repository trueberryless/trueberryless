export const GITHUB_LOGIN = "trueberryless";

const API_URL = "https://api.github.com";
const PULL_REQUEST_COUNT = 4;
const FEATURED_OWNERS = new Set([
  "all-contributors",
  "bombshell-dev",
  "catppuccin",
  "changesets",
  "danielroe",
  "npmx-dev",
  "withastro",
]);
const MAX_SEARCH_PAGES = 10;
const REQUEST_TIMEOUT = 60_000;

const EXTERNAL_MERGED_QUERY = `author:${GITHUB_LOGIN} is:pr is:merged -user:${GITHUB_LOGIN}`;

const STATS_QUERY = `query ($login: String!, $merged: String!, $reviewed: String!) {
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
}`;

const MERGED_PULL_REQUESTS_QUERY = `query ($query: String!, $after: String) {
  search(query: $query, type: ISSUE, first: 100, after: $after) {
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      ... on PullRequest {
        mergedAt
        number
        repository {
          name
          owner {
            login
          }
        }
        title
      }
    }
  }
}`;

export async function fetchGitHubActivity(
  token: string
): Promise<GitHubActivity> {
  const [stats, pullRequests, organizations] = await Promise.all([
    queryGraphQL<StatsData>(token, STATS_QUERY, {
      login: GITHUB_LOGIN,
      merged: `author:${GITHUB_LOGIN} is:pr is:merged`,
      reviewed: `reviewed-by:${GITHUB_LOGIN} is:pr -author:${GITHUB_LOGIN}`,
    }),
    fetchMergedPullRequests(token),
    fetchOrganizations(token),
  ]);

  return parseGitHubActivity({ organizations, pullRequests, stats });
}

export function parseGitHubActivity({
  organizations,
  pullRequests,
  stats,
}: GitHubData): GitHubActivity {
  const merged = pullRequests.toSorted((a, b) =>
    b.mergedAt.localeCompare(a.mergedAt)
  );

  return {
    featuredOwners: countPullRequestsByOwner(merged).filter(({ login }) =>
      FEATURED_OWNERS.has(login)
    ),
    latestPullRequests: merged
      .slice(0, PULL_REQUEST_COUNT)
      .map(({ mergedAt, number, repository, title }) => ({
        mergedAt,
        number,
        owner: repository.owner.login,
        repository: repository.name,
        title,
      })),
    memberships: organizations
      .map(({ login }) => login)
      .filter((login) => !login.startsWith(GITHUB_LOGIN)),
    stats: {
      contributedRepositories: stats.user.repositoriesContributedTo.totalCount,
      contributions:
        stats.user.contributionsCollection.contributionCalendar
          .totalContributions,
      mergedPullRequests: stats.merged.issueCount,
      reviewedPullRequests: stats.reviewed.issueCount,
    },
  };
}

export function getAvatarLogins(activity: GitHubActivity) {
  return [
    ...new Set([
      ...activity.latestPullRequests.map(({ owner }) => owner),
      ...activity.memberships,
      ...activity.featuredOwners.map(({ login }) => login),
    ]),
  ].toSorted();
}

function countPullRequestsByOwner(pullRequests: PullRequestNode[]) {
  const counts = new Map<string, number>();
  for (const { repository } of pullRequests) {
    const { login } = repository.owner;
    counts.set(login, (counts.get(login) ?? 0) + 1);
  }

  return [...counts]
    .map(([login, mergedPullRequests]) => ({ login, mergedPullRequests }))
    .toSorted(
      (a, b) =>
        b.mergedPullRequests - a.mergedPullRequests ||
        a.login.localeCompare(b.login)
    );
}

async function fetchMergedPullRequests(token: string) {
  const pullRequests: PullRequestNode[] = [];
  let after: string | undefined;

  for (let page = 0; page < MAX_SEARCH_PAGES; page++) {
    const { search } = await queryGraphQL<SearchData>(
      token,
      MERGED_PULL_REQUESTS_QUERY,
      { after, query: `${EXTERNAL_MERGED_QUERY} sort:updated-desc` }
    );
    pullRequests.push(
      ...search.nodes.filter((node): node is PullRequestNode =>
        Boolean(node.mergedAt)
      )
    );
    if (!search.pageInfo.hasNextPage) break;
    after = search.pageInfo.endCursor;
  }

  return pullRequests;
}

async function fetchOrganizations(token: string) {
  return requestGitHub<Array<{ login: string }>>(
    token,
    `/users/${GITHUB_LOGIN}/orgs`
  );
}

async function queryGraphQL<T>(
  token: string,
  query: string,
  variables: Record<string, string | undefined>
) {
  const { data, errors } = await requestGitHub<{
    data?: T;
    errors?: Array<{ message: string }>;
  }>(token, "/graphql", { query, variables });
  if (!data || errors?.length) {
    throw new Error(
      `[profile] The GitHub API returned errors: ${errors?.map(({ message }) => message).join(" ") ?? "no data"}`
    );
  }

  return data;
}

async function requestGitHub<T>(token: string, path: string, body?: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json",
      "user-agent": `${GITHUB_LOGIN}-profile`,
    },
    method: body === undefined ? "GET" : "POST",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
  if (!response.ok) {
    throw new Error(
      `[profile] The GitHub API answered \`${path}\` with \`${response.status} ${response.statusText}\`.`
    );
  }

  return (await response.json()) as T;
}

export interface GitHubActivity {
  featuredOwners: Array<{ login: string; mergedPullRequests: number }>;
  latestPullRequests: MergedPullRequest[];
  memberships: string[];
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
  owner: string;
  repository: string;
  title: string;
}

export interface GitHubData {
  organizations: Array<{ login: string }>;
  pullRequests: PullRequestNode[];
  stats: StatsData;
}

interface StatsData {
  merged: { issueCount: number };
  reviewed: { issueCount: number };
  user: {
    contributionsCollection: {
      contributionCalendar: { totalContributions: number };
    };
    repositoriesContributedTo: { totalCount: number };
  };
}

interface SearchData {
  search: {
    nodes: Array<PullRequestNode | Record<string, never>>;
    pageInfo: { endCursor: string; hasNextPage: boolean };
  };
}

interface PullRequestNode {
  mergedAt: string;
  number: number;
  repository: { name: string; owner: { login: string } };
  title: string;
}
