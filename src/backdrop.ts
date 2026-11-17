import sharp from "sharp";

import type { ImageSize } from "./image.ts";
import type { Rect } from "./layout.ts";

// The part of the banner, from its bottom edge, that continues the landscape below it.
const STRIP_RATIO = 0.3;
// The composition only gets blurred, so a low resolution is enough.
const SCALE = 0.5;
const RGBA_RE = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;

/**
 * Computes the average color a glass card shows at the given place: the backdrop behind
 * it, adjusted to the theme's brightness and covered by the tint. Elements that need to
 * look cut out of the glass, like the rings between overlapping avatars, use it.
 */
export async function getGlassColor(
  canvas: Buffer,
  { height, width, x, y }: Rect,
  { brightness, tint }: { brightness: number; tint: string }
) {
  const { channels } = await sharp(canvas)
    .extract({
      height: Math.round(height * SCALE),
      left: Math.round(x * SCALE),
      top: Math.round(y * SCALE),
      width: Math.round(width * SCALE),
    })
    .modulate({ brightness })
    .stats();
  const [r = 0, g = 0, b = 0, alpha = 1] = (RGBA_RE.exec(tint) ?? [])
    .slice(1)
    .map((value) => (value === undefined ? undefined : Number(value)));

  const mixed = channels.slice(0, 3).map(({ mean }, index) => {
    const tintChannel = [r, g, b][index] ?? 0;
    return Math.round(tintChannel * alpha + Math.min(255, mean) * (1 - alpha));
  });

  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Extends the banner to the size of the whole canvas. A center crop of a wide banner
 * would put the sky behind the middle of the profile, which shows up as a bright band.
 * Instead, the bottom edge of the banner is mirrored and stretched downwards, so the
 * landscape continues without a seam.
 */
export async function createBackdropCanvas(
  banner: Buffer,
  { height, width }: ImageSize
) {
  const canvasWidth = Math.round(width * SCALE);
  const canvasHeight = Math.round(height * SCALE);
  const bannerHeight = Math.round(canvasWidth / 3);

  const source = sharp(banner);
  const { height: sourceHeight = 0, width: sourceWidth = 0 } =
    await source.metadata();
  const stripHeight = Math.round(sourceHeight * STRIP_RATIO);

  const [top, strip] = await Promise.all([
    sharp(banner)
      .resize(canvasWidth, bannerHeight, { fit: "cover" })
      .toBuffer(),
    sharp(banner)
      .extract({
        height: stripHeight,
        left: 0,
        top: sourceHeight - stripHeight,
        width: sourceWidth,
      })
      .flip()
      .resize(canvasWidth, canvasHeight - bannerHeight, { fit: "fill" })
      .toBuffer(),
  ]);

  return sharp({
    create: {
      background: "#000000",
      channels: 3,
      height: canvasHeight,
      width: canvasWidth,
    },
  })
    .composite([
      { input: top, left: 0, top: 0 },
      { input: strip, left: 0, top: bannerHeight },
    ])
    .png()
    .toBuffer();
}
