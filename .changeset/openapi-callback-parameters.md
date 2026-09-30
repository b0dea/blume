---
"blume": patch
---

An operation's Callbacks section now lists each callback's parameters, such as a signature header, beside its request body and responses. A 3.1 or later spec that still keeps its webhooks under `x-webhooks`, which renders none of them, now logs a `BLUME_OPENAPI_X_WEBHOOKS` warning that says to rename the field to `webhooks`.
