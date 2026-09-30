---
"blume": patch
---

`blume validate` now checks every link form Markdown and MDX render, not only one-line inline links: reference-style links (at their `[label]: /target` definition), autolinks like `<https://example.com>`, links whose label wraps onto the next line, and lowercase HTML `<a href>` tags. An `<a href>` ships as written, so its relative path resolves against the page's URL, as a browser reads it, and no `basePath` is added to it.
