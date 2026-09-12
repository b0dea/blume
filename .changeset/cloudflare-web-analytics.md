---
"blume": patch
---

Add `analytics.cloudflare` for Cloudflare Web Analytics. Pass the site token from the dashboard's JS snippet — `analytics: { cloudflare: { token } }` — and Blume renders the beacon tag, the same way `posthog` takes a key. Until now the beacon meant hand-writing a `scripts` entry with the beacon URL and a JSON `data-cf-beacon` attribute.

This is for sites Cloudflare doesn't proxy. A proxied zone with automatic Web Analytics on already injects the beacon at the edge and should leave the option unset, or every pageview is counted twice; the analytics docs now spell out that distinction.
