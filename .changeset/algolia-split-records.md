---
"blume": patch
---

The Algolia sync no longer fails on long pages. Algolia caps a record at 10 KB on its Build and Grow plans and rejects the whole upload when one page's record is larger, so the sync now splits a longer page into several records, each carrying the page's title, description, and URL with a stretch of its text. It sets the index's `attributeForDistinct` to `url` (unless you set your own), so a split page appears once in results, at its best-matching record.
