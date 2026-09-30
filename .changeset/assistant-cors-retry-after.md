---
"blume": patch
---

The assistant route now exposes `Retry-After` to the origins listed in `ai.assistant.cors`, so a page on another site can read how long to wait after a `429` from the rate limit. Browsers hid the header from cross-origin callers before.
