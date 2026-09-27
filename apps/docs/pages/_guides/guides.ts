// Guides: long-form walkthroughs that each take a reader to one goal with
// Blume ("Deploy Markdown docs to GitHub Pages"), written for the people
// searching for that task and the answer engines that quote them. An entry
// here is the guide's card (the homepage row, the /guides index, and another
// guide's "keep going" row) and its page's header, facts, and next step; its
// body lives in its own static route under guides/ (so it gets an OG card and
// a sitemap entry, like the customer stories and compare pages). The array's
// order is the display order; the homepage shows the first three.

/** A guide's shelf: the label on its card and page, and a Lucide glyph. */
export const topics = {
  agents: { icon: "bot", label: "Agents" },
  deploy: { icon: "cloud-upload", label: "Deploy" },
  i18n: { icon: "languages", label: "Translation" },
  migrate: { icon: "arrow-right-left", label: "Migrate" },
  reference: { icon: "braces", label: "API reference" },
  sources: { icon: "database", label: "Content sources" },
  versioning: { icon: "git-branch", label: "Versioning" },
} satisfies Record<string, { icon: string; label: string }>;

/** Who writes the guides, credited in each one's header. */
export interface Author {
  /** A square photo in `public/guides/authors/`, shown on the featured guide. */
  avatar?: string;
  href: string;
  name: string;
}

export const authors: Record<"hayden", Author> = {
  hayden: { href: "https://x.com/haydenbleasel", name: "Hayden Bleasel" },
};

export interface Guide {
  author: keyof typeof authors;
  /** The Blume docs pages the guide leans on, linked from its page's facts. */
  docs: { href: string; label: string }[];
  /**
   * The guide's runnable example: its source and, where it deploys, the live
   * site. Linked from the facts once they exist.
   */
  example?: { demo?: string; repo?: string };
  id: string;
  /**
   * The cover, in `public/guides/`: a landscape gradient made with
   * `bun run generate-guide-image` (see scripts/generate-guide-image.ts),
   * whose `--use` also writes the grid's thumbnail to
   * `public/guides/thumbs/<id>.webp`. Decorative, so `alt` stays empty unless
   * the image shows something.
   */
  image?: { alt?: string; src: string };
  /** Search result title and description. */
  meta: { description: string; title: string };
  /**
   * The one thing to do after reading: a command to copy (shown in the
   * install box), a link, or both.
   */
  nextStep: {
    body: string;
    command?: string;
    link?: { href: string; label: string };
    title: string;
  };
  /** What the reader needs before starting, one short line each. */
  prerequisites: string[];
  /**
   * First published, as `YYYY-MM-DD`. Not shown on the site: guides land in
   * batches, so their dates would bunch up. Kept for structured data.
   */
  published: string;
  /** What the reader ends up with: the page's lede and the card's body. */
  summary: string;
  /**
   * The last run of the walkthrough, start to finish, on a clean project:
   * the date (`YYYY-MM-DD`, not shown, like `published`) and the Blume
   * version it ran against (shown in the facts). Set it only when the steps
   * were actually run.
   */
  tested?: { date: string; version: string };
  /** The goal, as the reader would put it: the page's h1 and card's title. */
  title: string;
  topic: keyof typeof topics;
  /** Last meaningful revision, as `YYYY-MM-DD`; not shown, like `published`. */
  updated?: string;
}

