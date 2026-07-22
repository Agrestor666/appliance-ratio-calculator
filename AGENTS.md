# Repository Guidelines

Appliance Ratio Calculator — browser tool for lifting planners (cargo weight, rigging, Appliance Ratio). Stack: Astro 6 SSR + React 19 islands + TypeScript + Tailwind 4 + Cloudflare (`@astrojs/cloudflare`), bootstrapped from the 10x Astro starter. Deeper agent rules: `@CLAUDE.md`. Product intent: `@context/foundation/prd.md`.

## Hard rules

- Install only via the project npm mirror in `@.npmrc` (`registry.npmmirror.com`). Do not call `registry.npmjs.org` for installs; `npm audit` is unavailable on this mirror.
- Never overwrite or delete `@context/` (plans, PRD, tech-stack hand-off). Never commit secrets; use `@.env.example` → `.env` / `.dev.vars` for `SUPABASE_*` (server-only via `astro:env`).
- Product code lives under `src/` only. The pre-Astro static calculator is archived at `@context/archive/2026-07-21-legacy-calculator/` — do not revive dual hosts or sync catalogs back into a live `legacy/` tree.
- App is SSR (`output: "server"` in `@astro.config.mjs`). API routes under `src/pages/api/` must export `const prerender = false`.
- Node **22.14.0** per `@.nvmrc`. Path alias `@/*` → `./src/*` (`@tsconfig.json`).

## Project structure

- `src/pages/` — routes; `src/pages/api/` — HTTP handlers; `src/pages/auth/`, `src/pages/dashboard.astro` — starter auth examples.
- `src/components/` — Astro + React; `src/components/ui/` — shadcn (new-york); hooks in `src/components/hooks/`.
- `src/lib/` — Supabase client, `cn()`, helpers, calculator logic + catalogs (`src/lib/data/`); `src/middleware.ts` — session + `PROTECTED_ROUTES`.
- `supabase/migrations/` — SQL migrations (`YYYYMMDDHHmmss_short_description.sql`); enable RLS on new tables.
- `public/`, `wrangler.jsonc` — static assets and Cloudflare config.
- `context/` — shaping/PRD/stack notes (not runtime); archived changes and the retired static calculator under `context/archive/`.

## Build, test, and development

- `npm run dev` — local Cloudflare workerd dev server.
- `npm run build` / `npm run preview` — production build and preview.
- `npm run build:pages` / `npm run deploy:pages` — static Cloudflare Pages deploy (`*.pages.dev`). Astro 6 SSR cannot target Pages; this path prerenders the calculator UI and omits auth API routes from that build.
- `npm run deploy` — SSR build + Workers deploy (`*.workers.dev`).
- `npm run lint` / `npm run lint:fix` — ESLint (type-checked); `npm run format` — Prettier.
- Pre-commit: husky + lint-staged (`@package.json` `lint-staged`).
- CI: `@.github/workflows/ci.yml` — `npm ci`, `astro sync`, lint, build (needs `SUPABASE_URL` / `SUPABASE_KEY` secrets). No repo test suite yet; do not invent a runner.

## Coding style

- Astro for layout/static; React only for interactivity. No Next.js `"use client"`.
- Merge Tailwind classes with `cn()` from `@/lib/utils` — do not concatenate class strings.
- API handlers: uppercase `GET`/`POST`; validate input with Zod. Shared types in `src/types.ts`.
- Add shadcn pieces with `npx shadcn@latest add <name>` into `src/components/ui/`.

## Lint / CI (do not regress)

CI runs `npm run lint` before build; a red lint job blocks the pipeline. Before finishing React/TS edits that touch `src/`, run `npm run lint` (or `npm run lint:fix` for Prettier/auto-fixables) and leave it green.

- **React Compiler:** never disable React ESLint rules in components (`eslint-disable` / `eslint-disable-next-line` for `react-hooks/*`, `react/*`, etc.). `react-compiler/react-compiler` fails the lint when any React rule is suppressed. Prefer correct deps (or recreate the effect when inputs change) over mount-only `[]` + disable.
- **No dead guards:** do not add `if (!x)` / optional chains that TypeScript already proves always truthy/falsy — `@typescript-eslint/no-unnecessary-condition` is an error.
- **Prettier via ESLint:** keep types and params formatted as Prettier expects (often single-line object/union types). Prefer `npm run lint:fix` or `npm run format` over hand-fighting wrapping; `prettier/prettier` failures fail CI the same as logic lint.

## Commits and PRs

Use Conventional Commits. PRs should stay green on the CI workflow above before merge.
