import type { OperationObject } from "@scalar/openapi-types/3.1";

import type { ApiDocument } from "./model.ts";
import { HTTP_METHODS } from "./model.ts";

/**
 * Targeted checks for spec mistakes that would otherwise render silently
 * wrong. This is not a validator — a linter such as Spectral or oasdiff owns
 * that — and a spec that fails one of these still renders. Each check names
 * one mistake whose symptom on the page is quiet: a path placeholder sent
 * as literal text, a Try it input whose value goes nowhere, an Authorization
 * section with no scheme to describe. Each reports a warning with its own
 * code, so a build says what's wrong instead of shipping it.
 */

/** One mistake a check found, before the source names the spec it's in. */
export interface SpecIssue {
  code: string;
  message: string;
  suggestion: string;
}

/** A `{name}` placeholder in a path template. */
const PATH_TEMPLATE = /\{(?<name>[^{}]+)\}/gu;

/** A reference to a parameter declared under `components.parameters`. */
const PARAMETER_REF = /^#\/components\/parameters\/(?<name>[^/]+)$/u;

/** How many operations a security-scheme warning names before counting the rest. */
const NAMED_OPERATIONS = 3;

/** One entry of a document's `paths` or `webhooks` map. */
type PathItem = NonNullable<ApiDocument["paths"]>[string];

/** One entry of a `parameters` list: a parameter, or a `$ref` to one. */
type ParameterEntry = NonNullable<OperationObject["parameters"]>[number];

// The runtime object checks stand guard because the document was parsed from
// arbitrary YAML/JSON: a spec can put a scalar or null where the type
// promises an object.
const isObject = <Value>(value: Value): value is NonNullable<Value> =>
  typeof value === "object" && value !== null;

/** A parameter's `name`, which a hand-written spec may have left out or mistyped. */
const isName = <Value>(value: Value): value is Value & string =>
  typeof value === "string";

/** A declared list, or none when a hand-written spec put something else there. */
const listOf = <Item>(value: Item[] | undefined): NonNullable<Item>[] =>
  Array.isArray(value) ? value.filter(isObject) : [];

/**
 * The names of the path parameters an operation declares, its own and its
 * path item's, `$ref`s resolved through `components.parameters`.
 */
const pathParameterNames = (
  document: ApiDocument,
  item: PathItem,
  operation: OperationObject
): Set<string> => {
  const components = document.components?.parameters ?? {};
  const names = new Set<string>();
  for (const entry of [
    ...listOf<ParameterEntry>(item.parameters),
    ...listOf<ParameterEntry>(operation.parameters),
  ]) {
    const refName =
      "$ref" in entry
        ? PARAMETER_REF.exec(entry.$ref)?.groups?.name
        : undefined;
    const parameter = (refName ? components[refName] : undefined) ?? entry;
    if (
      "in" in parameter &&
      parameter.in === "path" &&
      isName(parameter.name)
    ) {
      names.add(parameter.name);
    }
  }
  return names;
};

/**
 * A path whose template and declared path parameters disagree. A placeholder
 * with no parameter gets no input in Try it and no row in the table, so
 * requests send it as literal text; a parameter with no placeholder gets an
 * input whose value never reaches the URL.
 */
const pathParameterIssues = (
  signature: string,
  path: string,
  declared: Set<string>
): SpecIssue[] => {
  const used = new Set(
    [...path.matchAll(PATH_TEMPLATE)].map((match) => match.groups?.name ?? "")
  );
  const issues: SpecIssue[] = [];
  for (const name of used) {
    if (!declared.has(name)) {
      issues.push({
        code: "BLUME_OPENAPI_PATH_PARAMETER_MISSING",
        message: `${signature} has {${name}} in its path but declares no "${name}" path parameter, so Try it and the code samples send "{${name}}" as literal text.`,
        suggestion: `Declare "${name}" in the operation's or the path's \`parameters\`, with \`in: path\` and \`required: true\`.`,
      });
    }
  }
  for (const name of declared) {
    if (!used.has(name)) {
      issues.push({
        code: "BLUME_OPENAPI_PATH_PARAMETER_UNUSED",
        message: `${signature} declares a "${name}" path parameter, but its path has no {${name}}, so the value Try it asks for never reaches the URL.`,
        suggestion: `Add {${name}} to the path, or remove the parameter.`,
      });
    }
  }
  return issues;
};

/** The scheme names a `security` list requires. */
const requiredSchemes = (
  security: ApiDocument["security"] | OperationObject["security"]
): string[] =>
  listOf(security).flatMap((requirement) => Object.keys(requirement));

/**
 * Security schemes a requirement names that `components.securitySchemes`
 * doesn't define: the Authorization section has nothing to describe, and
 * Try it and the code samples send no credential for them. One warning per
 * scheme, naming where it's required: the root `security`, or the first few
 * operations that list it.
 */
const securitySchemeIssues = (
  document: ApiDocument,
  requirers: Map<string, string[]>
): SpecIssue[] => {
  const defined = document.components?.securitySchemes ?? {};
  const root = new Set(requiredSchemes(document.security));
  const issues: SpecIssue[] = [];
  for (const scheme of new Set([...root, ...requirers.keys()])) {
    if (Object.hasOwn(defined, scheme)) {
      continue;
    }
    const operations = requirers.get(scheme) ?? [];
    const more = operations.length - NAMED_OPERATIONS;
    const where = root.has(scheme)
      ? "The spec's root `security` requires"
      : `${operations.slice(0, NAMED_OPERATIONS).join(", ")}${more > 0 ? ` and ${more} more` : ""} ${operations.length === 1 ? "requires" : "require"}`;
    issues.push({
      code: "BLUME_OPENAPI_UNKNOWN_SECURITY_SCHEME",
      message: `${where} the "${scheme}" security scheme, which \`components.securitySchemes\` doesn't define, so the Authorization section can't describe it and requests send no credential for it.`,
      suggestion: `Define "${scheme}" in \`components.securitySchemes\`, or fix the name in \`security\`.`,
    });
  }
  return issues;
};

/**
 * Check a parsed document for the mistakes above. `$ref` path items are
 * skipped: the extractor already reports them as missing from the reference.
 */
export const specIssues = (document: ApiDocument): SpecIssue[] => {
  const issues: SpecIssue[] = [];
  // Scheme name -> the operations whose own `security` lists it.
  const requirers = new Map<string, string[]>();
  const visit = (name: string, item: PathItem, webhook: boolean): void => {
    if (!isObject(item) || "$ref" in item) {
      return;
    }
    for (const method of HTTP_METHODS) {
      const operation = item[method];
      if (!isObject(operation)) {
        continue;
      }
      const signature = webhook
        ? `Webhook "${name}" (${method.toUpperCase()})`
        : `${method.toUpperCase()} ${name}`;
      for (const scheme of requiredSchemes(operation.security)) {
        requirers.set(scheme, [...(requirers.get(scheme) ?? []), signature]);
      }
      // A webhook is keyed by its name, not a path: it has no template.
      if (!webhook) {
        issues.push(
          ...pathParameterIssues(
            signature,
            name,
            pathParameterNames(document, item, operation)
          )
        );
      }
    }
  };
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    visit(path, item, false);
  }
  for (const [name, item] of Object.entries(document.webhooks ?? {})) {
    visit(name, item, true);
  }
  return [...issues, ...securitySchemeIssues(document, requirers)];
};
