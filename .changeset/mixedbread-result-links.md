---
"blume": patch
---

Mixedbread search results now link to their pages. The endpoint read each result's link from metadata nothing sets, so every result pointed back at the current page; it now finds the page whose file `mxbai store sync` uploaded, shows that page's title, and lists each page once. When the search endpoint fails, the dialog shows its error message instead of "No results".
