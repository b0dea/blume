---
"blume": patch
---

`upstash()` rate limiting now counts a request and sets its window in one step. A window that ended mid-request could leave the reader's count with no expiry, which locked them out of that route for good; a count left that way now gets a window again on the reader's next request.
