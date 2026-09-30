---
"blume": patch
---

`blume eval --fix` now tells the agent to verify its edits with the same `--agent`, `--file`, `--threshold`, and `--timeout` the run used. It used to say a bare `blume eval`, which graded `evals.yaml` with Codex even when the run being fixed used Claude Code or another evals file.
