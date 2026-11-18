const SIZE = 200;
const CENTER = SIZE / 2;
const LABEL_RADIUS = 46;
const GROOVE_RADII = Array.from({ length: 12 }, (_, index) => 52 + index * 4);

export function createVinylSvg(cover: string, { isSpinning }: VinylOptions) {
  const grooves = GROOVE_RADII.map(
    (radius) =>
      `<circle cx="${CENTER}" cy="${CENTER}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">`,
    isSpinning
      ? [
          "<style>",
          `.vinyl-spin{transform-origin:${CENTER}px ${CENTER}px;animation:vinyl-spin 6s linear infinite}`,
          "@keyframes vinyl-spin{to{transform:rotate(360deg)}}",
          "@media (prefers-reduced-motion:reduce){.vinyl-spin{animation:none}}",
          "</style>",
        ].join("")
      : "",
    "<defs>",
    `<radialGradient id="vinyl-disc"><stop offset="0.45" stop-color="#1c1c20"/><stop offset="0.9" stop-color="#0a0a0c"/><stop offset="1" stop-color="#26262b"/></radialGradient>`,
    `<linearGradient id="vinyl-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0.2" stop-color="#fff" stop-opacity="0"/><stop offset="0.42" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="0.6" stop-color="#fff" stop-opacity="0.08"/><stop offset="0.8" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    `<clipPath id="vinyl-label"><circle cx="${CENTER}" cy="${CENTER}" r="${LABEL_RADIUS}"/></clipPath>`,
    "</defs>",
    '<g class="vinyl-spin">',
    `<circle cx="${CENTER}" cy="${CENTER}" r="${CENTER}" fill="url(#vinyl-disc)"/>`,
    ...grooves,
    `<image href="${cover}" x="${CENTER - LABEL_RADIUS}" y="${CENTER - LABEL_RADIUS}" width="${LABEL_RADIUS * 2}" height="${LABEL_RADIUS * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#vinyl-label)"/>`,
    `<circle cx="${CENTER}" cy="${CENTER}" r="${LABEL_RADIUS}" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>`,
    `<circle cx="${CENTER}" cy="${CENTER}" r="4" fill="#0a0a0c"/>`,
    "</g>",
    `<circle cx="${CENTER}" cy="${CENTER}" r="${CENTER}" fill="url(#vinyl-sheen)"/>`,
    "</svg>",
  ].join("");
}

interface VinylOptions {
  isSpinning: boolean;
}
