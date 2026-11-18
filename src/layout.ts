import { SNAKE_RATIO } from "./snake.ts";

const WIDTH = 840;
const INSET = 16;
const GAP = 12;
const INNER = WIDTH - INSET * 2;
const CARD_RADIUS = 22;

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

const NAME_PLATE_PADDING = 24;
const NAME_PLATE_AVATAR = 108;
const NAME_PLATE_HEIGHT = NAME_PLATE_AVATAR + NAME_PLATE_PADDING * 2;

const MUSIC_PADDING = 22;
const VINYL_SIZE = 196;
const VINYL = rect(
  MUSIC.x + MUSIC.width - Math.round(VINYL_SIZE * 0.78),
  MUSIC.y + (MUSIC.height - VINYL_SIZE) / 2,
  VINYL_SIZE,
  VINYL_SIZE
);
const LABEL_HEIGHT = 16;

export const LAYOUT = {
  banner: { height: WIDTH / 3, width: WIDTH },
  canvas: { height: bottom(SNAKE) + INSET, width: WIDTH },
  canvasRadius: CARD_RADIUS + INSET,
  cardRadius: CARD_RADIUS,
  cards: {
    hero: HERO,
    music: MUSIC,
    npmx: NPMX,
    owners: OWNERS,
    pullRequests: PULL_REQUESTS,
    snake: SNAKE,
    stats: STATS,
  },
  music: {
    equalizer: { x: MUSIC.x + MUSIC_PADDING, y: MUSIC.y + MUSIC_PADDING + 1 },
    labelHeight: LABEL_HEIGHT,
    padding: MUSIC_PADDING,
    textWidth: VINYL.x - MUSIC.x,
    vinyl: VINYL,
  },
  namePlate: {
    avatar: NAME_PLATE_AVATAR,
    padding: NAME_PLATE_PADDING,
    rect: rect(
      WIDTH - INSET - 20 - 580,
      INSET + HERO.height - 20 - NAME_PLATE_HEIGHT,
      580,
      NAME_PLATE_HEIGHT
    ),
  },
  sizes: {
    avatar: { height: NAME_PLATE_AVATAR, width: NAME_PLATE_AVATAR },
    cover: { height: MUSIC.height, width: MUSIC.width },
    ownerAvatar: { height: 96, width: 96 },
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
