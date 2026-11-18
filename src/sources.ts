import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

import { fetchBlueskyProfile } from "./bluesky.ts";
import type { BlueskyProfile } from "./bluesky.ts";
import {
  GITHUB_LOGIN,
  fetchGitHubActivity,
  getAvatarLogins,
} from "./github.ts";
import type { GitHubActivity } from "./github.ts";
import { fetchBuffer } from "./image.ts";
import { SPOTIFY_WIDGET_URL } from "./spotify.ts";
import type { ThemeName } from "./theme.ts";

const FIXTURES_DIR = new URL("../fixtures/", import.meta.url);
const AVATARS_DIR = new URL("avatars/", FIXTURES_DIR);
const OUTPUT_BRANCH_URL = `https://raw.githubusercontent.com/${GITHUB_LOGIN}/${GITHUB_LOGIN}/output/`;
const AVATAR_EXTENSION = ".png";

const SNAKE_FILES = {
  dark: "github-contribution-grid-snake-dark.svg",
  light: "github-contribution-grid-snake.svg",
} satisfies Record<ThemeName, string>;

const FIXTURE_FILES = {
  banner: "banner.jpg",
  bluesky: "bluesky.json",
  blueskyAvatar: "bluesky-avatar.jpg",
  github: "github.json",
  npmxCard: "npmx-card.png",
  snakeDark: "snake-dark.svg",
  snakeLight: "snake-light.svg",
  spotifyWidget: "spotify-widget.svg",
} as const;

export async function fetchLiveSources(
  token: string | undefined,
  snakeDir: URL
): Promise<ProfileSources> {
  if (!token) {
    throw new Error(
      "[profile] A live build needs a GitHub token to read the contribution stats. Set the `GITHUB_TOKEN` environment variable, or run `pnpm build` to render the fixtures instead."
    );
  }

  const [github, bluesky, spotifyWidget, npmxCard, snakeDark, snakeLight] =
    await Promise.all([
      fetchGitHubActivity(token),
      fetchBlueskyProfile(),
      fetchBuffer(SPOTIFY_WIDGET_URL).then(String),
      fetchBuffer(`https://npmxers.netlify.app/_og/r/${GITHUB_LOGIN}.png`),
      readSnake(snakeDir, SNAKE_FILES.dark),
      readSnake(snakeDir, SNAKE_FILES.light),
    ]);
  const [avatars, banner, blueskyAvatar] = await Promise.all([
    fetchAvatars(getAvatarLogins(github)),
    fetchBuffer(bluesky.banner),
    fetchBuffer(bluesky.avatar),
  ]);

  return {
    avatars,
    banner,
    bluesky,
    blueskyAvatar,
    github,
    npmxCard,
    snake: { dark: snakeDark, light: snakeLight },
    spotifyWidget,
  };
}

export async function loadFixtureSources(): Promise<ProfileSources> {
  const [
    banner,
    bluesky,
    blueskyAvatar,
    github,
    npmxCard,
    snakeDark,
    snakeLight,
    spotifyWidget,
    avatars,
  ] = await Promise.all([
    readFixture(FIXTURE_FILES.banner),
    readFixture(FIXTURE_FILES.bluesky).then(
      (json) => JSON.parse(String(json)) as BlueskyProfile
    ),
    readFixture(FIXTURE_FILES.blueskyAvatar),
    readFixture(FIXTURE_FILES.github).then(
      (json) => JSON.parse(String(json)) as GitHubActivity
    ),
    readFixture(FIXTURE_FILES.npmxCard),
    readFixture(FIXTURE_FILES.snakeDark).then(String),
    readFixture(FIXTURE_FILES.snakeLight).then(String),
    readFixture(FIXTURE_FILES.spotifyWidget).then(String),
    readFixtureAvatars(),
  ]);

  return {
    avatars,
    banner,
    bluesky,
    blueskyAvatar,
    github,
    npmxCard,
    snake: { dark: snakeDark, light: snakeLight },
    spotifyWidget,
  };
}

export async function saveFixtureSources(sources: ProfileSources) {
  await mkdir(AVATARS_DIR, { recursive: true });

  const files = new Map<URL, Buffer | string>([
    [new URL(FIXTURE_FILES.banner, FIXTURES_DIR), sources.banner],
    [new URL(FIXTURE_FILES.bluesky, FIXTURES_DIR), toJson(sources.bluesky)],
    [new URL(FIXTURE_FILES.blueskyAvatar, FIXTURES_DIR), sources.blueskyAvatar],
    [new URL(FIXTURE_FILES.github, FIXTURES_DIR), toJson(sources.github)],
    [new URL(FIXTURE_FILES.npmxCard, FIXTURES_DIR), sources.npmxCard],
    [new URL(FIXTURE_FILES.snakeDark, FIXTURES_DIR), sources.snake.dark],
    [new URL(FIXTURE_FILES.snakeLight, FIXTURES_DIR), sources.snake.light],
    [new URL(FIXTURE_FILES.spotifyWidget, FIXTURES_DIR), sources.spotifyWidget],
    ...[...sources.avatars].map(
      ([login, avatar]) =>
        [new URL(`${login}${AVATAR_EXTENSION}`, AVATARS_DIR), avatar] as const
    ),
  ]);

  await Promise.all(
    [...files].map(([file, content]) => writeFile(file, content))
  );
}

async function fetchAvatars(logins: string[]) {
  const avatars = await Promise.all(
    logins.map(
      async (login) =>
        [
          login,
          await fetchBuffer(`https://github.com/${login}.png?size=96`),
        ] as const
    )
  );

  return new Map(avatars);
}

async function readSnake(snakeDir: URL, name: string) {
  const file = new URL(name, snakeDir);
  if (existsSync(file)) return readFile(file, "utf8");

  return String(await fetchBuffer(`${OUTPUT_BRANCH_URL}${name}`));
}

async function readFixtureAvatars() {
  const files = await readdir(AVATARS_DIR);
  const avatars = await Promise.all(
    files
      .filter((file) => file.endsWith(AVATAR_EXTENSION))
      .map(
        async (file) =>
          [
            file.slice(0, -AVATAR_EXTENSION.length),
            await readFile(new URL(file, AVATARS_DIR)),
          ] as const
      )
  );

  return new Map(avatars);
}

function readFixture(name: string) {
  return readFile(new URL(name, FIXTURES_DIR));
}

function toJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export interface ProfileSources {
  avatars: Map<string, Buffer>;
  banner: Buffer;
  bluesky: BlueskyProfile;
  blueskyAvatar: Buffer;
  github: GitHubActivity;
  npmxCard: Buffer;
  snake: Record<ThemeName, string>;
  spotifyWidget: string;
}
