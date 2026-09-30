---
"blume": patch
---

With Mixedbread search, the search dialog now waits for the reader to pause typing before it sends a query, and cancels a query the reader has typed past. A search costs a request or a few instead of one per letter, which keeps readers under the search endpoint's rate limit, and a slow earlier response can no longer replace newer results. `useSearch()` and the WebMCP search tool still send each query at once.
