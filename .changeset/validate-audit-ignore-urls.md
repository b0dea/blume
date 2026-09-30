---
"blume": patch
---

Add `--ignore <glob>` to `blume validate` and `blume audit`. With `--external`, an external link whose URL matches the glob is never requested or reported, so a placeholder domain, a local server, or a site that turns bots away no longer fails the check: `--ignore "https://api.acme.example/**"`. Repeat the flag for more patterns. Internal links are always checked.
