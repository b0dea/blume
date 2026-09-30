---
"blume": patch
---

A `sanity()` body held in a Markdown string field now renders as Markdown instead of an empty page. A query that finds no documents while `SANITY_TOKEN` is unset now warns with `BLUME_MISSING_SECRET`, since a private dataset answers a query without a token with nothing rather than an error.
