import { defineCommand, runMain } from "citty";

import { getBlumeVersion } from "../core/version.ts";
import { loadEnvFiles } from "./env.ts";
import { normalizeHostArgs } from "./host-args.ts";
import { reportInternalError } from "./internal-error.ts";

const lazyCommand =
  <Module, Key extends keyof Module>(load: () => Promise<Module>, key: Key) =>
  async (): Promise<Module[Key]> => {
    const module = await load();
    return module[key];
  };

const main = defineCommand({
  meta: {
    description: "Markdown-first documentation powered by Astro and Vite.",
    name: "blume",
    version: getBlumeVersion(),
  },
  subCommands: {
    add: lazyCommand(() => import("./commands/add.ts"), "addCommand"),
    audit: lazyCommand(() => import("./commands/audit.ts"), "auditCommand"),
    build: lazyCommand(() => import("./commands/build.ts"), "buildCommand"),
    check: lazyCommand(() => import("./commands/check.ts"), "checkCommand"),
    dev: lazyCommand(() => import("./commands/dev.ts"), "devCommand"),
    doctor: lazyCommand(() => import("./commands/doctor.ts"), "doctorCommand"),
    eject: lazyCommand(() => import("./commands/eject.ts"), "ejectCommand"),
    eval: lazyCommand(() => import("./commands/eval.ts"), "evalCommand"),
    init: lazyCommand(() => import("./commands/init.ts"), "initCommand"),
    "mcp-stdio": lazyCommand(
      () => import("./commands/mcp-stdio.ts"),
      "mcpStdioCommand"
    ),
    preview: lazyCommand(
      () => import("./commands/preview.ts"),
      "previewCommand"
    ),
    sync: lazyCommand(() => import("./commands/sync.ts"), "syncCommand"),
    translate: lazyCommand(
      () => import("./commands/translate.ts"),
      "translateCommand"
    ),
    validate: lazyCommand(
      () => import("./commands/validate.ts"),
      "validateCommand"
    ),
    version: lazyCommand(
      () => import("./commands/version.ts"),
      "versionCommand"
    ),
  },
});

// Load `.env`/`.env.local` before any command runs so remote content sources
// can read their tokens (e.g. `GITHUB_TOKEN`) during the content scan.
loadEnvFiles(process.cwd());

// Backstop for unexpected async failures that escape a command's own handling
// (e.g. a rejected timer/watcher in `blume dev`), so even those report through
// the stable internal-error contract rather than a bare stack trace.
process.on("uncaughtException", (error) => {
  reportInternalError(error);
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  reportInternalError(error);
  process.exit(1);
});

runMain(main, { rawArgs: normalizeHostArgs(process.argv.slice(2)) });
