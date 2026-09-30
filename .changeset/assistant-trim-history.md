---
"blume": patch
---

Long conversations with the assistant keep working. The panel sent the whole conversation with every question, and once it passed the route's 24,000 characters or 40 messages, every answer failed. It now sends the latest turns that fit, dropping the oldest first; the reader still sees the whole conversation. `useAssistant` does the same.
