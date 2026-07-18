# Astro Migrate + UX Redesign Implementation Plan

## Overview

Migrate the full Appliance Ratio calculator (ratio + cargo + rigging + chart/alerts + technical report) from legacy root files into the Astro SSR app with a redesigned, readable IA — split workspace (inputs | live results), semantic labels, utilization as hero metric, cargo/rigging as Sheets — using shadcn/ui + Tailwind 4. Hard-switch `/` to the new calculator; park Dialogflow; preserve formula correctness (FR-005) via golden fixture + E2E smoke.

## Current State Analysis

- **Runtime `/` today:** Astro already owns `/` via `src/pages/index.astro` (Welcome starter). Root `index.html` / `app.js` / `styles.css` / `data/*` are **not** served by `astro dev` / Cloudflare (`public/` has no legacy HTML). Planners using the product today may still open legacy via file:// or a separate static host — Astro path is the scaffold, not the calculator yet.
- **Calculator logic:** ~2.1k-line `app.js` — DOM-id cache, `computeFromInputs` / `recompute` (`app.js:293–344`), Chart.js CDN doughnut, rigging + cargo modals, report via `window.open` / blob, Dialogflow bot, audio alerts.
- **Formula (frozen):** `E6 = (cargo + rigging) * contingency * daf`, `E8 = E6 / wll`. Golden from S-03: E6 = **1.730925**, E8 = **0.576975** for `EXCEL_DEFAULTS` — `context/archive/2026-07-18-cargo-weight-to-ratio/golden-utilization.md`.
- **Scaffold ready:** Astro 6 + React 19 islands + Tailwind 4 + shadcn new-york (`components.json`); only `Button` present; `cn()` + CSS tokens in `src/styles/global.css`. No `chart.js` / `zod` / `recharts` in `package.json`.
- **Prior slices:** Cargo fill, catalog, ratio handoff, B16.9 fittings done on **legacy host**; all deferred Astro/redesign to S-06. Research locked design system (shadcn) and layout direction (industrial split).
- **Constraints:** No auth/DB; browser-local; no formula rewrite; no inventing a test runner; npm via `registry.npmmirror.com`; do not silently delete legacy without cutover phase.

## Desired End State

A planner opens `/` on the Astro app and uses a light, industrial-neutral calculator: left panel for cargo/rigging/contingency/DAF/WLL (Sheets for catalog workflows), right panel for live utilization (hero), metrics, visual alerts, chart, and report CTA. Manual Te entry still works. Technical report opens as an in-app print view with content parity to legacy (including S-03 sentLog/Te mismatch disclosure). Dialogflow is absent. Formula matches golden. Root legacy tree lives under `legacy/` for reference, not as the product entry.

### Key Discoveries:

- Hard switch does **not** fight root `index.html` in Astro runtime — replace `src/pages/index.astro` content; move legacy to `legacy/` to avoid dual-source confusion (`AGENTS.md` already marks root tree as legacy).
- `computeFromInputs` is nearly pure — extract to `src/lib/` by passing numbers in (drop `.value` reads) (`app.js:293–312`).
- Island pattern exists: `client:load` on React forms (`src/pages/auth/signin.astro`).
- Report mismatch honesty already specified in S-03 archive plan — port that rule, do not drop it.
- Research: shadcn only; no Mantine/Ant; bot out of first viewport (now out of v1 entirely).

## What We're NOT Doing

- Dialogflow / LiftSpec Bot (Parked for a later decision)
- Auth, Supabase data, database migration
- Rewriting or “improving” the utilization / Appliance Ratio formula
- Audio beep / speech alerts (visual only in v1)
- Recharts or other chart libs (Chart.js via npm only)
- Dual-serve `/legacy` under `public/` (unless a later hotfix needs rollback)
- Full wireframe/design-tool pass — implement from research IA direction
- Inventing a test runner / CI UI tests
- Dark-mode-first skin or purple glass legacy theme
- Changing catalog math / ASME data (consume existing `data/` catalogs as source)
- Finishing S-05 (B16.5 flanges) inside this change — consume whatever catalog is current

## Implementation Approach

1. Stand up product shell + shadcn kit on `/` (empty but correct IA chrome).
2. Extract pure ratio engine; wire live inputs → results; prove golden.
3. Port cargo then rigging catalog workflows into Sheets feeding the same state.
4. Add Chart.js doughnut + visual threshold alerts.
5. Port technical report to in-app print view with S-03 mismatch disclosure.
6. Move legacy tree to `legacy/`; run smoke checklist; update agent docs pointers if needed.

