import { describe, expect, it } from "bun:test";

import { downlevelComponents } from "../src/ai/component-markdown.ts";
import { openapiComponentSerializers } from "../src/ai/openapi-components.ts";
import type { ApiOperationRef, ApiSpecData } from "../src/openapi/model.ts";
import type { OpenApiContentSource } from "../src/openapi/source.ts";

const operation = (
  overrides: Partial<ApiOperationRef> & Pick<ApiOperationRef, "key">
): ApiOperationRef => ({
  deprecated: false,
  description: "",
  method: "get",
  path: "/pets",
  route: "/reference/pets/list-pets",
  summary: "",
  tag: "Pets",
  tagSlug: "pets",
  ...overrides,
});

const spec = (operations: ApiOperationRef[]): ApiSpecData => ({
  codeSamples: [],
  description: "",
  // SAFETY: these serializers read only the normalized `operations` and
  // `title`; the parsed document is never touched, so an empty one cannot be
  // observed by anything under test.
  document: {} as ApiSpecData["document"],
  expandSchemas: false,
  kind: "openapi",
  label: "API",
  operations: Object.fromEntries(operations.map((entry) => [entry.key, entry])),
  playground: { enabled: false, proxy: false },
  route: "/reference",
  slug: "reference",
  tags: [{ description: "", name: "Pets", slug: "pets" }],
  title: "Pet API",
  version: "1.0.0",
});

/** The OpenAPI source, carrying `data` — the only source the serializers read. */
const openApiSource = (
  data: Record<string, ApiSpecData>
): OpenApiContentSource => ({
  kind: "openapi-source",
  load: () => Promise.resolve({ diagnostics: [], entries: [] }),
  name: "openapi",
  openApiData: () => data,
  staged: true,
});

const serializers = (data: Record<string, ApiSpecData>) =>
  openapiComponentSerializers({ sources: [openApiSource(data)] });

describe("openapi component serializers", () => {
  it("gives an operation page its method and path", () => {
    const data = {
      reference: spec([operation({ key: "list-pets", summary: "List pets" })]),
    };
    const source =
      'Lists every pet.\n\n<Operation source="reference" id="list-pets" />\n';
    expect(downlevelComponents(source, serializers(data))).toBe(
      "Lists every pet.\n\n`GET /pets`\n"
    );
  });

  it("marks a deprecated operation, which the description alone does not", () => {
    const data = {
      reference: spec([
        operation({
          deprecated: true,
          key: "old",
          method: "post",
          path: "/v1/pets",
        }),
      ]),
    };
    expect(
      downlevelComponents(
        '<Operation source="reference" id="old" />\n',
        serializers(data)
      )
    ).toBe("`POST /v1/pets`\n\n**Deprecated.**\n");
  });

  it("lists a tag's operations as links, with their summaries", () => {
    const data = {
      reference: spec([
        operation({ key: "list-pets", summary: "List pets" }),
        operation({
          key: "add-pet",
          method: "post",
          route: "/reference/pets/add-pet",
          summary: "Add a pet",
        }),
        operation({ key: "elsewhere", tag: "Owners", tagSlug: "owners" }),
      ]),
    };
    expect(
      downlevelComponents(
        '<ApiTagOperations source="reference" tag="pets" />\n',
        serializers(data)
      )
    ).toBe(
      "- [`GET /pets`](/reference/pets/list-pets) — List pets\n- [`POST /pets`](/reference/pets/add-pet) — Add a pet\n"
    );
  });

  it("summarizes the reference by tag, so the overview is not a run of empty headings", () => {
    const data = {
      reference: spec([
        operation({ key: "a" }),
        operation({ key: "b" }),
        operation({ key: "c", tag: "Owners", tagSlug: "owners" }),
      ]),
    };
    expect(
      downlevelComponents(
        '<ApiOverview source="reference" />\n',
        serializers(data)
      )
    ).toBe(
      "**Pet API**\n\n- **Pets** — 2 operations\n- **Owners** — 1 operation\n"
    );
  });

  it("declines an overview of a reference carrying no operations", () => {
    // A spec that parsed to nothing still renders its tag headings, so the
    // overview would downlevel to a bold title standing over an empty list.
    const data = { reference: spec([]) };
    const source = '<ApiOverview source="reference" />\n';
    expect(downlevelComponents(source, serializers(data))).toBe(source);
  });

  it("declines rather than emitting a page that lost its endpoint", () => {
    // An id or source the spec does not carry means the build and the spec
    // disagree. Leaving the JSX visible is Blume's own fallback and the honest
    // outcome; the alternative is a page silently missing its endpoint.
    const data = { reference: spec([operation({ key: "list-pets" })]) };
    for (const source of [
      '<Operation source="reference" id="gone" />\n',
      '<Operation source="other" id="list-pets" />\n',
      '<ApiTagOperations source="reference" tag="nothing" />\n',
      '<ApiTagOperations source="other" tag="pets" />\n',
      '<ApiTagOperations source="reference" />\n',
      '<ApiOverview source="other" />\n',
    ]) {
      expect(downlevelComponents(source, serializers(data))).toBe(source);
    }
  });

  it("declines every component when the project has no OpenAPI source", () => {
    const bare = openapiComponentSerializers({ sources: [] });
    const source = '<Operation source="reference" id="list-pets" />\n';
    expect(downlevelComponents(source, bare)).toBe(source);
  });
});
