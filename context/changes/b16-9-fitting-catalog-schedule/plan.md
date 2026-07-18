# B16.9 Fitting Catalog + Schedule Implementation Plan

## Overview

Ship roadmap S-04 (US-01, FR-001): planners can pick butt-weld fittings by type, NPS, and schedule with catalog weights from signed-off manufacturer/industry charts — nested like flanges — instead of Sch 40 base × `FITTING_SCH_FACTORS` (B36 wall ratios). Align type inventory with ASME B16.9-2024 (no laterals); do not claim kg/pc come from the B16.9 PDF (it has none). Legacy calculator host only (`index.html` / `app.js` / `data/piping_catalog.js`).

## Current State Analysis

- Fittings SSOT is flat `PIPING_CATALOG.fittings[type] → [{ nps, wt }]` Sch 40 equiv. (`data/piping_catalog.js:178–249`), header claims B16.9.
- Runtime schedule: `FITTING_SCH_FACTORS` in `app.js:1599–1703`; `getClassList` returns factor keys (`app.js:1791`); `getNpsList` ignores schedule (`app.js:1804`); `calcUnitKg` multiplies (`app.js:1821–1824`); preview shows Sch40 × factor (`app.js:1967–1970`).
- Flanges already use the target shape: `type → class → [{ nps, wt }]` (`piping_catalog.js:254+`); class list from `Object.keys(cat.flanges[typeId])`.
- Pipe schedule keys (18) — fittings must mirror these after refactor: `Sch 5S`, `Sch 5`, `Sch 10S`, `Sch 10`, `Sch 20`, `Sch 30`, `Sch 40S`, `Sch 40`, `Sch 60`, `Sch 80S`, `Sch 80`, `Sch 100`, `Sch 120`, `Sch 140`, `Sch 160`, `STD`, `XS`, `XXS`. (Do **not** invent `Sch 20S` unless pipes gain it.)
- Research: `context/changes/b16-9-fitting-catalog-schedule/research.md` — B16.9-2024 = dimensions/tolerances/markings only; reducers always hit `_default` factor today.
- Prior pattern: S-01 `gap-candidates.md` / S-02 `wall-thickness-candidates.md` — propose → human Sign-off → then edit SSOT.
- No test runner in repo; verification = `node --check` + manual cargo UI smoke.

## Desired End State

A planner selects **Butt-Weld Fitting** → full B16.9 type set (minus laterals) → **Schedule** from keys present for that type in the catalog → NPS (or `large×small` for reducers/reducing fittings) → sees kg/pc from the nested row’s `wt` (no B36 multiplier). Missing schedule or NPS simply does not appear in the cascade. Catalog comments state: product family B16.9; masses from cited manufacturer/industry charts (edition/URL or doc name in the candidates artifact). `FITTING_SCH_FACTORS` is gone. Fill on fittings remains out of scope (steel-only `calcUnitKg` path).

### Key Discoveries:

