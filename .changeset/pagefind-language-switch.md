---
"blume": patch
---

With `pagefind()`, search now follows a switch to another language. Pagefind read the page's language once, on the first search, so after picking another language in the switcher, which swaps the page without a reload, search kept returning results in the first language until a full page load.
