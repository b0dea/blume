---
"blume": patch
---

A `vercel()` server build with `base` set now serves the site under it. `@astrojs/vercel` ignores the base: it left the static files and routes at the root, so every page asset and server route 404'd, and its redirects came out as `^/docsold$` → `/docs/docs/new`. The build now moves the static files to `.vercel/output/static/<base>/` and the routes and redirects under the base.
