---
"blume": patch
---

Darken `--blume-muted-foreground` from `oklch(0.54 0 0)` to `oklch(0.53 0 0)` so muted body text clears WCAG AA on a tinted surface, not just on the page. At `0.54` it was 5.06:1 on the background but 4.38:1 inside a `danger` callout and 4.50:1 inside an `info` one — muted text is 14px body copy, and the theme routinely sets it over a 10% tint. At `0.53` every callout surface clears the bar with room to spare (4.57:1 worst case) and the page rises to 5.28:1. Dark mode is unchanged.
