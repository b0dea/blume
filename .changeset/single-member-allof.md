---
"blume": patch
---

API references now read a field whose schema is an `allOf` with one member, the way drf-spectacular writes enums and nested serializers, as that member: it's labeled with the member's name or type instead of `object`, lists its allowed values, and the Try it panel gives it the member's type and choices. A model that points back at itself through such a wrapper no longer crashes the build.
