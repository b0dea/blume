---
"blume": patch
---

Pagefind search results now link to each page's own URL. They ended in a slash (`/quickstart/`), which Blume doesn't serve, so a host redirected every result and `blume preview` answered Not Found. With `deployment.base` set, they also carried the base twice (`/docs/docs/quickstart/`).
