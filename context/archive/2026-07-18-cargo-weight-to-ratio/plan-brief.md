# Cargo Weight to Ratio — Plan Brief

> Full plan: `context/changes/cargo-weight-to-ratio/plan.md`

## What & Why

Close roadmap S-03 / FR-004–005: the planner can feed fill-aware cargo weight into Appliance Ratio without regressing the utilization formula or technical report, while manual Te entry remains. This finishes the must-have cargo-fill path’s Primary Success Criterion.

## Starting Point

S-01/S-02 already deliver catalog → fill → Send → `#cargoWeight` → `recompute()` on the legacy calculator. S-03 is not a new handoff button; the remaining gap is formal regression guardrails plus an honest report when Te is edited after Send.

## Desired End State

Fill-aware Send still drives ratio/chart/alerts; golden E6/E8 for defaults are frozen; the report discloses Te vs last-Send mismatch when it happens; medium stays in line labels; manual Te and Reset behavior remain trustworthy.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| -------- | ------ | ---------------- |
| Deliverable shape | Guardrails + thin polish | Send already works; close FR-004/005 with trust fixes, not feature expansion |
| Sync model | Keep Send button | Explicit handoff; matches rigging; avoids fighting manual Te |
| Report after Te edit | Flag mismatch; keep `sentLog` | Honest audit trail without wiping itemization |
| Fill in report | Label-only (S-02) | Enough auditability; Fill column is polish under `speed` |
| Regression depth | Smoke + golden numbers | Guards formula without inventing a test runner |
| Time cut | Drop optional UX chrome first | Protect mismatch flag + golden + E2E over hints |
| Done when | Code + golden + human E2E | Same close style as S-01/S-02; Primary Success demonstrated |

## Scope

**In scope:**
- `golden-utilization.md` (E6=1.730925, E8=0.576975 for defaults)
- Report cargo-section mismatch disclosure
- E2E smoke + `change.md` close-out Notes

**Out of scope:**
- Formula rewrite; live auto-sync; Fill column; main-form sync hints; Astro; catalog wt reconciliation; test runner; required roadmap.md edit

## Architecture / Approach

Legacy-only, report-adjacent change: freeze algebra in a markdown fixture; in `generateTechnicalReport` (payload optional), compare form Te to `sentSumKg/1000` when `sentLog` exists and disclose mismatch in the cargo subtitle. Leave `computeFromInputs` and Send handler alone.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Golden fixture | Frozen E6/E8 artifact + verify | Display rounding mistaken for formula drift |
| 2. Report mismatch flag | Honest Te vs `sentLog` disclosure | Wrong epsilon or accidental formula edit |
| 3. E2E + close-out | Verified Primary Success + Notes | Calling done without mismatch/manual Te smoke |

**Prerequisites:** S-02 archived (fill-aware Send works); legacy calculator openable locally  
**Estimated effort:** ~1 session across 3 phases

## Open Risks & Assumptions

- S-02 wt-suspect residual remains: wet-fill Te is not independently cross-checked against `wt` for every NPS — out of S-03 scope.
- Roadmap.md may still say S-03 `proposed` until a later archive/sync edit (not required by this plan).

## Success Criteria (Summary)

- Send fill-aware cargo Te → utilization updates; formula matches golden defaults after Reset
- Report discloses Te/`sentLog` mismatch when Te is edited after Send
- Manual Te and Reset paths still work; Primary Success Criterion closed
