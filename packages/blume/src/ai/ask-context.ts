import { normalizeRoute } from "../core/base-path.ts";
import { buildOramaIndex, queryOramaIndex } from "../search/orama-index.ts";
import type { OramaDoc } from "../search/orama-index.ts";

/** A chat message as posted by the Ask AI island (`{ role, content }`). */
export interface AskMessage {
  content: string;
  role: string;
}

/** The current-page hint the island forwards so the endpoint can prioritize it. */
export interface AskPage {
  path?: string;
}

/**
 * The self-contained snapshot the grounded Ask AI endpoint imports. Bundles the
 * search documents so retrieval works regardless of the configured search
 * provider and needs no filesystem access at request time. Serialized to
 * `generated/ask-data.json` and built by {@link buildAskData}.
 */
export interface AskData {
  /**
   * The site's `i18n.defaultLocale`, when i18n is configured. Selects a
   * word-segmenting Orama tokenizer for every non-Latin script, so retrieval
   * can match CJK, Cyrillic, Greek, Hebrew, or Devanagari content.
   */
  defaultLocale?: string;
  documents: OramaDoc[];
  site: string | null;
}

/** Documents retrieved per question and injected into the system prompt. */
const MAX_RESULTS = 6;
/** Characters kept per injected excerpt. */
const EXCERPT_CHARS = 2000;
/** Overall cap on injected documentation characters. */
const CONTEXT_BUDGET = 10_000;
/**
 * Smallest excerpt worth injecting. A long page pushed under a tiny residual
 * budget would get a full `## Title (/route)` heading over a fragment of a few
 * dozen characters — a section the model is invited to cite but that grounds
 * nothing. Short pages that fit whole are still injected below this floor.
 */
const MIN_EXCERPT_CHARS = 200;

/**
 * How much retrieved documentation a question carries (the `ai.ask.retrieval`
 * config). Every field falls back to the built-in default, so a partial object
 * only changes what it names. Injected characters dominate time-to-first-token
 * on a self-hosted backend, and the three knobs aren't interchangeable: the
 * budget caps the total, `excerptChars` decides how deep into one long page the
 * excerpt reaches, and `maxResults` decides how many pages retrieval adds (the
 * page the reader is viewing is injected on top of them).
 */
export interface AskRetrievalOptions {
  /** Overall cap on injected documentation characters. Defaults to `10000`. */
  contextBudget?: number;
  /** Characters kept per injected excerpt. Defaults to `2000`. */
  excerptChars?: number;
  /**
   * Documents retrieved per question. Defaults to `6`. The current page is
   * injected in addition when it isn't among the hits.
   */
  maxResults?: number;
}
/** Chars of lead-in kept before the matched region, for heading/sentence context. */
const EXCERPT_LEAD = 160;

/**
 * Remove English filler from retrieval and excerpt queries. Keep content verbs
 * such as "sign", "file" and "close", which can name documentation topics.
 */
const STOPWORDS = new Set([
  "a",
  "about",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "been",
  "before",
  "being",
  "both",
  "but",
  "by",
  "can",
  "did",
  "do",
  "does",
  "done",
  "each",
  "every",
  "for",
  "from",
  "get",
  "got",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "hers",
  "him",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "may",
  "me",
  "might",
  "mine",
  "must",
  "my",
  "no",
  "nor",
  "not",
  "of",
  "on",
  "or",
  "other",
  "our",
  "ours",
  "own",
  "shall",
  "she",
  "should",
  "so",
  "some",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "to",
  "us",
  "use",
  "used",
  "using",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
  "yours",
]);

/** A run of letters, combining marks and digits inside a word-like segment. */
const TERM = /[\p{L}\p{M}\p{N}]+/gu;

/**
 * Word-shaped pieces of a query, NFC-normalized and lowercased. Languages
 * written without spaces (the CJK/Thai sites the Orama tokenizer goes out of
 * its way to support) have no delimiter for a regex to split on, so the query
 * is cut with `Intl.Segmenter` where available — otherwise every excerpt
 * window silently degrades to the head of the page. The regex fallback covers
 * runtimes without the segmenter and still handles spaced scripts correctly.
 */
const hasSegmenter = (
  segmenter: typeof Intl.Segmenter | undefined
): segmenter is typeof Intl.Segmenter => typeof segmenter === "function";

const segmentQuery = (query: string): string[] => {
  const lowered = query.normalize("NFC").toLowerCase();
  if (!hasSegmenter(Intl.Segmenter)) {
    return lowered.match(TERM) ?? [];
  }
  const pieces: string[] = [];
  const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
  for (const segment of segmenter.segment(lowered)) {
    if (segment.isWordLike) {
      pieces.push(segment.segment);
    }
  }
  return pieces;
};

