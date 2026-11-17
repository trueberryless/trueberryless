const BAND_RATIO = 0.35;
const DURATION = 11;

/**
 * Creates a faint band of light that drifts across the glass every few seconds, like a
 * reflection on a real pane. It only moves during the first part of the cycle, so it
 * reads as a calm detail instead of a constant shimmer.
 */
export function createSheenSvg({
  height,
  width,
}: {
  height: number;
  width: number;
}) {
  const band = Math.round(width * BAND_RATIO);
  const start = -band - height;
  const end = width + height;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    // The profile inlines this SVG, so its ids and class names must not clash with the
    // contribution snake, the equalizer or the vinyl.
    "<style>",
    `.sheen-band{transform:translateX(${start}px);animation:sheen-move ${DURATION}s ease-in-out infinite}`,
    `@keyframes sheen-move{0%{transform:translateX(${start}px)}40%,100%{transform:translateX(${end}px)}}`,
    "@media (prefers-reduced-motion:reduce){.sheen-band{animation:none;opacity:0}}",
    "</style>",
    '<defs><linearGradient id="sheen-gradient" x1="0" y1="0" x2="1" y2="0">',
    '<stop offset="0" stop-color="#fff" stop-opacity="0"/>',
    '<stop offset="0.5" stop-color="#fff" stop-opacity="0.09"/>',
    '<stop offset="1" stop-color="#fff" stop-opacity="0"/>',
    "</linearGradient></defs>",
    `<g transform="skewX(-24)"><rect class="sheen-band" x="0" y="0" width="${band}" height="${height}" fill="url(#sheen-gradient)"/></g>`,
    "</svg>",
  ].join("");
}
