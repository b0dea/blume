---
"blume": patch
---

A content source's missing token or SDK is now reported as itself on a fresh build, instead of as `BLUME_SOURCE_FETCH_FAILED` with the API's error. `blume dev`, `blume build`, and `blume doctor` warn about unset variables before any source fetches, `notion()` and `contentful()` stop before their first request with `BLUME_MISSING_SECRET` when their token is unset, and a missing SDK fails as `BLUME_SOURCE_SDK_MISSING`.
