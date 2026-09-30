---
"blume": patch
---

`BLUME_MDX_CURLY_ANCHOR` now also catches the spaced `{ #id }` and kramdown `{: #id }` heading anchors in `.mdx` pages, which fail the compile the same way `{#id}` does, and quotes the marker as written. Only the unspaced `{#id}` pins an anchor in `.md`.
