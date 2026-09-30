---
"blume": patch
---

`upstash()` takes `urlEnv` and `tokenEnv`, the names of the env vars its REST endpoint and token are read from, so a database added from Vercel's Marketplace works with the `KV_REST_API_URL` and `KV_REST_API_TOKEN` it sets: `upstash({ urlEnv: "KV_REST_API_URL", tokenEnv: "KV_REST_API_TOKEN" })`. `blume build` warns about the variables you name.
