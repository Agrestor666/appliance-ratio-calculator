/**
 * Build static site + deploy to Cloudflare Pages (*.pages.dev).
 * Project name is separate from the Workers app to avoid collisions.
 *
 * Clears stale Workers deploy redirect (`.wrangler/deploy/config.json`) left by
 * `astro build` / `wrangler deploy` — it points at dist/server/wrangler.json which
 * does not exist after a static Pages build.
 */
import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectName = process.env.CF_PAGES_PROJECT || "appliance-ratio-calculator-pages";
const workersDeployRedirect = path.join(root, ".wrangler", "deploy");

const build = spawnSync("node", ["scripts/build-pages.mjs"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

await rm(workersDeployRedirect, { recursive: true, force: true });

const create = spawnSync(
  "npx",
  ["wrangler", "pages", "project", "create", projectName, "--production-branch", "master"],
  { cwd: root, stdio: "pipe", shell: true, env: process.env, encoding: "utf8" },
);
// Ignore "already exists" — create is idempotent enough for first-run UX.
if (create.status !== 0) {
  const msg = `${create.stdout ?? ""}${create.stderr ?? ""}`;
  if (!/already exists|name already used|8000007/i.test(msg) && !/Successfully created/i.test(msg)) {
    // Project may already exist; continue to deploy. Log only unexpected failures.
    if (!/A project with this name already exists/i.test(msg)) {
      process.stderr.write(msg);
    }
  }
}

const deploy = spawnSync(
  "npx",
  [
    "wrangler",
    "pages",
    "deploy",
    "./dist",
    "--project-name",
    projectName,
    "--branch",
    "master",
    "--commit-dirty=true",
  ],
  { cwd: root, stdio: "inherit", shell: true, env: process.env },
);
process.exit(deploy.status ?? 1);
