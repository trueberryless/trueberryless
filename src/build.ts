import { mkdir, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";

import { createProfileData } from "./data.ts";
import { createAssetLoader } from "./fallback.ts";
import { loadFonts } from "./font.ts";
import { renderProfile } from "./render.ts";
import {
  fetchLiveSources,
  loadFixtureSources,
  saveFixtureSources,
} from "./sources.ts";
import { THEMES, THEME_NAMES } from "./theme.ts";

const DIST_DIR = new URL("../dist/", import.meta.url);

const { values: options } = parseArgs({
  options: {
    live: { default: false, type: "boolean" },
    "update-fixtures": { default: false, type: "boolean" },
  },
});

const sources = options.live
  ? await fetchLiveSources(process.env.GITHUB_TOKEN, DIST_DIR)
  : await loadFixtureSources();
if (options["update-fixtures"]) await saveFixtureSources(sources);

const [data, fonts] = await Promise.all([
  createProfileData(sources),
  loadFonts(),
]);

const loadAdditionalAsset = createAssetLoader();

await mkdir(DIST_DIR, { recursive: true });
await Promise.all([
  ...THEME_NAMES.map(async (themeName) =>
    writeFile(
      new URL(`profile-${themeName}.svg`, DIST_DIR),
      await renderProfile(data, themeName, fonts, { loadAdditionalAsset })
    )
  ),
  writeFile(new URL("index.html", DIST_DIR), createPreviewHtml()),
]);

function createPreviewHtml() {
  const sections = THEME_NAMES.map(
    (themeName) =>
      `<section style="background:${THEMES[themeName].page};padding:32px"><img src="profile-${themeName}.svg" alt="Profile in ${themeName} mode" style="display:block;margin:auto;max-width:100%"></section>`
  );

  return [
    "<!doctype html>",
    '<html lang="en">',
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Profile preview</title></head>',
    '<body style="margin:0">',
    "<main>",
    '<h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)">Profile preview</h1>',
    ...sections,
    "</main>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}
