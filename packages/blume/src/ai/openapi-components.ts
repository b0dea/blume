import type { BlumeProject } from "../core/project-graph.ts";
import type { ApiOperationRef, ApiSpecData } from "../openapi/model.ts";
import { isOpenApiSource } from "../openapi/source.ts";
import type {
  ComponentMarkdown,
  EvaluatedValue,
} from "./component-markdown.ts";
import { isString } from "./component-markdown.ts";

/** `` `GET /pets/{id}` `` — the line an agent is looking for. */
const signature = (operation: ApiOperationRef): string =>
  `\`${operation.method.toUpperCase()} ${operation.path}\``;

const summarize = (operation: ApiOperationRef): string =>
  operation.summary.trim().replaceAll(/\s+/gu, " ");

/** One operation as a link, for the tag listings. */
const listItem = (operation: ApiOperationRef): string => {
  const tail = [summarize(operation), operation.deprecated ? "Deprecated." : ""]
    .filter(Boolean)
    .join(" ");
  return `- [${signature(operation)}](${operation.route})${tail ? ` — ${tail}` : ""}`;
};

const operationsOf = (data: ApiSpecData): ApiOperationRef[] =>
  Object.values(data.operations);

/** Operation counts per display tag, in first-seen order. */
const countByTag = (operations: ApiOperationRef[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const operation of operations) {
    counts.set(operation.tag, (counts.get(operation.tag) ?? 0) + 1);
  }
  return counts;
};

/**
 * Agent-facing Markdown for the components a generated reference page is made
 * of: `<Operation>`, `<ApiTagOperations>` and `<ApiOverview>`.
 *
 * `render-mdx.ts` builds each reference page as the operation's description in
 * the body plus one of these components, deliberately: the structured UI is the
 * component's job, and the prose stays Markdown so it indexes. That split is
 * right for the rendered page and lossy everywhere else — `<route>.md`,
 * llms-full.txt, MCP `get_page` and the Ask AI corpus all downlevel components
 * to Markdown, and these three had no serializer, so an operation page reached
 * an agent as its description followed by a bare tag. On a site whose reference
 * is most of the corpus that is most of the corpus: measured on one 449-page
 * site, 266 pages and 266 raw `<Operation>` in llms-full.txt, so "which
 * endpoint do I call?" had no answer anywhere in the agent surface.
 *
 * What these emit is what {@link ApiOperationRef} already normalizes across
 * OpenAPI, AsyncAPI and GraphQL, rather than re-deriving anything from the
 * document. Parameters, schemas and responses are deliberately left out: those
 * are `operation-model.ts` plus each component's own preparation, and a second
 * implementation here would be free to disagree with the page. The endpoint and
 * what it does is the part that was missing altogether.
 */
export const openapiComponentSerializers = (
  project: Partial<Pick<BlumeProject, "sources">>
) => {
  // `sources` is always set on a scanned project; the default is for the
  // partial projects the downlevel tests build, which carry pages and no
  // sources. Without it every agent-surface builder throws on a fixture.
  const specs =
    (project.sources ?? []).find(isOpenApiSource)?.openApiData() ?? {};
  const specOf = (source: EvaluatedValue): ApiSpecData | undefined =>
    isString(source) ? specs[source] : undefined;

  return {
    /**
     * The overview page's map of the reference. Without it the page downlevels
     * to its intro paragraph followed by a run of empty tag headings.
     */
    ApiOverview: ({ props }) => {
      const data = specOf(props.source);
      if (!data) {
        return null;
      }
      const operations = operationsOf(data);
      if (operations.length === 0) {
        return null;
      }
      const groups = [...countByTag(operations).entries()].map(
        ([tag, count]) =>
          `- **${tag}** — ${count} operation${count === 1 ? "" : "s"}`
      );
      return `**${data.title}**\n\n${groups.join("\n")}`;
    },

    /** One tag's operations, mirroring the list the rendered page shows. */
    ApiTagOperations: ({ props }) => {
      const { tag } = props;
      const data = specOf(props.source);
      if (!(data && isString(tag))) {
        return null;
      }
      const operations = operationsOf(data).filter(
        (operation) => operation.tagSlug === tag
      );
      return operations.length > 0 ? operations.map(listItem).join("\n") : null;
    },

    /**
     * One operation. Declines when the spec carries no such key — Blume's own
     * fallback, which leaves the JSX visible rather than publishing a page that
     * silently lost its endpoint.
     */
    Operation: ({ props }) => {
      const { id } = props;
      const data = specOf(props.source);
      const operation = data && isString(id) ? data.operations[id] : undefined;
      if (!operation) {
        return null;
      }
      return operation.deprecated
        ? `${signature(operation)}\n\n**Deprecated.**`
        : signature(operation);
    },
  } satisfies Record<string, ComponentMarkdown>;
};
