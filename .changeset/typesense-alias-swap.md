---
"blume": patch
---

Typesense syncs no longer take search down while they run. Each `blume build` imports your pages into a new collection, then points an alias with your `collection` name at it and drops the collection it replaced, so searches keep reading the previous collection until the new one is complete, and a failed sync leaves it serving instead of leaving no collection at all. On the first sync, a collection that already has that name is replaced by the alias, and search keys scoped to the name keep working. The admin key needs to manage aliases as well as collections.