Single primary React island (or thin shell + child islands) owns calculator state so cargo/rigging Send and ratio recompute share one source of truth — avoid dual `el(id)` worlds.

## Critical Implementation Details

**Formula freeze:** Port algebra byte-for-byte from `computeFromInputs`. Do not “simplify” contingency/DAF defaults or threshold constants without human confirm. Golden SSOT stays E6=1.730925 / E8=0.576975 for defaults.

**Catalog import:** Prefer ES-module-friendly copies or thin adapters under `src/lib/data/` (or `src/data/`) that import from moved/`legacy`/`data` sources without `window.*` globals. Imperative `innerHTML` table builders become React lists.

**State sequencing:** Cargo/Rigging Sheets mutate list state → Send writes Te into ratio inputs (button-Send, not live auto-sync — preserve S-03 behavior) → recompute. Manual edit of Te after Send must not clear `sentLog`; report must disclose mismatch when applicable.

**Cutover ordering:** Ship working `/` calculator **before** moving root files to `legacy/`, or move in the same phase after smoke on Astro — never leave a window where both are half-broken and docs point at the wrong tree. Do **not** place `index.html` under `public/`.

**npm:** Install `chart.js` (and any shadcn peer deps) via project mirror (`registry.npmmirror.com` / `.npmrc`).

---

## Phase 1: Shell & design kit

### Overview

Replace the Welcome page with a product calculator shell: light neutral branding, split L|R layout chrome, shadcn primitives needed for later phases, no business logic yet (placeholders OK).

### Changes Required:

#### 1. Product layout & `/` route

**File**: `src/pages/index.astro`, `src/layouts/Layout.astro`

**Intent**: Make `/` the calculator host with product title; drop starter Welcome from the default path.

**Contract**: `index.astro` renders Layout + a React island mount point (e.g. `CalculatorApp` with `client:load`). Layout default title becomes the product name (e.g. “Appliance Ratio Calculator”), not “10x Astro Starter”. Banner/missing-config behavior may remain.

#### 2. Shell UI structure

**File**: `src/components/calculator/*` (new)

**Intent**: Establish the IA chrome from research — left inputs column, right results column; semantic section headings; utilization slot; no Excel numbering.

**Contract**: Desktop: two-column workspace; mobile: stacked with results not buried forever (sticky results or results-first after first paint — pick one consistent pattern). Placeholders for Sheets triggers (“Cargo”, “Rigging”). Use `cn()` for classes.

#### 3. shadcn primitives

**File**: `src/components/ui/*` via `npx shadcn@latest add …`

**Intent**: Add only components Phase 1–2 need now; defer the rest to the phase that first uses them (progressive disclosure).

**Contract**: Minimum for shell: `card`, `button` (exists), `badge`, `separator` (or equivalent). Later phases add `input`, `label`, `select`, `sheet`, `table`, `tabs`, `alert`, `progress` as first needed. Style remains **new-york**; theme stays CSS variables in `global.css` (light industrial-neutral — tweak tokens only if needed for contrast, no purple glass).

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes on touched `src/` files
- `npm run build` succeeds
- `/` is served by Astro (no Welcome hero as primary content)

#### Manual Verification:

- Desktop shows clear L|R split chrome; mobile stacks readably
- Visual language is light/neutral (not legacy purple glass)
- No Dialogflow widget on the page

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before Phase 2.

---

## Phase 2: Core ratio engine

### Overview

Extract pure utilization math to `src/lib/`, wire ratio inputs and live results (utilization hero + metrics), prove golden defaults.

### Changes Required:

#### 1. Pure compute module

**File**: `src/lib/appliance-ratio.ts` (name flexible; keep under `src/lib/`)

**Intent**: Own the frozen formula and parsing helpers without DOM.

**Contract**: Export a function equivalent to `computeFromInputs` that accepts numeric inputs `{ cargoTe, riggingTe, contingency, daf, wll }` and returns `{ totalWeightTe: E6, utilization: E8, remaining: 1-E8 }` (plus any validation errors). Constants/defaults mirror `EXCEL_DEFAULTS` (`app.js:27–33`). Do not change algebra.

#### 2. Golden fixture in this change

**File**: `context/changes/astro-migrate-ux-redesign/golden-utilization.md`

**Intent**: Carry forward S-03 golden into this change folder so implementers do not depend on archive paths alone.

