# Cargo Catalog Selection Implementation Plan

## Overview

Validate roadmap S-01 (FR-001): planners can select piping from the catalog into a cargo list, with manual Te entry preserved. The catalog→list→Send path already exists on the legacy calculator; this change gap-fills pipe NPS coverage via a curated, user-approved pass and applies path-critical modal/reset hardening — without Astro migration, fill UI, or line-model prep for S-02.

## Current State Analysis

- Legacy cargo modal (`index.html` ~249–325) + `app.js` cargo module (~1590–2112) already supports Category → cascade selects → Add to list → Send to Cargo Weight (Te). Manual path is typing `#cargoWeight` on the main form.
- Active catalog: `data/piping_catalog.js` → `window.PIPING_CATALOG` (pipes / fittings / flanges / valves). Pipe rows: `{ nps, od, wt }` (od mm, wt kg/m). Loaded from `index.html`.
- Unused alternate: `data/pipes.json` (~379 pipe rows, same OD+wt idea, different keys/NPS spelling). No fittings/flanges/valves. ~201 overlapping rows disagree on weight vs the JS catalog — unsafe as a bulk merge or overwrite source. ~32 NPS rows exist in JSON but not in the active catalog (gap candidates); some JSON gap rows have `wt_per_m_kg: 0`.
- Neither source has wall thickness / ID — S-02 fill volume is a separate enrichment.
- Astro `src/` has no calculator UI. F-01 fill-media catalog is data-only and unwired (correct for S-01).
- Path-critical quirks: Escape closes rigging modal, not cargo (`app.js` ~1442–1444 vs cargo wire ~2061–2067). Main Reset restores form defaults but does not clear `cargoState.log` / `sentLog` (~1416–1423), so a technical report can still show a stale cargo breakdown after Reset.
- Blast radius of Send: writes `#cargoWeight` → `recompute()` (ratio/chart/alerts); snapshots `sentLog` for the report. Live log does not drive utilization until Send. Rigging is independent.

## Desired End State

A planner can build a multi-item cargo list from an expanded-enough pipe catalog on the legacy calculator, send the total to Cargo Weight, and still type Te manually. Escape closes the cargo modal; Reset clears cargo list state so report/cargo hints cannot lie after a form reset. A signed-off gap list is applied (or explicitly declined items documented). S-02 can assume catalog selection works and still needs wall/ID + fill wiring.

### Key Discoveries:

- Catalog selection for FR-001 is already implemented — S-01 is validation + coverage + harden, not greenfield UI (`app.js:1905–2104`, `index.html:249–325`).
- Treat `piping_catalog.js` as SSOT; curated add-only from `pipes.json` gaps with non-zero wt (`data/piping_catalog.js:6–10`).
- Escape asymmetry and Reset/`sentLog` stale snapshot are the only in-scope behavior fixes (path-critical).
- AGENTS.md: do not replace the legacy tree unless a plan says so — this plan keeps host = legacy.

## What We're NOT Doing

- Migrating cargo UI (or any calculator) into Astro `src/`
- Pipe fill media UI, density wiring, or fill mass math (S-02 / F-01 wiring)
- Enriching pipe rows with wall thickness / ID for volume
- Restructuring cargo log items beyond current `{ id, label, qty, unitKg, totalKg }`
- Bulk-merging or overwriting existing `PIPING_CATALOG` weights from `pipes.json`
- Loading `pipes.json` at runtime
- Expanding fittings/flanges/valves catalogs (no alternate dump source)
- Changing Appliance Ratio formula, rigging calculator, or auth
- Full UI redesign; Enter-to-add in cargo modal; clearing rigging state on Reset
- Inventing a test runner (repo has none)

## Implementation Approach

1. Produce a written gap proposal by normalizing schedule families and NPS labels between `pipes.json` and `PIPING_CATALOG.pipes`, listing add candidates (non-zero wt) and explicit skips (zero wt, unverified, user-declined).
2. Pause for human sign-off on that artifact before editing the catalog.
3. Apply only approved rows into `data/piping_catalog.js` using catalog field names and NPS spelling (`1-1/4`, not `1+1/4`).
4. Harden cargo Escape (mirror rigging) and clear cargo log + `sentLog` (+ related cargo summary fields as needed) on main Reset.
5. Manually verify a typical multi-item path and manual Te fallback; leave S-02 handoff notes in `change.md`.

## Critical Implementation Details

**Approval gate:** Phase 2 must not edit `piping_catalog.js` until Phase 1’s candidate list is signed off in chat or in the proposal artifact. Implementing without approval risks shipping unverified large-NPS weights.

