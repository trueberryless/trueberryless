export const GITHUB_LOGIN = "trueberryless";

const API_URL = "https://api.github.com";
const PULL_REQUEST_COUNT = 4;
const TOP_OWNER_COUNT = 6;
// The search API returns at most 1,000 results, which is 10 pages.
const MAX_SEARCH_PAGES = 10;

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

// `sort:updated-desc` is the closest the search API gets to "recently merged", so the
// pull requests get sorted by their merge date afterwards.
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

/**
 * Fetches the contribution stats, the pull requests merged into other people's
 * repositories and the public organization memberships. The token only reads public
 * data, so the workflow's `GITHUB_TOKEN` is enough.
 */
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
    externalMergedPullRequests: merged.length,
    latestPullRequests: merged
      .slice(0, PULL_REQUEST_COUNT)
      .map(({ mergedAt, number, repository, title }) => ({
        mergedAt,
        number,
        owner: repository.owner.login,
        repository: repository.name,
        title,
      })),
    // Organizations named after the user are personal ones, not memberships worth showing.
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
    topOwners: countPullRequestsByOwner(merged).slice(0, TOP_OWNER_COUNT),
  };
}

/** Every login whose avatar the profile shows. */
export function getAvatarLogins(activity: GitHubActivity) {
  return [
    ...new Set([
      ...activity.latestPullRequests.map(({ owner }) => owner),
      ...activity.memberships,
      ...activity.topOwners.map(({ login }) => login),
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

// The GraphQL `organizations` field needs the `read:org` scope, while this REST endpoint
// lists the public memberships with any token.
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
  });
  if (!response.ok) {
    throw new Error(
      `[profile] The GitHub API answered \`${path}\` with \`${response.status} ${response.statusText}\`.`
    );
  }

  return (await response.json()) as T;
}

export interface GitHubActivity {
  /** How many pull requests were merged into other people's repositories. */
  externalMergedPullRequests: number;
  latestPullRequests: MergedPullRequest[];
  /** Public organization memberships, without personal organizations. */
  memberships: string[];
  stats: GitHubStats;
  /** The owners with the most merged pull requests, people and organizations alike. */
  topOwners: Array<{ login: string; mergedPullRequests: number }>;
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
