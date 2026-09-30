---
"blume": patch
---

`blume validate --external` and `blume audit --external` now fail a link only when it's dead: a 404 or 410, or a host name that doesn't resolve. A refused or dropped connection is a warning, like a timeout or any other error status, since it's more often the other site or the runner's network than the link. The finding also names the reason a request failed (`getaddrinfo ENOTFOUND …`) instead of Node's bare "fetch failed".