/** Distinct, meaningful lowercase terms from a query (drops stopwords). */
const queryTerms = (query: string): string[] => {
  const terms = segmentQuery(query).flatMap((piece) => piece.match(TERM) ?? []);
  return [...new Set(terms)].filter(
    (term) => term.length >= 2 && !STOPWORDS.has(term)
  );
};

/**
 * The grounding preamble. The model is told to answer strictly from the injected
 * excerpts and to cite the pages it used as Markdown links (each excerpt is
 * headed by `## Title (/route)`), so citations render as real links in the panel.
 */
const BASE_INSTRUCTION =
  "You are a helpful documentation assistant for this project. Answer the user's question using ONLY the documentation excerpts below. Each excerpt is headed by its page as `## Page Title (/route)`. If the answer is not covered by the excerpts, say you don't know and suggest where in the docs to look — do not invent details. Always cite the pages you drew from, and write every citation as a Markdown link to that page using its route, e.g. [Page Title](/route).";

/** The most recent non-empty user message, used as the retrieval query. */
const lastUserMessage = (messages: AskMessage[]): string => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role === "user" && message.content?.trim()) {
      return message.content.trim();
    }
  }
  return "";
};

/** Meaningful terms below which a follow-up cannot stand as a query on its own. */
const MIN_QUERY_TERMS = 3;

const FOLLOW_UP_OPENERS = new Set(["also", "and", "but", "then"]);
const ANAPHORA = new Set([
  "it",
  "its",
  "that",
  "them",
  "these",
  "they",
  "this",
  "those",
]);

const isFollowUp = (message: string): boolean => {
  const words = segmentQuery(message);
  const [first] = words;
  return (
    (first !== undefined && FOLLOW_UP_OPENERS.has(first)) ||
    words.some((word) => ANAPHORA.has(word))
  );
};

/**
 * Short follow-ups need the subject from earlier user turns. Exclude assistant
 * turns so an incorrect answer cannot reinforce its own retrieval results.
 */
const retrievalQuery = (messages: AskMessage[]): string => {
  const asked = messages
    .filter((message) => message?.role === "user" && message.content?.trim())
    .map((message) => message.content.trim())
    .toReversed();
  const [latest = "", ...earlier] = asked;
  const terms = queryTerms(latest);
  if (terms.length >= MIN_QUERY_TERMS || !isFollowUp(latest)) {
    return terms.join(" ");
  }
  let index = 0;
  while (terms.length < MIN_QUERY_TERMS && index < earlier.length) {
    const message = earlier[index] ?? "";
    index += 1;
    for (const term of queryTerms(message)) {
      if (!terms.includes(term)) {
        terms.push(term);
      }
    }
  }
  return terms.join(" ");
};

/**
 * Excerpt the region of `content` most relevant to `query`, not just its head.
 *
 * Pages are indexed whole (one document each), so a naive head slice of a long
 * page returns its intro and misses sections below the fold — the exact failure
 * where "How does Ask AI work?" retrieves the right page but only sees its
 * opening paragraph. This centers the window on the densest cluster of query
 * terms so the injected text is the part that actually answers the question.
 * Exported for testing; {@link createAskContext} is the runtime entry point.
 */
export const relevantExcerpt = (
  content: string,
  query: string,
  max: number
): string => {
  // NFC to match the normalized query terms; positions are computed on (and
  // sliced from) this same string, so offsets stay aligned.
  const trimmed = content.normalize("NFC").trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  const withEllipsis = (start: number): string => {
    const slice = trimmed.slice(start, start + max).trim();
    const prefix = start > 0 ? "…" : "";
    const suffix = start + max < trimmed.length ? "…" : "";
    return `${prefix}${slice}${suffix}`;
  };

  // Case-insensitive matching via regex rather than `indexOf` on a lowercased
  // copy: length-changing case mappings (Turkish İ → "i" + U+0307) would shift
  // every index in the copy, sliding the excerpt window off the match. Terms
  // come from TERM (letters, marks and digits only), so no regex escaping.
  const positions: number[] = [];
  for (const term of queryTerms(query)) {
    for (const match of trimmed.matchAll(new RegExp(term, "giu"))) {
      positions.push(match.index);
    }
  }
  // No query terms hit this doc — nothing to center on, so keep the head.
  if (positions.length === 0) {
    return withEllipsis(0);
  }

  // Pick the term hit whose following `max`-char window covers the most hits.
  // `positions` is non-empty here, so the first window (count ≥ 1) always wins
  // over the initial 0 and assigns a real offset to `best`.
  positions.sort((a, b) => a - b);
  let best = 0;
  let bestCount = 0;
  for (const start of positions) {
    const end = start + max;
    let count = 0;
    for (const pos of positions) {
      if (pos >= end) {
        break;
      }
      if (pos >= start) {
        count += 1;
      }
    }
    if (count > bestCount) {
      bestCount = count;
      best = start;
    }
  }
  // Cap the lead-in at half the window: under a tight remaining budget `max`
  // can be smaller than EXCERPT_LEAD, and an uncapped `best - EXCERPT_LEAD`
  // start would end the slice before the very match it centered on.
  const lead = Math.min(EXCERPT_LEAD, Math.floor(max / 2));
  return withEllipsis(Math.max(0, best - lead));
};

