---
"blume": patch
---

`typesense()` takes a `locale`, a two-letter language code such as `"ja"`, `"zh"`, or `"th"`. The sync then tokenizes the collection's searched text fields for that language, so a query in a script written without spaces matches words inside a run of text, not only at its start.
