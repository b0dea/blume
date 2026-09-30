---
"blume": patch
---

`Accept: text/markdown` negotiation on a Vercel server build now reads media types in any case and honors q-values the way `blume dev` and Cloudflare do: `text/markdown;q=0` gets HTML, and so does a header that weighs `text/html` above Markdown. The prerendered 404's JSON twin negotiates the same way. When Markdown and HTML both carry a q-value below 1, Vercel's routing rules can't compare them and serve HTML. `blume dev` now sends `Vary: Accept` on the HTML answer at a negotiated URL too, not only on the Markdown one.
