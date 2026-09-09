import { describe, expect, it } from "bun:test";

import { pinHeadingAnchors } from "../src/translate/anchors.ts";
import { validateTranslation } from "../src/translate/validate.ts";

const SOURCE = `# Guide

## Ordering

Text.

## Hidden pages [!toc]

## Setup [#install]

## API
`;

describe(pinHeadingAnchors, () => {
  it("pins each translated heading to the source id unless it already matches", () => {
    const translated = `# Anleitung

## Reihenfolge

Text.

## Ausgeblendete Seiten [!toc]

## Einrichtung [#install]

## API
`;
    const result = pinHeadingAnchors(SOURCE, translated);
    expect(result.pinned).toBe(3);
    expect(result.skipped).toBeUndefined();
    expect(result.text).toBe(`# Anleitung [#guide]

## Reihenfolge [#ordering]

Text.

## Ausgeblendete Seiten [!toc] [#hidden-pages]

## Einrichtung [#install]

## API
`);
  });

  it("returns the text untouched when nothing needs a pin", () => {
    const result = pinHeadingAnchors("## API\n", "## API\n");
    expect(result).toStrictEqual({ pinned: 0, text: "## API\n" });
  });

  it("pins setext headings on their last text line and keeps closing hashes and CRLF", () => {
    const source = "Intro\n=====\n\n## Setup ##\r\n";
    const translated =
      "Einleitung\nzweite Zeile\n=====\n\n## Einrichtung ##\r\n";
    const result = pinHeadingAnchors(source, translated);
    expect(result.pinned).toBe(2);
    expect(result.text).toBe(
      "Einleitung\nzweite Zeile [#intro]\n=====\n\n## Einrichtung [#setup] ##\r\n"
    );
  });

  it("disambiguates repeated headings the way the renderer does", () => {
    const source = "## Setup\n\n## Setup\n";
    const translated = "## Einrichtung\n\n## Setup\n";
    const result = pinHeadingAnchors(source, translated);
    expect(result.text).toBe(
      "## Einrichtung [#setup]\n\n## Setup [#setup-1]\n"
    );
  });

  it("skips a translation whose heading structure differs from the source", () => {
    const result = pinHeadingAnchors(SOURCE, "# Anleitung\n\n## Reihenfolge\n");
    expect(result.pinned).toBe(0);
    expect(result.text).toBe("# Anleitung\n\n## Reihenfolge\n");
    expect(result.skipped).toBe(
      "heading structure differs (source has 5 headings, translation has 2)"
    );
    // Same count, different depths.
    expect(
      pinHeadingAnchors("## A\n\n### B\n", "## X\n\n## Y\n").skipped
    ).toContain("heading structure differs");
  });

  it("keeps the agent's text when a pin would not render as the source id", () => {
    // A link-reference definition for `#setup` turns the appended `[#setup]`
    // into a shortcut link, so the rendered id would still differ.
    const translated = "## Einrichtung\n\n[#setup]: /elsewhere\n";
    const result = pinHeadingAnchors("## Setup\n", translated);
    expect(result).toStrictEqual({
      pinned: 0,
      skipped: "pinned anchors did not reproduce the source heading ids",
      text: translated,
    });
  });
});

describe("validateTranslation pins anchors", () => {
  it("writes source heading ids into the validated body", () => {
    const source = `---
title: Setup
---
## Ordering

Text.
`;
    const agent = `---
title: Einrichtung
---
## Reihenfolge

Text.
`;
    const result = validateTranslation(source, agent);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).toContain("## Reihenfolge [#ordering]\n");
      expect(result.text).toContain("title: Einrichtung");
    }
  });
});
