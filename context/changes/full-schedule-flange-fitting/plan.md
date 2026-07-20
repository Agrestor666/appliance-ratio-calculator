# Full Schedule Flange + Fitting Implementation Plan

## Overview

Ship roadmap S-07 (US-01, FR-001): expand Weld Neck flanges and all in-catalog butt-weld fittings so planners can select from the same **18 pipe schedule keys** wherever a signed-off mass exists. **Fittings** stay manufacturer-chart only (omit when no cell). **Weld Neck** keeps chart masses for existing `STD` / `Sch 40` / `Sch 40S` and **calculates** missing schedule×NPS masses via a bore-metal Δm model (`ρ=7850`, `L=wn thk` from `flanges/*.csv`, base = catalog `STD`). Product SSOT is `src/lib/data/piping-catalog.js` with 1:1 sync to `legacy/data/piping_catalog.js`. Success is **max coverage under this dual policy + honest Skip list**, not a hard every-type×18 gate.

## Current State Analysis

- **Pipe vocabulary (18 keys):** `Sch 5S`, `Sch 5`, `Sch 10S`, `Sch 10`, `Sch 20`, `Sch 30`, `Sch 40S`, `Sch 40`, `Sch 60`, `Sch 80S`, `Sch 80`, `Sch 100`, `Sch 120`, `Sch 140`, `Sch 160`, `STD`, `XS`, `XXS` — `pipes:` block in `src/lib/data/piping-catalog.js`. Items carry `od` (mm) and optional `t` (wall mm).
- **Fittings:** nested `fittings[type][schedule] → [{ nps, wt }]`. Coverage sparse (typically 4–8 schedules/type). Thin/mid schedules largely absent. Chart-only policy unchanged from S-04.
- **Weld Neck flanges:** `flanges["Weld Neck"][class][schedule] → [{ nps, wt }]` for classes **150–2500** (no Class 400). Today only **Sch 40S / Sch 40 / STD** per class (chart). Slip-On / Blind remain class-only.
- **Geometry for calc:** `flanges/FLG{150,300,600,900,1500,2500}.csv` expose per-NPS `wn kg` and `wn thk` (mm) but **no schedule axis** — one mass/geometry per class×NPS. Catalog `STD` (not CSV `wn kg`) is the Δm baseline.
- **Runtime:** Astro `src/lib/cargo.ts` + Cargo sheet already populate fitting Schedule from `getClassList` and WN Flange schedule from `getScheduleList`. Adding catalog keys grows dropdowns — no cascade redesign expected.
- **Dual catalog:** `src` and `legacy` piping catalogs must stay in sync after apply.
- **Re-plan note:** Prior Phase 1 draft under omit-only WN policy is **discarded**. Fresh `schedule-weight-candidates.md` required under this plan.

## Desired End State

A planner selecting **Butt-Weld Fitting** or **Flange → Weld Neck** can choose every schedule key with a signed-off mass for that type (fitting) or class (WN), using the 18 pipe strings. Fitting masses are chart-sourced; WN non-baseline schedules are calculated (documented in candidates) but shown in UI as plain kg like today. Dropdowns show only present keys. SO/Blind/deferred flanges unchanged. Catalog headers cite this change’s candidates artifact. `src` and `legacy` match. Skipped combinations are listed with reasons.

### Key Discoveries:

- UI cascade already data-driven (`src/lib/cargo.ts` `getClassList` / `getScheduleList` / `isFlangeScheduleNest`) — this change is primarily **data + Sign-off + WN calc tooling**, not shell work.
- CSV `wn thk` + pipe `od`/`t` are sufficient for the locked cylindrical Δm model; charts alone cannot fill the 18-key WN nest.
- Archived S-04/S-05 forbade inventing WN schedule masses; this plan **explicitly overrides that for WN only**, with Sign-off liability on the calc model.
- Dual-file sync remains load-bearing — apply must touch both catalogs in one session.

## What We're NOT Doing

