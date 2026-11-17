export const THEME_NAMES = ["dark", "light"] as const;

// Colors from GitHub's Primer primitives, so the cards blend into the profile page in
// both color modes.
export const THEMES = {
  dark: {
    accent: "#3fb950",
    border: "#3d444d",
    card: "#151b23",
    heroOverlay:
      "linear-gradient(90deg, rgba(13, 17, 23, 0.9) 0%, rgba(13, 17, 23, 0.72) 55%, rgba(13, 17, 23, 0.35) 100%)",
    muted: "#9198a1",
    page: "#0d1117",
    subtle: "#212830",
    text: "#f0f6fc",
  },
  light: {
    accent: "#1a7f37",
    border: "#d1d9e0",
    card: "#f6f8fa",
    heroOverlay:
      "linear-gradient(90deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.78) 55%, rgba(255, 255, 255, 0.4) 100%)",
    muted: "#59636e",
    page: "#ffffff",
    subtle: "#eff2f5",
    text: "#1f2328",
  },
} satisfies Record<ThemeName, Theme>;

export type ThemeName = (typeof THEME_NAMES)[number];

export interface Theme {
  accent: string;
  border: string;
  card: string;
  heroOverlay: string;
  muted: string;
  page: string;
  subtle: string;
  text: string;
}
