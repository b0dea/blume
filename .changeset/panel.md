---
"blume": patch
---

Give the API reference's sticky sample panel its own scroll region. A grid item's sticky containing block is its grid row, and the row is as tall as its tallest item — so expanding a request schema on the left made the left column tower over the panel and handed sticky an enormous travel budget, pinning the panel with everything below the viewport fold unreachable until the left column ended. Bounding it to the viewport turns the overhang into a scroll. Applies to the OpenAPI, AsyncAPI and GraphQL operation pages, which share the markup.
