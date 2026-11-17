import type { CSSProperties, ReactNode } from "react";

import type { Music, ProfileData } from "./data.ts";
import { EQUALIZER_SIZE, createEqualizerSvg } from "./equalizer.ts";
import { formatNumber, formatShortDate } from "./format.ts";
import type { MergedPullRequest } from "./github.ts";
import { createIconDataUri } from "./icon.ts";
import type { IconName } from "./icon.ts";
import { toDataUri } from "./image.ts";
import { LAYOUT } from "./layout.ts";
import type { Rect } from "./layout.ts";
import { createSheenSvg } from "./sheen.ts";
import { cropSnake } from "./snake.ts";
import type { Theme, ThemeName } from "./theme.ts";
import { createVinylSvg } from "./vinyl.ts";

const HEADING_FONT = "Hubot Sans";
const MONO_FONT = "Monaspace Neon";
const TEXT_FONT = "Mona Sans";

const FULL: CSSProperties = {
  height: "100%",
  left: 0,
  position: "absolute",
  top: 0,
  width: "100%",
};

const ELLIPSIS: CSSProperties = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export function Profile({ data, theme, themeName }: ProfileProps) {
  const { canvas, canvasRadius, cards } = LAYOUT;
  const backdrop = data.backdrops[themeName];
  const glass: GlassContext = { image: backdrop.glass, theme };

  return (
    <div
      style={{
        borderRadius: canvasRadius,
        color: theme.text,
        display: "flex",
        fontFamily: TEXT_FONT,
        height: canvas.height,
        overflow: "hidden",
        position: "relative",
        width: canvas.width,
      }}
    >
      <Picture src={backdrop.glass} style={FULL} />
      <Picture
        src={backdrop.banner}
        style={{
          ...LAYOUT.banner,
          left: 0,
          maskImage: "linear-gradient(180deg, black 70%, transparent 100%)",
          position: "absolute",
          top: 0,
        }}
      />
      <div
        style={{
          ...FULL,
          backgroundImage: theme.backdropOverlay,
          display: "flex",
        }}
      />
      <NamePlate data={data} glass={glass} />
      <Stats glass={glass} stats={data.github.stats} />
      <MusicCard music={data.music} rect={cards.music} theme={theme} />
      <PullRequestsCard
        avatars={data.avatars}
        glass={glass}
        pullRequests={data.github.latestPullRequests}
      />
      <ImageCard rect={cards.npmx} src={data.npmxCard} theme={theme} />
      <OwnersCard
        avatars={data.avatars}
        glass={glass}
        owners={data.github.topOwners}
      />
      <Glass context={glass} rect={cards.snake}>
        <Picture
          src={toDataUri(cropSnake(data.snake[themeName]), "image/svg+xml")}
          style={{ ...FULL, objectFit: "contain" }}
        />
      </Glass>
      <Picture
        src={toDataUri(createSheenSvg(canvas), "image/svg+xml")}
        style={FULL}
      />
    </div>
  );
}

function NamePlate({
  data,
  glass,
}: {
  data: ProfileData;
  glass: GlassContext;
}) {
  const { bluesky, github } = data;
  const { theme } = glass;

  return (
    <Glass
      context={glass}
      rect={LAYOUT.namePlate}
      style={{ alignItems: "center", gap: 22, padding: "0 24px" }}
    >
      <Picture
        src={data.avatar}
        style={{
          ...LAYOUT.sizes.avatar,
          border: `3px solid ${theme.glassBorder}`,
          borderRadius: 999,
        }}
      />
      <div
        style={{ display: "flex", flex: 1, flexDirection: "column", gap: 8 }}
      >
        <span
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {bluesky.displayName}
        </span>
        <span style={{ ...ELLIPSIS, color: theme.muted, fontSize: 15 }}>
          {bluesky.description}
        </span>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 12,
            marginTop: 6,
          }}
        >
          <span
            style={{
              backgroundColor: theme.pill,
              borderRadius: 999,
              fontFamily: MONO_FONT,
              fontSize: 13,
              padding: "4px 10px",
            }}
          >
            @{bluesky.handle}
          </span>
          <Facepile
            avatars={data.avatars}
            logins={github.memberships}
            theme={theme}
          />
        </div>
      </div>
    </Glass>
  );
}

function Facepile({
  avatars,
  logins,
  theme,
}: {
  avatars: Map<string, string>;
  logins: string[];
  theme: Theme;
}) {
  return (
    <div style={{ alignItems: "center", display: "flex" }}>
      {logins.map((login, index) => {
        const avatar = avatars.get(login);
        if (!avatar) return null;

        return (
          <Picture
            key={login}
            src={avatar}
            style={{
              border: `2px solid ${theme.glassBorder}`,
              borderRadius: 999,
              height: 28,
              marginLeft: index === 0 ? 0 : -8,
              width: 28,
            }}
          />
        );
      })}
    </div>
  );
}

