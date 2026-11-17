export const THEME_NAMES = ["dark", "light"] as const;

export const THEMES = {
  dark: {
    accent: "#3fb950",
    backdropBrightness: 0.6,
    backdropOverlay:
      "linear-gradient(180deg, rgba(3, 7, 18, 0.05) 0%, rgba(3, 7, 18, 0.45) 45%, rgba(3, 7, 18, 0.7) 100%)",
    divider: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.16)",
    glassShadow: "0 16px 40px rgba(0, 0, 0, 0.35)",
    glassTint: "rgba(13, 17, 25, 0.56)",
    merged: "#a371f7",
    muted: "rgba(255, 255, 255, 0.64)",
    page: "#0d1117",
    pill: "rgba(255, 255, 255, 0.1)",
    solidTint: "rgba(13, 17, 23, 0.86)",
    scrim:
      "linear-gradient(90deg, rgba(8, 10, 16, 0.82) 0%, rgba(8, 10, 16, 0.55) 55%, rgba(8, 10, 16, 0.2) 100%)",
    text: "#ffffff",
  },
  light: {
    accent: "#1a7f37",
    backdropBrightness: 1.02,
    backdropOverlay:
      "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 45%, rgba(255, 255, 255, 0.45) 100%)",
    divider: "rgba(12, 18, 34, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.8)",
    glassShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
    glassTint: "rgba(255, 255, 255, 0.58)",
    merged: "#8250df",
    muted: "rgba(12, 18, 34, 0.62)",
    page: "#ffffff",
    pill: "rgba(12, 18, 34, 0.06)",
    solidTint: "rgba(255, 255, 255, 0.86)",
    scrim:
      "linear-gradient(90deg, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0.6) 55%, rgba(255, 255, 255, 0.15) 100%)",
    text: "#0c1222",
  },
} satisfies Record<ThemeName, Theme>;

export type ThemeName = (typeof THEME_NAMES)[number];

export interface Theme {
  accent: string;
  /** How bright the landscape behind the cards is, as a `sharp` brightness factor. */
  backdropBrightness: number;
  backdropOverlay: string;
  divider: string;
  glassBorder: string;
  glassShadow: string;
  glassTint: string;
  merged: string;
  muted: string;
  /** The background of the GitHub page, used by the local preview. */
  page: string;
  pill: string;
  /** A nearly opaque tint for content that brings its own colors, like the snake. */
  solidTint: string;
  /** Keeps text readable on top of the album cover. */
  scrim: string;
  text: string;
}