- Calculating fitting masses (fittings remain chart-only omit)
- Rewriting existing WN chart rows (`STD` / `Sch 40` / `Sch 40S`)
- Adding schedule nest to Slip-On / Blind
- Verifying or rewriting deferred flange types (Socket Weld / Threaded / Lap Joint)
- Adding Class 400 (even though `flanges/FLG400.csv` exists)
- Expanding Class / NPS matrix beyond current catalog rows
- Adding new fitting types
- Claiming calculated kg/pc come from ASME B16.5 / B16.9 PDFs
- UI label for “calculated” vs chart (candidates-only source notes)
- Fill mass on fittings/flanges; Appliance Ratio formula changes; Astro UX redesign (S-06)
- New test runner / CI catalog suite
- Auth, DB, or schema migrations

## Implementation Approach

1. Document the WN calc contract; discard old candidates draft; regenerate `schedule-weight-candidates.md` with fitting chart proposals + WN calculated proposals + Skip lists.
2. Human full Sign-off (Accept / Skip batches) — no catalog edits until recorded.
3. Apply Accepted rows into `src` catalog nests; sync `legacy` 1:1; update header comments to cite this change’s candidates file (and note WN calc for non-baseline schedules).
4. Verify with change-folder scripts (keys ⊆ 18, parity src↔legacy, spot-check chart + calc `wt`) + Astro cargo smoke + `npm run lint` as applicable.

## Critical Implementation Details

**Approval gate:** Phase 3 must not edit either catalog until Phase 2 Sign-off is recorded in `## Sign-off` (or chat mirrored into that section).

**WN mass formula (locked):** For each class × NPS that already has catalog `STD` mass, and for each missing schedule `sch` among the 18 keys (excluding schedules that already have chart rows):

- Require pipe rows with numeric `od` and `t` for both `STD` and `sch` at that NPS; else Skip.
- Require numeric `wn thk` (mm) from the matching class CSV (`flanges/FLG{class}.csv`) for that NPS; else Skip.
- `ID = OD − 2t` (mm). Convert lengths to metres for volume.
- `ΔV = (π/4) · L · (ID_STD² − ID_sch²)` with `L = wn thk`.
- `Δm = ρ · ΔV` with `ρ = 7850 kg/m³`.
- `wt = max(wt_STD + Δm, 0.01)` then round to match catalog presentation (1 decimal kg, same style as existing WN rows).
- Source note in candidates: `calculated (ρ=7850, L=wn thk)`.

**No silent fallback:** After apply, schedules without arrays must not appear. Do not reintroduce B36 multipliers for fittings. Do not invent `t` or `wn thk`.

**Done ≠ full matrix:** Success is process completion + every Acceptable cell Accepted and applied, plus an honest Skip list.

**Dual SSOT:** Edit `src/lib/data/piping-catalog.js` first; sync fittings + WN schedule data to `legacy/data/piping_catalog.js` in the same apply session. Preserve each file’s wrapper (`export const` vs `window.PIPING_CATALOG`).

**Discard stale draft:** Delete or overwrite `schedule-weight-candidates.md` from the omit-only Phase 1 attempt; regenerate under this contract. Update `_gen_candidates.cjs` (or replace) so WN proposed rows come from the formula, not chart-omit-only logic.

---

## Phase 1: Calc Spec + Fresh Candidates

### Overview

Lock the calc contract in the candidates artifact, discard the old omit-only draft, and produce a reviewable list of fitting chart proposals + WN calculated proposals + Skips — without editing live catalogs.

### Changes Required:

#### 1. Candidates artifact (regenerated)

**File**: `context/changes/full-schedule-flange-fitting/schedule-weight-candidates.md`

**Intent**: Give the human a Sign-off surface for every new schedule×NPS (fitting chart) or schedule×class×NPS (WN calculated), plus Skip reasons, so SSOT edits are never speculative.