/** A Markdown heading at level 2 or deeper — where a page divides itself. */
const SECTION_HEADING = /^ {0,3}#{2,6}[\t ]+.+$/u;
const CODE_FENCE = /^ {0,3}(?<run>`{3,}|~{3,})(?<rest>.*)$/u;

type Fence = { delimiter: "`" | "~"; length: number } | null;

const nextFence = (line: string, fence: Fence): Fence => {
  const groups = line.match(CODE_FENCE)?.groups;
  const run = groups?.run;
  if (run === undefined) {
    return fence;
  }
  const rest = groups?.rest ?? "";
  const delimiter = run.startsWith("`") ? ("`" as const) : ("~" as const);
  if (fence === null) {
    if (delimiter === "`" && rest.includes("`")) {
      return fence;
    }
    return { delimiter, length: run.length };
  }
  return fence.delimiter === delimiter &&
    run.length >= fence.length &&
    rest.trim() === ""
    ? null
    : fence;
};

const sectionStarts = (content: string): number[] => {
  const starts: number[] = [];
  let fence: Fence = null;
  let offset = 0;
  for (const rawLine of content.split("\n")) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    const next = nextFence(line, fence);
    if (fence === null && next === null && SECTION_HEADING.test(line)) {
      starts.push(offset);
    }
    fence = next;
    offset += rawLine.length + 1;
  }
  return starts;
};

/** Count term prefixes at the word boundaries used by the query tokenizer. */
const termHits = (text: string, terms: string[]): number => {
  let hits = 0;
  const words = segmentQuery(text).flatMap((piece) => piece.match(TERM) ?? []);
  for (const word of words) {
    for (const term of terms) {
      if (word.startsWith(term)) {
        hits += 1;
      }
    }
  }
  return hits;
};

const excerptLongSection = (
  section: string,
  query: string,
  max: number
): string => {
  const [heading = "", ...rest] = section.split("\n");
  const body = rest.join("\n").trim();
  if (!SECTION_HEADING.test(heading) || body === "") {
    return relevantExcerpt(section, query, max);
  }
  const room = max - heading.length - 1;
  if (room < MIN_EXCERPT_CHARS) {
    return relevantExcerpt(section, query, max);
  }
  return `${heading}\n${relevantExcerpt(body, query, room)}`;
};

/**
 * Preserve headings and lists by selecting whole sections with the most query
 * matches, then emitting them in document order. Oversized sections fall back
 * to a relevant window; ellipses mark omitted content.
 */
export const sectionExcerpt = (
  content: string,
  query: string,
  max: number
): string => {
  const trimmed = content.normalize("NFC").trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  const terms = queryTerms(query);
  if (terms.length === 0) {
    return relevantExcerpt(trimmed, query, max);
  }

  const headings = sectionStarts(trimmed);
  if (headings.length === 0) {
    return relevantExcerpt(trimmed, query, max);
  }
  // The text above the first heading is the page's own lead-in, and is a
  // section like any other; `headings[0] === 0` means there is none.
  const starts = headings[0] === 0 ? headings : [0, ...headings];
  const sections = starts
    .map((start, index) => ({
      index,
      text: trimmed
        .slice(start, index + 1 < starts.length ? starts[index + 1] : undefined)
        .trim(),
    }))
    .filter((section) => section.text !== "");

  const ranked = sections
    .map((section) => ({ ...section, hits: termHits(section.text, terms) }))
    .filter((section) => section.hits > 0)
    .toSorted((a, b) => b.hits - a.hits || a.index - b.index);
  const [bestSection] = ranked;
  if (!bestSection) {
    return relevantExcerpt(trimmed, query, max);
  }
  if (bestSection.text.length > max) {
    // The window lands wherever the terms cluster, which is rarely the first
    // line — so the heading that names what the model is reading would be the
    // first thing cut. Hold it back and window only the body beneath it.
    return excerptLongSection(bestSection.text, query, max);
  }

  const render = (selected: typeof ranked): string => {
    const ordered = selected.toSorted((a, b) => a.index - b.index);
    const parts: string[] = [];
    let previous = -1;
    for (const section of ordered) {
      if (previous !== -1 && section.index !== previous + 1) {
        parts.push("…");
      }
      parts.push(section.text);
      previous = section.index;
    }
    const [first] = ordered;
    if (first && first.index > 0) {
      parts.unshift("…");
    }
    if (previous < sections.length - 1) {
      parts.push("…");
    }
    return parts.join("\n\n");
  };

  const chosen: typeof ranked = [];
  for (const section of ranked) {
    const candidate = [...chosen, section];
    if (render(candidate).length <= max + 2) {
      chosen.push(section);
    }
  }
  if (chosen.length === 0) {
    return excerptLongSection(bestSection.text, query, max);
  }
  return render(chosen);
};

