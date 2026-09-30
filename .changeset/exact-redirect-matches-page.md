---
"blume": patch
---

An exact redirect from a page's own URL now warns with `BLUME_REDIRECT_MATCHES_PAGE` in `blume validate`, `doctor`, `dev`, and `build`: the redirect takes the URL over, so the page never publishes. Before, only a pattern redirect was flagged.
