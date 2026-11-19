import type { Font } from "satori";

import { fetchBuffer, toDataUri } from "./image.ts";

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2";
const TWEMOJI_URL =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/";
const WEIGHTS = [400, 600, 800];
const FONT_FACE_RE =
  /font-weight:\s*(\d+);[^}]*?src:\s*url\((https:[^)]+)\)\s*format\('(?:truetype|opentype|woff)'\)/g;
const VARIATION_SELECTOR = 0xfe0f;
const ZERO_WIDTH_JOINER = 0x200d;

const FONT_FAMILIES = new Map([
  ["ar-AR", "Noto Sans Arabic"],
  ["bn-IN", "Noto Sans Bengali"],
  ["devanagari", "Noto Sans Devanagari"],
  ["he-IL", "Noto Sans Hebrew"],
  ["ja-JP", "Noto Sans JP"],
  ["kannada", "Noto Sans Kannada"],
  ["ko-KR", "Noto Sans KR"],
  ["math", "Noto Sans Math"],
  ["ml-IN", "Noto Sans Malayalam"],
  ["symbol", "Noto Sans Symbols 2"],
  ["ta-IN", "Noto Sans Tamil"],
  ["te-IN", "Noto Sans Telugu"],
  ["th-TH", "Noto Sans Thai"],
  ["zh-CN", "Noto Sans SC"],
  ["zh-HK", "Noto Sans HK"],
  ["zh-TW", "Noto Sans TC"],
]);
const DEFAULT_FONT_FAMILY = "Noto Sans";
const LANGUAGE_SEPARATOR = "|";

export function createAssetLoader() {
  const cache = new Map<string, Promise<Font[] | string>>();

  return (languageCode: string, segment: string) => {
    const key = `${languageCode}:${segment}`;
    let asset = cache.get(key);
    if (!asset) {
      asset =
        languageCode === "emoji"
          ? loadEmoji(segment)
          : loadFallbackFonts(languageCode, segment);
      cache.set(key, asset);
    }

    return asset;
  };
}

export function getFontFamilies(languageCode: string) {
  const families = languageCode
    .split(LANGUAGE_SEPARATOR)
    .map((code) => FONT_FAMILIES.get(code))
    .filter((family) => family !== undefined);

  return families.length > 0 ? [...new Set(families)] : [DEFAULT_FONT_FAMILY];
}

export function parseFontFaces(css: string) {
  return [...css.matchAll(FONT_FACE_RE)].map(
    ([, weight = "400", url = ""]) => ({
      url,
      weight: Number(weight),
    })
  );
}

export function getEmojiCode(emoji: string) {
  const codePoints = [...emoji].map(
    (character) => character.codePointAt(0) ?? 0
  );
  const isSequence = codePoints.includes(ZERO_WIDTH_JOINER);

  return codePoints
    .filter((codePoint) => isSequence || codePoint !== VARIATION_SELECTOR)
    .map((codePoint) => codePoint.toString(16))
    .join("-");
}

async function loadFallbackFonts(
  languageCode: string,
  segment: string
): Promise<Font[]> {
  const families = getFontFamilies(languageCode);
  const results = await Promise.allSettled(
    families.map((family) => loadFontFamily(family, segment))
  );
  const fonts = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  if (fonts.length === 0) {
    console.warn(
      `[profile] Could not load ${families.map((family) => `\`${family}\``).join(", ")} for "${segment}", so these characters render as boxes.`
    );
  }

  return fonts;
}

async function loadFontFamily(family: string, segment: string) {
  const faces = parseFontFaces(await fetchFontCss(family, segment));

  return Promise.all(
    faces.map(async ({ url, weight }) => ({
      data: await fetchBuffer(url),
      name: `${family} ${segment}`,
      style: "normal" as const,
      weight: weight as Font["weight"],
    }))
  );
}

async function fetchFontCss(family: string, text: string) {
  const query = `family=${encodeURIComponent(family)}`;
  const subset = `text=${encodeURIComponent(text)}`;

  try {
    return String(
      await fetchBuffer(
        `${GOOGLE_FONTS_URL}?${query}:wght@${WEIGHTS.join(";")}&${subset}`
      )
    );
  } catch {
    return String(await fetchBuffer(`${GOOGLE_FONTS_URL}?${query}&${subset}`));
  }
}

async function loadEmoji(segment: string) {
  try {
    const svg = await fetchBuffer(`${TWEMOJI_URL}${getEmojiCode(segment)}.svg`);
    return toDataUri(svg, "image/svg+xml");
  } catch (error) {
    console.warn(`[profile] Could not load the emoji "${segment}".`, error);
    return [];
  }
}
