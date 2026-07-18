<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: B16.5 Flange Catalog

- **Plan**: context/changes/b16-5-flange-catalog/plan.md
- **Scope**: Phases 1–4 of 4
- **Date**: 2026-07-18
- **Verdict**: NEEDS ATTENTION → triage resolved
- **Findings**: 0 critical 2 warnings 2 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | WARNING |

## Findings

### F1 — Phase 2 catalog never committed

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Success Criteria
- **Location**: data/piping_catalog.js
- **Detail**: WN nest + Core-3 rewrite lived only in dirty worktree; Phase 3 runtime committed without Phase 2 catalog.
- **Fix A ⭐ Recommended**: Commit Phase 2 catalog (+ helpers), stamp Progress 2.x SHAs.
- **Fix B**: Leave dirty; document follow-up before archive.
- **Decision**: FIXED via Fix A — catalog/helpers `7219577`, Progress stamp `9e4e835`

### F2 — Default WN Schedule is Sch 40S (truncated NPS)

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: app.js syncCargoSchedule
- **Detail**: First catalog key was Sch 40S (NPS ≤ 10″); STD full NPS looked missing until Schedule changed.
- **Fix**: Prefer selecting `STD` when present after fillSelect.
- **Decision**: FIXED — `if (schedules.includes("STD")) cargoSchSel.value = "STD";` (uncommitted in app.js at triage close)

### F3 — Deferred flange types still selectable with legacy wt

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: app.js getTypeList / catalog deferred types
- **Detail**: Plan left Socket Weld / Threaded / Lap Joint selectable; user chose to hide them in UI.
- **Fix**: Filter deferred types from flange Type dropdown; keep catalog rows.
- **Decision**: FIXED — getTypeList filters deferred set (uncommitted in app.js at triage close)

### F4 — Phase 2 helper scripts untracked

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: _apply_p2.cjs, _verify_p2.cjs
- **Detail**: Untracked tooling; resolved by F1 commit.
- **Decision**: SKIPPED — already fixed with F1 (`7219577`)
