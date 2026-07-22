/**
 * Build a static dist/ for Cloudflare Pages (*.pages.dev).
 * Uses astro.config.pages.mjs (no disk moves — API routes omitted via integration).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync("npx", ["astro", "build", "--config", "astro.config.pages.mjs"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});
process.exit(result.status ?? 1);