function Stats({
  glass,
  stats,
}: {
  glass: GlassContext;
  stats: ProfileData["github"]["stats"];
}) {
  const tiles: Array<{ icon: IconName; label: string; value: number }> = [
    {
      icon: "flame",
      label: "contributions in a year",
      value: stats.contributions,
    },
    {
      icon: "git-merge",
      label: "pull requests merged",
      value: stats.mergedPullRequests,
    },
    {
      icon: "code-review",
      label: "pull requests reviewed",
      value: stats.reviewedPullRequests,
    },
    {
      icon: "repo",
      label: "repos contributed to",
      value: stats.contributedRepositories,
    },
  ];

  return tiles.map(({ icon, label, value }, index) => {
    const rect = LAYOUT.cards.stats[index];
    if (!rect) return null;

    return (
      <Glass
        context={glass}
        key={label}
        rect={rect}
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -0.5,
              lineHeight: 1,
            }}
          >
            {formatNumber(value)}
          </span>
          <Picture
            src={createIconDataUri(icon, glass.theme.muted)}
            style={{ height: 16, width: 16 }}
          />
        </div>
        <span style={{ color: glass.theme.muted, fontSize: 13 }}>{label}</span>
      </Glass>
    );
  });
}

function MusicCard({
  music,
  rect,
  theme,
}: {
  music: Music | undefined;
  rect: Rect;
  theme: Theme;
}) {
  if (!music) return null;

  const { vinyl } = LAYOUT.sizes;
  const textWidth = rect.width - vinyl.width * 0.78;

  return (
    <Card rect={rect} theme={theme}>
      <Picture src={music.background} style={FULL} />
      <div style={{ ...FULL, backgroundImage: theme.scrim, display: "flex" }} />
      <Picture
        src={toDataUri(
          createVinylSvg(music.cover, { isSpinning: music.isPlaying }),
          "image/svg+xml"
        )}
        style={{
          ...vinyl,
          left: textWidth,
          position: "absolute",
          top: (rect.height - vinyl.height) / 2,
        }}
      />
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 22,
          position: "relative",
          width: textWidth,
        }}
      >
        <div
          style={{
            alignItems: "center",
            color: theme.muted,
            display: "flex",
            fontSize: 13,
            fontWeight: 600,
            gap: 8,
          }}
        >
          {music.isPlaying ? (
            <Picture
              src={toDataUri(createEqualizerSvg(theme.accent), "image/svg+xml")}
              style={EQUALIZER_SIZE}
            />
          ) : null}
          {music.isPlaying ? "Now playing" : "Last played"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              display: "block",
              fontFamily: HEADING_FONT,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: -0.5,
              lineClamp: 3,
              lineHeight: 1.1,
            }}
          >
            {music.title}
          </span>
          <span style={{ ...ELLIPSIS, color: theme.muted, fontSize: 15 }}>
            {music.artist}
          </span>
        </div>
      </div>
    </Card>
  );
}

function PullRequestsCard({
  avatars,
  glass,
  pullRequests,
}: {
  avatars: Map<string, string>;
  glass: GlassContext;
  pullRequests: MergedPullRequest[];
}) {
  const { theme } = glass;

  return (
    <Glass
      context={glass}
      rect={LAYOUT.cards.pullRequests}
      style={{ flexDirection: "column", padding: "8px 20px" }}
    >
      {pullRequests.map(
        ({ mergedAt, number, owner, repository, title }, index) => {
          const avatar = avatars.get(owner);

          return (
            <div
              key={`${owner}/${repository}#${number}`}
              style={{
                alignItems: "center",
                borderTop: index === 0 ? "none" : `1px solid ${theme.divider}`,
                display: "flex",
                flex: 1,
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexShrink: 0,
                  height: 36,
                  position: "relative",
                  width: 36,
                }}
              >
                {avatar ? (
                  <Picture
                    src={avatar}
                    style={{ borderRadius: 10, height: 36, width: 36 }}
                  />
                ) : null}
                <div
                  style={{
                    alignItems: "center",
                    backgroundColor: theme.merged,
                    border: `2px solid ${theme.glassBorder}`,
                    borderRadius: 999,
                    bottom: -5,
                    display: "flex",
                    height: 18,
                    justifyContent: "center",
                    position: "absolute",
                    right: -5,
                    width: 18,
                  }}
                >
                  <Picture
                    src={createIconDataUri("git-merge", "#ffffff")}
                    style={{ height: 10, width: 10 }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  gap: 3,
                  minWidth: 0,
                }}
              >
                <span style={{ ...ELLIPSIS, fontSize: 14, fontWeight: 600 }}>
                  {title}
                </span>
                <span
                  style={{
                    ...ELLIPSIS,
                    color: theme.muted,
                    fontFamily: MONO_FONT,
                    fontSize: 12,
                  }}
                >
                  {owner}/{repository}#{number}
                </span>
              </div>
              <span style={{ color: theme.muted, flexShrink: 0, fontSize: 12 }}>
                {formatShortDate(mergedAt)}
              </span>
            </div>
          );
        }
      )}
    </Glass>
  );
}

