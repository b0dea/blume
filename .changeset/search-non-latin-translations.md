---
"blume": patch
---

Search now finds translations in a non-Latin script on a site whose default language is written in Latin script, such as the Japanese and Hindi pages of an English site. Each of those locales' pages is indexed with its own word-segmenting tokenizer, so the search dialog, the MCP server's `search_docs`, and the assistant match them, whether the search is scoped to one language or runs across all of them. Latin-script pages keep the tokenizer they had.
