---
"blume": patch
---

`node()` takes `allowedDomains`, set as Astro's `security.allowedDomains`, for a server behind a reverse proxy. Astro only reads the reader's address from `X-Forwarded-For` for a host listed there, so every reader behind a proxy shared one rate limit count; with the proxy's host listed, each reader gets their own.
