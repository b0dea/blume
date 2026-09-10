import { Marked } from "marked";

/**
 * Render a spec description as Markdown.
 *
 * An OpenAPI `description` is Markdown by specification — "CommonMark syntax MAY be used for rich
 * text representation" — but the reference components printed it with `set:text`, so a schema
 * property, parameter or header showed its source. On a spec generated from code docstrings that
 * is most of them: `**Inline**` printed its asterisks, `` `apiKey` `` printed its backticks, and
 * because HTML collapses newlines every paragraph and list ran together into one wall of text.
 * The operation description does not have this problem — it is emitted into the MDX body and goes
 * through the full pipeline — which is what made the difference visible page by page.
 *
 * `marked` rather than the site's own Markdown pipeline: the pipeline is async, plugin-laden and
 * built for whole documents, while these are thousands of short strings per build — a large
 * reference renders tens of thousands of them. `marked` is synchronous, already a dependency,
 * and already how the Ask AI island renders model Markdown.
 */
const markdown = new Marked({
  // `breaks` is deliberately NOT set, unlike the Ask AI island. Docstring prose is hard-wrapped at
  // 72 or 79 columns, so honouring single newlines would break every sentence mid-flow at exactly
  // the width the source file happened to use.
  breaks: false,
  gfm: true,
  renderer: {
    // Raw HTML is escaped rather than passed through. A description is data lifted out of a spec
    // file, frequently generated upstream from source comments, and it is interpolated with
    // `set:html`; the island that renders model output runs DOMPurify over it for the same
    // reason, which needs a DOM and so is unavailable in a component that renders on the server.
    html: ({ text }: { text: string }) =>
      text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;"),
    // A link is emitted only when the author clearly meant one; anything else keeps its source
    // text verbatim. Two failures drove this, and both are prose that was never Markdown.
    //
    // GFM autolinks a BARE url (`raw === href`), and a spec description is full of EXAMPLE hosts
    // — `https://myorg.my.salesforce.com`, `https://yourstore.myshopify.com`. Each became an
    // anchor pointing at a host that does not exist and was never meant to be visited.
    //
    // Worse, regex and format notation reads as link syntax. Debezium's own wording for a column
    // list is `schemaName[.]tableName[.](columnName1|columnName2)`, in which `[.](columnName1|
    // columnName2)` is EXACTLY `[text](href)` — 48 pages of one reference linked to a path made
    // of that notation.
    // Rendering the demoted case as `raw` rather than as `text` is what keeps that intact: the
    // text alone is `.`, so emitting it would silently delete the rest of the notation.
    //
    // The test for "meant one" is the href: an absolute URL, a site-root path, a fragment or a
    // mailto. A bare relative href in a spec description has never yet been a link. The lookahead
    // keeps `//host` out: that is a scheme-relative URL to another origin, not a site-root path.
    link({ href, raw }: { href: string; raw: string }) {
      const deliberate = /^(?:https?:|mailto:|#|\/(?!\/))/iu.test(href) && raw !== href;
      return deliberate
        ? false
        : raw
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    },
  },
});

/** `description` rendered to HTML, or an empty string when there is nothing to render. */
export const descriptionHtml = (description: string | undefined): string =>
  description?.trim() ? markdown.parse(description, { async: false }) : "";
