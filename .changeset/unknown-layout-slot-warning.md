---
"blume": patch
---

A `layout` override in `components.ts` whose key isn't a layout slot (a typo, or `footer` for `Footer`) now logs a warning that lists the slots, instead of being ignored silently.
