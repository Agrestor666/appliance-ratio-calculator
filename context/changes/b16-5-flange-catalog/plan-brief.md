# B16.5 Flange Catalog — Plan Brief

> Full plan: `context/changes/b16-5-flange-catalog/plan.md`

## What & Why

Align core flange cargo weights (Weld Neck, Slip-On, Blind) to manufacturer/industry charts under the ASME B16.5 product family, and add **schedule selection for Weld Neck only** so bore can match the pipe path. Do not claim kg/pc come from the B16.5 PDF.

## Starting Point

Flanges already nest `type → class → [{ nps, wt }]` with six types and classes 150–2500; UI is Type → Class → NPS with no schedule. S-04 established the candidates/charts playbook for fittings; flanges have no factor table to remove.

## Desired End State

Planner picks Flange → type → Class → (WN only) Schedule → NPS and gets chart-aligned kg/pc. SO/Blind stay three-level. Socket Weld / Threaded / Lap Joint remain available but unverified. Missing cells are omitted from dropdowns.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| -------- | ------ | ---------------- |
| Mass source | Manufacturer/industry charts | B16.5 is product family/dims; mirror S-04 honesty |
| Schedule UX | Weld Neck only | Real bore/schedule gap without bloating SO/Blind |
| Type scope v1 | WN + Slip-On + Blind | Core cargo set; defer SW/Threaded/LJ |
| Coverage | Current matrix only | Contained verify/replace; no Class 400 / new NPS |
| Deferred types | Leave in UI unchanged | No surprise removal |
| WN data shape | `type → class → schedule → rows` | Minimal blast radius vs flattening class keys |
| Missing cells | Omit (no invent) | Honest coverage |
| Approval gate | Auto-apply non-conflicts; Sign-off Conflicts only | Faster than full-matrix Sign-off; 5% / multi-source / facing rules |

## Scope

**In scope:** Candidates + Conflict Sign-off; rewrite core-3 weights; WN schedule nest; WN Schedule UI; smoke + handoff.

**Out of scope:** Deferred-type verification; coverage expansion; B16.5 dimension storage; flange fill; S-03/S-04 redo; Astro; inventing wt; test runner.

## Architecture / Approach

Propose chart weights → classify Auto-apply vs Conflict → after Conflict Sign-off (or empty Conflicts), rewrite core-3 in `piping_catalog.js` (WN nested) → add Schedule select + helper branching for WN-only four-level cascade → leave deferred types untouched.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Weight candidates + conflicts | Reviewable `flange-weight-candidates.md` | Chart coverage / Conflict volume |
| 2. Apply catalog data | Core-3 SSOT + WN nest | Editing Conflict rows before Sign-off |
| 3. Runtime WN schedule cascade | Schedule UI + helpers | Breaking SO/Blind if shape detection wrong |
| 4. Smoke + handoff | Verified path + Notes | Deferred types mistaken for “done” |

**Prerequisites:** S-01 done; `data/ASME B16.5.pdf` for family context; access to agreed weight charts for Phase 1.
**Estimated effort:** Phase 1 is the bulk (candidates + any Conflicts); Phases 2–3 one focused session; Phase 4 short smoke.

## Open Risks & Assumptions

- Chart licensing / which manufacturer tables the human accepts
- WN schedule coverage may be sparse vs today’s dense class×NPS tables
- Default facing assumption (RF CS) may not match every site’s flanges
- Auto-apply at 5% threshold could still land a wrong chart edition if sources are weak

## Success Criteria (Summary)

- WN cargo path includes Schedule and uses nested catalog `wt`
- Slip-On / Blind weights are chart-aligned within the current matrix; no Schedule step
- Deferred flange types still work; missing cells never invent mass
