---
"blume": patch
---

A failed search sync now fails the build when its admin key is set. Algolia, Orama Cloud, and Typesense syncs used to only warn when the upload failed, so a site could deploy against an index the build never updated; they now stop `blume build` with `BLUME_SEARCH_SYNC_FAILED`. Without the key (or, for Orama Cloud, without `indexId`), the build still warns and skips the sync, so a build without secrets keeps working.
