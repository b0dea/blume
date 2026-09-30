---
"blume": patch
---

An operation's own `x-codeSamples` now reach its Markdown copy, so `llms-full.txt`, the MCP server, and the assistant see your SDK calls, and site search indexes them like any code block. A sample whose `source` is a `$ref` to a file is read relative to the spec, and one that can't be read logs a `BLUME_OPENAPI_CODE_SAMPLE_REF` warning instead of disappearing.
