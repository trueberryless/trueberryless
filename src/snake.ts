const VIEW_BOX_RE = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/;
const SIZE_RE = / width="[\d.]+" height="[\d.]+"/;
const ROOT_VARIABLES_RE = /:root\{[^}]*\}/;
const STYLE_END_RE = /<\/style>/;
const REDUCED_MOTION_RULE =
  "@media (prefers-reduced-motion:reduce){.c,.s,.u{animation:none}}";

const TOP = -20;
const HEIGHT = 7 * 16 + 36;

export const SNAKE_RATIO = HEIGHT / 880;

export function cropSnake(svg: string) {
  const viewBox = VIEW_BOX_RE.exec(svg);
  if (!viewBox) return svg;

  const [, x, , width] = viewBox;

  return svg
    .replace(VIEW_BOX_RE, `viewBox="${x} ${TOP} ${width} ${HEIGHT}"`)
    .replace(SIZE_RE, ` width="${width}" height="${HEIGHT}"`);
}

export function recolorSnake(svg: string, palette: SnakePalette) {
  const variables = Object.entries(palette)
    .map(([name, color]) => `--${name}:${color}`)
    .join(";");

  return svg.replace(ROOT_VARIABLES_RE, `:root{${variables}}`);
}

export function respectReducedMotion(svg: string) {
  return svg.replace(STYLE_END_RE, `${REDUCED_MOTION_RULE}</style>`);
}

export interface SnakePalette {
  c0: string;
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  cb: string;
  ce: string;
  cs: string;
}
