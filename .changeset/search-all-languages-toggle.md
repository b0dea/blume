---
"blume": patch
---

The search dialog's "All languages" toggle now works with `pagefind()`: it merges every language's index into the search, where it used to return the page's language alone. With `mixedbread()`, which can't limit a search to one language, the dialog no longer shows the toggle, since every search already spans every language.
