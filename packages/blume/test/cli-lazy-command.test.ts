import { afterAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";

import { join } from "pathe";

const CLI = join(import.meta.dir, "..", "src", "cli", "index.ts");
const dirs: string[] = [];

afterAll(async () => {
  await Promise.all(
    dirs.map((dir) => rm(dir, { force: true, recursive: true }))
  );
});

const guardedCli = async (...args: string[]) => {
  const root = await mkdtemp(join(tmpdir(), "blume-cli-lazy-"));
  dirs.push(root);
  const preload = join(root, "preload.ts");
  await writeFile(
    preload,
    [
      "Bun.plugin({",
      '  name: "reject-unselected-command",',
      "  setup(build) {",
      "    build.onLoad({ filter: /[/\\\\]commands[/\\\\]dev\\.ts$/ }, () => {",
      '      throw new Error("unselected dev command was loaded");',
      "    });",
      "  },",
      "});",
      "",
    ].join("\n")
  );
  const proc = Bun.spawn(
    [process.execPath, "--preload", preload, CLI, ...args],
    { cwd: root, stderr: "pipe", stdout: "pipe" }
  );
  const [exitCode, stderr, stdout] = await Promise.all([
    proc.exited,
    new Response(proc.stderr).text(),
    new Response(proc.stdout).text(),
  ]);
  return { exitCode, stderr, stdout };
};

describe("lazy CLI commands", () => {
  it("runs a selected command without loading unrelated command dependencies", async () => {
    const result = await guardedCli("eval", "--agent", "copilot");
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Invalid --agent "copilot"');
    expect(result.stderr).not.toContain("unselected dev command was loaded");
  });

  it("renders selected-command help without loading unrelated command dependencies", async () => {
    const result = await guardedCli("eval", "--help");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Test the docs");
    expect(result.stdout).toContain("--threshold");
    expect(result.stderr).not.toContain("unselected dev command was loaded");
  });
});
