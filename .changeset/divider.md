---
"blume": patch
---

Drop the page-actions divider when the rail has no table of contents. The actions block carries its own top border as a separator under the contents, but the contents only render when a page has a heading at or above `toc.maxHeadingLevel` — so on a page without one the block became the rail's first child and drew a rule across the top of an empty column.
