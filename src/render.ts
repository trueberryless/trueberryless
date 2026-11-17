import { Resvg } from "@resvg/resvg-js";
import { createElement } from "react";
import satori from "satori";
import type { Font } from "satori";
import sharp from "sharp";

import type { ProfileData } from "./data.ts";
import { EQUALIZER_SIZE, createEqualizerSvg } from "./equalizer.ts";
import { GITHUB_LOGIN } from "./github.ts";
import { toDataUri } from "./image.ts";
import { LAYOUT } from "./layout.ts";
import type { Rect } from "./layout.ts";
import { Profile } from "./profile.tsx";
import { cropSnake } from "./snake.ts";
import { THEMES } from "./theme.ts";
import type { ThemeName } from "./theme.ts";
import { createVinylSvg } from "./vinyl.ts";

// Twice the display size keeps text sharp on high density screens. GitHub shows the
// profile at most 840 pixels wide, and smaller on phones.
const RASTER_SCALE = 2;
const WEBP_QUALITY = 84;

const ATTRIBUTE_RE = /([a-zA-Z:-]+)="([^"]*)"/g;
const ROOT_SVG_RE = /<svg([^>]*)>([\s\S]*)<\/svg>\s*$/;

/**
 * Renders the profile into an SVG that stays smooth on slow devices. A browser repaints an
 * SVG image as a whole on every animation frame, so everything static (glass, shadows,
 * text and photos) is flattened into one WebP image, and only the snake, the spinning
 * record and the equalizer stay vectors on top of it.
 */
export async function renderProfile(
  data: ProfileData,
  themeName: ThemeName,
  fonts: Font[]
) {
  const { canvas } = LAYOUT;
  const staticSvg = await satori(
    createElement(Profile, { data, theme: THEMES[themeName], themeName }),
    { fonts, ...canvas }
  );
  const image = await rasterizeSvg(staticSvg);
  const name = `${data.bluesky.displayName} (${GITHUB_LOGIN}) on GitHub`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-labelledby="title">`,
    `<title id="title">${escapeXml(name)}</title>`,
    `<image href="${image}" width="${canvas.width}" height="${canvas.height}"/>`,
    ...createAnimatedLayers(data, themeName),
    "</svg>",
  ].join("");
}

async function rasterizeSvg(svg: string) {
  // Satori already turned all text into paths, so no fonts need to be loaded.
  const png = new Resvg(svg, {
    fitTo: { mode: "zoom", value: RASTER_SCALE },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  const webp = await sharp(png)
    .webp({ effort: 6, quality: WEBP_QUALITY, smartSubsample: true })
    .toBuffer();

  return toDataUri(webp, "image/webp");
}

function createAnimatedLayers(data: ProfileData, themeName: ThemeName) {
  const { cards, cardRadius, music: musicLayout } = LAYOUT;
  const layers = [inlineSvg(cropSnake(data.snake[themeName]), cards.snake)];

  const { music } = data;
  if (music?.isPlaying) {
    const { height, width, x, y } = cards.music;
    // The record sticks out of the card, so it gets clipped to the card's rounded corners.
    layers.push(
      `<clipPath id="music-clip"><rect x="${x + 1}" y="${y + 1}" width="${width - 2}" height="${height - 2}" rx="${cardRadius - 1}"/></clipPath>`,
      `<g clip-path="url(#music-clip)">${inlineSvg(createVinylSvg(music.cover, { isSpinning: true }), musicLayout.vinyl)}</g>`,
      inlineSvg(createEqualizerSvg(THEMES[themeName].accent), {
        ...EQUALIZER_SIZE,
        ...musicLayout.equalizer,
      })
    );
  }

  return layers;
}

/** Places an SVG document inside another one, filling the given rectangle. */
export function inlineSvg(source: string, { height, width, x, y }: Rect) {
  const root = ROOT_SVG_RE.exec(source);
  if (!root) {
    throw new Error("[profile] Could not find the root element of an SVG.");
  }

  const [, rootAttributes = "", content = ""] = root;
  const attributes = new Map(
    [...rootAttributes.matchAll(ATTRIBUTE_RE)].map(
      ([, key = "", value = ""]) => [key, value]
    )
  );
  const viewBox =
    attributes.get("viewBox") ??
    `0 0 ${attributes.get("width")} ${attributes.get("height")}`;

  return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${content}</svg>`;
}

function escapeXml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
