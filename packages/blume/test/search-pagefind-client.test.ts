import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

import { join } from "pathe";

import { createSearch } from "../src/components/layout/search/pagefind.ts";

/**
 * The Pagefind client against a stand-in `pagefind.js`. Like the real bundle,
 * the stand-in's `createInstance` reads the page's `<html lang>` as it
 * creates an instance, and each instance records the language it read and
 * the queries it searched.
 */

/** What the stand-in records for each instance it creates. */
interface CreatedInstance {
  language: string;
  options: { baseUrl: string };
  searches: string[];
}

/** The page the client reads its language from. */
const page = { lang: "en" };
const documentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document"
);

beforeAll(() => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: page },
    writable: true,
  });
});

afterAll(() => {
  // SAFETY: views globalThis as carrying just the document faked above, so
  // `delete` can remove it where no original descriptor existed.
  const globals = globalThis as { document?: unknown };
  if (documentDescriptor) {
    Object.defineProperty(globalThis, "document", documentDescriptor);
  } else {
    delete globals.document;
  }
});

/** Write a stand-in bundle; each test gets its own module instance. */
const bundle = async (): Promise<{
  created: CreatedInstance[];
  url: string;
}> => {
  const dir = await mkdtemp(join(tmpdir(), "blume-pagefind-client-"));
  const file = join(dir, "pagefind.mjs");
  await writeFile(
    file,
    [
      "export const created = [];",
      "const result = (url, title) => ({ data: () => Promise.resolve({ excerpt: 'pf', meta: title ? { title } : undefined, url }) });",
      "export const createInstance = (options) => {",
      "  const instance = { language: globalThis.document.documentElement.lang, options, searches: [] };",
      "  created.push(instance);",
      "  return { search: (query) => { instance.searches.push(query); return Promise.resolve({ results: [result('/p/', 'PF'), result('/'), result('/q/#part', 'Q')] }); } };",
      "};",
    ].join("\n")
  );
  const url = pathToFileURL(file).href;
  // SAFETY: the stand-in written above exports `created` as this list.
  const { created } = (await import(url)) as { created: CreatedInstance[] };
  return { created, url };
};

describe("Pagefind search client", () => {
  it("maps results to the dialog's slashless, base-less routes", async () => {
    page.lang = "en";
    const { created, url } = await bundle();
    const search = await createSearch({ url });
    const { hits } = await search("q");
    // Base-less routes, as every provider returns them: the dialog mounts the
    // deployment base itself.
    expect(created.map((instance) => instance.options)).toStrictEqual([
      { baseUrl: "/" },
    ]);
    // Slashless, as Blume serves pages; the home route and a fragment keep
    // their shape.
    expect(hits.map((hit) => hit.url)).toStrictEqual(["/p", "/", "/q#part"]);
    expect(hits[0]?.title).toBe("PF");
    expect(hits[1]?.title).toBe("/");
  });

  it("searches the index of the page's current language", async () => {
    page.lang = "en";
    const { created, url } = await bundle();
    const search = await createSearch({ url });
    await search("one");
    await search("two");
    // A client-side language switch: same client, new page language.
    page.lang = "ja";
    await search("three");
    page.lang = "en";
    await search("four");
    expect(
      created.map(({ language, searches }) => ({ language, searches }))
    ).toStrictEqual([
      { language: "en", searches: ["one", "two", "four"] },
      { language: "ja", searches: ["three"] },
    ]);
  });
});
