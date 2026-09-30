---
"blume": patch
---

`blume audit --url` now requests each configured redirect's old URL on the live site and reports `BLUME_AUDIT_REDIRECT_NOT_SERVED` when it isn't redirected to the configured destination: an error when the old URL fails, and a warning when the host serves the build's meta-refresh page instead of an HTTP redirect.
