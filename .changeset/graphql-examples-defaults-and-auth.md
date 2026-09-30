---
"blume": patch
---

GraphQL example variables start at each argument's declared default, so `first: Int = 20` is `20` rather than `0`, and input objects fill their fields' defaults the same way. Generated example queries and responses leave deprecated fields out.

`graphql()` takes an `auth` option, in the shape of `api.auth` for hand-written endpoint pages: `{ method: "bearer" }`, `"basic"`, or `"key"` with the header `name` (`x-api-key` by default). With it, every operation page shows an Authorization section, the Try it panel gets a credential field, and the code samples send a placeholder credential. A per-source `auth` overrides the adapter's.
