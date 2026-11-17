import { describe, expect, test } from "vitest";

import { parseAstroBadge } from "../../src/astro.ts";

describe("parseAstroBadge", () => {
  test("reads the counts and achievements from the badge", () => {
    const contributions = parseAstroBadge(
      [
        "<svg>",
        '<text font-weight="500" font-size="8.5" x="17" y="61" text-anchor="middle">22</text>',
        '<text font-weight="500" font-size="8.5" x="17" y="91" text-anchor="middle">353</text>',
        '<text font-weight="500" font-size="8.5" x="17" y="121" text-anchor="middle">328</text>',
        '<text x="41" y="41"><tspan font-weight="500">Constellation Crafter</tspan> <tspan dx="2" fill="#BFC1C9">PRs in 6 Astro repos</tspan></text>,',
        '<text x="41" y="58.5"><tspan font-weight="500">Rosetta Stone</tspan> <tspan dx="2" fill="#BFC1C9">Reviewed 40 i18n PRs</tspan></text>',
        "</svg>",
      ].join("\n")
    );

    expect(contributions).toEqual({
      achievements: [
        { description: "PRs in 6 Astro repos", title: "Constellation Crafter" },
        { description: "Reviewed 40 i18n PRs", title: "Rosetta Stone" },
      ],
      counts: { issues: 22, pullRequests: 353, reviews: 328 },
    });
  });

  test("returns undefined when the badge looks different", () => {
    expect(
      parseAstroBadge('<svg><text x="41" y="22">@trueberryless</text></svg>')
    ).toBeUndefined();
  });
});
