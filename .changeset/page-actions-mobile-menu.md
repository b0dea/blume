---
"blume": patch
---

Page actions now show in windows narrower than 1,280px and on phones. Edit on GitHub, Copy as Markdown, Export, Open in chat, and Connect to MCP sit at the bottom of the "On this page" dropdown above the content, their menus opening in place, and that dropdown now shows on a page with no headings too. The actions render once per page and move between the right rail and that dropdown as the window crosses 1,280px. A `TableOfContents` layout override receives the place they move into as children of its `mobile` variant, so render a `<slot />` there to keep them.
