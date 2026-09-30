---
"blume": patch
---

`mdxRemote()` fixes: `blume validate` resolves a link between remote files (`./02-errors.mdx`) to the page it publishes at instead of reporting it broken, a `!` pattern in `include` now excludes what it matches as it does for `filesystem()` instead of including every file, a `github.path` with nothing under it at the ref warns with `BLUME_SOURCE_PATH_MISSING`, and the `BLUME_SOURCE_TRUNCATED` warning no longer suggests narrowing `path`, which can't help.
