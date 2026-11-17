const VIEW_BOX_RE = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/;
const SIZE_RE = / width="[\d.]+" height="[\d.]+"/;
const ROOT_VARIABLES_RE = /:root\{[^}]*\}/;

// `Platane/snk` draws seven rows of 16px cells. The snake leaves the grid by at most one
// row, and the progress bar it draws below the grid stays empty most of the time, so the
// crop keeps the grid with one row of margin.
const TOP = -20;
const HEIGHT = 7 * 16 + 36;

/** The aspect ratio of a cropped snake. */
export const SNAKE_RATIO = HEIGHT / 880;

/** Crops the empty space below the contribution grid out of a `Platane/snk` SVG. */
export function cropSnake(svg: string) {
  const viewBox = VIEW_BOX_RE.exec(svg);
  if (!viewBox) return svg;

  const [, x, , width] = viewBox;

  return svg
    .replace(VIEW_BOX_RE, `viewBox="${x} ${TOP} ${width} ${HEIGHT}"`)
    .replace(SIZE_RE, ` width="${width}" height="${HEIGHT}"`);
}

/**
 * Replaces the colors of a `Platane/snk` SVG, which it defines as CSS variables: `cb` for
 * the cell borders, `cs` for the snake, `ce` for eaten cells and `c0` to `c4` for the
 * contribution levels.
 */
export function recolorSnake(svg: string, palette: SnakePalette) {
  const variables = Object.entries(palette)
    .map(([name, color]) => `--${name}:${color}`)
    .join(";");

  return svg.replace(ROOT_VARIABLES_RE, `:root{${variables}}`);
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
