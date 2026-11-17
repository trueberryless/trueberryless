import type { Rect } from "./layout.ts";

// The arm comes in from the right edge, 30 degrees below the horizontal.
const ARM_ANGLE = (150 * Math.PI) / 180;
// Where along the radius the needle touches the record: on the outer grooves.
const NEEDLE_RADIUS = 0.9;
// How far the arm swings up and away from the record while nothing plays.
const REST_ROTATION = 28;

/**
 * Creates a tone arm that comes into the music card from its right edge. The pivot stays
 * hidden outside the card, so only the end of the arm and the headshell show, touching
 * the outer grooves of the record. While nothing plays, the arm is swung up and away.
 * It only uses plain shapes, because it is drawn on top of the spinning record and
 * filters would make every frame expensive.
 */
export function createTonearmSvg(
  card: Rect,
  vinyl: Rect,
  { isPlaying }: { isPlaying: boolean }
) {
  const pivot = { x: card.width + 26, y: 6 };
  const direction = { x: Math.cos(ARM_ANGLE), y: Math.sin(ARM_ANGLE) };
  const center = {
    x: vinyl.x - card.x + vinyl.width / 2,
    y: vinyl.y - card.y + vinyl.height / 2,
  };
  const length = getDistanceToCircle(
    pivot,
    direction,
    center,
    (vinyl.width / 2) * NEEDLE_RADIUS
  );
  const needle = {
    x: pivot.x + direction.x * length,
    y: pivot.y + direction.y * length,
  };
  const angle = (ARM_ANGLE * 180) / Math.PI;
  const rotation = isPlaying ? 0 : REST_ROTATION;
  const shadow = "rgba(0,0,0,0.35)";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${card.width}" height="${card.height}" viewBox="0 0 ${card.width} ${card.height}">`,
    "<defs>",
    '<linearGradient id="tonearm-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset="0.5" stop-color="#b9bdc4"/><stop offset="1" stop-color="#7c818a"/></linearGradient>',
    "</defs>",
    `<g transform="rotate(${rotation} ${pivot.x} ${pivot.y})">`,
    // A sharp offset copy acts as the shadow, since a blur would cost too much.
    `<line x1="${pivot.x + 3}" y1="${pivot.y + 4}" x2="${round(needle.x + 3)}" y2="${round(needle.y + 4)}" stroke="${shadow}" stroke-width="6" stroke-linecap="round"/>`,
    `<line x1="${pivot.x}" y1="${pivot.y}" x2="${round(needle.x)}" y2="${round(needle.y)}" stroke="url(#tonearm-metal)" stroke-width="5" stroke-linecap="round"/>`,
    `<g transform="translate(${round(needle.x)} ${round(needle.y)}) rotate(${angle})">`,
    `<rect x="-9" y="-6.5" width="22" height="13" rx="3" fill="${shadow}" transform="translate(3 4)"/>`,
    '<rect x="-9" y="-6.5" width="22" height="13" rx="3" fill="#2a2e35" stroke="#9aa0a8" stroke-width="1"/>',
    '<circle cx="-4" cy="0" r="1.6" fill="#d7dbe0"/>',
    "</g>",
    "</g>",
    "</svg>",
  ].join("");
}

// How far the arm reaches from the pivot along its direction until it first touches the
// circle of the outer grooves.
function getDistanceToCircle(
  origin: Point,
  direction: Point,
  center: Point,
  radius: number
) {
  const offset = { x: origin.x - center.x, y: origin.y - center.y };
  const projection = offset.x * direction.x + offset.y * direction.y;
  const discriminant =
    projection ** 2 - (offset.x ** 2 + offset.y ** 2 - radius ** 2);
  if (discriminant < 0) return Math.hypot(offset.x, offset.y) - radius;

  return -projection - Math.sqrt(discriminant);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

interface Point {
  x: number;
  y: number;
}
