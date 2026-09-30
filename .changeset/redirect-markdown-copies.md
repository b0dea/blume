---
"blume": patch
---

A redirect from one page to another now moves the page's raw Markdown too: `/old.md` and `/old.mdx` redirect to `/new.md` and `/new.mdx` with the same status, in `blume dev`, the redirect files a static build writes, and every server build. They used to 404.