// Written 2026-09-27 against main ahead of the 2.1 release, from the plan in
// "Search-focused tutorials for Blume". None has been run end to end on a
// clean project yet, so none sets `tested`, and none has its example project.
export const guides: Guide[] = [
  {
    author: "hayden",
    docs: [
      { href: "/docs/migrating", label: "Migrating" },
      { href: "/docs/deployment#redirects", label: "Redirects" },
      { href: "/compare/mintlify", label: "Blume vs Mintlify" },
    ],
    id: "migrate-from-mintlify",
    image: { src: "/guides/migrate-from-mintlify.webp" },
    meta: {
      description:
        "Move your Mintlify docs to Blume with a coding agent: what carries over, what to review, how to keep your URLs, and how to switch without downtime.",
      title: "How to migrate from Mintlify to self-hosted documentation",
    },
    nextStep: {
      body: "Run it at the root of your Mintlify repository, on a clean branch, then work through the review above.",
      command: "npx blume migrate mintlify --claude",
      link: { href: "/docs/migrating", label: "Read the migration reference" },
      title: "Migrate your docs",
    },
    prerequisites: [
      "A Mintlify docs repository",
      "Node.js 22.12 or later",
      "Claude Code or Codex, signed in",
    ],
    published: "2026-09-27",
    summary:
      "Hand your Mintlify repository to a coding agent, review what it changed, keep your URLs working, and deploy a docs site you host yourself.",
    title: "Migrate your docs from Mintlify",
    topic: "migrate",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/references/openapi", label: "OpenAPI reference" },
      { href: "/docs/references/api-pages", label: "API pages" },
      { href: "/docs/deployment", label: "Deployment" },
    ],
    id: "openapi-documentation-website",
    image: { src: "/guides/openapi-documentation-website.webp" },
    meta: {
      description:
        "Generate a documentation website from an OpenAPI spec: a page per operation, a working Try it playground, code samples, and your own guides beside the reference.",
      title: "How to generate API documentation from an OpenAPI spec",
    },
    nextStep: {
      body: "Start a project, drop your spec beside it, and add the reference to your config.",
      command: "npx blume init",
      link: {
        href: "/docs/references/openapi",
        label: "Read the OpenAPI reference docs",
      },
      title: "Start your API docs",
    },
    prerequisites: [
      "An OpenAPI spec in YAML or JSON (Swagger 2.0 works too)",
      "Node.js 22.12 or later",
    ],
    published: "2026-09-27",
    summary:
      "Turn an OpenAPI file into a docs site with a page per operation, a request playground, and hand-written guides beside the reference.",
    title: "Generate API docs from an OpenAPI spec",
    topic: "reference",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/content/sources/notion", label: "Notion source" },
      { href: "/docs/content/sources", label: "Content sources" },
      { href: "/docs/deployment", label: "Deployment" },
    ],
    id: "notion-documentation-website",
    image: { src: "/guides/notion-documentation-website.webp" },
    meta: {
      description:
        "Publish a documentation website from a Notion database: connect an integration, choose what goes live with a Status property, and rebuild when pages change.",
      title: "How to turn a Notion database into a documentation website",
    },
    nextStep: {
      body: "Pick notion when init asks where your content lives, then add your database ID to the config.",
      command: "npx blume init",
      link: {
        href: "/docs/content/sources/notion",
        label: "Read the Notion source docs",
      },
      title: "Publish your Notion docs",
    },
    prerequisites: [
      "A Notion database of pages",
      "Permission to create a Notion connection",
      "Node.js 22.12 or later",
    ],
    published: "2026-09-27",
    summary:
      "Keep writing in Notion and publish a searchable docs site from a database, with a Status property that decides what goes live.",
    title: "Turn a Notion database into a docs site",
    topic: "sources",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/deployment#subpath-deploys", label: "Subpath deploys" },
      { href: "/docs/cli/validate", label: "blume validate" },
    ],
    id: "markdown-docs-github-pages",
    image: { src: "/guides/markdown-docs-github-pages.webp" },
    meta: {
      description:
        "Deploy Markdown documentation to GitHub Pages with GitHub Actions: a searchable docs site at your project URL that rebuilds on every push.",
      title: "How to deploy Markdown documentation to GitHub Pages",
    },
    nextStep: {
      body: "Run it in your repository to add Blume beside your code, then add the workflow above.",
      command: "npx blume init",
      link: { href: "/docs/deployment", label: "Read the deployment docs" },
      title: "Put your docs on GitHub Pages",
    },
    prerequisites: [
      "A GitHub repository with Markdown docs",
      "Access to the repository's Pages settings",
      "Node.js 22.12 or later",
    ],
    published: "2026-09-27",
    summary:
      "Turn the Markdown in your repository into a searchable docs site on GitHub Pages that rebuilds every time you push.",
    title: "Deploy Markdown docs to GitHub Pages",
    topic: "deploy",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/discoverability/mcp", label: "MCP server" },
      { href: "/docs/discoverability/llms-txt", label: "llms.txt" },
      { href: "/docs/deployment#server-rendering", label: "Server rendering" },
    ],
    id: "mcp-server-for-documentation",
    image: { src: "/guides/mcp-server-for-documentation.webp" },
    meta: {
      description:
        "Add an MCP server to your documentation so coding agents can search and read it: turn it on, deploy it on a server host, and connect Claude Code or Cursor.",
      title: "How to add an MCP server to your documentation",
    },
    nextStep: {
      body: "Turn it on in your config, deploy, and connect your own editor to it.",
      link: {
        href: "/docs/discoverability/mcp",
        label: "Read the MCP server docs",
      },
      title: "Give agents your docs",
    },
    prerequisites: [
      "A Blume docs project",
      "A host that runs server code",
      "An MCP client, like Claude Code or Cursor",
    ],
    published: "2026-09-27",
    summary:
      "Let coding agents search and read your docs from inside the editor, through an MCP server that deploys with your site.",
    title: "Add an MCP server to your docs",
    topic: "agents",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/references/openapi#overlays", label: "OpenAPI overlays" },
      { href: "/docs/references/openapi", label: "OpenAPI reference" },
    ],
    id: "openapi-overlays-public-docs",
    image: { src: "/guides/openapi-overlays-public-docs.webp" },
    meta: {
      description:
        "Hide internal endpoints from public API documentation with an OpenAPI Overlay: keep the generated spec untouched and strip internal operations on every build.",
      title: "How to remove internal endpoints from public OpenAPI docs",
    },
    nextStep: {
      body: "Add an overlay beside your spec and list it in the reference's config.",
      link: {
        href: "/docs/references/openapi#overlays",
        label: "Read the overlays docs",
      },
      title: "Write your first overlay",
    },
    prerequisites: [
      "A Blume site with an OpenAPI reference",
      "A spec generated from code, or owned by another team",
      "Basic YAML",
    ],
    published: "2026-09-27",
    summary:
      "Publish a public API reference from the spec your code generates, with an overlay that strips internal operations on every build.",
    title: "Remove internal endpoints from public API docs",
    topic: "reference",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/migrating", label: "Migrating" },
      {
        href: "/docs/deployment#mount-the-docs-under-a-path",
        label: "Mount under a path",
      },
      { href: "/docs/content/islands", label: "Interactive islands" },
      { href: "/compare/docusaurus", label: "Blume vs Docusaurus" },
    ],
    id: "migrate-from-docusaurus",
    image: { src: "/guides/migrate-from-docusaurus.webp" },
    meta: {
      description:
        "Move a Docusaurus site's docs to Blume with a coding agent: sidebars, admonitions, versioned docs, and custom React components, plus how to keep your URLs.",
      title: "How to migrate a Docusaurus site to Blume",
    },
    nextStep: {
      body: "Run it at the root of your Docusaurus site, on a clean branch, then work through the review above.",
      command: "npx blume migrate docusaurus --claude",
      link: { href: "/docs/migrating", label: "Read the migration reference" },
      title: "Migrate your docs",
    },
    prerequisites: [
      "A Docusaurus site's repository",
      "Node.js 22.12 or later",
      "Claude Code or Codex, signed in",
    ],
    published: "2026-09-27",
    summary:
      "Move a Docusaurus site's docs to Blume with a coding agent, and check the sidebars, admonitions, and React components it carries over.",
    title: "Migrate your docs from Docusaurus",
    topic: "migrate",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/content/sources/obsidian", label: "Obsidian source" },
      { href: "/docs/content/sources", label: "Content sources" },
      {
        href: "/docs/content/frontmatter#sidebar",
        label: "Sidebar frontmatter",
      },
    ],
    id: "publish-obsidian-documentation",
    image: { src: "/guides/publish-obsidian-documentation.webp" },
    meta: {
      description:
        "Publish Obsidian notes as a documentation website: wikilinks, heading links, and images resolved at build time, straight from the vault with no export step.",
      title: "How to publish Obsidian notes as a documentation website",
    },
    nextStep: {
      body: "Scaffold a project with the Obsidian source, then move the notes you want public into its vault folder.",
      command: "npx blume init handbook-site",
      link: {
        href: "/docs/content/sources/obsidian",
        label: "Read the Obsidian source docs",
      },
      title: "Publish your vault",
    },
    prerequisites: [
      "A vault of notes that are safe to publish",
      "Node.js 22.12 or later",
    ],
    published: "2026-09-27",
    summary:
      "Publish a vault of Obsidian notes as a docs site, with wikilinks, heading links, and images resolved at build time.",
    title: "Publish Obsidian notes as a docs site",
    topic: "sources",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/content/versioning", label: "Versioning" },
      { href: "/docs/cli/version", label: "blume version" },
      {
        href: "/docs/deployment#pattern-redirects",
        label: "Pattern redirects",
      },
    ],
    id: "version-markdown-documentation",
    image: { src: "/guides/version-markdown-documentation.webp" },
    meta: {
      description:
        "Version Markdown documentation for an SDK: snapshot the current docs before a breaking release, and give readers of both versions a switcher, search, and the right canonical URLs.",
      title: "How to version Markdown documentation for an SDK",
    },
    nextStep: {
      body: "Snapshot your docs as they are today, before the breaking change lands.",
      command: "npx blume version v1",
      link: {
        href: "/docs/content/versioning",
        label: "Read the versioning docs",
      },
      title: "Snapshot your docs",
    },
    prerequisites: [
      "A Blume project with Markdown or MDX docs",
      "A breaking release on the way",
      "Node.js 22.12 or later",
    ],
    published: "2026-09-27",
    summary:
      "Snapshot your docs before a breaking release, so readers on the old and new versions each find the right instructions.",
    title: "Version your docs for a breaking release",
    topic: "versioning",
  },
  {
    author: "hayden",
    docs: [
      { href: "/docs/content/i18n", label: "Internationalization" },
      { href: "/docs/cli/translate", label: "blume translate" },
    ],
    id: "translate-markdown-documentation",
    image: { src: "/guides/translate-markdown-documentation.webp" },
    meta: {
      description:
        "Translate Markdown documentation with a coding agent, then keep translations current with a CI check that fails when a source page changes.",
      title: "How to translate Markdown docs and detect outdated translations",
    },
    nextStep: {
      body: "Add a locale to your config, then translate your docs into it.",
      command: "npx blume translate --claude",
      link: { href: "/docs/cli/translate", label: "Read the translate docs" },
      title: "Translate your docs",
    },
    prerequisites: [
      "A Blume project with Markdown or MDX docs",
      "Claude Code or Codex, signed in",
      "A reviewer who reads the target language",
    ],
    published: "2026-09-27",
    summary:
      "Translate your docs with a coding agent, then keep them current with a CI check that fails when a source page changes.",
    title: "Translate your docs and catch stale translations",
    topic: "i18n",
  },
];

/** A guide by its id; throws at build time on a typo in a route file. */
export const guideById = (id: string): Guide => {
  const guide = guides.find((entry) => entry.id === id);
  if (!guide) {
    throw new Error(`Unknown guide: ${id}`);
  }
  return guide;
};
