import { readFile } from "node:fs/promises";

import { parseAstroBadge } from "./astro.ts";
import type { AstroContributions } from "./astro.ts";
import type { GitHubActivity } from "./github.ts";
import { createImageDataUri, toDataUri } from "./image.ts";
import { LAYOUT } from "./layout.ts";
import type { ProfileSources } from "./sources.ts";
import { parseSpotifyWidget } from "./spotify.ts";
import type { ThemeName } from "./theme.ts";

const PAINTING_PATH = new URL("../assets/painting.png", import.meta.url);

/** Turns the raw sources into the data URIs and values the profile renders. */
export async function createProfileData(
  sources: ProfileSources
): Promise<ProfileData> {
  const track = parseSpotifyWidget(sources.spotifyWidget);

  const [avatar, hero, npmxCard, cover] = await Promise.all([
    createImageDataUri(sources.avatar, LAYOUT.avatar),
    createImageDataUri(await readFile(PAINTING_PATH), LAYOUT.hero, {
      blur: 6,
    }),
    createImageDataUri(sources.npmxCard, LAYOUT.npmxCard),
    track && createImageDataUri(track.cover, LAYOUT.cover),
  ]);

  return {
    astro: {
      badge: toDataUri(sources.astroBadge, "image/svg+xml"),
      contributions: parseAstroBadge(sources.astroBadge),
    },
    avatar,
    github: sources.github,
    hero,
    npmxCard,
    snake: {
      dark: toDataUri(sources.snake.dark, "image/svg+xml"),
      light: toDataUri(sources.snake.light, "image/svg+xml"),
    },
    track: track && cover ? { ...track, cover } : undefined,
  };
}

export interface ProfileData {
  astro: {
    /** The original badge, shown when its contents can't be read. */
    badge: string;
    contributions: AstroContributions | undefined;
  };
  avatar: string;
  github: GitHubActivity;
  hero: string;
  npmxCard: string;
  snake: Record<ThemeName, string>;
  track: Track | undefined;
}

export interface Track {
  artist: string;
  cover: string;
  isPlaying: boolean;
  title: string;
}
