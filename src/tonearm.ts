import type { Rect } from "./layout.ts";

// Where the needle lands on the record, as an angle from its center and a share of its
// radius: on the outer grooves, towards the bottom left.
const NEEDLE_ANGLE = (160 * Math.PI) / 180;
const NEEDLE_RADIUS = 0.86;
// How far the arm swings away from the record while nothing plays.
const REST_ROTATION = -24;

/**
 * Creates a tone arm that reaches into the music card from its bottom right corner. Its
 * pivot sits right in the corner, so most of the base lies outside the card. While the
 * track plays, the needle rests on the record. Otherwise the arm is swung away from it.
 * It only uses plain shapes, because it is drawn on top of the spinning record and
 * filters would make every frame expensive.
 */
export function createTonearmSvg(
  card: Rect,
  vinyl: Rect,
  { isPlaying }: { isPlaying: boolean }
) {
  // A quarter of the base peeks into the corner, the rest lies outside the card.
  const pivot = { x: card.width - 4, y: card.height - 2 };
  const center = {
    x: vinyl.x - card.x + vinyl.width / 2,
    y: vinyl.y - card.y + vinyl.height / 2,
  };
  const needle = {
    x: center.x + Math.cos(NEEDLE_ANGLE) * (vinyl.width / 2) * NEEDLE_RADIUS,
    y: center.y + Math.sin(NEEDLE_ANGLE) * (vinyl.height / 2) * NEEDLE_RADIUS,
  };
  const angle =
    (Math.atan2(needle.y - pivot.y, needle.x - pivot.x) * 180) / Math.PI;
  const rotation = isPlaying ? 0 : REST_ROTATION;
  const shadow = "rgba(0,0,0,0.35)";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${card.width}" height="${card.height}" viewBox="0 0 ${card.width} ${card.height}">`,
    "<defs>",
    '<linearGradient id="tonearm-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset="0.5" stop-color="#b9bdc4"/><stop offset="1" stop-color="#7c818a"/></linearGradient>',
    '<radialGradient id="tonearm-base" cx="0.4" cy="0.35"><stop offset="0" stop-color="#5b616b"/><stop offset="1" stop-color="#1d2026"/></radialGradient>',
    "</defs>",
    `<g transform="rotate(${rotation} ${pivot.x} ${pivot.y})">`,
    // A sharp offset copy acts as the shadow, since a blur would cost too much.
    `<line x1="${pivot.x + 3}" y1="${pivot.y + 4}" x2="${needle.x + 3}" y2="${needle.y + 4}" stroke="${shadow}" stroke-width="6" stroke-linecap="round"/>`,
    `<line x1="${pivot.x}" y1="${pivot.y}" x2="${needle.x}" y2="${needle.y}" stroke="url(#tonearm-metal)" stroke-width="5" stroke-linecap="round"/>`,
    `<g transform="translate(${needle.x} ${needle.y}) rotate(${angle})">`,
    `<rect x="-9" y="-6.5" width="22" height="13" rx="3" fill="${shadow}" transform="translate(3 4)"/>`,
    '<rect x="-9" y="-6.5" width="22" height="13" rx="3" fill="#2a2e35" stroke="#9aa0a8" stroke-width="1"/>',
    '<circle cx="-4" cy="0" r="1.6" fill="#d7dbe0"/>',
    "</g>",
    `<circle cx="${pivot.x}" cy="${pivot.y}" r="20" fill="url(#tonearm-base)" stroke="#9aa0a8" stroke-width="1"/>`,
    `<circle cx="${pivot.x}" cy="${pivot.y}" r="7" fill="url(#tonearm-metal)"/>`,
    "</g>",
    "</svg>",
  ].join("");
}