**Reset scope:** Clear cargo calculator state only (`cargoState.log`, `sentLog`, `sentSumKg`, and any UI that depends on them via `renderCargoLog` / main hint). Do not clear `riggingState` in this change.

**Escape wiring:** Prefer extending the existing global `keydown` listener that already handles rigging Escape (`app.js` ~1442–1444) so cargo closes the same way — avoid a second competing listener unless necessary.

---

## Phase 1: Gap Proposal

### Overview

Diff active pipe catalog vs unused `pipes.json` and write an approval artifact the human can accept, trim, or reject before any catalog edits.

### Changes Required:

#### 1. Gap candidate artifact

**File**: `context/changes/cargo-catalog-selection/gap-candidates.md`

**Intent**: Record schedule-key mapping, NPS normalization rules, proposed additions (`schedule`, `nps`, `od`, `wt`, source note), and skipped rows with reason (zero wt, conflict policy, out of typical-load scope).

**Contract**: Markdown with sections at least: `## Mapping`, `## Proposed additions`, `## Skipped`, `## Sign-off`. Proposed rows must use catalog shape `{ nps, od, wt }` and catalog schedule keys (`Sch 40`, `STD`, etc.). Do not modify `data/piping_catalog.js` in this phase.

### Success Criteria:

#### Automated Verification:

- `gap-candidates.md` exists under the change folder
- Proposed-additions section lists only rows absent from current `PIPING_CATALOG.pipes` for that schedule+NPS (spot-checkable by script or manual grep)
- No edits to `data/piping_catalog.js` in this phase

#### Manual Verification:

- Human reviews proposed list and records sign-off (accept all / accept subset / reject) in `## Sign-off` or chat before Phase 2

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Apply Approved Catalog Additions

### Overview

Add only signed-off pipe NPS rows into the active catalog; leave fittings/flanges/valves and all existing pipe weights untouched.

### Changes Required:

#### 1. Active piping catalog

**File**: `data/piping_catalog.js`

**Intent**: Insert approved pipe entries so the cargo modal’s Schedule → NPS cascade offers the gap-filled sizes for typical loads.

**Contract**: Add-only under `PIPING_CATALOG.pipes[<schedule>]`. Preserve existing objects. Normalize NPS to catalog style. Skip any signed-off rejection and any zero-wt source row. Do not change fittings/flanges/valves. Do not load or reference `pipes.json` from `index.html`.

### Success Criteria:

#### Automated Verification:

- `data/piping_catalog.js` parses as JS (e.g. `node --check data/piping_catalog.js`)
- Every signed-off accepted NPS appears under the correct schedule key in `PIPING_CATALOG.pipes`
- Existing sample rows (spot-check a few pre-change NPS/wt) unchanged

#### Manual Verification:

- Open legacy calculator → Cargo calculator → for at least two newly added pipe NPS, preview weight looks sane and Add to list works
- Pre-existing Sch 40 / common NPS path still works unchanged

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 3: Path-Critical Harden

### Overview

Close the Escape asymmetry for the cargo modal and make main Reset clear cargo list/report snapshot state so the catalog path cannot leave stale cargo evidence after reset.

### Changes Required:

#### 1. Escape closes cargo modal

**File**: `app.js`

**Intent**: Keyboard users can dismiss the cargo modal the same way as rigging.

**Contract**: When `cargoModal` is open and Escape is pressed, call `hideCargoModal()`. Prefer extending the existing `window` `keydown` handler that already handles rigging Escape (~1442–1444).

#### 2. Reset clears cargo calculator state

**File**: `app.js`

**Intent**: After Reset, cargo list and sent snapshot cannot disagree with restored default Te / empty report cargo log.

**Contract**: In the `resetBtn` click handler (~1416–1423), after restoring form defaults, clear `cargoState.log`, `cargoState.sentLog`, `cargoState.sentSumKg` (and refresh cargo UI / main cargo hint if those helpers exist — e.g. `renderCargoLog`). Do not modify `riggingState`.

### Success Criteria:

#### Automated Verification:

- `app.js` contains Escape handling that invokes `hideCargoModal` (or equivalent) when cargo modal is visible
- `resetBtn` handler clears `cargoState.sentLog` (and log) — greppable
- `node --check app.js` passes

#### Manual Verification:

- Open cargo modal → press Escape → modal closes
- Add items → Send to Cargo Weight → Generate report shows cargo log → Reset → cargo Te back to default, report cargo breakdown empty/manual, reopening cargo modal shows empty list
- Rigging Escape and rigging log behavior unchanged

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 4: End-to-End Verification and Handoff

