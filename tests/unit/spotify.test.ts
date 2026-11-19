import { describe, expect, test } from "vitest";

import { parseSpotifyWidget } from "../../src/spotify.ts";

describe("parseSpotifyWidget", () => {
  test("reads the track from the widget", () => {
    const track = parseSpotifyWidget(
      createWidget({ artist: "Animadrop", title: "Soul Mirror" })
    );

    expect(track).toEqual({
      artist: "Animadrop",
      cover: Buffer.from("AAAA", "base64"),
      isPlaying: true,
      title: "Soul Mirror",
    });
  });

  test("decodes HTML entities in the title and artist", () => {
    const track = parseSpotifyWidget(
      createWidget({ artist: "Simon &amp; Garfunkel", title: "Don&#39;t Stop" })
    );

    expect(track?.artist).toBe("Simon & Garfunkel");
    expect(track?.title).toBe("Don't Stop");
  });

  test("decodes numeric HTML entities", () => {
    const track = parseSpotifyWidget(
      createWidget({
        artist: "Reol &#x2F; &#12524;&#12458;&#12523;",
        title: "Don&#x27;t Stop",
      })
    );

    expect(track?.artist).toBe("Reol / レオル");
    expect(track?.title).toBe("Don't Stop");
  });

  test("detects a track that is not playing anymore", () => {
    const track = parseSpotifyWidget(
      createWidget({
        artist: "beastboy",
        heading: "Recently played on",
        title: "Nice Guy Flavors",
      })
    );

    expect(track?.isPlaying).toBe(false);
  });

  test("returns undefined when the widget has no track", () => {
    expect(
      parseSpotifyWidget("<svg><text>Something went wrong</text></svg>")
    ).toBeUndefined();
  });
});

function createWidget({
  artist,
  heading = "Now playing on",
  title,
}: {
  artist: string;
  heading?: string;
  title: string;
}) {
  return [
    "<svg>",
    `<div class="playing">${heading} <img class="logo" src="" /></div>`,
    `<div class="artist">${title}</div>`,
    `<div class="song">${artist}</div>`,
    '<img src="data:image/png;base64, AAAA" width="300" height="300" class="cover" />',
    "</svg>",
  ].join("\n");
}
