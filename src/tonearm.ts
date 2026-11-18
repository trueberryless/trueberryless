import type { Rect } from "./layout.ts";

const NEEDLE_ANGLE = (60 * Math.PI) / 180;
const NEEDLE_RADIUS = 0.64;
const ARM_ANGLE = (30 * Math.PI) / 180;
const ARM_LENGTH = 80;
const REST_ROTATION = 40;

export function createTonearmSvg(
  card: Rect,
  vinyl: Rect,
  { isPlaying }: { isPlaying: boolean }
) {
  const center = {
    x: vinyl.x - card.x + vinyl.width / 2,
    y: vinyl.y - card.y + vinyl.height / 2,
  };
  const needle = {
    x: round(
      center.x + Math.cos(NEEDLE_ANGLE) * (vinyl.width / 2) * NEEDLE_RADIUS
    ),
    y: round(
      center.y + Math.sin(NEEDLE_ANGLE) * (vinyl.height / 2) * NEEDLE_RADIUS
    ),
  };
  const pivot = {
    x: round(needle.x + Math.cos(ARM_ANGLE) * ARM_LENGTH),
    y: round(needle.y + Math.sin(ARM_ANGLE) * ARM_LENGTH),
  };
  const headshellAngle = (ARM_ANGLE * 180) / Math.PI + 180;
  const rotation = isPlaying ? 0 : REST_ROTATION;
  const shadow = "rgba(0,0,0,0.35)";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${card.width}" height="${card.height}" viewBox="0 0 ${card.width} ${card.height}">`,
    "<defs>",
    '<linearGradient id="tonearm-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset="0.5" stop-color="#b9bdc4"/><stop offset="1" stop-color="#7c818a"/></linearGradient>',
    "</defs>",
    `<g transform="rotate(${rotation} ${pivot.x} ${pivot.y})">`,
    `<line x1="${pivot.x + 3}" y1="${pivot.y + 4}" x2="${needle.x + 3}" y2="${needle.y + 4}" stroke="${shadow}" stroke-width="6" stroke-linecap="round"/>`,
    `<line x1="${pivot.x}" y1="${pivot.y}" x2="${needle.x}" y2="${needle.y}" stroke="url(#tonearm-metal)" stroke-width="5" stroke-linecap="round"/>`,
    `<g transform="translate(${needle.x} ${needle.y}) rotate(${headshellAngle})">`,
    `<rect x="-9" y="-6.5" width="22" height="13" rx="3" fill="${shadow}" transform="translate(3 4)"/>`,
    '<rect x="-9" y="-6.5" width="22" height="13" rx="3" fill="#2a2e35" stroke="#9aa0a8" stroke-width="1"/>',
    '<circle cx="-4" cy="0" r="1.6" fill="#d7dbe0"/>',
    "</g>",
    "</g>",
    "</svg>",
  ].join("");
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
