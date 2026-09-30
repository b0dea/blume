---
"blume": patch
---

`--budget-js`, `--budget-css`, `--analyze`, and `blume audit` now read a `cloudflare()` server build with `base` set from `dist/client/<base>/`, where the adapter writes it. They read `dist/client` before, so a budget measured nothing and passed, and the audit reported every page's links and assets as broken.
