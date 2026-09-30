---
"blume": patch
---

A `<Component path>` that names no example now gets a `BLUME_EXAMPLE_NOT_FOUND` warning at its line from `blume dev`, `blume build`, and `blume doctor`, instead of only a "No example found" box on the page. A `components.ts` override or island named `Component` replaces the built-in, so its `path` isn't checked.