- Nest fittings like flanges — reuse `getClassList` / `getNpsList` flange branches; fitting-specific factor path can be deleted (`app.js:1791`, `1821–1824`, `1967–1970`).
- B16.9 cannot supply kg/pc — plan locks **manufacturer/industry charts** as mass source with human sign-off (`research.md`, roadmap Open Q #6).
- Full type set × 18 schedules is large — Phase 1 uses A/B buckets and may be multi-round Sign-off before Phase 2.
- Pipe keys are the schedule vocabulary (18), not the old 19 factor keys (which included `Sch 20S`).

## What We're NOT Doing

- Storing or verifying B16.9 dimensional tables (A, B, H, E, OD at bevel) in the catalog
- Claiming masses are “from ASME B16.9.pdf”
- Laterals (out of B16.9 §1.3)
- Fill mass / internal volume on fittings
- Flanges / B16.5 (S-05), Appliance Ratio handoff (S-03), Astro migration
- Keeping `FITTING_SCH_FACTORS` as a production path (removed after nested data ships)
- Inventing weights when charts lack a cell — omit row (or document skip); no silent B36 fallback in v1
- Auth, DB, new test runner, full UI redesign

## Implementation Approach

1. Build a candidates artifact: B16.9 type→catalog-key map, cited chart sources, proposed `wt` rows for type×schedule×NPS (and compound pairs), coverage gaps, Sign-off — no SSOT edits.
2. After human Sign-off (accept all / subset / reject), reshape `fittings` to nested `type → schedule → [{ nps, wt }]` and apply only approved rows.
3. Point cargo helpers at the nested catalog (flange-like); delete `FITTING_SCH_FACTORS` and the Sch40×factor preview.
4. Smoke the cargo path for old and new types; leave handoff notes for S-05 / roadmap.

## Critical Implementation Details

**Approval gate:** Phase 2 must not edit `data/piping_catalog.js` until Phase 1 Sign-off is recorded (`## Sign-off` or chat). Same gate as S-01/S-02.

**No silent fallback:** After nesting, if a schedule has no array for a type, it must not appear in the Schedule dropdown. Do not reintroduce B36 factors for missing cells.

**Schedule key set:** Use exactly the pipe catalog schedule strings listed above. Alias notes (STD≈Sch40, etc.) belong in the candidates artifact, not as duplicate runtime keys unless charts publish separate STD/XS/XXS weights.

**Compound NPS:** Reducers and other reducing fittings use catalog `nps` strings like `"8x6"` with a dedicated `wt` per schedule (decision 5A). No large-end factor lookup.

**Interim breakage:** Between Phase 2 catalog reshape and Phase 3 runtime, the UI may break if shipped mid-change — implement Phase 2 and Phase 3 in one working session (or keep factors until nested data is loaded and switch atomically in one commit).

---

## Phase 1: Weight Candidates + Type Inventory

### Overview

Produce an approval artifact mapping B16.9 fitting types to catalog keys, citing manufacturer/industry weight chart sources, and proposing kg/pc rows for human Sign-off — without editing the live catalog.

### Changes Required:

#### 1. Candidates artifact

**File**: `context/changes/b16-9-fitting-catalog-schedule/fitting-weight-candidates.md`

**Intent**: Give the human a reviewable proposal of every type×schedule×NPS (and reducing pair) weight to load, plus explicit skips, so SSOT edits are never speculative.

**Contract**: Markdown sections at least:
- `## Sources` — named chart(s), edition/date/URL or file path, units (kg), material assumption (e.g. carbon steel BW)
- `## Type inventory` — table: B16.9 table ref → proposed catalog type key → in/out. Locked **in** set (no laterals):
  - Existing: `90° LR Elbow`, `90° SR Elbow`, `45° LR Elbow`, `Equal Tee`, `Concentric Reducer`, `Eccentric Reducer`, `Cap`
  - Add: `LR Reducing Elbow`, `180° LR Return`, `180° SR Return`, `90° 3D Elbow`, `45° 3D Elbow`, `Equal Cross`, `Reducing Tee`, `Reducing Cross`, `Lap Joint Stub End (Long)`, `Lap Joint Stub End (Short)`
  - Out: laterals; 45° SR as separate type (not tabulated in B16.9 6.1-4)
- `## Schedule keys` — copy of the 18 pipe keys; note any chart alias → catalog key mapping
- `## Proposed rows` — or bucket **A. recommended** / **B. needs review**: `type`, `schedule`, `nps`, `wt` (kg/pc), source note
- `## Skipped` — chart-missing, out-of-NPS, rejected sizes, with reason
- `## Conflict policy` — do not invent wt; do not keep Sch40×factor as fill-in
- `## Sign-off`
  Do not modify `data/piping_catalog.js` or `app.js` in this phase.

### Success Criteria:

#### Automated Verification:

- `fitting-weight-candidates.md` exists under the change folder
- Type inventory lists all locked-in keys above
- Proposed rows use only the 18 pipe schedule keys (spot-checkable)
- No edits to `data/piping_catalog.js` or `app.js` in this phase

#### Manual Verification:

- Human records Sign-off (accept all / accept subset / reject) in `## Sign-off` or chat before Phase 2
- Source citations are acceptable to the human for cargo planning use

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Apply Nested Catalog Data

### Overview

Reshape fittings to `type → schedule → [{ nps, wt }]` and load only signed-off rows so Schedule/NPS dropdowns are data-driven.

### Changes Required:

#### 1. Active piping catalog — fittings reshape

**File**: `data/piping_catalog.js`

**Intent**: Make fittings SSOT schedule-native and expand to the signed-off B16.9 type set with chart weights.

**Contract**:
- Replace flat `fittings[type] = [{nps,wt}]` with `fittings[type][schedule] = [{nps,wt}]` (same nesting idea as `flanges[type][class]`).
- Include only Sign-off-accepted types/schedules/rows; omit unsigned bucket-B / skipped cells.
- Update file header (`:4`) and fittings section comments: B16.9 product family; masses from charts cited in `fitting-weight-candidates.md`; shape `{ nps, wt }` under schedule keys.
- Do not change `pipes`, `flanges`, or `valves`.
- Prefer shipping Phase 2+3 together so the cargo UI never loads nested data with the old factor code.

### Success Criteria:

#### Automated Verification:

- `node --check data/piping_catalog.js` passes
- Spot-check: at least one existing type (e.g. `90° LR Elbow`) has nested `Sch 40` (or signed schedule) with numeric `wt > 0`
- Spot-check: a new signed-off type key exists if Sign-off included it
- No remaining top-level `fittings[type]` arrays (must be schedule objects)

#### Manual Verification:

- Spot-check a few proposed rows match Sign-off `wt` values
- Rejected / skipped rows are absent from the file

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Prefer completing Phase 3 in the same session before manual UI smoke if the app would otherwise break.

---

## Phase 3: Runtime — Drop FITTING_SCH_FACTORS

### Overview

Drive fitting Schedule/NPS/weight from the nested catalog like flanges; remove B36 multiplier logic and Sch40×factor preview.

### Changes Required:

#### 1. Cargo catalog helpers

**File**: `app.js`

**Intent**: Treat fittings as schedule-nested catalog data so UI and mass match SSOT without approximate factors.

**Contract**:
- `getClassList("fitting", typeId)` → `Object.keys(cat.fittings?.[typeId] || {})` (same pattern as flange/valve group keys).
- `getNpsList` for fitting → `cat.fittings?.[typeId]?.[classId]` (honor `classId`).
- `calcUnitKg` for fitting → return `item.wt` (same as flange/valve at the non-pipe branch); delete the factor multiply.
- `updateCargoPreview`: remove Sch40 × factor branch for fittings; show `kg/pc` from `unitKg` like other piece items.
- Delete the entire `FITTING_SCH_FACTORS` constant and its header comments.
- Keep class label **"Schedule"** for fittings; keep `hasClass: true`.
- Do not change pipe fill math or flange/valve paths beyond shared helper cleanup if any.

### Success Criteria:

#### Automated Verification:

- `node --check app.js` passes
- Repo grep: no remaining `FITTING_SCH_FACTORS` identifier in `app.js` / `data/`
- Grep: fitting path no longer multiplies by a schedule factor table

#### Manual Verification:

- Cargo modal: Fitting → type → Schedule list matches keys present for that type in catalog
- Changing schedule changes NPS list when coverage differs
- Preview/add weight equals catalog `wt` for selected schedule (no “× factor” text)
- Reducer: compound NPS shows chart `wt` for that schedule (not a default multiplier)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Smoke + Handoff

### Overview

Verify end-to-end cargo use of the new fittings catalog and record handoff notes for parallel/follow-on work.

### Changes Required:

#### 1. Change notes

**File**: `context/changes/b16-9-fitting-catalog-schedule/change.md`

**Intent**: Capture what shipped, source policy, and leftovers so S-05 / future catalog work does not rediscover gaps.

**Contract**: Update Notes with: mass source policy (charts + Sign-off path), nested shape summary, any unsigned types/schedules deferred, pointer to `fitting-weight-candidates.md`. Set status per implement skill when done (planner leaves `planned` until implement starts).

### Success Criteria:

#### Automated Verification:

- `change.md` Notes mention chart source policy and nested fittings shape

#### Manual Verification:

- Add 90° LR Elbow Sch 40 and Sch 80 (if both signed) — weights differ and match catalog
- Add a newly introduced type (if signed) — appears in Type list and adds to cargo log
- Add concentric reducer pair — weight from nested schedule row
- Mixed list (pipe + fitting) still totals; Send to Cargo Weight still works
- Fill selector does not change fitting steel mass (regression from S-02)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- None required — repo has no test runner; do not invent one

### Integration Tests:

- None automated; optional local `node --check` on touched JS files

### Manual Testing Steps:

1. Open Cargo calculator → Butt-Weld Fitting → confirm expanded type list
2. Pick type with multiple schedules → confirm Schedule options ⊆ catalog keys for that type
3. Sch 40 vs heavier schedule → different kg/pc when charts differ
4. Reducer `large×small` → finite wt; no factor line in preview
5. Add several fittings + one pipe with fill → fitting kg unchanged by fill; Send updates Te
6. Escape/Reset cargo behavior unchanged (S-01 hardenings)

## Performance Considerations

Nested fittings increase `piping_catalog.js` size substantially (full types × schedules). Keep as static script load (current pattern). No lazy-loading required for v1 unless file becomes unwieldy after Sign-off — if so, note in change Notes; do not split without a follow-on change.

## Migration Notes

- One-shot reshape: flat fittings → nested. No backward compatibility with `FITTING_SCH_FACTORS`.
- Ship catalog reshape + runtime switch together to avoid a broken intermediate UI.
- Existing saved mental model: schedule still labeled Schedule; values now real catalog partitions.

## References

- Related research: `context/changes/b16-9-fitting-catalog-schedule/research.md`
- Roadmap S-04: `context/foundation/roadmap.md` (Stream C)
- Pattern: `context/archive/2026-07-18-cargo-catalog-selection/plan.md` (gap-candidates Sign-off)
- Pattern: `context/archive/2026-07-18-pipe-fill-cargo-weight/plan.md` (wall-thickness Sign-off)
- Flange nesting reference: `data/piping_catalog.js` flanges block; `app.js` `getClassList` / `getNpsList`
- Standard (dims only): `data/ASME B16.9.pdf` (B16.9-2024)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Weight Candidates + Type Inventory

#### Automated

- [x] 1.1 fitting-weight-candidates.md exists under the change folder — cf65266
- [x] 1.2 Type inventory lists all locked-in keys — cf65266
- [x] 1.3 Proposed rows use only the 18 pipe schedule keys — cf65266
- [x] 1.4 No edits to piping_catalog.js or app.js in this phase — cf65266

#### Manual

- [x] 1.5 Human Sign-off recorded before Phase 2 — cf65266
- [x] 1.6 Source citations acceptable to human for cargo planning — cf65266

### Phase 2: Apply Nested Catalog Data

#### Automated

- [x] 2.1 node --check data/piping_catalog.js passes — 1e77370
- [x] 2.2 Spot-check nested schedule + wt > 0 for an existing type — 1e77370
- [x] 2.3 Spot-check new signed-off type key if included — 1e77370
- [x] 2.4 No remaining top-level fittings[type] arrays — 1e77370

#### Manual

- [x] 2.5 Spot-check proposed rows match Sign-off wt — 1e77370
- [x] 2.6 Rejected/skipped rows absent from file — 1e77370

### Phase 3: Runtime — Drop FITTING_SCH_FACTORS

#### Automated

- [x] 3.1 node --check app.js passes
- [x] 3.2 No FITTING_SCH_FACTORS identifier in app.js / data/
- [x] 3.3 Fitting path no longer multiplies by schedule factor table

#### Manual

- [x] 3.4 Schedule list matches catalog keys for selected type
- [x] 3.5 Schedule change updates NPS list when coverage differs
- [x] 3.6 Preview/add weight equals catalog wt (no × factor)
- [x] 3.7 Reducer compound NPS uses nested schedule wt

### Phase 4: Smoke + Handoff

#### Automated

- [ ] 4.1 change.md Notes mention chart source policy and nested shape

#### Manual

- [ ] 4.2 LR Elbow Sch 40 vs Sch 80 weights match catalog
- [ ] 4.3 New type appears and adds to cargo log (if signed)
- [ ] 4.4 Concentric reducer weight from nested schedule row
- [ ] 4.5 Mixed pipe+fitting list and Send still work
- [ ] 4.6 Fill does not change fitting steel mass
