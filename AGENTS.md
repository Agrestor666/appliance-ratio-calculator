# Repository Guidelines

Appliance Ratio Calculator — browser tool for lifting planners (cargo weight, rigging, Appliance Ratio). Stack: Astro 6 SSR + React 19 islands + TypeScript + Tailwind 4 + Cloudflare (`@astrojs/cloudflare`), bootstrapped from the 10x Astro starter. Deeper agent rules: `@CLAUDE.md`. Product intent: `@context/foundation/prd.md`.

## Hard rules

- Install only via the project npm mirror in `@.npmrc` (`registry.npmmirror.com`). Do not call `registry.npmjs.org` for installs; `npm audit` is unavailable on this mirror.
- Never overwrite or delete `@context/` (plans, PRD, tech-stack hand-off). Never commit secrets; use `@.env.example` → `.env` / `.dev.vars` for `SUPABASE_*` (server-only via `astro:env`).
- Treat `legacy/` (`index.html`, `app.js`, `styles.css`, `data/`) as the pre-Astro calculator reference tree — not the product entry. New UI and APIs go under `src/`; do not “fix” or delete `legacy/` unless a change plan says so.
- App is SSR (`output: "server"` in `@astro.config.mjs`). API routes under `src/pages/api/` must export `const prerender = false`.
- Node **22.14.0** per `@.nvmrc`. Path alias `@/*` → `./src/*` (`@tsconfig.json`).

## Project structure

- `src/pages/` — routes; `src/pages/api/` — HTTP handlers; `src/pages/auth/`, `src/pages/dashboard.astro` — starter auth examples.
- `src/components/` — Astro + React; `src/components/ui/` — shadcn (new-york); hooks in `src/components/hooks/`.
- `src/lib/` — Supabase client, `cn()`, helpers; `src/middleware.ts` — session + `PROTECTED_ROUTES`.
- `supabase/migrations/` — SQL migrations (`YYYYMMDDHHmmss_short_description.sql`); enable RLS on new tables.
- `public/`, `wrangler.jsonc` — static assets and Cloudflare config.
- `legacy/` — parked static calculator (reference / emergency rollback host); not served by Astro.
- `context/` — shaping/PRD/stack notes (not runtime).

## Build, test, and development

- `npm run dev` — local Cloudflare workerd dev server.
- `npm run build` / `npm run preview` — production build and preview.
- `npm run lint` / `npm run lint:fix` — ESLint (type-checked); `npm run format` — Prettier.
- Pre-commit: husky + lint-staged (`@package.json` `lint-staged`).
- CI: `@.github/workflows/ci.yml` — `npm ci`, `astro sync`, lint, build (needs `SUPABASE_URL` / `SUPABASE_KEY` secrets). No repo test suite yet; do not invent a runner.

## Coding style

- Astro for layout/static; React only for interactivity. No Next.js `"use client"`.
- Merge Tailwind classes with `cn()` from `@/lib/utils` — do not concatenate class strings.
- API handlers: uppercase `GET`/`POST`; validate input with Zod. Shared types in `src/types.ts`.
- Add shadcn pieces with `npx shadcn@latest add <name>` into `src/components/ui/`.

## Commits and PRs

No git history in this working tree yet — establish Conventional Commits when initializing the repo. PRs should stay green on the CI workflow above before merge.
