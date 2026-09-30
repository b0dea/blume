---
"blume": patch
---

API reference schema tables now match the examples beside them: request body tables leave out `readOnly` properties, and response tables leave out `writeOnly` ones. A webhook's or callback's body, which your API sends, keeps its `readOnly` properties.
