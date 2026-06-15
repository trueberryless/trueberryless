import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BENTO_HTML_PATH = path.join(__dirname, "../src/bento-grid.html");
const OUTPUT_SVG_PATH = path.join(__dirname, "../html-wrapper.svg");
const LOCAL_SNAKE_PATH = path.join(
  __dirname,
  "../dist/github-contribution-grid-snake-dark.svg",
);

const SNAKE_URL =
  "https://raw.githubusercontent.com/trueberryless/trueberryless/snake/github-contribution-grid-snake-dark.svg";
const SPOTIFY_URL =
  "https://spotify-github-profile.kittinanx.com/api/view?uid=pjyifjjapvah0yoy2zvd8vx0v&cover_image=true&theme=default&show_offline=false&background_color=0d1117&interchange=true&bar_color=53b14f&bar_color_cover=true";

async function build() {
  let html = fs.readFileSync(BENTO_HTML_PATH, "utf-8");

  let snakeSvg = "";
  if (fs.existsSync(LOCAL_SNAKE_PATH)) {
    snakeSvg = fs.readFileSync(LOCAL_SNAKE_PATH, "utf-8");
  } else {
    const snakeRes = await fetch(SNAKE_URL);
    snakeSvg = await snakeRes.text();
  }

  const spotifyRes = await fetch(SPOTIFY_URL);
  let spotifySvg = await spotifyRes.text();

  spotifySvg = spotifySvg.replace(/<a[^>]*>/g, "").replace(/<\/a>/g, "");

  const felixPath = path.join(__dirname, "../src/img/felix.png");
  const felixBase64 = fs.readFileSync(felixPath, "base64");
  html = html.replace(
    "./img/felix.png",
    `data:image/png;base64,${felixBase64}`,
  );

  const astroRes = await fetch(
    "https://astro.badg.es/v2/contributor/trueberryless.svg",
  );
  const astroBuffer = await astroRes.arrayBuffer();
  const astroBase64 = Buffer.from(astroBuffer).toString("base64");
  html = html.replace(
    "https://astro.badg.es/v2/contributor/trueberryless.svg",
    `data:image/svg+xml;base64,${astroBase64}`,
  );

  const npmxersRes = await fetch(
    "https://npmxers.trueberryless.org/_og/r/trueberryless.png",
  );
  const npmxersBuffer = await npmxersRes.arrayBuffer();
  const npmxersBase64 = Buffer.from(npmxersBuffer).toString("base64");
  html = html.replace(
    "https://npmxers.trueberryless.org/_og/r/trueberryless.png",
    `data:image/png;base64,${npmxersBase64}`,
  );

  html = html.replace("{{SNAKE_SVG}}", snakeSvg);
  html = html.replace("{{SPOTIFY_SVG}}", spotifySvg);

  const finalSvg = `<svg width="840" height="906" xmlns="http://www.w3.org/2000/svg">
    <foreignObject width="100%" height="100%">
        ${html}
    </foreignObject>
</svg>`;

  fs.writeFileSync(OUTPUT_SVG_PATH, finalSvg);
}

build();