**Contract**: Same expected E6/E8 and inputs as `context/archive/2026-07-18-cargo-weight-to-ratio/golden-utilization.md`; note verification against `src/lib` export (one-shot `node`/`tsx` expression OK — no test runner).

#### 3. Ratio inputs + results UI

**File**: `src/components/calculator/*`

**Intent**: Live recompute on input change; semantic labels (Cargo weight, Rigging weight, Contingency, DAF, WLL); Reset to defaults; utilization as dominant right-panel metric.

**Contract**: Manual entry of all fields works without opening Sheets. Display may round; algebraic golden remains SSOT. Threshold defaults (warn 0.85 / crit 0.9) available for Phase 4 even if alerts UI is stubbed.

### Success Criteria:

#### Automated Verification:

- One-shot Node (or equivalent) against `src/lib` yields E6=1.730925 and E8=0.576975 for golden inputs
- `golden-utilization.md` exists in this change folder
- `npm run lint` / `npm run build` pass

#### Manual Verification:

- Reset (or default load) shows Total Weight / Utilization consistent with golden (display rounding OK)
- Editing any input updates results immediately (perceived instant)
- Manual Te entry works without catalog Sheets

**Implementation Note**: Pause for human confirmation before Phase 3.

---

## Phase 3: Cargo & Rigging Sheets

### Overview

Port catalog-driven cargo (incl. fill) and rigging builders into shadcn Sheets; Send writes Te into ratio inputs; preserve list/log behavior and manual override.

### Changes Required:

#### 1. Catalog modules for Astro

**File**: `src/lib/data/*` or adapters importing from `data/` / future `legacy/data/`

**Intent**: Eliminate `window.PIPING_CATALOG` / `RIGGING_CATALOG` / `FILL_MEDIA_CATALOG` globals for the Astro app.

**Contract**: Typed (or JSDoc-typed) exports consumed by React. Until Phase 6 move, importing from repo `data/` is OK if Vite can resolve; after move, update import paths once.

#### 2. Cargo Sheet

**File**: `src/components/calculator/cargo/*`

**Intent**: Parity with legacy cargo modal capabilities needed for US-01 path: category/type/class/schedule/NPS/length/fill/qty → list → Send to Cargo Weight (fill-aware Te).

**Contract**: Button-Send (not live auto-sync). Keep `sentLog` / sum semantics so Phase 5 can disclose Te mismatch. Manual cargo Te on main form remains editable after Send.

#### 3. Rigging Sheet

**File**: `src/components/calculator/rigging/*`

**Intent**: Parity with legacy rigging modal: sheet tabs / catalog table / log / sum → Send to Rigging Weight. Help content can be a secondary Sheet or Dialog (static copy from `#riggingHelpModal`) — optional if time-boxed, but Send path is must-have.

**Contract**: Same Send model as cargo. Steppers/qty UX may use shadcn controls instead of legacy +/- DOM.

### Success Criteria:

#### Automated Verification:

- `npm run lint` / `npm run build` pass
- Catalog modules resolve without `window.*` in the Astro island bundle path

#### Manual Verification:

- Build a fill-aware pipe cargo list → Send → cargo Te and utilization update correctly
- Build a rigging list → Send → rigging Te updates; ratio recomputes
- Manual edit of Te after Send still recomputes (list not required to auto-clear)
- Sheets work on desktop and are usable on mobile

**Implementation Note**: Pause for human confirmation before Phase 4.

---

## Phase 4: Chart & visual alerts

### Overview

Add Chart.js doughnut and visual warn/crit alerts (no audio).

### Changes Required:

#### 1. Chart.js dependency

**File**: `package.json` (via npm mirror)

**Intent**: Replace CDN global with bundled Chart.js for the island.

**Contract**: Install `chart.js` using project registry mirror. No Recharts.

#### 2. Chart + thresholds UI

**File**: `src/components/calculator/*`

**Intent**: Port doughnut + threshold display behavior from `ensureChart` / `updateChart` / thresholds UI (`app.js:46–135` region) into React lifecycle.

**Contract**: Chart updates when utilization changes. Visual language uses status colors (safe / warn / crit), not legacy purple chrome.

#### 3. Visual alerts

**File**: `src/components/calculator/*`

**Intent**: Show warn/crit messaging when utilization crosses thresholds (port logic from `updateAlerts` without beep/speech).

**Contract**: No `Audio` / `speechSynthesis` in v1. Alerts visible in the results panel.

### Success Criteria:

#### Automated Verification:

