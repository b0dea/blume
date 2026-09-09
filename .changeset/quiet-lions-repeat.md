---
"blume": patch
---

Stop the llms.txt audit reporting the MCP route as a stale entry. `llms.txt` advertises `ai.mcp.route` whenever the MCP server is on, but that endpoint is streamable HTTP — a route the server answers, not a file the build writes — so it appears in neither the page snapshots nor the static file index and the stale-entry check read the site's own index as broken. Every server-output site with `ai.mcp` enabled raised `BLUME_AUDIT_LLMS_TXT_STALE_ENTRY` for a file that was never meant to exist, and under `--fail-on warning` that failed the audit and blocked publishing. The configured route is now exempt while the server is enabled, and only then: with `ai.mcp` off, a listed `/mcp` is as stale as any other dead entry. The other targets llms.txt lists — `llms-full.txt`, `/index.md`, `agent-readability.json`, `sitemap.xml` — are real files and are unaffected.

The link, llms.txt, and redirect checks now share one definition of what the build serves, so a page link or a configured redirect that lands on the MCP route is no longer reported as broken either, and an llms.txt entry that points at a directory served from its `index.html` is accepted the way the link check already did.
