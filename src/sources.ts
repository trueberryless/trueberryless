import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import { ASTRO_BADGE_URL } from "./astro.ts";
import { GITHUB_LOGIN, fetchGitHubActivity } from "./github.ts";
import type { GitHubActivity } from "./github.ts";
import { fetchBuffer } from "./image.ts";
import { SPOTIFY_WIDGET_URL } from "./spotify.ts";
import type { ThemeName } from "./theme.ts";

const FIXTURES_DIR = new URL("../fixtures/", import.meta.url);
const SNAKE_OUTPUT_BRANCH_URL = `https://raw.githubusercontent.com/${GITHUB_LOGIN}/${GITHUB_LOGIN}/output/`;

// The file names `Platane/snk` writes in the update workflow. A local live build without
// them falls back to the files published on the `output` branch.
const SNAKE_FILES = {
  dark: "github-contribution-grid-snake-dark.svg",
  light: "github-contribution-grid-snake.svg",
} satisfies Record<ThemeName, string>;

const FIXTURE_FILES = {
  astroBadge: "astro-badge.svg",
  avatar: "avatar.png",
  github: "github.json",
  npmxCard: "npmx-card.png",
  snakeDark: "snake-dark.svg",
  snakeLight: "snake-light.svg",
  spotifyWidget: "spotify-widget.svg",
} as const;

/**
 * Fetches everything the profile shows from the live services.
 *
 * @param snakeDir The directory where `Platane/snk` wrote the contribution snakes.
 */
export async function fetchLiveSources(
  token: string | undefined,
  snakeDir: URL
): Promise<ProfileSources> {
  if (!token) {
    throw new Error(
      "[profile] A live build needs a GitHub token to read the contribution stats. Set the `GITHUB_TOKEN` environment variable, or run `pnpm build` to render the fixtures instead."
    );
  }

  const [
    github,
    spotifyWidget,
    astroBadge,
    npmxCard,
    avatar,
    snakeDark,
    snakeLight,
  ] = await Promise.all([
    fetchGitHubActivity(token),
    fetchBuffer(SPOTIFY_WIDGET_URL).then(String),
    fetchBuffer(ASTRO_BADGE_URL).then(String),
    fetchBuffer(`https://npmxers.netlify.app/_og/r/${GITHUB_LOGIN}.png`),
    fetchBuffer(`https://github.com/${GITHUB_LOGIN}.png?size=256`),
    readSnake(snakeDir, SNAKE_FILES.dark),
    readSnake(snakeDir, SNAKE_FILES.light),
  ]);

  return {
    astroBadge,
    avatar,
    github,
    npmxCard,
    snake: { dark: snakeDark, light: snakeLight },
    spotifyWidget,
  };
}

/** Loads the sources saved in `fixtures/`, so the profile renders without network access. */
export async function loadFixtureSources(): Promise<ProfileSources> {
  const [
    astroBadge,
    avatar,
    github,
    npmxCard,
    snakeDark,
    snakeLight,
    spotifyWidget,
  ] = await Promise.all([
    readFixture(FIXTURE_FILES.astroBadge).then(String),
    readFixture(FIXTURE_FILES.avatar),
    readFixture(FIXTURE_FILES.github).then(
      (json) => JSON.parse(String(json)) as GitHubActivity
    ),
    readFixture(FIXTURE_FILES.npmxCard),
    readFixture(FIXTURE_FILES.snakeDark).then(String),
    readFixture(FIXTURE_FILES.snakeLight).then(String),
    readFixture(FIXTURE_FILES.spotifyWidget).then(String),
  ]);

  return {
    astroBadge,
    avatar,
    github,
    npmxCard,
    snake: { dark: snakeDark, light: snakeLight },
    spotifyWidget,
  };
}

export async function saveFixtureSources(sources: ProfileSources) {
  await mkdir(FIXTURES_DIR, { recursive: true });

  const files = new Map<string, Buffer | string>([
    [FIXTURE_FILES.astroBadge, sources.astroBadge],
    [FIXTURE_FILES.avatar, sources.avatar],
    [FIXTURE_FILES.github, `${JSON.stringify(sources.github, null, 2)}\n`],
    [FIXTURE_FILES.npmxCard, sources.npmxCard],
    [FIXTURE_FILES.snakeDark, sources.snake.dark],
    [FIXTURE_FILES.snakeLight, sources.snake.light],
    [FIXTURE_FILES.spotifyWidget, sources.spotifyWidget],
  ]);

  await Promise.all(
    [...files].map(([name, content]) =>
      writeFile(new URL(name, FIXTURES_DIR), content)
    )
  );
}

async function readSnake(snakeDir: URL, name: string) {
  const file = new URL(name, snakeDir);
  if (existsSync(file)) return readFile(file, "utf8");

  return String(await fetchBuffer(`${SNAKE_OUTPUT_BRANCH_URL}${name}`));
}

function readFixture(name: string) {
  return readFile(new URL(name, FIXTURES_DIR));
}

export interface ProfileSources {
  astroBadge: string;
  avatar: Buffer;
  github: GitHubActivity;
  npmxCard: Buffer;
  snake: Record<ThemeName, string>;
  spotifyWidget: string;
}
