---
"blume": patch
---

`blume eval --agent claude` no longer loads your Claude Code settings files or `CLAUDE.md` into the reader and judge, the way Codex runs already skip your Codex config. Hooks, plugins, and memory could hand the reader context your docs never gave it. Your Claude Code login still works; set any other variables it needs, such as `ANTHROPIC_API_KEY`, in your shell rather than in `settings.json`.
