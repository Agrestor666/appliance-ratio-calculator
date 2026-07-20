<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Full Schedule Flange + Fitting

- **Plan**: context/changes/full-schedule-flange-fitting/plan.md
- **Scope**: Phases 1–4 of 4
- **Date**: 2026-07-20
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical 3 warnings 3 observations

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

### F1 — Sign-off gate accepts OR of checkbox / Decision text

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: _apply_p3.cjs (~145–147)
- **Detail**: Apply proceeded if either Decision Accept all OR checked Accept all was present; mismatched Sign-off could still write full A+B+C.
- **Fix A ⭐ Recommended**: Require both checkbox and Decision == Accept all
  - Strength: Closes mismatch path; matches Accept-all liability intent.
  - Tradeoff: Apply helper slightly stricter for future re-runs.
  - Confidence: HIGH
  - Blind spot: Subset Accept would need a separate parser later.
- **Fix B**: Parse Decision only; ignore checkbox
- **Decision**: FIXED via Fix A

### F2 — Slip-On / Blind not deep-verified after apply

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: _verify_p3.cjs / _verify_p4.cjs
- **Detail**: Verify only asserted Class 150 flat array — not mass equality or src↔legacy deep parity for SO/Blind.
- **Fix**: Add SO/Blind deep parity + chart mass spot-checks to `_verify_p4.cjs`.
- **Decision**: FIXED

### F3 — Non-atomic src then legacy catalog write

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: _apply_p3.cjs (~480–481)
- **Detail**: Writes src then legacy with no rollback; second-write failure leaves dual-catalog drift.
- **Fix**: After both writes, assert fittings + WN + SO/Blind parity; throw on mismatch.
- **Decision**: FIXED

### F4 — Verify recomputes one WN cell of 1280 calculated

- **Severity**: 🔎 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: _verify_p4.cjs
- **Detail**: Plan required one formula recompute; future generator/apply drift across 1280 cells would not be caught.
- **Fix**: Recompute all non-chart WN catalog cells in `_verify_p4.cjs`.
- **Decision**: FIXED

### F5 — Re-running `_gen_candidates.cjs` can wipe Sign-off

- **Severity**: 🔎 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: _gen_candidates.cjs
- **Detail**: Generator overwrote candidates including Sign-off; latent process hazard after Accept.
- **Fix**: Refuse overwrite when Sign-off is Accept*; require `--force`.
- **Decision**: FIXED

### F6 — Benign EXTRA process files

- **Severity**: 🔎 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: plan-brief.md, _verify_p3.cjs
- **Detail**: Not named in Changes Required; both support the plan without product-scope expansion.
- **Fix**: No code change — leave as-is; note in change.md Notes.
- **Decision**: FIXED
