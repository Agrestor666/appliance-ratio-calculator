# Cargo Catalog Selection — Plan Brief

> Full plan: `context/changes/cargo-catalog-selection/plan.md`

## What & Why

Ship roadmap S-01 / FR-001: a planner can select piping from the catalog into a cargo list, with manual cargo weight still available. This is the north-star validation that the catalog covers a typical load before fill (S-02) and ratio handoff polish (S-03).

## Starting Point

The legacy cargo modal already supports catalog → list → Send to Cargo Weight (`index.html` + `app.js` + `data/piping_catalog.js`). Gaps are pipe NPS coverage vs unused `pipes.json`, and path-critical UX (Escape, Reset vs `sentLog`). Astro has no calculator UI yet.

## Desired End State

On the legacy calculator, the pipe catalog includes user-approved gap-fills; Escape closes the cargo modal; Reset clears cargo list/snapshot state; multi-item catalog selection and manual Te both work. Fill and Astro migration remain later work.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| -------- | ------ | ---------------- |
| Deliverable | Validate + path-critical harden (not Astro rewrite) | Feature exists; north star is coverage + trust, not migration |
| Host | Legacy only (`index.html` / `app.js` / `data/`) | Matches F-01 pattern and AGENTS.md; lowest risk under `speed` |
| Catalog coverage | Curated gap-fill from `pipes.json` after research + sign-off | Answers “katalog za wąski” without unsafe bulk merge |
| Gap process | Agent proposes → human approves → then edit SSOT | Weights disagree across sources; approval gates bad data |
| Harden scope | Escape + Reset clears cargo log/`sentLog` only | Path-critical; leave rigging and S-02 line-model alone |

## Scope

**In scope:**
- Gap proposal artifact + approved NPS additions to `PIPING_CATALOG.pipes`
- Escape closes cargo modal; Reset clears cargo calculator state
- Manual E2E verification + S-02 handoff notes

**Out of scope:**
- Astro port, fill UI/math, wall thickness/ID, log schema redesign
- Overwriting existing weights; loading `pipes.json`; fittings/flanges/valves expansion
- Formula/rigging/auth changes; full UI redesign; new test runner

## Architecture / Approach

Keep `data/piping_catalog.js` as SSOT. Diff against `pipes.json` for missing pipe NPS only; add curated non-zero-wt rows after sign-off. Behavior fixes stay in `app.js` next to existing rigging Escape / Reset handlers. No runtime coupling to `pipes.json` or `src/`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Gap proposal | `gap-candidates.md` for sign-off | Approving unverified large-NPS weights |
| 2. Apply additions | Approved rows in `piping_catalog.js` | Accidental overwrite of existing wt |
| 3. Path-critical harden | Escape + Reset clears cargo state | Regressing rigging keyboard/reset behavior |
| 4. E2E + handoff | Verified S-01 path + Notes for S-02 | Calling S-01 done without typical-load smoke |

**Prerequisites:** Legacy calculator openable locally; human available to sign off Phase 1 list  
**Estimated effort:** ~2 sessions across 4 phases (Phase 1–2 gated on approval)

## Open Risks & Assumptions

- `pipes.json` provenance is weaker than the active catalog — treat it as a candidate source, not truth; skip zero-wt and dubious rows.
- “Typical load” is validated by your sign-off + smoke checklist, not by a formal coverage metric.
- S-02 still blocked on pipe internal volume (wall/ID) even after this catalog work.

## Success Criteria (Summary)

- Approved pipe gaps appear in the cargo Schedule → NPS cascade
- Catalog → multi-item list → Send updates Cargo Weight; manual Te still works
- Escape closes cargo; Reset does not leave stale cargo list/report snapshot