**Contract**: Markdown sections at least:
- `## Sources` — fittings: Wermac/Hackney Ladish (chart); WN baseline: catalog STD from S-05 (Wermac/Texas); WN non-baseline: calculated per formula below; cite `flanges/*.csv` for `wn thk`; units kg; material assumption CS / RF A105 as prior
- `## Schedule keys` — the 18 pipe keys
- `## WN calc contract` — formula, ρ, L source, base mass, floor ε=0.01, rounding, Skip rules (missing `t`, missing `wn thk`, no STD baseline)
- `## Gap inventory` — per fitting type and per WN class: present vs missing of 18
- `## Proposed rows` — `kind` (fitting|wn), `type`/`class`, `schedule`, `nps`, `wt`, source note (`chart …` or `calculated (ρ=7850, L=wn thk)`)
- `## Skipped` — chart-missing (fittings) / missing pipe `t` / missing `wn thk` / no STD baseline / out-of-scope Class 400, with reason
- `## Alias notes` — carry forward S-04/S-05 STD↔Sch 40 style notes; no new invent for fittings
- `## Conflict / mass policy` — fittings: omit, no invent; WN: chart keep STD/40/40S; calculate other missing schedules when inputs exist
- `## Sign-off` — empty stub for Phase 2

Optional tooling (`_gen_candidates.cjs`) must implement the WN formula against catalog pipes + `flanges/*.csv` + existing WN STD rows. Output must land in the markdown artifact.

Do **not** modify `src/lib/data/piping-catalog.js`, `legacy/data/piping_catalog.js`, `src/lib/cargo.ts`, or UI components in this phase.

### Success Criteria:

#### Automated Verification:

- `schedule-weight-candidates.md` exists and contains `## WN calc contract`
- Proposed schedule strings are only from the 18 pipe keys
- No edits to `src/lib/data/piping-catalog.js` or `legacy/data/piping_catalog.js` in this phase
- Spot-check script (or `_verify_p1.cjs` update): at least one Proposed WN row carries source note containing `calculated`

#### Manual Verification:

- Gap inventory matches current catalog reality (human spot-check 2 fitting types + 1 WN class)
- One hand-check of WN Δm for a known class×NPS×schedule (recompute from OD/t/`wn thk`) matches the Proposed `wt` within rounding
- Source / calc citations acceptable for cargo planning use

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before Phase 2.

---

## Phase 2: Sign-off Gate

### Overview

Human Accepts / Skips proposed rows (full Sign-off). No catalog apply until Sign-off is recorded. Liability covers both chart fitting masses and calculated WN masses.

### Changes Required:

#### 1. Record Sign-off

**File**: `context/changes/full-schedule-flange-fitting/schedule-weight-candidates.md` (`## Sign-off`)

**Intent**: Lock which proposed rows may enter SSOT and which remain Skipped for this change.

**Contract**: Sign-off entry includes date, decision (accept all / accept subset / reject), and if subset — which batches/rows (e.g. fittings A/B, WN by class). Chat confirmation is acceptable if mirrored into `## Sign-off` before Phase 3.

No runtime or catalog file edits in this phase.

### Success Criteria:

#### Automated Verification:

- `## Sign-off` section is non-empty with a clear Accept/Skip outcome
- Still no catalog file edits in this phase

#### Manual Verification:

- Human confirms they reviewed Proposed vs Skipped (including calculated WN batches) and accept liability for cargo planning
- Any Conflict/ambiguous cells resolved before Phase 3

**Implementation Note**: Pause for human Sign-off before Phase 3. Do not start apply on a partial verbal “looks fine” without a recorded Sign-off block.

---

## Phase 3: Apply Dual Catalog

### Overview

Insert only Accepted rows into the nested fittings and WN flange structures in `src`, then sync `legacy` 1:1 for those data sections. Update catalog header comments to cite this change’s candidates artifact and the WN calc policy for non-baseline schedules.

### Changes Required:

#### 1. Product catalog apply

**File**: `src/lib/data/piping-catalog.js`

**Intent**: Add signed-off schedule nests/rows so Astro cargo dropdowns expose new schedules with chart or calculated `wt`.

