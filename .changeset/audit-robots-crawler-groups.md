---
"blume": patch
---

`blume audit` now reads every `User-agent` group in robots.txt, not only `*`, and warns with `BLUME_AUDIT_ROBOTS_BLOCKS_CRAWLER` when a rule aimed at one crawler blocks it from pages the sitemap advertises.
