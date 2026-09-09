---
"blume": patch
---

Keep content links inside the reader's language on multi-locale sites. Markdown links and `Card`, `Tile`, `Tooltip`, and `Update` hrefs written as `/guides/setup` rendered verbatim on translated pages, so a reader on `/fr/…` was sent back to the default locale on the first click. Root-relative page links now resolve to the same-locale route when one is served — a translation or a fallback page — and keep their authored target otherwise, so custom pages and explicit cross-locale links are untouched. `blume check` resolves links the same way, so an anchor is validated against the translated page a reader actually lands on.

Because anchors now travel with the link, `blume translate` pins every translated heading to its source heading's anchor id with a trailing `[#id]` marker (unless the translation already pins one), so `#fragment` links resolve identically in every language.
