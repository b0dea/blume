---
"blume": patch
---

Typesense results rank by relevance again. The dialog sorted by relevance in ten buckets and then by `search.boost`, which ranked pages inside each bucket by boost alone, so with equal boosts the best match could land behind weaker ones. It now sorts by relevance first and uses the boost to order results that match equally well.
