<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Cargo Catalog Selection

- **Plan**: context/changes/cargo-catalog-selection/plan.md
- **Scope**: Phases 1–4 of 4
- **Date**: 2026-07-18
- **Verdict**: APPROVED
- **Findings**: 0 critical 1 warning 1 observation

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

### F1 — Non-monotonic Sch *S weights after gap-fill

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: data/piping_catalog.js:39, :107
- **Detail**: Approved add-only inserts for Sch 10S / Sch 80S NPS 22 are pipes.json-faithful but sit next to pre-existing *S neighbors that appear aliased from the non-S schedule, so kg/m drops as NPS increases (20 → 22 → 24). Plan forbade overwriting existing weights.
- **Fix A ⭐ Recommended**: Document the cliff in gap-candidates.md / change.md Notes (no catalog overwrite)
  - Strength: Matches plan SSOT/add-only contract; warns planners.
  - Tradeoff: Catalog still non-monotonic for those two series.
  - Confidence: HIGH — aligns with conflict policy already signed off.
  - Blind spot: Whether Sch 10S/80S 20–24 neighbors are truly wrong vs intentional catalog history.
- **Fix B**: Reconcile Sch 10S / Sch 80S large-NPS series from pipes.json (overwrite neighbors)
  - Strength: Restores monotonic series for planners.
  - Tradeoff: Violates “do not overwrite” plan guardrail; needs new sign-off.
  - Confidence: MEDIUM — pipes.json already disagreed widely elsewhere.
  - Blind spot: Downstream trust in other aliased *S rows.
- **Decision**: FIXED via Fix A (docs in gap-candidates.md + change.md; landed in 45e0cc7)

### F2 — Epilogue commit still staged

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: context/changes/cargo-catalog-selection/{change,plan}.md
- **Detail**: Phase 4 landed as ca55672; epilogue (Progress SHA write-back + status: implemented) was staged but uncommitted until triage.
- **Fix**: Commit the staged epilogue (and F1 docs).
- **Decision**: FIXED (45e0cc7)