**Contract**:
- Preserve nest shapes: `fittings[type][schedule] = [{ nps, wt }]`; `flanges["Weld Neck"][class][schedule] = [{ nps, wt }]`
- Only Accepted rows from Phase 2; do not invent beyond Sign-off
- Do not alter existing STD/40/40S chart values unless Sign-off explicitly says so (default: leave untouched)
- Do not alter Slip-On / Blind / deferred flange shapes
- Update fittings/flanges header comments to cite `context/changes/full-schedule-flange-fitting/schedule-weight-candidates.md` (keep prior S-04/S-05 citations; note WN non-baseline masses may be calculated)

#### 2. Legacy catalog sync

**File**: `legacy/data/piping_catalog.js`

**Intent**: Keep reference/rollback catalog identical in data content for fittings + WN schedules.

**Contract**: After src apply, sync the same fittings and WN schedule data into the legacy file preserving `window.PIPING_CATALOG` wrapper. Spot-check: schedule key sets for a sample fitting type and WN class 150 match src.

#### 3. Optional apply helper

**File**: `context/changes/full-schedule-flange-fitting/_apply_p3.cjs` (optional)

**Intent**: Deterministic apply from Accepted tables to reduce hand-edit errors.

**Contract**: If used, must only write Accepted rows; must not touch SO/Blind/deferred; must not overwrite chart STD/40/40S unless Accepted says so; must be re-runnable or clearly one-shot documented in Notes.

### Success Criteria:

#### Automated Verification:

- `node --check` (or equivalent parse) on both catalog JS files
- Change-folder verify script confirms: new schedule keys ⊆ 18 pipe keys
- Spot-check: at least one Accepted fitting row and one Accepted calculated WN row present with expected `wt`
- `src` vs `legacy` parity check for fittings + WN schedule key sets

#### Manual Verification:

- Catalog headers mention this change’s candidates path and WN calc note
- Existing Sch 40/80/STD chart rows not wiped

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before Phase 4 smoke.

---

## Phase 4: Verify + Smoke

### Overview

Prove dual-catalog integrity, that calculated WN spot-checks still match the formula, and that Astro cargo UI exposes new schedules end-to-end without inventing missing ones. No new test runner.

### Changes Required:

#### 1. Verify scripts

**File**: `context/changes/full-schedule-flange-fitting/_verify_p4.cjs` (and/or updated `_verify_p1.cjs` reuse)

**Intent**: Automate key invariants so sync drift, illegal schedule strings, and calc regressions are caught before handoff.

**Contract**: Script(s) check at least: (1) all fitting/WN schedule keys ⊆ pipe keys; (2) src↔legacy parity for fittings + WN; (3) spot-check Accepted sample chart + calculated `wt`; (4) recompute one WN sample via the locked formula and compare to catalog within rounding; exit non-zero on failure.

#### 2. Runtime smoke (no code change expected)

**Files**: exercise via running app — `src/lib/cargo.ts`, Cargo sheet (read-only unless a real bug appears)

**Intent**: Confirm data-driven dropdowns pick up new keys; omit still works for Skipped schedules; no UI “calculated” badge required.

**Contract**: If smoke reveals a cascade bug, fix minimally in `cargo.ts` / Cargo sheet — do not expand scope to redesign. Prefer documenting if bug is pre-existing and unrelated.

### Success Criteria:

#### Automated Verification:

- `_verify_p4.cjs` (or equivalent) exits 0
- `npm run lint` passes on any touched `src` TS/JS/Astro files (if none touched beyond data JS, `node --check` on catalogs remains the automated bar)

#### Manual Verification:

- Astro cargo: Fitting → type with new schedule → NPS → unit kg matches Accepted `wt`
- Astro cargo: Flange → Weld Neck → Class → new Schedule (calculated) → NPS → kg matches Accepted
- A Skipped schedule does **not** appear for a type/class that has no array
- Slip-On / Blind path still has no Flange schedule control
- Legacy catalog file still loads if opened as reference (optional spot-check)

**Implementation Note**: After Phase 4, update `change.md` Notes with coverage summary (new chart fitting rows vs calculated WN rows vs Skip) for roadmap/handoff. Archive via `/10x-archive` when done.

---

## Testing Strategy

### Unit Tests:

- None via a new runner (repo has none). Use change-folder `_verify_*.cjs` as the automated substitute, including one formula recomputation check.

