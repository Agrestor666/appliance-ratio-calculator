---
change_id: full-schedule-flange-fitting
title: Full schedule flange fitting
status: archived
created: 2026-07-19
updated: 2026-07-20

archived_at: 2026-07-20T20:52:13Z
---

## Notes

Re-planned 2026-07-19: WN missing schedules are **calculated** (ρ=7850, L=`wn thk` from `flanges/*.csv`, base = catalog STD); fittings remain chart-only. Prior omit-only Phase 1 candidates draft is discarded — regenerate under new plan. See `plan-brief.md` / `plan.md`.

### Coverage summary (Sign-off Accept all)

| Bucket | Count |
| --- | ---: |
| A. new fitting chart cells | 118 |
| B. fitting alias extensions | 108 |
| C. WN calculated (missing schedules) | 1280 |
| Skipped schedule×type/class combos | 135 |
| WN per-NPS Skip cells (input gaps) | 355 |

Applied to `src/lib/data/piping-catalog.js` + `legacy/data/piping_catalog.js`. Chart `STD` / `Sch 40` / `Sch 40S` WN rows kept; Slip-On / Blind unchanged (no schedule nest). Verify: `_verify_p4.cjs`.

Helpers beyond plan naming: `plan-brief.md`, `_verify_p3.cjs` (benign process extras; no product-scope expansion).
