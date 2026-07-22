/**
 * Build static site + deploy to Cloudflare Pages (*.pages.dev).
 * Project name / output dir come from wrangler.jsonc.
 */
import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectName = process.env.CF_PAGES_PROJECT || "appliance-ratio-calculator-pages";

const build = spawnSync("npx", ["astro", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

// Drop leftover Workers redirect from older SSR deploys, if present.
await rm(path.join(root, ".wrangler", "deploy"), { recursive: true, force: true });

const create = spawnSync(
  "npx",
  ["wrangler", "pages", "project", "create", projectName, "--production-branch", "master"],
  { cwd: root, stdio: "pipe", shell: true, env: process.env, encoding: "utf8" },
);
if (create.status !== 0) {
  const msg = `${create.stdout ?? ""}${create.stderr ?? ""}`;
  if (!/already exists|name already used|8000007|Successfully created/i.test(msg)) {
    if (!/A project with this name already exists/i.test(msg)) {
      process.stderr.write(msg);
    }
  }
}

const deploy = spawnSync(
  "npx",
  ["wrangler", "pages", "deploy", "--branch", "master", "--commit-dirty=true"],
  { cwd: root, stdio: "inherit", shell: true, env: process.env },
);
process.exit(deploy.status ?? 1);
