---
"blume": patch
---

`blume build` with `pagefind()` now reports how many pages the search index holds. The "Indexed N page(s) for search" line used to count every HTML file in the build, including search-excluded pages, hidden pages, and the 404 page, which the index leaves out.
