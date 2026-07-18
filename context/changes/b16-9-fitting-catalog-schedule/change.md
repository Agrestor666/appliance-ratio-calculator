---
change_id: b16-9-fitting-catalog-schedule
title: B16 9 fitting catalog schedule
status: implemented
created: 2026-07-18
updated: 2026-07-18
archived_at: null
---

## Notes

### Shipped (S-04)

- **Mass source policy:** ASME B16.9-2024 is product-family / dimensions only (no kg tables). Cargo `wt` (kg/pc) comes from manufacturer/industry charts cited in `fitting-weight-candidates.md` (primary: Wermac / Hackney Ladish), accepted via Phase 1 Sign-off (Accept all A+B, 2026-07-18). Do not claim masses are “from B16.9.pdf”.
- **Nested shape:** `PIPING_CATALOG.fittings[type][schedule] = [{ nps, wt }]` — same nesting idea as flanges (`type → class → rows`). Schedule keys ⊆ the 18 pipe schedule strings. Runtime (`app.js`) lists Schedule/NPS from keys present in the catalog; `calcUnitKg` returns row `wt` (no B36 multiplier). `FITTING_SCH_FACTORS` removed.
- **Types with numeric rows (12):** `90° LR Elbow`, `90° SR Elbow`, `45° LR Elbow`, `180° LR Return`, `180° SR Return`, `90° 3D Elbow`, `45° 3D Elbow`, `Equal Tee`, `Cap`, `Concentric Reducer`, `Eccentric Reducer`, `Lap Joint Stub End (Long)`.
- **Schedules with rows:** `Sch 40S`, `Sch 40`, `Sch 80S`, `Sch 80`, `Sch 160`, `STD`, `XS`, `XXS` (coverage varies by type). Chart-missing schedules (`Sch 5S`…`Sch 30`, `Sch 60`, `Sch 100`…`Sch 140`) are omitted from dropdowns — no silent factor fill-in.
- **Approval artifact:** `fitting-weight-candidates.md` (Sources, Type inventory, Proposed A+B, Skipped, Sign-off). Apply/verify helpers: `_apply_p2.cjs`, `_verify_p2.cjs`, `_verify_p3.cjs`.

### Deferred / leftovers

- **Types locked in inventory but no numeric rows this round:** `LR Reducing Elbow`, `Reducing Tee`, `Equal Cross`, `Reducing Cross`, `Lap Joint Stub End (Short)` — omit until a later Sign-off round.
- **Out of B16.9 / out of scope:** laterals; 45° SR as separate type; fill mass on fittings; B16.9 dimensional tables in SSOT.
- **Research:** `research.md`. Plan: `plan.md`.

### Handoff

- **S-05 (B16.5 flanges):** independent catalog stream; flanges already nested by class — no fitting-factor leftovers to clean up.
- **S-03 (ratio handoff):** cargo Send path unchanged; mixed pipe+fitting lists still write Te.
- **Future chart rounds:** extend via candidates → Sign-off → apply pattern (same as S-01/S-02); do not reintroduce schedule factors.

### Commit trail

- Phase 1 `cf65266` — candidates + Sign-off
- Phase 2 `1e77370` — nested catalog data
- Phase 3 `6e7434b` — runtime drop factors
