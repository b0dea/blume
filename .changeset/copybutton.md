---
"blume": patch
---

Make room for the copy button in code blocks that drop the language bar. Inside `<Tabs>`, `<CodeGroup>`, `<Steps>`, `<Callout>`, `<Card>` and `<Accordion>` the bar is cleared but the button is not, and the block's `padding-top` was the 1rem chosen for a block with no chrome at all — so the button painted over the first line of code.