### Integration Tests:

- None. Smoke Astro cargo path manually.

### Manual Testing Steps:

1. Start `npm run dev`; open cargo sheet.
2. Add fitting (e.g. 90° LR Elbow) — confirm new Accepted schedules appear; pick NPS; note kg.
3. Add WN flange Class 150 — confirm Flange schedule list includes calculated schedules when Accepted; pick NPS; note kg matches candidates.
4. Confirm SO flange still has no schedule dropdown.
5. Spot-check one Skipped schedule is absent.

## Performance Considerations

Catalog JS will grow with many new WN schedule blocks (calc fills far more than charts alone). Keep row format compact (existing style). No runtime caching changes — catalogs load as static modules.

## Migration Notes

No user-data migration. Existing sessions referencing only old schedules remain valid. New schedules appear as additional dropdown options only. Policy change vs archived S-05: WN non-baseline masses may be calculated; document in candidates + catalog header, not in UI.

## References

- Roadmap S-07: `context/foundation/roadmap.md`
- Prior fittings: `context/archive/2026-07-18-b16-9-fitting-catalog-schedule/`
- Prior flanges: `context/archive/2026-07-18-b16-5-flange-catalog/`
- Flange geometry CSVs: `flanges/FLG*.csv` (`wn thk`, `wn kg`)
- Runtime cascade: `src/lib/cargo.ts`
- Product catalog: `src/lib/data/piping-catalog.js`
- Legacy catalog: `legacy/data/piping_catalog.js`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Calc Spec + Fresh Candidates

#### Automated

- [x] 1.1 `schedule-weight-candidates.md` exists with `## WN calc contract` — 8d0baca
- [x] 1.2 Proposed schedule strings are only from the 18 pipe keys — 8d0baca
- [x] 1.3 No edits to `src/lib/data/piping-catalog.js` or `legacy/data/piping_catalog.js` in this phase — 8d0baca
- [x] 1.4 At least one Proposed WN row has source note containing `calculated` — 8d0baca

#### Manual

- [x] 1.5 Gap inventory matches current catalog reality (spot-check) — 8d0baca
- [x] 1.6 Hand-check one WN Δm vs Proposed `wt` within rounding — 8d0baca
- [x] 1.7 Source / calc citations acceptable for cargo planning use — 8d0baca

### Phase 2: Sign-off Gate

#### Automated

- [x] 2.1 `## Sign-off` section non-empty with Accept/Skip outcome — f9d5a46
- [x] 2.2 No catalog file edits in this phase — f9d5a46

#### Manual

- [x] 2.3 Human reviewed Proposed vs Skipped (incl. calculated WN); Sign-off recorded — f9d5a46
- [x] 2.4 Ambiguous/Conflict cells resolved before Phase 3 — f9d5a46

### Phase 3: Apply Dual Catalog

#### Automated

- [x] 3.1 Both catalog JS files parse (`node --check` or equivalent) — 68d06ef
- [x] 3.2 New schedule keys ⊆ 18 pipe keys — 68d06ef
- [x] 3.3 Spot-check Accepted fitting + calculated WN `wt` present — 68d06ef
- [x] 3.4 src↔legacy parity for fittings + WN schedule key sets — 68d06ef

#### Manual

- [x] 3.5 Catalog headers cite this change’s candidates path + WN calc note — 68d06ef
- [x] 3.6 Existing Sch 40/80/STD chart rows not wiped — 68d06ef

### Phase 4: Verify + Smoke

#### Automated

- [x] 4.1 `_verify_p4.cjs` (or equivalent) exits 0 — 83f8020
- [x] 4.2 `npm run lint` / parse checks pass for touched files — 83f8020

#### Manual

- [x] 4.3 Fitting path: new schedule → NPS → kg matches Accepted — 83f8020
- [x] 4.4 WN path: calculated schedule → NPS → kg matches Accepted — 83f8020
- [x] 4.5 Skipped schedule absent from dropdown — 83f8020
- [x] 4.6 Slip-On / Blind still without Flange schedule control — 83f8020
