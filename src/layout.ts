import { SNAKE_RATIO } from "./snake.ts";

// Every card has an absolute position on one grid. The glass effect depends on it: each
// card shows the slice of the blurred landscape that lies right behind it.
const WIDTH = 840;
const INSET = 16;
const GAP = 12;
const INNER = WIDTH - INSET * 2;

const HERO = rect(INSET, INSET, INNER, 236);
const STATS_Y = bottom(HERO) + GAP;
const STAT_WIDTH = (INNER - GAP * 3) / 4;
const STATS = [0, 1, 2, 3].map((index) =>
  rect(INSET + index * (STAT_WIDTH + GAP), STATS_Y, STAT_WIDTH, 96)
);
const ROW_Y = STATS_Y + 96 + GAP;
const MUSIC = rect(INSET, ROW_Y, 352, 232);
const PULL_REQUESTS = rect(right(MUSIC) + GAP, ROW_Y, INNER - 352 - GAP, 232);
const NPMX = rect(INSET, bottom(MUSIC) + GAP, 420, 210);
const OWNERS = rect(right(NPMX) + GAP, NPMX.y, INNER - 420 - GAP, 210);
const SNAKE = rect(
  INSET,
  bottom(NPMX) + GAP,
  INNER,
  Math.round(INNER * SNAKE_RATIO)
);

export const LAYOUT = {
  canvas: { height: bottom(SNAKE) + INSET, width: WIDTH },
  /** The Bluesky banner, sharp across the top and fading into the blurred backdrop. */
  banner: { height: WIDTH / 3, width: WIDTH },
  // Concentric with the cards: the outer radius is the card radius plus the inset.
  canvasRadius: 22 + INSET,
  cardRadius: 22,
  cards: {
    hero: HERO,
    music: MUSIC,
    npmx: NPMX,
    owners: OWNERS,
    pullRequests: PULL_REQUESTS,
    snake: SNAKE,
    stats: STATS,
  },
  /** The glass name plate in the hero, relative to the canvas. */
  namePlate: rect(WIDTH - INSET - 20 - 520, INSET + 236 - 20 - 138, 520, 138),
  sizes: {
    avatar: { height: 92, width: 92 },
    cover: { height: 232, width: 352 },
    ownerAvatar: { height: 96, width: 96 },
    vinyl: { height: 196, width: 196 },
  },
} as const;

function rect(x: number, y: number, width: number, height: number): Rect {
  return { height, width, x, y };
}

function bottom({ height, y }: Rect) {
  return y + height;
}

function right({ width, x }: Rect) {
  return x + width;
}

export interface Rect {
  height: number;
  width: number;
  x: number;
  y: number;
}
