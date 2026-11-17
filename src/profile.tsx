import type { CSSProperties, ReactNode } from "react";

import type { ProfileData, Track } from "./data.ts";
import { EQUALIZER_SIZE, createEqualizerSvg } from "./equalizer.ts";
import { formatNumber, formatShortDate } from "./format.ts";
import type { MergedPullRequest } from "./github.ts";
import { GITHUB_LOGIN } from "./github.ts";
import { toDataUri } from "./image.ts";
import { LAYOUT } from "./layout.ts";
import type { Theme, ThemeName } from "./theme.ts";

const HEADING_FONT = "Hubot Sans";
const MONO_FONT = "Monaspace Neon";
const TEXT_FONT = "Mona Sans";

const MAINTAINED = ["npmx", "bombshell", "All Contributors", "Singi Labs"];

const ELLIPSIS_STYLE: CSSProperties = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export function Profile({ data, theme, themeName }: ProfileProps) {
  return (
    <div
      style={{
        color: theme.text,
        display: "flex",
        flexDirection: "column",
        fontFamily: TEXT_FONT,
        gap: LAYOUT.gap,
        width: LAYOUT.width,
      }}
    >
      <Hero avatar={data.avatar} hero={data.hero} theme={theme} />
      <Stats stats={data.github.stats} theme={theme} />
      <Row>
        <AstroCard astro={data.astro} theme={theme} />
        <Card label="npmx" theme={theme}>
          <Picture
            src={data.npmxCard}
            style={{ ...LAYOUT.npmxCard, borderRadius: 8 }}
          />
        </Card>
      </Row>
      <Row>
        <TrackCard theme={theme} track={data.track} />
        <PullRequestsCard
          pullRequests={data.github.pullRequests}
          theme={theme}
        />
      </Row>
      <Card
        label="Contributions in the last year"
        note="eaten by Platane/snk"
        theme={theme}
      >
        <Picture src={data.snake[themeName]} style={LAYOUT.snake} />
      </Card>
    </div>
  );
}

