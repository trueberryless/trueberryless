import { GITHUB_LOGIN } from "./github.ts";

export const ASTRO_BADGE_URL = `https://astro.badg.es/v2/contributor/${GITHUB_LOGIN}.svg`;

// The badge lists each achievement as a bold title followed by a lighter description,
// and shows the issue, pull request and review counts in its left column.
const ACHIEVEMENT_RE =
  /<tspan font-weight="500">([^<]+)<\/tspan>\s*<tspan[^>]*>([^<]+)<\/tspan>/g;
const COUNT_RE = /<text font-weight="500" font-size="8\.5"[^>]*>(\d+)<\/text>/g;

/**
 * Reads the achievements and counts out of the Astro Badges SVG, so the profile can show
 * them in its own style. Returns `undefined` when the badge doesn't look as expected.
 */
export function parseAstroBadge(svg: string): AstroContributions | undefined {
  const achievements = [...svg.matchAll(ACHIEVEMENT_RE)].map(
    ([, title = "", description = ""]) => ({
      description: description.trim(),
      title: title.trim(),
    })
  );
  const [issues, pullRequests, reviews] = [...svg.matchAll(COUNT_RE)].map(
    ([, count]) => Number(count)
  );
  if (
    achievements.length === 0 ||
    issues === undefined ||
    pullRequests === undefined ||
    reviews === undefined
  ) {
    return;
  }

  return { achievements, counts: { issues, pullRequests, reviews } };
}

export interface AstroContributions {
  achievements: Array<{ description: string; title: string }>;
  counts: { issues: number; pullRequests: number; reviews: number };
}
