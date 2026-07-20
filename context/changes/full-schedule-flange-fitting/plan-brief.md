# Full Schedule Flange + Fitting — Plan Brief

> Full plan: `context/changes/full-schedule-flange-fitting/plan.md`

## What & Why

Expand Weld Neck flanges and in-catalog BW fittings across the **18 pipe schedule keys** so typical cargo can match pipe↔fitting↔flange. Charts alone cannot fill WN schedules (`flanges/*.csv` has one `wn kg` per class×NPS). This re-plan keeps fitting masses chart-only and **calculates missing WN schedule masses** from bore Δm.

## Starting Point

Nested catalog from S-04/S-05; WN only Sch 40S/40/STD (chart); fittings sparse. Astro cascade is data-driven. Dual SSOT: `src/lib/data/piping-catalog.js` + `legacy/data/piping_catalog.js`. Prior omit-only candidates draft is discarded.

## Desired End State

Fitting dropdowns grow where charts allow; WN dropdowns grow with calculated masses for missing schedules (inputs permitting). UI shows plain kg (no “calculated” badge). SO/Blind unchanged. src ↔ legacy parity. Honest Skip list for gaps.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| -------- | ------ | ---------------- | ------ |
| What to calculate | WN missing schedules only; keep chart STD/40/40S | Preserve S-05 Sign-off; fill chart-blind schedules | Plan |
| Δm baseline | Catalog `STD` mass | Continuity with Wermac/Texas rows already in SSOT | Plan |
| Geometry model | Cylinder: `ΔV=π/4·L·(ID_STD²−ID_sch²)`, `L=wn thk` | Simple, auditable; uses CSV + pipe OD/t | Plan |
| Density | 7850 kg/m³ | Standard CS planning density | Plan |
| Thin schedules | Calculate when pipe has `od`+`t`; floor `wt≥0.01` | Prefer lighter thin-wall over clamp-to-STD | Plan |
| Missing `t` / `wn thk` | Skip cell | No invent / no interpolate | Plan |
| Class 400 | Out of scope | Not in current catalog classes | Plan |
| Fittings | Chart-only (omit) | Unchanged S-04 honesty | Plan |
| UI labeling | Candidates note only | Avoid cargo-sheet noise | Plan |
| Candidates draft | Regenerate from scratch | Old file assumed omit-only WN | Plan |
| Approval | Full Sign-off before apply | Liability on chart + calc masses | Plan |

## Scope

**In scope:** Fresh candidates (chart fittings + calc WN); Sign-off; dual-catalog apply; verify (incl. formula spot-check) + Astro smoke.

**Out of scope:** Fitting calc; rewrite STD/40/40S; SO/Blind schedule; Class 400; deferred flange types; UI “approx” badge; S-06 UX; test runner.

## Architecture / Approach

Document WN calc contract → regenerate candidates from pipes + `flanges/*.csv` + catalog STD → human Sign-off → insert Accepted rows into existing nests in `src` → sync `legacy` → verify keys ⊆ 18, parity, and one recomputed Δm.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Calc spec + fresh candidates | New `schedule-weight-candidates.md` with formula + rows | Formula units / rounding drift |
| 2. Sign-off gate | Accept/Skip locked (incl. calc liability) | Apply without Sign-off |
| 3. Apply dual catalog | src + legacy SSOT updated | Sync drift or wiping chart rows |
| 4. Verify + smoke | Scripts + Astro cargo path | Large WN nest growth; sparse fittings remain |

**Prerequisites:** S-04/S-05 done; `flanges/*.csv` present; pipe `od`/`t` for schedules to calculate.
**Estimated effort:** ~2–3 sessions (Phase 1 tooling + Sign-off dominate; apply/verify one focused session).

## Open Risks & Assumptions

- Cylindrical `wn thk` model is an approximation of real hub/bore metal — systematic bias vs manufacturer schedule-specific masses if they exist elsewhere
- Many fitting thin schedules may still Skip (chart empty)
- Catalog file size grows substantially with calculated WN schedules

## Success Criteria (Summary)

- New Accepted fitting (chart) and WN (calculated) schedules appear in Astro cargo with correct kg/pc
- Skipped schedules never invent mass or appear in dropdowns
- src ↔ legacy fittings + WN schedule data stay in parity; formula spot-check passes