function OwnersCard({
  avatars,
  glass,
  owners,
}: {
  avatars: Map<string, string>;
  glass: GlassContext;
  owners: ProfileData["github"]["topOwners"];
}) {
  const { theme } = glass;
  const [first, ...rest] = owners;
  if (!first) return null;

  return (
    <Glass
      context={glass}
      rect={LAYOUT.cards.owners}
      style={{ flexDirection: "column", padding: "16px 20px" }}
    >
      <span style={{ color: theme.muted, fontSize: 13 }}>
        merged pull requests by project owner
      </span>
      <div style={{ alignItems: "center", display: "flex", flex: 1, gap: 18 }}>
        <Bubble
          avatar={avatars.get(first.login)}
          count={first.mergedPullRequests}
          size={getBubbleSize(first, first)}
          theme={theme}
        />
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flex: 1,
            flexWrap: "wrap",
            gap: 14,
            justifyContent: "center",
          }}
        >
          {rest.map((owner) => (
            <Bubble
              avatar={avatars.get(owner.login)}
              count={owner.mergedPullRequests}
              key={owner.login}
              size={getBubbleSize(owner, first)}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </Glass>
  );
}

function Bubble({
  avatar,
  count,
  size,
  theme,
}: {
  avatar: string | undefined;
  count: number;
  size: number;
  theme: Theme;
}) {
  return (
    <div
      style={{ alignItems: "center", display: "flex", flexDirection: "column" }}
    >
      {avatar ? (
        <Picture
          src={avatar}
          style={{
            border: `2px solid ${theme.glassBorder}`,
            borderRadius: 999,
            height: size,
            width: size,
          }}
        />
      ) : (
        <div
          style={{
            backgroundColor: theme.pill,
            borderRadius: 999,
            display: "flex",
            height: size,
            width: size,
          }}
        />
      )}
      <span
        style={{
          backgroundColor: theme.text,
          borderRadius: 999,
          color: theme.page,
          fontSize: 11,
          fontWeight: 600,
          marginTop: -10,
          padding: "2px 7px",
        }}
      >
        {formatNumber(count)}
      </span>
    </div>
  );
}

// Areas grow with the count, so the diameter grows with its square root.
function getBubbleSize(
  owner: { mergedPullRequests: number },
  largest: { mergedPullRequests: number }
) {
  const ratio = Math.sqrt(
    owner.mergedPullRequests / largest.mergedPullRequests
  );

  return Math.round(36 + (108 - 36) * ratio);
}

function ImageCard({
  rect,
  src,
  theme,
}: {
  rect: Rect;
  src: string;
  theme: Theme;
}) {
  return (
    <Card rect={rect} theme={theme}>
      <Picture src={src} style={FULL} />
    </Card>
  );
}

/** A card with a frosted glass background that shows the blurred landscape behind it. */
function Glass({ children, context, rect, style }: GlassProps) {
  const { canvas } = LAYOUT;
  const { image, theme } = context;

  return (
    <Card rect={rect} theme={theme}>
      <Picture
        src={image}
        style={{ ...canvas, left: -rect.x, position: "absolute", top: -rect.y }}
      />
      <div
        style={{ ...FULL, backgroundColor: theme.glassTint, display: "flex" }}
      />
      <div
        style={{
          ...FULL,
          backgroundImage: theme.glassHighlight,
          display: "flex",
        }}
      />
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flex: 1,
          position: "relative",
          ...style,
        }}
      >
        {children}
      </div>
    </Card>
  );
}

function Card({
  children,
  rect,
  theme,
}: {
  children: ReactNode;
  rect: Rect;
  theme: Theme;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.glassBorder}`,
        borderRadius: LAYOUT.cardRadius,
        boxShadow: theme.glassShadow,
        display: "flex",
        height: rect.height,
        left: rect.x,
        overflow: "hidden",
        position: "absolute",
        top: rect.y,
        width: rect.width,
      }}
    >
      {children}
    </div>
  );
}

function Picture({ src, style }: { src: string; style: CSSProperties }) {
  // oxlint-disable-next-line jsx-a11y/alt-text -- Satori draws this into an SVG, where the README's `alt` describes the image.
  return <img src={src} style={{ objectFit: "cover", ...style }} />;
}

interface ProfileProps {
  data: ProfileData;
  theme: Theme;
  themeName: ThemeName;
}

interface GlassContext {
  /** The blurred landscape for the current theme. */
  image: string;
  theme: Theme;
}

interface GlassProps {
  children: ReactNode;
  context: GlassContext;
  rect: Rect;
  style?: CSSProperties;
}