/**
 * Build the request-time grounding function for the Ask AI endpoint.
 *
 * Lexical retrieval over Orama (the same index/ranking the search dialog and MCP
 * server use). The index is built once and memoized across requests. Returns a
 * grounded system prompt — the retrieved excerpts plus the page the user is
 * viewing — or `undefined` when there is nothing to ground on, so the endpoint
 * can fall back to its plain prompt.
 *
 * `options.instructions` (the `ai.ask.instructions` config) is appended after
 * the base instruction rather than replacing it: the base carries the
 * functional contract (answer only from the excerpts, cite pages as Markdown
 * links) that the panel's citation rendering depends on.
 *
 * `options.retrieval` (the `ai.ask.retrieval` config) sizes how much
 * documentation each question carries; omitted fields keep today's defaults.
 */
export const createAskContext = (
  data: AskData,
  options?: { instructions?: string; retrieval?: AskRetrievalOptions }
): ((
  messages: AskMessage[],
  page?: AskPage
) => Promise<string | undefined>) => {
  let dbPromise: Promise<Awaited<ReturnType<typeof buildOramaIndex>>> | null =
    null;
  const index = () => {
    dbPromise ??= buildOramaIndex(data.documents, data.defaultLocale);
    return dbPromise;
  };
  const byRoute = new Map(data.documents.map((doc) => [doc.route, doc]));
  const instruction = options?.instructions
    ? `${BASE_INSTRUCTION}\n\n${options.instructions}`
    : BASE_INSTRUCTION;
  const maxResults = options?.retrieval?.maxResults ?? MAX_RESULTS;
  const excerptChars = options?.retrieval?.excerptChars ?? EXCERPT_CHARS;
  const contextBudget = options?.retrieval?.contextBudget ?? CONTEXT_BUDGET;

  return async (messages, page) => {
    const list = Array.isArray(messages) ? messages : [];
    // The raw question decides whether there is anything to answer; the derived
    // query decides what is retrieved and which part of each page is quoted.
    // A question of nothing but stopwords still retrieves on itself rather than
    // on an empty string, which would match every page equally.
    const asked = lastUserMessage(list);
    if (!asked) {
      return;
    }
    const query = retrievalQuery(list) || asked;

    // The current page anchors retrieval to its locale and is injected first.
    const current = page?.path
      ? byRoute.get(normalizeRoute(page.path))
      : undefined;
    const db = await index();
    const hits = await queryOramaIndex(db, query, maxResults, {
      locale: current?.locale || undefined,
    });

    const seen = new Set<string>();
    const sections: string[] = [];
    let budget = contextBudget;
    const push = (doc: OramaDoc, label: string) => {
      if (seen.has(doc.route) || budget <= 0) {
        return;
      }
      // Skip a page that would be cut to a junk fragment: its excerpt is only
      // useful when it either fits whole or gets at least the minimum window.
      if (budget < MIN_EXCERPT_CHARS && doc.content.trim().length > budget) {
        return;
      }
      seen.add(doc.route);
      const body = sectionExcerpt(
        doc.content,
        query,
        Math.min(excerptChars, budget)
      );
      budget -= body.length;
      sections.push(`## ${doc.title} (${doc.route})${label}\n${body}`);
    };

    if (current) {
      push(current, " — the page the user is currently viewing");
    }
    for (const hit of hits) {
      push(hit, "");
    }

    if (sections.length === 0) {
      return;
    }
    return `${instruction}\n\n<docs>\n${sections.join("\n\n")}\n</docs>`;
  };
};
