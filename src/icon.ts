import { createRequire } from "node:module";

import { toDataUri } from "./image.ts";

const require = createRequire(import.meta.url);
const OCTICONS = require("@primer/octicons/build/data.json") as Record<
  string,
  { heights: Record<string, { path: string; width: number }> }
>;
const PATH_TAG_RE = /<path /g;

export type IconName = "code-review" | "flame" | "git-merge" | "repo";

export function createIconDataUri(name: IconName, color: string, size = 16) {
  const icon = OCTICONS[name]?.heights[size];
  if (!icon) {
    throw new Error(
      `[profile] The Octicon \`${name}\` has no ${size}px variant.`
    );
  }

  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${icon.width}" height="${size}" viewBox="0 0 ${icon.width} ${size}">${icon.path.replaceAll(PATH_TAG_RE, `<path fill="${color}" `)}</svg>`,
    "image/svg+xml"
  );
}
