import { highlight, sanitizeExcerpt, SEARCH_LIMIT } from "./types.ts";
import type { SearchFn } from "./types.ts";

interface PagefindResult {
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta?: { title?: string };
  }>;
}

interface PagefindModule {
  options: (options: { baseUrl: string }) => Promise<void>;
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
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
  // whose export contract (`options()`, `search()`) is fixed by pagefind.
  // oxlint-disable-next-line react-doctor/no-dynamic-import-path
  const pagefind = (await import(
    /* @vite-ignore */
    opts.url
  )) as PagefindModule;
  // `baseUrl` "/" keeps result URLs base-less routes, like every other
  // provider's: by default Pagefind prefixes the folder the bundle is served
  // under, and the dialog adds the deployment base itself.
  await pagefind.options({ baseUrl: "/" });
  // Pagefind builds its own marked-up excerpt; we keep its `<mark>` highlights
  // (dropping any other markup — the excerpt is rendered via innerHTML) and
  // only highlight the title ourselves. It carries no section/breadcrumb data,
  // so pills stay hidden and the preview pane falls back to the excerpt.
  return async (query) => {
    const response = await pagefind.search(query);
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
