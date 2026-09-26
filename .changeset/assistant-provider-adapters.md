---
"blume": minor
---

The assistant can now call OpenAI, Anthropic, Gemini, and Grok directly. `openai({ model })`, `anthropic({ model })`, `gemini({ model })`, and `grok({ model })` from `blume/ai` send each question to the provider's own API with your key, through its AI SDK package (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, or `@ai-sdk/xai`, installed as needed). They read `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, and `XAI_API_KEY`, turn the docs tools on, and send `reasoning` as each model's own control. `openai()` also takes a `baseUrl` for any OpenAI-compatible endpoint, which it calls through `@ai-sdk/openai-compatible` with the docs tools off, as `openaiCompatible()` did. `openaiCompatible()` still works and now returns the same adapter.
