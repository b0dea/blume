---
"blume": patch
---

OpenAPI references now warn about spec mistakes that used to render wrong without a sign: a `{name}` in a path with no path parameter of that name (`BLUME_OPENAPI_PATH_PARAMETER_MISSING`), a path parameter the path never uses (`BLUME_OPENAPI_PATH_PARAMETER_UNUSED`), and a `security` requirement naming a scheme that `components.securitySchemes` doesn't define (`BLUME_OPENAPI_UNKNOWN_SECURITY_SCHEME`). The pages still build.
