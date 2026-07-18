<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Pipe Fill → Cargo Weight

- **Plan**: context/changes/pipe-fill-cargo-weight/plan.md
- **Scope**: Phases 1–4 of 4
- **Date**: 2026-07-18
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical · 2 warnings · 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Log/report claims fill when geometry failed

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: app.js:2003–2007 (mass path / preview)
- **Detail**: Preview showed geometry unavailable + steel-only kg, but Add tagged lines as filled while mass stayed steel-only.
- **Fix A ⭐ Recommended**: Explicit label suffix `(geometry unavailable)` on Add when wet + !geometryOk.
- **Fix B**: Block Add when wet + !geometryOk.
- **Decision**: FIXED via Fix A

### F2 — Signed-off wt-suspect rows: steel vs fill can diverge

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Safety & Quality
- **Location**: data/piping_catalog.js (bucket-B accepts)
- **Detail**: Sign-off accepted wt-suspect rows; steel uses `wt`, fill uses `od`/`t` — paths can diverge.
- **Fix A ⭐ Recommended**: Document residual risk in change.md S-03 handoff.
- **Fix B**: Defer wet-fill for wt-suspect keys.
- **Decision**: FIXED via Fix A

### F3 — Negative / zero length accepted into cargo totals

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: app.js Add / preview length path
- **Detail**: `lenM ≤ 0` could enter the log and poison Send totals.
- **Fix**: Reject `lenM ≤ 0` for length-enabled categories in preview/Add.
- **Decision**: FIXED

### F4 — Missing fill catalog: console-only, unlike piping catalog

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: app.js buildCargoFillSelect
- **Detail**: Missing FILL_MEDIA_CATALOG only console.errored; piping catalog shows preview warning.
- **Fix**: Set preview to `⚠ fill_media_catalog.js not loaded` when items empty.
- **Decision**: FIXED

### F5 — calcUnitKg drops geometryOk

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: app.js cargoAddItem
- **Detail**: Add called calcUnitKg then pipeUnitMass again for geometry label.
- **Fix**: Share one pipeUnitMass result for pipe Add path.
- **Decision**: FIXED

## Triage summary

| Finding | Decision |
|---------|----------|
| F1 | FIXED via Fix A |
| F2 | FIXED via Fix A |
| F3 | FIXED |
| F4 | FIXED |
| F5 | FIXED |
