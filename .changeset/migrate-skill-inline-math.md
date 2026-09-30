---
"blume": patch
---

The `blume-migrate` skill now keeps a source's inline math inline, rewriting `$x$` as `$$x$$` inside its sentence. It used to treat inline math as unsupported and move each formula onto its own line or drop it, though Blume renders `$$…$$` inline.
