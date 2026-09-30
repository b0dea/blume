---
"blume": patch
---

`githubReleases()` takes a `baseUrl` for a repository on GitHub Enterprise Server, and tags a draft release it includes (with `drafts: true`) `Draft` instead of `Release`. An RSS item now falls back to the page's `seo.description`, so the releases feed describes each release with the summary of its notes.
