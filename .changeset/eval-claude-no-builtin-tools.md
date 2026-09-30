---
"blume": patch
---

`blume eval --agent claude` now runs the reader and judge with every Claude Code built-in tool turned off, so the reader has only the docs tools. Its list of blocked tools had fallen behind Claude Code, which left newer tools such as `Monitor` (which runs shell commands) and `Skill` (which loads your installed skills) available to it.
