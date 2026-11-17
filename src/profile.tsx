import type { CSSProperties, ReactNode } from "react";

import type { Music, ProfileData } from "./data.ts";
import { EQUALIZER_SIZE } from "./equalizer.ts";
import { formatNumber, formatShortDate } from "./format.ts";
import type { MergedPullRequest } from "./github.ts";
import { createIconDataUri } from "./icon.ts";
import type { IconName } from "./icon.ts";
import { toDataUri } from "./image.ts";
import { LAYOUT } from "./layout.ts";
import type { Rect } from "./layout.ts";
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

const OWNER_GRID_COLUMNS = 3;
const LARGEST_BUBBLE = 108;
const SMALL_BUBBLE = { max: 54, min: 36 };

/**
 * Everything of the profile that doesn't move. It gets flattened into one image, and the
 * animated parts (the snake, the spinning record and the equalizer) are drawn on top of
 * it as vectors, so the browser only repaints a few shapes per frame.
 */
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
      <MusicCard music={data.music} theme={theme} />
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
      {/* The snake itself is drawn on top of the flattened image. */}
      <Glass context={glass} rect={cards.snake} tint={theme.solidTint} />
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
  const { avatar, padding, rect } = LAYOUT.namePlate;
  const { theme } = glass;

  return (
    <Glass
      context={glass}
      rect={rect}
      style={{ alignItems: "center", gap: 22, padding }}
    >
      <Picture
        src={data.avatar}
        style={{ borderRadius: 999, height: avatar, width: avatar }}
      />
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          minWidth: 0,
        }}
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
        <span
          style={{
            ...ELLIPSIS,
            color: theme.muted,
            fontSize: 15,
            lineHeight: 1.2,
            marginTop: 10,
          }}
        >
          {bluesky.description}
        </span>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 12,
            marginTop: 16,
          }}
        >
          <span
            style={{
              alignItems: "center",
              backgroundColor: theme.pill,
              borderRadius: 999,
              display: "flex",
              fontFamily: MONO_FONT,
              fontSize: 13,
              height: 28,
              padding: "0 12px",
            }}
          >
            @{bluesky.handle}
          </span>
          <div style={{ alignItems: "center", display: "flex", gap: 6 }}>
            {github.memberships.map((login) => {
              const organizationAvatar = data.avatars.get(login);
              if (!organizationAvatar) return null;

              return (
                <Picture
                  key={login}
                  src={organizationAvatar}
                  style={{ borderRadius: 999, height: 26, width: 26 }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Glass>
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
  theme,
}: {
  music: Music | undefined;
  theme: Theme;
}) {
  if (!music) return null;

  const { cards } = LAYOUT;
  const { labelHeight, padding, textWidth, vinyl } = LAYOUT.music;

  return (
    <Card rect={cards.music} theme={theme}>
      <Picture src={music.background} style={FULL} />
      <div style={{ ...FULL, backgroundImage: theme.scrim, display: "flex" }} />
      {/* A playing record spins on top of the flattened image, a paused one stays here. */}
      {music.isPlaying ? null : (
        <Picture
          src={toDataUri(
            createVinylSvg(music.cover, { isSpinning: false }),
            "image/svg+xml"
          )}
          style={{
            height: vinyl.height,
            left: vinyl.x - cards.music.x,
            position: "absolute",
            top: vinyl.y - cards.music.y,
            width: vinyl.width,
          }}
        />
      )}
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding,
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
            height: labelHeight,
          }}
        >
          {/* Keeps room for the equalizer, which is drawn on top. */}
          {music.isPlaying ? (
            <div style={{ ...EQUALIZER_SIZE, display: "flex" }} />
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
                    borderRadius: 999,
                    bottom: -4,
                    display: "flex",
                    height: 17,
                    justifyContent: "center",
                    position: "absolute",
                    right: -4,
                    width: 17,
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

  const rows = [
    rest.slice(0, OWNER_GRID_COLUMNS),
    rest.slice(OWNER_GRID_COLUMNS, OWNER_GRID_COLUMNS * 2),
  ].filter((row) => row.length > 0);

  return (
    <Glass
      context={glass}
      rect={LAYOUT.cards.owners}
      style={{ flexDirection: "column", gap: 16, padding: 20 }}
    >
      <span style={{ color: theme.muted, fontSize: 13, lineHeight: 1.2 }}>
        merged pull requests by project owner
      </span>
      <div style={{ alignItems: "center", display: "flex", flex: 1, gap: 20 }}>
        <Bubble
          avatar={avatars.get(first.login)}
          count={first.mergedPullRequests}
          size={LARGEST_BUBBLE}
          theme={theme}
        />
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-around",
          }}
        >
          {rows.map((row) => (
            <div key={row[0]?.login} style={{ display: "flex" }}>
              {/* Empty cells keep a short row aligned with the columns above it. */}
              {Array.from({ length: OWNER_GRID_COLUMNS }, (_, index) => {
                const owner = row[index];

                return (
                  <div
                    key={owner?.login ?? `empty-${index}`}
                    style={{
                      display: "flex",
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    {owner ? (
                      <Bubble
                        avatar={avatars.get(owner.login)}
                        count={owner.mergedPullRequests}
                        size={getBubbleSize(owner, first)}
                        theme={theme}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
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
          style={{ borderRadius: 999, height: size, width: size }}
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

// Areas grow with the count, so the diameter grows with its square root. The smaller
// bubbles share a grid, so their size is capped to fit a cell.
function getBubbleSize(
  owner: { mergedPullRequests: number },
  largest: { mergedPullRequests: number }
) {
  const ratio = Math.sqrt(
    owner.mergedPullRequests / largest.mergedPullRequests
  );

  return Math.min(
    SMALL_BUBBLE.max,
    Math.round(SMALL_BUBBLE.min + (LARGEST_BUBBLE - SMALL_BUBBLE.min) * ratio)
  );
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
function Glass({ children, context, rect, style, tint }: GlassProps) {
  const { canvas } = LAYOUT;
  const { image, theme } = context;

  return (
    <Card rect={rect} theme={theme}>
      <Picture
        src={image}
        style={{ ...canvas, left: -rect.x, position: "absolute", top: -rect.y }}
      />
      <div
        style={{
          ...FULL,
          backgroundColor: tint ?? theme.glassTint,
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
  // oxlint-disable-next-line jsx-a11y/alt-text -- Satori draws this into an image, where the README's `alt` describes it.
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
  children?: ReactNode;
  context: GlassContext;
  rect: Rect;
  style?: CSSProperties;
  /** Overrides the tint, e.g. a more opaque one behind content that needs contrast. */
  tint?: string;
}
