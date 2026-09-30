---
"blume": patch
---

Search analytics can keep query text away from your analytics providers. With `search: { analytics: { queries: false } }`, the `search` and `search_select` events carry the query's length as `queryChars` instead of its text, and the text travels only on the `blume:track` DOM event, the way the assistant handles questions. By default queries are still sent as typed.
