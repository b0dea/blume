---
"blume": patch
---

A missed `severity: warning` question in `blume eval` now reads as the warning it is. Its line shows `⚠ warn` instead of `✖ fail`, the summary counts it as warned rather than failed, and its finding prints as a `⚠` line instead of a `fix:` line, matching the exit code, which already ignored it. Each question in the `--json` results now carries its `severity`.
