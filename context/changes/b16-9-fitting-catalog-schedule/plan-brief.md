# B16.9 Fitting Catalog + Schedule — Plan Brief

> Full plan: `context/changes/b16-9-fitting-catalog-schedule/plan.md`
> Research: `context/changes/b16-9-fitting-catalog-schedule/research.md`

## What & Why

Replace Sch 40 × B36 `FITTING_SCH_FACTORS` with nested schedule×NPS fitting weights from signed-off manufacturer/industry charts, and expand types to the full ASME B16.9 set (no laterals). B16.9 defines dimensions, not kg/pc — cargo fidelity needs chart masses plus schedule-native SSOT.

## Starting Point

Seven flat BW types with Sch 40 `wt`; UI schedule only multiplies via B36 wall ratios. Flanges already nest `type → class → rows`. Research confirmed B16.9-2024 has zero mass tables.

## Desired End State

Planner picks Butt-Weld Fitting → B16.9 type → Schedule (keys present in catalog) → NPS/`large×small` → kg/pc from nested `wt`. No factor preview. Missing cells omitted from dropdowns.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| -------- | ------ | ---------------- | ------ |
| Mass source | Manufacturer/industry charts + Sign-off | B16.9 has no kg tables | Plan (1A) |
| Type scope v1 | Full B16.9 types except laterals | Maximize catalog fidelity for Stream C | Plan (2C) |
| Data shape | Nested `type → schedule → [{nps,wt}]` | Match flanges; kill factors | Plan (3A) / Research |
| Schedule keys | Mirror 18 pipe catalog keys | Consistent UX with Pipe | Plan (4A) |
| Reducers | Per-pair `wt` per schedule | Fixes `_default` factor bug | Plan (5A) |
| Dimensions | Weights only; NPS ≤48 where charts exist | Cargo needs mass, not B16.9 dims | Plan (6A) / Research |
| Missing cells | Omit (no B36 fallback) | Honest coverage vs fake precision | Plan |

## Scope

**In scope:** Candidates artifact + Sign-off; nested fittings data; remove `FITTING_SCH_FACTORS`; full type inventory listed in plan Phase 1; smoke + handoff notes.

**Out of scope:** B16.9 dimension storage; laterals; fitting fill mass; flanges/S-05; Astro; inventing wt; test runner.

## Architecture / Approach

Propose chart weights → human Sign-off → reshape `PIPING_CATALOG.fittings` like flanges → point `getClassList` / `getNpsList` / `calcUnitKg` / preview at nested rows and delete the factor table. Ship catalog + runtime together.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Weight candidates + type inventory | Reviewable `fitting-weight-candidates.md` | Chart coverage / Sign-off volume |
| 2. Apply nested catalog | Signed-off nested SSOT | Editing before Sign-off |
| 3. Drop FITTING_SCH_FACTORS | Flange-like runtime | Broken UI if split from Phase 2 |
| 4. Smoke + handoff | Verified path + Notes | Incomplete type coverage deferred |

**Prerequisites:** S-01 done; `data/ASME B16.9.pdf` for type inventory only; access to agreed weight charts for Phase 1.
**Estimated effort:** Large data Phase 1 (multi-round Sign-off likely); Phases 2–3 one focused session; Phase 4 short smoke.

## Open Risks & Assumptions

- Chart licensing / which manufacturer tables the human accepts
- Full types × 18 schedules may leave many Skipped cells — UI will show sparse schedules per type
- File size growth of `piping_catalog.js`

## Success Criteria (Summary)

- Fitting kg/pc comes from nested catalog `wt` for the selected schedule
- Type list covers the locked B16.9 set (minus laterals) for signed-off rows
- No `FITTING_SCH_FACTORS` left in the runtime path
