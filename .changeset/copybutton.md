---
"blume": patch
---

Make room for the copy button in code blocks that drop the language bar. Inside a component whose chrome is `not-prose` — `<Tabs>`, `<CodeGroup>`, `<Steps>`, `<Callout>`, `<Card>`, `<Accordion>` and the rest — the bar is cleared but the button is not, and the block's `padding-top` was the 1rem chosen for a block with no chrome at all, so the button painted over the first line of code. The clearance follows the same rule the button does, so inside those components an untitled `<CodeBlock>` and the `<Component>` source pane get it too, not only fenced and titled blocks.
