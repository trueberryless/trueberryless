import { createBackdropCanvas, getGlassColor } from "./backdrop.ts";
import type { BlueskyProfile } from "./bluesky.ts";
import type { GitHubActivity } from "./github.ts";
import { createImageDataUri } from "./image.ts";
import { LAYOUT } from "./layout.ts";
import type { ProfileSources } from "./sources.ts";
import { parseSpotifyWidget } from "./spotify.ts";
import { THEMES, THEME_NAMES } from "./theme.ts";
import type { ThemeName } from "./theme.ts";

const GLASS_SCALE = 0.5;
const GLASS_BLUR = 30;

export async function createProfileData(
  sources: ProfileSources
): Promise<ProfileData> {
  const track = parseSpotifyWidget(sources.spotifyWidget);

  const [avatar, npmxCard, backdrops, avatars, music] = await Promise.all([
    createImageDataUri(sources.blueskyAvatar, LAYOUT.sizes.avatar),
    createImageDataUri(sources.npmxCard, LAYOUT.cards.npmx),
    createBackdrops(sources.banner),
    createAvatars(sources.avatars),
    track && createMusic(track),
  ]);

  return {
    avatar,
    avatars,
    backdrops,
    bluesky: sources.bluesky,
    github: sources.github,
    music,
    npmxCard,
    snake: sources.snake,
  };
}

async function createBackdrops(banner: Buffer) {
  const canvas = await createBackdropCanvas(banner, LAYOUT.canvas);
  const backdrops = await Promise.all(
    THEME_NAMES.map(async (themeName) => {
      const { backdropBrightness: brightness, glassTint } = THEMES[themeName];
      const [bannerImage, glass, namePlateColor] = await Promise.all([
        createImageDataUri(banner, LAYOUT.banner, { brightness, quality: 80 }),
        createImageDataUri(canvas, LAYOUT.canvas, {
          blur: GLASS_BLUR,
          brightness,
          scale: GLASS_SCALE,
        }),
        getGlassColor(canvas, LAYOUT.namePlate.rect, {
          brightness,
          tint: glassTint,
        }),
      ]);

      return [
        themeName,
        { banner: bannerImage, glass, namePlateColor },
      ] as const;
    })
  );

  return Object.fromEntries(backdrops) as Record<ThemeName, Backdrop>;
}

async function createAvatars(avatars: ProfileSources["avatars"]) {
  const dataUris = await Promise.all(
    [...avatars].map(
      async ([login, avatar]) =>
        [
          login,
          await createImageDataUri(avatar, LAYOUT.sizes.ownerAvatar, {
            scale: 1,
          }),
        ] as const
    )
  );

  return new Map(dataUris);
}

async function createMusic(
  track: NonNullable<ReturnType<typeof parseSpotifyWidget>>
): Promise<Music> {
  const [background, cover] = await Promise.all([
    createImageDataUri(track.cover, LAYOUT.sizes.cover, {
      blur: 18,
      scale: 0.5,
    }),
    createImageDataUri(track.cover, { height: 92, width: 92 }),
  ]);

  return {
    artist: track.artist,
    background,
    cover,
    isPlaying: track.isPlaying,
    title: track.title,
  };
}

export interface ProfileData {
  avatar: string;
  avatars: Map<string, string>;
  backdrops: Record<ThemeName, Backdrop>;
  bluesky: BlueskyProfile;
  github: GitHubActivity;
  music: Music | undefined;
  npmxCard: string;
  snake: Record<ThemeName, string>;
}

interface Backdrop {
  banner: string;
  glass: string;
  namePlateColor: string;
}

export interface Music {
  artist: string;
  background: string;
  cover: string;
  isPlaying: boolean;
  title: string;
}
