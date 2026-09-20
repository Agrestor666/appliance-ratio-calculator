# Appliance Ratio Calculator

Browser tool for lifting planners: **Appliance Ratio**, cargo weight, and rigging weight in one place.

Live: [appliance-ratio-calculator-pages.pages.dev](https://appliance-ratio-calculator-pages.pages.dev)

## What it does

The lift is evaluated in Te along one path:

```text
total weight = (cargo weight + rigging weight) × contingency × DAF
utilization  = total weight ÷ WLL        (= Appliance ratio = Used)
remaining    = 1 − utilization
```

Everything else feeds or presents those numbers:

- **Cargo sheet** — build a cargo list from catalog line items (pipe, fitting, flange, valve) by type / class / schedule / NPS, with quantities, or type a total by hand. Pipe items can be filled (empty, fresh water, seawater, light oil); the fill adds to the line weight. Catalog weights come from ASME B16.5 (flanges) and B16.9 (fittings) plus pipe schedule tables.
- **Rigging sheet** — pick gear from the rigging catalog (shackles, beam clamps, chain blocks, slings) with WLL and per-item weight, or type a total by hand.
- **Ratio inputs** — contingency, DAF, and appliance WLL at radius.
- **Live results** — total weight and utilization, with warn / critical utilization thresholds (defaults 0.85 / 0.90) driving visual alerts.
- **Capacity chart** — Used vs Remaining, with an over-capacity callout above 100%.
- **Lift overview diagram** — schematic of the configured lift.
- **Technical report** — printable summary of inputs, outputs, formulas, and the chart.

Routes: `/` is the calculator, [`/help`](https://appliance-ratio-calculator-pages.pages.dev/help) documents the flow, every input/output, and the formulas. No login is required.

## Tech stack

- [Astro](https://astro.build/) 6 — static site + React islands
- [React](https://react.dev/) 19 — calculator UI
- [TypeScript](https://www.typescriptlang.org/) 5
- [Tailwind CSS](https://tailwindcss.com/) 4 + shadcn/ui (new-york) + [Lucide](https://lucide.dev/) icons
- [Chart.js](https://www.chartjs.org/) 4 — capacity chart
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — `sitemap-index.xml` at build time
- [Supabase](https://supabase.com/) — optional auth scaffold (not required for the calculator)
- [Cloudflare Pages](https://pages.cloudflare.com/) — only host (`*.pages.dev`)

## Prerequisites

- Node.js **22.14.0** (see `.nvmrc`)
- npm (comes with Node.js)

## Getting started

```bash
git clone https://github.com/Agrestor666/appliance-ratio-calculator.git
cd appliance-ratio-calculator
npm install
npm run dev
```

Open the URL printed by Astro (default `http://localhost:4321/`).

No `.env` is needed — the calculator runs without Supabase. See [Supabase (optional)](#supabase-optional) to enable the auth scaffold.

## Scripts

| Command            | Purpose                            |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Astro dev server                   |
| `npm run build`    | Static production build → `dist/`  |
| `npm run preview`  | Preview the production build       |
| `npm run deploy`   | Build + deploy to Cloudflare Pages |
| `npm run lint`     | ESLint (type-checked)              |
| `npm run lint:fix` | Auto-fix ESLint issues             |
| `npm run format`   | Prettier                           |

## Project structure

```text
src/
  pages/              # Routes: index.astro (calculator), help.astro, auth examples
  pages/api/          # Starter auth handlers — omitted from the Pages build
  layouts/Layout.astro
  components/         # Astro + React
    calculator/       # CalculatorApp/Shell, cargo + rigging sheets, chart, report, diagram
    ui/               # shadcn (new-york)
  lib/                # appliance-ratio, cargo, rigging, report, format helpers
    data/             # piping / fill-media / rigging catalogs + types
  styles/global.css   # Tailwind entry + theme tokens
  middleware.ts       # Session + PROTECTED_ROUTES
public/               # Favicons, PWA icons, site.webmanifest
flanges/              # Raw ASME B16.5 dimension/weight CSVs — see below
scripts/deploy.mjs    # Cloudflare Pages deploy helper
wrangler.jsonc        # Pages project name + output dir
.github/workflows/    # CI + deploy
supabase/             # Local Supabase / migrations (optional)
context/              # PRD, roadmap, change + archive notes (not runtime)
```

`flanges/FLG{150…2500}.csv` are raw per-pressure-class ASME B16.5 flange dimension and weight tables, kept as source material for future catalog imports. They are **not** read at runtime — the app only reads the generated objects in `src/lib/data/`.

Agent-facing conventions live in `AGENTS.md` and `CLAUDE.md`; product intent in `context/foundation/prd.md`.

There is no test suite in this repo — `npm run lint` and `npm run build` are the only automated gates.

## Deployment

Deploy target is **Cloudflare Pages only** (not Workers / `*.workers.dev`).

```bash
npm run deploy
```

Requires Wrangler auth (`npx wrangler login`). Production URL:

`https://appliance-ratio-calculator-pages.pages.dev`

## CI

GitHub Actions on every push/PR to `master`:

1. **ci** — `npm ci` → `npx astro sync` → lint → build
2. **deploy** — on push to `master`, deploys to Pages **only if** Cloudflare secrets are set; otherwise the job soft-skips with a warning

Repository secrets (Settings → Secrets and variables → Actions):

| Secret                  | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `SUPABASE_URL`          | Optional build-time env                 |
| `SUPABASE_KEY`          | Optional build-time env                 |
| `CLOUDFLARE_API_TOKEN`  | Pages Edit token (needed for CI deploy) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID                   |

## Supabase (optional)

Auth is a starter leftover. Env vars are **server-only** via `astro:env` (`SUPABASE_URL`, `SUPABASE_KEY`).

### Local stack

Needs Docker.

```bash
cp .env.example .env
npx supabase start
```

Copy the printed URL and anon key into `.env`, then `npx supabase stop` when done. Studio: `http://localhost:54323`.

### Auth routes

| Route                 | Description             |
| --------------------- | ----------------------- |
| `/auth/signin`        | Sign-in                 |
| `/auth/signup`        | Sign-up                 |
| `/auth/confirm-email` | Post-signup inbox check |
| `/dashboard`          | Example protected page  |

Protection is configured in `src/middleware.ts` (`PROTECTED_ROUTES`).

## License

MIT
