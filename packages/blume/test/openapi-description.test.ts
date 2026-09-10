import { describe, expect, it } from "bun:test";

import { descriptionHtml } from "../src/components/openapi/description.ts";

describe("descriptionHtml", () => {
  it("renders the Markdown a description is specified to contain", () => {
    const html = descriptionHtml(
      "**Inline** transforms run first.\n\nUse `apiKey` for auth."
    );
    expect(html).toContain("<strong>Inline</strong>");
    expect(html).toContain("<code>apiKey</code>");
    // Two paragraphs, not one run-on line — the wall of text this exists to fix.
    expect(html.match(/<p>/gu)).toHaveLength(2);
  });

  it("renders a list as a list", () => {
    const html = descriptionHtml("Steps:\n\n1. Connect\n2. Snapshot");
    expect(html).toContain("<ol>");
    expect(html.match(/<li>/gu)).toHaveLength(2);
  });

  it("leaves a bare URL as text", () => {
    // A spec description is full of EXAMPLE hosts. GFM would autolink each one
    // to a host that does not exist and was never meant to be visited.
    const host = "https://myorg.my.salesforce.com";
    const html = descriptionHtml(`Such as ${host} here.`);
    expect(html).not.toContain("<a ");
    expect(html).toContain(host);
  });

  it("keeps regex notation that only looks like a link", () => {
    // Debezium's column-list wording: `[.](columnName1|columnName2)` is EXACTLY
    // `[text](href)`. Emitting the link text alone would delete the notation,
    // since that text is just `.`.
    const notation = "schemaName[.]tableName[.](columnName1|columnName2)";
    const html = descriptionHtml(notation);
    expect(html).not.toContain("<a ");
    expect(html).toContain(notation);
  });

  it("links an href the author clearly meant", () => {
    const html = descriptionHtml("See [the guide](https://example.com/guide).");
    expect(html).toContain('href="https://example.com/guide"');
    expect(html).toContain(">the guide</a>");
  });

  it("does not read a scheme-relative URL as a site-root path", () => {
    // `//host` is a network-path reference to another origin, not a path on
    // this site — the one shape the "site-root" half of the policy must reject.
    const html = descriptionHtml("See [elsewhere](//attacker.example).");
    expect(html).not.toContain("<a ");
    expect(html).toContain("[elsewhere](//attacker.example)");
  });

  it("escapes raw HTML rather than passing it through", () => {
    const html = descriptionHtml('Ends with <img src=x onerror="alert(1)">.');
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("gives a table the scroll frame the body would have given it", () => {
    // `set:html` bypasses the `blume:table-wrap` plugin, and a description sits
    // in a column narrower than the body — so an unbreakable cell would
    // otherwise overflow the reference layout.
    const table = [
      "| Column | Meaning |",
      "| --- | --- |",
      "| `pk_one_very_long_unbreakable_token` | key |",
    ].join("\n");
    const frame = '<div class="blume-table-scroll" tabindex="0">';
    const html = descriptionHtml(table);
    expect(html).toContain(`${frame}<table>`);
    expect(html).toContain("</table></div>");
  });

  it("renders nothing for a description that is absent or blank", () => {
    // A spec property need not carry one at all, which is the shape the caller
    // guards on — declared rather than passed literally, since the linter reads
    // a bare `undefined` argument as noise.
    const absent: string | undefined = undefined;
    expect(descriptionHtml(absent)).toBe("");
    expect(descriptionHtml("   \n  ")).toBe("");
  });
});
