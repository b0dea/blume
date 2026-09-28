---
"blume": patch
---

OpenAPI overlays can now add a property named `constructor` (it used to fail with a merge error), and a `__proto__` key in an overlay no longer reaches `Object.prototype`. Parsing a long run of digits in a theme color no longer takes quadratic time.
