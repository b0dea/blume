---
"blume": patch
---

The sitemap now leaves out a page whose `seo.canonical` names another URL, so following the duplicate-content fix no longer trips `BLUME_AUDIT_NON_CANONICAL_IN_SITEMAP`. An archived-version page whose own `seo.canonical` names itself stays listed.