- `chart.js` listed in `package.json` dependencies
- `npm run build` succeeds (Chart tree-shaken/bundled, no CDN script required on `/`)

#### Manual Verification:

- Raising utilization into warn/crit bands updates chart and shows visual alerts
- No beep/speech on threshold cross
- Reset clears or normalizes alert state appropriately

**Implementation Note**: Pause for human confirmation before Phase 5.

---

## Phase 5: Technical report (in-app print)

### Overview

Replace `window.open` report with an in-app print view; preserve payload richness and S-03 mismatch disclosure.

### Changes Required:

#### 1. Report payload builder

**File**: `src/lib/report.ts` (or under `src/components/calculator/report/`)

**Intent**: Collect inputs, results, thresholds, cargo/rigging logs, chart image (if feasible) for print — parity with `getReportPayload` / `generateTechnicalReport` intent (`app.js:1125–1408`).

**Contract**: When `sentLog` non-empty and form cargo Te differs from last Send sum beyond ~`1e-6` Te, disclose mismatch in cargo section (S-03 rule). Manual-entry copy when no `sentLog`.

#### 2. Print view UX

**File**: route and/or React view (e.g. printable panel, dedicated print CSS)

**Intent**: User triggers report from results panel (secondary CTA); Print / Save as PDF via browser.

**Contract**: Prefer same-origin in-app view over `window.open` to blank. Must work under Cloudflare-local/`astro dev` without popup blockers as a hard dependency. Chart snapshot: best-effort canvas → image in report; if blocked, still ship numeric results + logs.

### Success Criteria:

#### Automated Verification:

- `npm run lint` / `npm run build` pass

#### Manual Verification:

- Happy path: Send cargo → open report → sees inputs/results/logs consistent with UI
- Mismatch path: Send then edit cargo Te → report discloses last-Send breakdown may not match Te
- Print dialog usable (browser Print / PDF)
- Report CTA lives with results, not as the only page purpose

**Implementation Note**: Pause for human confirmation before Phase 6.

---

## Phase 6: Cutover & smoke

### Overview

Make Astro `/` the sole product entry; relocate legacy tree; run full smoke against golden + E2E paths.

### Changes Required:

#### 1. Relocate legacy tree

**File**: move `index.html`, `app.js`, `styles.css`, and related root calculator assets / `data/` as needed into `legacy/` (keep git history via `git mv` where practical)

**Intent**: End dual-source confusion; keep code available for reference/diff during bake-in.

**Contract**: Do **not** put legacy `index.html` in `public/`. Update any Astro import paths that still pointed at `data/`. Update `AGENTS.md` one-liner if it still says legacy lives at repo root (point to `legacy/`). Do not delete without human OK.

#### 2. Smoke & close-out notes

**File**: `context/changes/astro-migrate-ux-redesign/change.md` Notes

**Intent**: Record smoke results and any known gaps.

**Contract**: Checklist covering: defaults/golden; fill-aware cargo Send → ratio; rigging Send; visual alerts; report + mismatch; manual Te; Reset; mobile glance; no bot. Note residual risks (e.g. chart-in-report best-effort).

### Success Criteria:

#### Automated Verification:

- `npm run lint` + `npm run build` pass after moves
- Repo has no requirement that root `index.html` be the product entry
- Golden one-shot against `src/lib` still passes

#### Manual Verification:

- Full E2E smoke checklist above passes on `npm run dev` (Cloudflare workerd)
- `/` shows only the new calculator (no Welcome, no Dialogflow)
- Legacy files are under `legacy/` and not required for the Astro app to run

**Implementation Note**: After Phase 6, change is ready for `/10x-impl-review` / archive when human accepts.

---

## Testing Strategy

### Unit Tests:

- None via a formal runner (repo has none). Use one-shot Node verification of `src/lib` against golden values.

### Integration Tests:

- None automated. Phase 6 manual E2E is the integration gate.

### Manual Testing Steps:

1. Load `/` → defaults match golden Total Weight / Utilization (rounding OK).
2. Open Cargo Sheet → add filled pipe → Send → utilization updates; edit Te manually → recomputes.
3. Open Rigging Sheet → add item → Send → recomputes.
4. Drive utilization above warn/crit → visual alerts + chart update; no audio.
5. Generate report → print view; repeat after Te edit for mismatch disclosure.
6. Reset → back to defaults.
7. Narrow viewport → layout remains usable.
8. Confirm no Dialogflow widget.

## Performance Considerations