### Overview

Confirm S-01 outcome end-to-end and leave explicit notes for S-02 / roadmap.

### Changes Required:

#### 1. Change notes handoff

**File**: `context/changes/cargo-catalog-selection/change.md`

**Intent**: Record what was added/skipped and what S-02 still needs (wall/ID, fill wiring, F-01 already available).

**Contract**: Update frontmatter `status` when implementation finishes (implement skill owns status transitions during implement); ensure `## Notes` includes: approved gap summary pointer to `gap-candidates.md`, harden behaviors shipped, and S-02 prerequisites (internal volume / wall thickness, wire `FILL_MEDIA_CATALOG`).

### Success Criteria:

#### Automated Verification:

- `change.md` Notes mention S-02 handoff (wall/ID + fill) and point at `gap-candidates.md`

#### Manual Verification:

- Typical-load smoke: multi-item list with pipe + at least one non-pipe category → Send → ratio updates; manual Te edit still works without requiring the modal
- FR-001 escape hatch: clear/ignore catalog path and type Te directly — ratio still computes
- No fill UI appears (out of scope)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Testing Strategy

### Unit Tests:

- None — repository has no test runner; do not invent one for this slice.

### Integration Tests:

- None automated. Use `node --check` on touched JS files and greppable contracts above.

### Manual Testing Steps:

1. Load legacy `index.html` (or existing local static serve path used for the calculator).
2. Cargo calculator: pick pipe schedule/NPS (including a newly added size if any) → set length/qty → Add → add a fitting or flange → Send → confirm `#cargoWeight` and utilization update.
3. Escape closes cargo modal; backdrop/X still work.
4. Send → open report → Reset → confirm defaults and empty cargo snapshot / empty modal list.
5. Type cargo Te manually without opening the modal → ratio updates.
6. Spot-check that a previously existing Sch 40 NPS weight is unchanged after gap-fill.

## Performance Considerations

Catalog size increase is small (~tens of rows). No pagination or lazy-load needed. Avoid any runtime load of `pipes.json`.

## Migration Notes

No data migration. `pipes.json` remains unused. If future work retires it, do that in a separate change — not required here.

## References

- Roadmap S-01: `context/foundation/roadmap.md`
- PRD FR-001 / US-01 / Non-Goals: `context/foundation/prd.md`
- Active catalog: `data/piping_catalog.js`
- Alternate dump: `data/pipes.json`
- Cargo UI/logic: `index.html` (cargo modal), `app.js` (~1590–2112, reset ~1416–1423, Escape ~1442–1444)
- Fill media (out of scope, S-02): `data/fill_media_catalog.js`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Gap Proposal

#### Automated

- [x] 1.1 gap-candidates.md exists under the change folder — 896da08
- [x] 1.2 Proposed additions are absent from current PIPING_CATALOG.pipes for that schedule+NPS — 896da08
- [x] 1.3 No edits to data/piping_catalog.js in this phase — 896da08

#### Manual

- [x] 1.4 Human sign-off recorded on proposed gap list before Phase 2 — 896da08

### Phase 2: Apply Approved Catalog Additions

#### Automated

- [x] 2.1 data/piping_catalog.js parses (node --check)
- [x] 2.2 Every signed-off accepted NPS appears under the correct schedule key
- [x] 2.3 Spot-check: pre-existing sample NPS/wt unchanged

#### Manual

- [x] 2.4 Newly added pipe NPS selectable; preview + Add to list works
- [x] 2.5 Pre-existing common pipe path still works

### Phase 3: Path-Critical Harden

#### Automated

- [ ] 3.1 Escape handling invokes hideCargoModal when cargo modal visible
- [ ] 3.2 resetBtn handler clears cargoState.sentLog and log
- [ ] 3.3 node --check app.js passes

#### Manual

- [ ] 3.4 Escape closes cargo modal
- [ ] 3.5 Reset clears cargo Te path evidence (list, sentLog/report cargo breakdown)
- [ ] 3.6 Rigging Escape and rigging log behavior unchanged

### Phase 4: End-to-End Verification and Handoff

#### Automated

- [ ] 4.1 change.md Notes include S-02 handoff and gap-candidates pointer

#### Manual

- [ ] 4.2 Typical multi-item catalog → Send → ratio updates; manual Te still works
- [ ] 4.3 Manual-only Te path works without modal
- [ ] 4.4 No fill UI introduced
