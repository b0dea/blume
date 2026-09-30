---
"blume": patch
---

`blume doctor` now reports a tab, selector item, featured link, header action, or call to action whose path matches no page (`BLUME_NAV_MISSING_PAGE`), the same warning `blume dev` and `blume build` print. It checks against every route the site serves, custom `.astro` pages, the generated changelog, and references included.
