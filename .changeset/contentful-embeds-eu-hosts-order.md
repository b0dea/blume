---
"blume": patch
---

`contentful()` renders an embedded file that isn't an image, like a PDF, as a link to it instead of a broken image, and warns with `BLUME_SOURCE_UNRESOLVED_LINK` when a page embeds or links an asset or entry the Delivery API didn't return (an unpublished one, say) instead of dropping it silently. An embed of another entry of the same content type now resolves. New `host` and `previewHost` options reach a space with EU data residency, and `fields.order` on `contentful()`, `payload()`, and `strapi()` reads a page's sidebar order from a number field.
