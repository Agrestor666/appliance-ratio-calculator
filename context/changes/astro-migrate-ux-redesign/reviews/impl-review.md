<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Astro Migrate + UX Redesign

- **Plan**: `context/changes/astro-migrate-ux-redesign/plan.md`
- **Scope**: Phases 1–6 of 6
- **Date**: 2026-07-19
- **Verdict**: NEEDS ATTENTION → triaged
- **Findings**: 0 critical · 5 warnings · 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | WARNING |

## Findings

### F1 — Repo-wide `npm run lint` fails (CI risk)

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: `context/changes/full-schedule-flange-fitting/*` (unrelated WT)
- **Detail**: S-06-scoped lint + build + golden pass; full `eslint .` failed on unrelated change `.cjs` scripts — CI runs full lint.
- **Fix**: Ignore `context/changes/**/*.cjs` in `eslint.config.js`.
- **Decision**: FIXED

### F2 — Chart clamps utilization overshoot to 100%

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: `src/lib/appliance-ratio.ts` (`chartPercentsFromUtilization`)
- **Detail**: `clamp01` made util > 1 look “full” at 100% while Remaining metrics could go negative.
- **Fix A ⭐ Recommended**: Show actual Used % when utilization > 1; `overCapacity` callout in UI.
- **Decision**: FIXED (Fix A)

### F3 — Invalid threshold strings silently fall back to defaults

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: `src/lib/appliance-ratio.ts` (`parseThresholdForm`)
- **Detail**: Garbage warn/crit still evaluated at 0.85/0.9 with no input error.
- **Fix**: `ThresholdParseResult`; unparseable → INPUT alert; block report.
- **Decision**: FIXED

### F4 — No enforcement that warn < crit

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: `src/lib/appliance-ratio.ts` (`parseThresholdForm`)
- **Detail**: Inverted thresholds produced confusing severity.
- **Fix**: Validate `warn < crit` in `parseThresholdForm`.
- **Decision**: FIXED

### F5 — Doughnut chart destroyed/recreated on every percent change

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: `src/components/calculator/UtilizationChart.tsx`
- **Detail**: `useEffect` remounted Chart.js on every keystroke.
- **Fix**: Mount once; update data/colors via `chart.update("none")`.
- **Decision**: FIXED

### F6 — `client:only="react"` vs planned `client:load`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `src/pages/index.astro:7–8`
- **Detail**: Justified Cloudflare workerd / Invalid hook call workaround; documented in change.md.
- **Fix**: Keep + existing comment.
- **Decision**: FIXED (kept as-is)

### F7 — Phase 6 cutover still uncommitted

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: git working tree → commit `5cea412`
- **Detail**: Legacy relocate + Progress/smoke notes were uncommitted.
- **Fix**: Commit Phase 6 cutover (+ triage fixes F1–F5).
- **Decision**: FIXED — `5cea412`

### F8 — Print may include Layout banners

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: `src/styles/global.css`
- **Detail**: Print CSS hid report actions only; Layout `.banner` could appear in Print/PDF.
- **Fix**: Hide `.banner` in `@media print`.
- **Decision**: FIXED (uncommitted at save time — `src/styles/global.css`)
