import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import type { Font } from "satori";

const require = createRequire(import.meta.url);

const FONTS = [
  {
    name: "Mona Sans",
    path: require.resolve("@fontsource/mona-sans/files/mona-sans-latin-400-normal.woff"),
    weight: 400,
  },
  {
    name: "Mona Sans",
    path: require.resolve("@fontsource/mona-sans/files/mona-sans-latin-600-normal.woff"),
    weight: 600,
  },
  {
    name: "Hubot Sans",
    path: require.resolve("@fontsource/hubot-sans/files/hubot-sans-latin-800-normal.woff"),
    weight: 800,
  },
  {
    name: "Monaspace Neon",
    path: require.resolve("@fontsource/monaspace-neon/files/monaspace-neon-latin-400-normal.woff"),
    weight: 400,
  },
] as const;

export async function loadFonts(): Promise<Font[]> {
  return Promise.all(
    FONTS.map(async ({ name, path, weight }) => ({
      data: await readFile(path),
      name,
      style: "normal" as const,
      weight,
    }))
  );
}
