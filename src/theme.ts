import type { SnakePalette } from "./snake.ts";

export const THEME_NAMES = ["dark", "light"] as const;

export const THEMES = {
  dark: {
    accent: "#3fb950",
    backdropBrightness: 0.6,
    backdropOverlay:
      "linear-gradient(180deg, rgba(13, 17, 23, 0) 0%, rgba(13, 17, 23, 0.4) 40%, rgba(13, 17, 23, 0.88) 100%)",
    border: "#3d444d",
    divider: "rgba(240, 246, 252, 0.08)",
    glassBorder: "rgba(240, 246, 252, 0.14)",
    glassShadow: "0 16px 40px rgba(1, 4, 9, 0.4)",
    glassTint: "rgba(13, 17, 23, 0.56)",
    merged: "#ab7df8",
    muted: "#9198a1",
    page: "#0d1117",
    pill: "rgba(240, 246, 252, 0.1)",
    scrim:
      "linear-gradient(90deg, rgba(13, 17, 23, 0.84) 0%, rgba(13, 17, 23, 0.55) 55%, rgba(13, 17, 23, 0.2) 100%)",
    snake: {
      c0: "#262c36",
      c1: "#0e4429",
      c2: "#006d32",
      c3: "#26a641",
      c4: "#39d353",
      cb: "rgba(240, 246, 252, 0.06)",
      ce: "#262c36",
      cs: "#ab7df8",
    },
    solidTint: "rgba(13, 17, 23, 0.82)",
    text: "#f0f6fc",
  },
  light: {
    accent: "#1a7f37",
    backdropBrightness: 1.02,
    backdropOverlay:
      "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.28) 40%, rgba(255, 255, 255, 0.86) 100%)",
    border: "#d1d9e0",
    divider: "rgba(31, 35, 40, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.85)",
    glassShadow: "0 16px 40px rgba(31, 35, 40, 0.14)",
    glassTint: "rgba(255, 255, 255, 0.6)",
    merged: "#8250df",
    muted: "#59636e",
    page: "#ffffff",
    pill: "rgba(31, 35, 40, 0.06)",
    scrim:
      "linear-gradient(90deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.62) 55%, rgba(255, 255, 255, 0.15) 100%)",
    snake: {
      c0: "#ebedf0",
      c1: "#9be9a8",
      c2: "#40c463",
      c3: "#30a14e",
      c4: "#216e39",
      cb: "rgba(31, 35, 40, 0.06)",
      ce: "#ebedf0",
      cs: "#8250df",
    },
    solidTint: "rgba(255, 255, 255, 0.86)",
    text: "#1f2328",
  },
} satisfies Record<ThemeName, Theme>;

export type ThemeName = (typeof THEME_NAMES)[number];

export interface Theme {
  accent: string;
  backdropBrightness: number;
  backdropOverlay: string;
  border: string;
  divider: string;
  glassBorder: string;
  glassShadow: string;
  glassTint: string;
  merged: string;
  muted: string;
  page: string;
  pill: string;
  scrim: string;
  snake: SnakePalette;
  solidTint: string;
  text: string;
}
