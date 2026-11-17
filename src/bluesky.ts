const BLUESKY_HANDLE = "felixs.dev";

const PROFILE_URL = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${BLUESKY_HANDLE}`;

/**
 * Fetches the public Bluesky profile. Its name, bio, avatar and banner make up the top of
 * the GitHub profile, so changing them on Bluesky updates both.
 */
export async function fetchBlueskyProfile(): Promise<BlueskyProfile> {
  const response = await fetch(PROFILE_URL);
  if (!response.ok) {
    throw new Error(
      `[profile] Bluesky answered with \`${response.status} ${response.statusText}\` for \`${BLUESKY_HANDLE}\`.`
    );
  }

  const { avatar, banner, description, displayName, handle } =
    (await response.json()) as BlueskyProfile;
  if (!avatar || !banner) {
    throw new Error(
      `[profile] The Bluesky profile of \`${BLUESKY_HANDLE}\` needs an avatar and a banner.`
    );
  }

  return { avatar, banner, description, displayName, handle };
}

export interface BlueskyProfile {
  avatar: string;
  banner: string;
  description: string;
  displayName: string;
  handle: string;
}
