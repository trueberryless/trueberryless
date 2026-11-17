import { createElement } from "react";
import satori from "satori";
import type { Font } from "satori";

import type { ProfileData } from "./data.ts";
import { LAYOUT } from "./layout.ts";
import { Profile } from "./profile.tsx";
import { THEMES } from "./theme.ts";
import type { ThemeName } from "./theme.ts";

const SVG_OPEN_TAG_RE = /^<svg([^>]*)>/;
const SVG_IMAGE_RE =
  /<image ([^>]*)href="data:image\/svg\+xml;base64,([^"]+)"([^>]*)\/>/g;
const ATTRIBUTE_RE = /([a-zA-Z:-]+)="([^"]*)"/g;
const ROOT_SVG_RE = /<svg([^>]*)>([\s\S]*)<\/svg>\s*$/;

const KEPT_IMAGE_ATTRIBUTES = ["height", "width", "x", "y"] as const;
const KEPT_ROOT_ATTRIBUTES = ["height", "viewBox", "width"] as const;
const CLIPPING_ATTRIBUTES = ["clip-path", "mask"] as const;

/**
 * Renders the profile into a single SVG. Satori lays the cards out with flexbox and turns
 * all text into paths, so the result looks the same everywhere and needs no fonts.
 */
export async function renderProfile(
  data: ProfileData,
  themeName: ThemeName,
  fonts: Font[]
) {
  const svg = await satori(
    createElement(Profile, { data, theme: THEMES[themeName], themeName }),
    { fonts, width: LAYOUT.width }
  );

  return addAccessibleName(inlineAnimatedImages(svg));
}

/**
 * Browsers draw an SVG that sits in an `<image>` as a still frame, so the CSS animations of
 * the snake and the equalizer would never run. This moves every animated SVG image inline
 * and keeps the clip path and mask Satori created for it.
 */
export function inlineAnimatedImages(svg: string) {
  return svg.replaceAll(
    SVG_IMAGE_RE,
    (image, before: string, base64: string, after: string) => {
      const source = Buffer.from(base64, "base64").toString("utf8");
      const root = ROOT_SVG_RE.exec(source);
      if (!source.includes("@keyframes") || !root) return image;

      const [, rootAttributes = "", content = ""] = root;
      const imageAttributes = parseAttributes(`${before} ${after}`);
      const { height, viewBox, width } = parseAttributes(rootAttributes);

      const position = KEPT_IMAGE_ATTRIBUTES.map(
        (name) => `${name}="${imageAttributes[name] ?? 0}"`
      ).join(" ");
      const box = viewBox ?? `0 0 ${width} ${height}`;
      const clipping = CLIPPING_ATTRIBUTES.filter(
        (name) => imageAttributes[name]
      )
        .map((name) => `${name}="${imageAttributes[name]}"`)
        .join(" ");

      return `<g ${clipping}><svg ${position} viewBox="${box}" preserveAspectRatio="xMidYMid meet">${content}</svg></g>`;
    }
  );
}

function parseAttributes(source: string) {
  const attributes: Record<string, string> = Object.create(null);
  for (const [, name = "", value = ""] of source.matchAll(ATTRIBUTE_RE)) {
    attributes[name] = value;
  }

  return attributes as Partial<
    Record<
      | (typeof KEPT_IMAGE_ATTRIBUTES)[number]
      | (typeof KEPT_ROOT_ATTRIBUTES)[number]
      | (typeof CLIPPING_ATTRIBUTES)[number],
      string
    >
  >;
}

function addAccessibleName(svg: string) {
  return svg.replace(
    SVG_OPEN_TAG_RE,
    '<svg$1 role="img" aria-labelledby="title"><title id="title">Felix Schneider (trueberryless) on GitHub</title>'
  );
}
