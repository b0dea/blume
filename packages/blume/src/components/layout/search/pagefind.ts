import { highlight, sanitizeExcerpt, SEARCH_LIMIT } from "./types.ts";
import type { SearchFn } from "./types.ts";

interface PagefindResult {
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta?: { title?: string };
  }>;
}

/** One Pagefind instance, searching the index of one page language. */
interface PagefindInstance {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

interface PagefindModule {
  createInstance: (options: { baseUrl: string }) => PagefindInstance;
}

// Pagefind names each page after its built file (`quickstart/index.html`), so
// its URLs end in a slash. Blume serves pages without one (`trailingSlash:
// "never"`): hosts redirect the slashed URL, and `blume preview` 404s it.
const TRAILING_SLASH = /(?<=.)\/(?=[#?]|$)/u;

/**
 * Pagefind: load the index emitted into the built site and query it. The bundle
 * lives in the output (not `node_modules`), so it is imported at runtime by URL
 * — which is why this only works in the production build, not `dev`.
 */
export const createSearch = async (opts: {
  url: string;
}): Promise<SearchFn> => {
  // The pagefind bundle lives in the built site (not node_modules) and is
  // resolved at runtime by URL — it can't be a static, code-splittable path.
  // SAFETY: the URL points at the `pagefind.js` module our own build emitted,
  // whose export contract (`createInstance()`) is fixed by pagefind.
  // oxlint-disable-next-line react-doctor/no-dynamic-import-path
  const pagefind = (await import(
    /* @vite-ignore */
    opts.url
  )) as PagefindModule;
  // Pagefind keeps an index per language and searches the one for the page's
  // `<html lang>`, which it reads once, when an instance is created. A
  // client-side language switch changes the page's language without a
  // reload, so each language gets its own instance, created on its first
  // search: after the switch, search moves to the new page's index.
  const instances = new Map<string, PagefindInstance>();
  const instanceFor = (language: string): PagefindInstance => {
    const existing = instances.get(language);
    if (existing) {
      return existing;
    }
    // `baseUrl` "/" keeps result URLs base-less routes, like every other
    // provider's: by default Pagefind prefixes the folder the bundle is served
    // under, and the dialog adds the deployment base itself.
    const instance = pagefind.createInstance({ baseUrl: "/" });
    instances.set(language, instance);
    return instance;
  };
  // Pagefind builds its own marked-up excerpt; we keep its `<mark>` highlights
  // (dropping any other markup — the excerpt is rendered via innerHTML) and
  // only highlight the title ourselves. It carries no section/breadcrumb data,
  // so pills stay hidden and the preview pane falls back to the excerpt.
  return async (query) => {
    const response = await instanceFor(document.documentElement.lang).search(
      query
    );
    const docs = await Promise.all(
      response.results.slice(0, SEARCH_LIMIT).map((result) => result.data())
    );
    const hits = docs.map((doc) => ({
      excerpt: sanitizeExcerpt(doc.excerpt),
      title: highlight(doc.meta?.title ?? doc.url, query),
      url: doc.url.replace(TRAILING_SLASH, ""),
    }));
    return { hits, sections: [] };
  };
};
