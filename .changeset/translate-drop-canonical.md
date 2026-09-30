---
"blume": patch
---

`blume translate` no longer copies a page's `seo.canonical` into its translations. The canonical names the source-language page, so every translation used to canonicalize to it and drop out of search in its own language; a translation now gets the default canonical, its own URL.