- Prefer one hydrated calculator island over many tiny islands sharing duplicated catalog state.
- Catalog data should be static imports (tree-shakeable) — avoid fetching.
- Chart.js loaded with the island bundle is acceptable for this tool’s scale (low QPS, medium users per PRD).

## Migration Notes

- **Runtime cutover:** Astro `/` becomes product; relocate root legacy → `legacy/`.
- **Rollback:** Keep `legacy/` until human accepts; emergency static host can serve `legacy/index.html` outside Astro if needed (not wired into Cloudflare assets by default).
- **Data:** No DB migration; catalogs are static files.
- **Formula:** No behavioral migration — same algebra.

## References

- Related research: `context/changes/astro-migrate-ux-redesign/research.md`
- Golden source: `context/archive/2026-07-18-cargo-weight-to-ratio/golden-utilization.md`
- Formula / recompute: `app.js:293–344`
- Report / mismatch: `context/archive/2026-07-18-cargo-weight-to-ratio/plan.md`
- Roadmap: `context/foundation/roadmap.md` §S-06
- Stack: `context/foundation/tech-stack.md`, `AGENTS.md`, `components.json`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Shell & design kit

#### Automated

- [x] 1.1 `npm run lint` passes on touched `src/` files — 82082a3
- [x] 1.2 `npm run build` succeeds — 82082a3
- [x] 1.3 `/` is served by Astro (no Welcome hero as primary content) — 82082a3

#### Manual

- [x] 1.4 Desktop shows clear L|R split chrome; mobile stacks readably — 82082a3
- [x] 1.5 Visual language is light/neutral (not legacy purple glass) — 82082a3
- [x] 1.6 No Dialogflow widget on the page — 82082a3

### Phase 2: Core ratio engine

#### Automated

- [x] 2.1 One-shot Node (or equivalent) against `src/lib` yields E6=1.730925 and E8=0.576975 for golden inputs — 1d5f517
- [x] 2.2 `golden-utilization.md` exists in this change folder — 1d5f517
- [x] 2.3 `npm run lint` / `npm run build` pass — 1d5f517

#### Manual

- [x] 2.4 Reset (or default load) shows Total Weight / Utilization consistent with golden (display rounding OK) — 1d5f517
- [x] 2.5 Editing any input updates results immediately (perceived instant) — 1d5f517
- [x] 2.6 Manual Te entry works without catalog Sheets — 1d5f517

### Phase 3: Cargo & Rigging Sheets

#### Automated

- [x] 3.1 `npm run lint` / `npm run build` pass
- [x] 3.2 Catalog modules resolve without `window.*` in the Astro island bundle path

#### Manual

- [x] 3.3 Build a fill-aware pipe cargo list → Send → cargo Te and utilization update correctly
- [x] 3.4 Build a rigging list → Send → rigging Te updates; ratio recomputes
- [x] 3.5 Manual edit of Te after Send still recomputes (list not required to auto-clear)
- [x] 3.6 Sheets work on desktop and are usable on mobile

### Phase 4: Chart & visual alerts

#### Automated

- [ ] 4.1 `chart.js` listed in `package.json` dependencies
- [ ] 4.2 `npm run build` succeeds (Chart bundled; no CDN script required on `/`)

#### Manual

- [ ] 4.3 Raising utilization into warn/crit bands updates chart and shows visual alerts
- [ ] 4.4 No beep/speech on threshold cross
- [ ] 4.5 Reset clears or normalizes alert state appropriately

### Phase 5: Technical report (in-app print)

#### Automated

- [ ] 5.1 `npm run lint` / `npm run build` pass

#### Manual

- [ ] 5.2 Happy path: Send cargo → open report → sees inputs/results/logs consistent with UI
- [ ] 5.3 Mismatch path: Send then edit cargo Te → report discloses last-Send breakdown may not match Te
- [ ] 5.4 Print dialog usable (browser Print / PDF)
- [ ] 5.5 Report CTA lives with results, not as the only page purpose

### Phase 6: Cutover & smoke

#### Automated

- [ ] 6.1 `npm run lint` + `npm run build` pass after moves
- [ ] 6.2 Repo has no requirement that root `index.html` be the product entry
- [ ] 6.3 Golden one-shot against `src/lib` still passes

#### Manual

- [ ] 6.4 Full E2E smoke checklist passes on `npm run dev`
- [ ] 6.5 `/` shows only the new calculator (no Welcome, no Dialogflow)
- [ ] 6.6 Legacy files are under `legacy/` and not required for the Astro app to run
