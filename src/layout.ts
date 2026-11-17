// Every size derives from the canvas width and one gap, so all cards share the same grid
// lines. GitHub scales the image down on narrow screens.
const WIDTH = 840;
const GAP = 12;
const PADDING = 20;
const HALF = (WIDTH - GAP) / 2;
const HALF_INNER = HALF - PADDING * 2;
const SNAKE_RATIO = 192 / 880;
const ASTRO_BADGE_RATIO = 260 / 156;

export const LAYOUT = {
  astroBadge: {
    height: HALF_INNER / 2,
    width: Math.round((HALF_INNER / 2) * ASTRO_BADGE_RATIO),
  },
  avatar: { height: 112, width: 112 },
  cover: { height: 148, width: 148 },
  gap: GAP,
  half: HALF,
  hero: { height: 208, width: WIDTH },
  npmxCard: { height: HALF_INNER / 2, width: HALF_INNER },
  padding: PADDING,
  quarter: (WIDTH - GAP * 3) / 4,
  radius: 14,
  snake: {
    height: Math.round((WIDTH - PADDING * 2) * SNAKE_RATIO),
    width: WIDTH - PADDING * 2,
  },
  width: WIDTH,
} as const;
