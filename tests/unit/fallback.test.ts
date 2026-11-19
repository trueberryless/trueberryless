import { afterEach, describe, expect, test, vi } from "vitest";

import {
  createAssetLoader,
  getEmojiCode,
  getFontFamilies,
  parseFontFaces,
} from "../../src/fallback.ts";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getFontFamilies", () => {
  test("picks the Noto font for the script", () => {
    expect(getFontFamilies("ja-JP")).toEqual(["Noto Sans JP"]);
    expect(getFontFamilies("ko-KR")).toEqual(["Noto Sans KR"]);
    expect(getFontFamilies("zh-CN")).toEqual(["Noto Sans SC"]);
  });

  test("tries every language of a shared script", () => {
    expect(getFontFamilies("ja-JP|zh-CN|zh-TW|zh-HK")).toEqual([
      "Noto Sans JP",
      "Noto Sans SC",
      "Noto Sans TC",
      "Noto Sans HK",
    ]);
  });

  test("falls back to Noto Sans for other scripts", () => {
    expect(getFontFamilies("unknown")).toEqual(["Noto Sans"]);
  });
});

describe("parseFontFaces", () => {
  test("reads the weight and URL of every TrueType face", () => {
    expect(
      parseFontFaces(`@font-face {
  font-family: 'Noto Sans JP';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/l/font?kit=a) format('truetype');
}
@font-face {
  font-family: 'Noto Sans JP';
  font-style: normal;
  font-weight: 800;
  src: url(https://fonts.gstatic.com/l/font?kit=b) format('truetype');
}`)
    ).toEqual([
      { url: "https://fonts.gstatic.com/l/font?kit=a", weight: 400 },
      { url: "https://fonts.gstatic.com/l/font?kit=b", weight: 800 },
    ]);
  });

  test("ignores WOFF2 faces, which Satori can't read", () => {
    expect(
      parseFontFaces(
        "@font-face { font-weight: 400; src: url(https://example.com/a.woff2) format('woff2'); }"
      )
    ).toEqual([]);
  });
});

describe("getEmojiCode", () => {
  test("drops the variation selector of a single emoji", () => {
    expect(getEmojiCode("❤️")).toBe("2764");
  });

  test("keeps every code point of a joined sequence", () => {
    expect(getEmojiCode("👩‍💻")).toBe("1f469-200d-1f4bb");
  });
});

describe("createAssetLoader", () => {
  test("loads an emoji as an image and caches it", async () => {
    const fetch = vi.fn(async () => new Response("<svg></svg>"));
    vi.stubGlobal("fetch", fetch);
    const loadAsset = createAssetLoader();

    const first = await loadAsset("emoji", "🎧");
    const second = await loadAsset("emoji", "🎧");

    expect(first).toBe(
      `data:image/svg+xml;base64,${Buffer.from("<svg></svg>").toString("base64")}`
    );
    expect(second).toBe(first);
    expect(fetch).toHaveBeenCalledOnce();
  });

  test("loads a subset font named after its segment", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.startsWith("https://fonts.googleapis.com/")
          ? new Response(
              "@font-face { font-weight: 800; src: url(https://fonts.gstatic.com/l/font?kit=a) format('truetype'); }"
            )
          : new Response("font")
      )
    );

    const fonts = await createAssetLoader()("ko-KR", "사랑해");

    expect(fonts).toEqual([
      {
        data: Buffer.from("font"),
        name: "Noto Sans KR 사랑해",
        style: "normal",
        weight: 800,
      },
    ]);
  });

  test("renders without the fallback font when it can't be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      })
    );
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1000 });

    await expect(createAssetLoader()("ja-JP", "金字塔")).resolves.toEqual([]);

    vi.useRealTimers();
  }, 30_000);
});
