---
"blume": patch
---

Frontmatter that isn't valid YAML, such as an unquoted value holding `: `, is now reported as `BLUME_FRONTMATTER_INVALID` at its file and line instead of failing `blume validate`, `doctor`, `audit`, `build`, and `dev` with `BLUME_INTERNAL`.
