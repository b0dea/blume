---
"blume": patch
---

Darken the green and orange badges so they meet WCAG AA in light mode. Both drew their label at `-700` over a 15% tint of their own hue, landing at 4.32:1 and 4.44:1 against the 4.5:1 bar for text that size, while every other hue already cleared it (blue 5.71:1, red 5.17:1, purple 5.82:1, yellow 6.02:1). At `-800` they reach 6.20:1 and 6.25:1, with the fill weight unchanged. This covers GET and PUT method badges (and GraphQL `QUERY`), the matching badges in a reference's sidebar, 2xx/4xx response status chips, and the `green`/`orange` variants of `<Badge>`. Dark mode was already passing and is unchanged.
