---
"blume": patch
---

The API playground's built-in proxy now checks `rateLimit` in `blume dev` and `blume build`, answering `429 Too Many Requests` past the limit. Only `blume eject` used to limit it.
