---
"blume": patch
---

`payload()` now warns with `BLUME_SOURCE_UNSUPPORTED_NODE` when a page's Lexical body holds a node it leaves out as a comment, like a block with no serializer or a relationship, naming the page and the node, instead of dropping it without a word.
