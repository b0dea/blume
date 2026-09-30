---
"blume": patch
---

The MCP `search_docs` and `list_pages` tools now match a number or boolean in `filters` against the facet's string form, the way facet values are stored, so `{"priority": 1}` finds pages with `priority: 1`. Such a value used to be dropped, and the tool answered as if no filter had been sent.