function Hero({
  avatar,
  hero,
  theme,
}: Pick<ProfileData, "avatar" | "hero"> & { theme: Theme }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: LAYOUT.radius,
        display: "flex",
        height: LAYOUT.hero.height,
        overflow: "hidden",
        position: "relative",
        width: LAYOUT.hero.width,
      }}
    >
      <Picture
        src={hero}
        style={{ ...LAYOUT.hero, left: 0, position: "absolute", top: 0 }}
      />
      <div
        style={{
          backgroundImage: theme.heroOverlay,
          display: "flex",
          height: LAYOUT.hero.height,
          left: 0,
          position: "absolute",
          top: 0,
          width: LAYOUT.hero.width,
        }}
      />
      {/* Positioned elements paint over in-flow ones, so the content needs a position too. */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 28,
          padding: "0 36px",
          position: "relative",
        }}
      >
        <Picture
          src={avatar}
          style={{
            ...LAYOUT.avatar,
            border: `3px solid ${theme.border}`,
            borderRadius: LAYOUT.avatar.width,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ alignItems: "baseline", display: "flex", gap: 14 }}>
            <span
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: -1,
                lineHeight: 1,
              }}
            >
              Felix Schneider
            </span>
            <span
              style={{
                color: theme.muted,
                fontFamily: MONO_FONT,
                fontSize: 16,
              }}
            >
              @{GITHUB_LOGIN}
            </span>
          </div>
          <span style={{ color: theme.muted, fontSize: 17 }}>
            Open source developer from Austria, mostly around Astro and
            Starlight.
          </span>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 8,
              marginTop: 6,
            }}
          >
            <span
              style={{
                color: theme.muted,
                fontSize: 13,
                fontWeight: 600,
                marginRight: 4,
              }}
            >
              Maintaining
            </span>
            {MAINTAINED.map((name) => (
              <span
                key={name}
                style={{
                  backgroundColor: theme.subtle,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "4px 12px",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stats({
  stats,
  theme,
}: {
  stats: ProfileData["github"]["stats"];
  theme: Theme;
}) {
  const tiles = [
    { label: "contributions in a year", value: stats.contributions },
    { label: "pull requests merged", value: stats.mergedPullRequests },
    { label: "pull requests reviewed", value: stats.reviewedPullRequests },
    { label: "repos contributed to", value: stats.contributedRepositories },
  ];

  return (
    <Row>
      {tiles.map(({ label, value }) => (
        <div
          key={label}
          style={{
            ...getCardStyle(theme),
            flexDirection: "column",
            gap: 6,
            padding: `18px ${LAYOUT.padding}px`,
            width: LAYOUT.quarter,
          }}
        >
          <span
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 30,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {formatNumber(value)}
          </span>
          <span style={{ color: theme.muted, fontSize: 13 }}>{label}</span>
        </div>
      ))}
    </Row>
  );
}

function AstroCard({
  astro,
  theme,
}: {
  astro: ProfileData["astro"];
  theme: Theme;
}) {
  const { contributions } = astro;
  if (!contributions) {
    return (
      <Card label="Astro contributions" theme={theme}>
        <Picture src={astro.badge} style={LAYOUT.astroBadge} />
      </Card>
    );
  }

  const counts = [
    { label: "pull requests", value: contributions.counts.pullRequests },
    { label: "reviews", value: contributions.counts.reviews },
    { label: "issues", value: contributions.counts.issues },
  ];

  return (
    <Card
      align="stretch"
      label="Astro contributions"
      note="astro.badg.es"
      theme={theme}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", fontSize: 14, gap: 16 }}>
          {counts.map(({ label, value }) => (
            <span key={label} style={{ color: theme.muted }}>
              <span
                style={{ color: theme.text, fontWeight: 600, marginRight: 4 }}
              >
                {formatNumber(value)}
              </span>
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {contributions.achievements.map(({ description, title }) => (
            <span key={title} style={{ ...ELLIPSIS_STYLE, fontSize: 13 }}>
              <span style={{ fontWeight: 600, marginRight: 8 }}>{title}</span>
              <span style={{ color: theme.muted }}>{description}</span>
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

function TrackCard({
  theme,
  track,
}: {
  theme: Theme;
  track: Track | undefined;
}) {
  if (!track) {
    return (
      <Card label="Spotify" theme={theme}>
        <span style={{ color: theme.muted, fontSize: 15 }}>
          Nothing played recently.
        </span>
      </Card>
    );
  }

  return (
    <Card
      align="stretch"
      label={track.isPlaying ? "Now playing" : "Recently played"}
      labelIcon={
        track.isPlaying ? (
          <Picture
            src={toDataUri(createEqualizerSvg(theme.accent), "image/svg+xml")}
            style={EQUALIZER_SIZE}
          />
        ) : undefined
      }
      note="on Spotify"
      theme={theme}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
        <Picture
          src={track.cover}
          style={{ ...LAYOUT.cover, borderRadius: 8 }}
        />
        <div
          style={{ display: "flex", flex: 1, flexDirection: "column", gap: 6 }}
        >
          <span
            style={{
              display: "block",
              fontFamily: HEADING_FONT,
              fontSize: 22,
              fontWeight: 800,
              lineClamp: 3,
              lineHeight: 1.2,
            }}
          >
            {track.title}
          </span>
          <span
            style={{
              color: theme.muted,
              display: "block",
              fontSize: 15,
              lineClamp: 2,
            }}
          >
            {track.artist}
          </span>
        </div>
      </div>
    </Card>
  );
}

function PullRequestsCard({
  pullRequests,
  theme,
}: {
  pullRequests: MergedPullRequest[];
  theme: Theme;
}) {
  return (
    <Card align="stretch" label="Latest merged pull requests" theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pullRequests.map(({ mergedAt, number, repository, title }) => (
          <div
            key={`${repository}#${number}`}
            style={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <div
              style={{
                color: theme.muted,
                display: "flex",
                fontSize: 12,
                gap: 12,
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  ...ELLIPSIS_STYLE,
                  flexShrink: 1,
                  fontFamily: MONO_FONT,
                }}
              >
                {repository}#{number}
              </span>
              <span style={{ flexShrink: 0 }}>{formatShortDate(mergedAt)}</span>
            </div>
            <span style={{ ...ELLIPSIS_STYLE, fontSize: 14 }}>{title}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Card({
  align = "center",
  children,
  label,
  labelIcon,
  note,
  theme,
}: CardProps) {
  return (
    <div
      style={{
        ...getCardStyle(theme),
        flex: 1,
        flexDirection: "column",
        gap: 14,
        padding: LAYOUT.padding,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 13,
          justifyContent: "space-between",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          {labelIcon}
          <span style={{ color: theme.muted, fontWeight: 600 }}>{label}</span>
        </div>
        {note ? <span style={{ color: theme.muted }}>{note}</span> : null}
      </div>
      <div
        style={{
          alignItems: align,
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", gap: LAYOUT.gap }}>{children}</div>;
}

function Picture({ src, style }: { src: string; style: CSSProperties }) {
  // oxlint-disable-next-line jsx-a11y/alt-text -- Satori draws this into an SVG, where the README's `alt` describes the image.
  return <img src={src} style={{ objectFit: "contain", ...style }} />;
}

function getCardStyle(theme: Theme): CSSProperties {
  return {
    backgroundColor: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: LAYOUT.radius,
    display: "flex",
  };
}

interface ProfileProps {
  data: ProfileData;
  theme: Theme;
  themeName: ThemeName;
}

interface CardProps {
  /** How the card's content is aligned horizontally. */
  align?: "center" | "stretch";
  children: ReactNode;
  label: string;
  labelIcon?: ReactNode;
  note?: string;
  theme: Theme;
}
