---
"blume": patch
---

A `contentful()` rich text link to another entry of the source's content type now links to that entry's page, at the route it's built at (prefix, nested slug, and locale included). A link to an entry of any other content type still keeps only its text, and a link to an entry the Delivery API didn't return (an unpublished one, say) warns with `BLUME_SOURCE_UNRESOLVED_LINK`.
