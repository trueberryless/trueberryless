export const SPOTIFY_WIDGET_URL =
  "https://spotify-github-profile.kittinanx.com/api/view?uid=pjyifjjapvah0yoy2zvd8vx0v&cover_image=true&theme=default&show_offline=false&interchange=true";

const TITLE_RE = /<div class="artist">([^<]*)<\/div>/;
const ARTIST_RE = /<div class="song">([^<]*)<\/div>/;
const COVER_RE =
  /<img src="data:image\/[a-z]+;base64,\s*([^"]+)"[^>]*class="cover"/;
const NOW_PLAYING_RE = /Now playing on/;
const HTML_ENTITY_RE = /&(amp|lt|gt|quot|#39|apos);/g;

const HTML_ENTITIES = new Map([
  ["#39", "'"],
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["lt", "<"],
  ["quot", '"'],
]);

export function parseSpotifyWidget(svg: string): SpotifyTrack | undefined {
  const title = TITLE_RE.exec(svg)?.[1];
  const artist = ARTIST_RE.exec(svg)?.[1];
  const cover = COVER_RE.exec(svg)?.[1];
  if (!title || !artist || !cover) return;

  return {
    artist: decodeHtmlEntities(artist.trim()),
    cover: Buffer.from(cover, "base64"),
    isPlaying: NOW_PLAYING_RE.test(svg),
    title: decodeHtmlEntities(title.trim()),
  };
}

function decodeHtmlEntities(text: string) {
  return text.replaceAll(
    HTML_ENTITY_RE,
    (entity, name: string) => HTML_ENTITIES.get(name) ?? entity
  );
}

export interface SpotifyTrack {
  artist: string;
  cover: Buffer;
  isPlaying: boolean;
  title: string;
}
