# B16.5 Flange Catalog Implementation Plan

## Overview

Ship roadmap S-05 (US-01, FR-001): planners can pick flanges from a B16.5 product-family catalog with kg/pc from manufacturer/industry charts, and select **schedule for Weld Neck only** so bore matches the pipe path. Core v1 types are Weld Neck, Slip-On, and Blind within the **current** class×NPS matrix (no coverage expansion). Socket Weld / Threaded / Lap Joint stay in the UI unchanged and unverified this slice. Legacy calculator host only (`index.html` / `app.js` / `data/piping_catalog.js`).

## Current State Analysis

- Flanges SSOT is `PIPING_CATALOG.flanges[type][class] → [{ nps, wt }]` (`data/piping_catalog.js` flanges block ~851+). Header claims ASME B16.5; rows are mass-only (no bore, facing, or schedule).
- Types today: Weld Neck, Slip-On, Blind, Socket Weld, Threaded, Lap Joint. Classes `"150"`…`"2500"` (no Class 400). Schedule is **not** in the cascade.
- Runtime: `cargoCategories` flange `hasClass: true` (`app.js` ~1663); `getClassList` / `getNpsList` treat flange group values as row arrays (`app.js` ~1682–1702); `calcUnitKg` returns `item.wt` for non-pipe (`app.js` ~1708–1716). Class label = **"Class / Rating"**.
- UI has three cascade selects (Type / Class / NPS) plus Length/Fill on the bottom row (`index.html` ~268–305). WN schedule nest needs a **fourth** cascade step — a Schedule field visible only for Weld Neck.
- S-04 already locked chart + candidates process for fittings; flanges have no `FITTING_SCH_FACTORS`-style fallback to remove. PDF `data/ASME B16.5.pdf` is on disk for product-family / type inventory — masses still come from charts (planning decision 1A; roadmap Open Q #6).
- Pipe schedule vocabulary (18 keys) — WN schedule keys must be a subset of these strings (same rule as fittings).

## Desired End State

A planner selects **Flange** → type (all six still listed) → **Class / Rating** → for **Weld Neck only**, **Schedule** (keys present under that class) → NPS → sees kg/pc from the nested row’s `wt`. Slip-On and Blind stay type → class → NPS with chart-aligned weights for the existing matrix. Missing chart cells are omitted from dropdowns (no invent, no silent scale). Catalog comments state: product family B16.5; masses from cited manufacturer/industry charts. Deferred types (Socket Weld, Threaded, Lap Joint) remain selectable with today’s rows.

### Key Discoveries:

- Nesting target for WN: `flanges["Weld Neck"][class][schedule] → [{ nps, wt }]`; SO/Blind remain `type → class → [{ nps, wt }]` (decision 6A) — helpers must branch on flange type / value shape.
- Approval model is lighter than S-04: **auto-apply non-conflicts; human Sign-off only on Conflict rows** (decision 8C). Conflict definition is locked below.
- Fourth UI control is required for WN; SO/Blind must not show a fake Schedule.
- Coverage is “current matrix only” (decision 4A) — do not add Class 400 or new NPS beyond today’s cells for the core three types.

## What We're NOT Doing

- Claiming masses are “from ASME B16.5.pdf”
- Expanding class/NPS coverage (Class 400, new NPS gaps) in this slice
- Schedule UI for Slip-On, Blind, Socket Weld, Threaded, or Lap Joint
- Verifying or rewriting Socket Weld / Threaded / Lap Joint weights (leave unchanged)
- Storing B16.5 dimensional tables (OD, thickness, bolt circle, facing dims) in the catalog
- Fill mass / internal volume on flanges
- Fittings / B16.9 (S-04), Appliance Ratio handoff (S-03), Astro migration
- Inventing weights when charts lack a cell
- Auth, DB, new test runner, full UI redesign

## Implementation Approach

1. Build `flange-weight-candidates.md`: sources, core-3 inventory, proposed rows for current SO/Blind/WN class×NPS plus WN×schedule, Conflict vs Auto-apply buckets, Skipped — no SSOT edits until Conflict Sign-off (or “no conflicts”) is recorded.
2. Apply auto-accepted + Conflict-accepted rows: rewrite Weld Neck / Slip-On / Blind; nest WN under schedule; leave deferred types byte-stable where practical.
3. Extend cargo UI/helpers: Schedule select for Weld Neck only; `getNpsList` / find / preview / add honor the four-level path; SO/Blind keep the three-level path.
4. Smoke cargo path; handoff notes for deferred types and roadmap.

## Critical Implementation Details

**Conflict definition (decision 8C):** A proposed cell is a **Conflict** when any of: (a) existing catalog `wt` and chart `wt` differ by more than **5%** relative (`|chart − catalog| / catalog > 0.05`, catalog `wt > 0`); (b) two cited chart sources disagree by more than 5% on the same cell; (c) chart splits facing/material (e.g. RF vs RTJ) and the proposal must pick one without an existing catalog convention. All other proposed cells with a single clear chart value are **Auto-apply** (including new WN schedule×NPS cells with no prior catalog row). Phase 2 must not write Conflict rows until human Sign-off on `## Sign-off` (accept / reject / edit) — or the Conflict section is empty and Notes say so.

**No silent fallback:** After apply, if a WN class has no schedule object, or a schedule has no NPS row, those options must not appear. Do not invent STD/Sch40 fill-ins.

**Schedule key set:** Use exactly the pipe catalog schedule strings (18). Alias notes belong in the candidates artifact, not as duplicate runtime keys unless charts publish separate STD/XS/XXS weights.

**WN-only Schedule UI:** Add a Schedule field (new select or wrap) that is enabled/visible only when Category=Flange and Type=Weld Neck. For other flange types and all non-flange categories, show disabled "—" (same pattern as Length for non-pipe). Prefer placing it in the top selector row after Class / before NPS.

**Shape detection:** Runtime must distinguish WN nested objects (`class → schedule → array`) from SO/Blind arrays (`class → array`). Do not break valve/fitting paths.

**Interim breakage:** Prefer shipping Phase 2 catalog reshape and Phase 3 runtime in one working session (or one commit) so the UI never loads nested WN data with three-level-only helpers.

---

## Phase 1: Weight Candidates + Conflicts

### Overview

Produce an approval artifact for core-3 flange weights (and WN schedules), classifying each cell as Auto-apply or Conflict — without editing the live catalog.

### Changes Required:

#### 1. Candidates artifact

**File**: `context/changes/b16-5-flange-catalog/flange-weight-candidates.md`

**Intent**: Give a reviewable proposal of every core-3 class×NPS (and WN schedule×NPS) weight to load, with Conflicts isolated for human Sign-off under decision 8C.

**Contract**: Markdown sections at least:
- `## Sources` — named chart(s), edition/date/URL or file path, units (kg), material/facing assumption (default RF carbon steel unless charts force a split)
- `## Type inventory` — table of catalog types → in scope this slice / deferred:
  - **In (rewrite):** `Weld Neck`, `Slip-On`, `Blind`
  - **Deferred (leave unchanged):** `Socket Weld`, `Threaded`, `Lap Joint`
- `## Schedule keys` — the 18 pipe keys; note chart alias → catalog key mapping for WN
- `## Proposed rows` — buckets **Auto-apply** and **Conflict**: `type`, `class`, `schedule` (WN only; empty/— for SO/Blind), `nps`, `current_wt` (if any), `chart_wt`, source note, conflict reason when applicable
- `## Skipped` — chart-missing within current matrix, out-of-scope expansion, deferred types, with reason
- `## Conflict policy` — paste the 5% / multi-source / facing rules from Critical Implementation Details; state Auto-apply default for non-conflicts
- `## Sign-off` — required only for Conflict bucket (accept all / subset / reject / edit); if Conflict is empty, record “no conflicts — Auto-apply proceeds”
  Do not modify `data/piping_catalog.js`, `app.js`, or `index.html` in this phase.

Optional helpers (same spirit as S-04): `_gen_candidates.cjs` / `_verify_p1.cjs` under the change folder — allowed if they only write/read the candidates artifact.

### Success Criteria:

#### Automated Verification:

- `flange-weight-candidates.md` exists under the change folder
- Type inventory marks WN / Slip-On / Blind in-scope and the other three deferred
- Proposed WN schedule keys ⊆ the 18 pipe schedule strings (spot-checkable)
- No edits to `data/piping_catalog.js`, `app.js`, or `index.html` in this phase

#### Manual Verification:

- Human records Conflict Sign-off (or “no conflicts”) in `## Sign-off` or chat before Phase 2
- Source citations and facing/material assumption are acceptable for cargo planning use

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Apply Catalog Data (Core 3 + WN Nest)

### Overview

Rewrite Weld Neck / Slip-On / Blind from Auto-apply + Conflict-accepted rows; nest Weld Neck under schedule; leave deferred types unchanged.

### Changes Required:

#### 1. Active piping catalog — flanges core-3 reshape

**File**: `data/piping_catalog.js`

**Intent**: Make flange SSOT chart-aligned for the core three types and schedule-native for Weld Neck so Class → Schedule → NPS is data-driven.

**Contract**:
- `Slip-On` / `Blind`: keep `type → class → [{ nps, wt }]`; replace/omit cells per Auto-apply + accepted Conflicts; omit Skipped / rejected Conflict cells (decision 7A).
- `Weld Neck`: reshape to `type → class → schedule → [{ nps, wt }]` using only accepted schedule keys/rows.
- Do **not** modify `Socket Weld`, `Threaded`, or `Lap Joint` blocks.
- Do not change `pipes`, `fittings`, or `valves`.
- Update file header / flanges section comments: B16.5 product family; masses from charts cited in `flange-weight-candidates.md`; document WN nest vs SO/Blind shape.
- Prefer shipping Phase 2+3 together so the cargo UI never loads nested WN with old helpers.

### Success Criteria:

#### Automated Verification:

- `node --check data/piping_catalog.js` passes
- Spot-check: `Slip-On` / `Blind` still have class keys mapping to arrays of `{ nps, wt }`
- Spot-check: `Weld Neck` class values are schedule objects (not bare NPS arrays)
- Spot-check: deferred types `Socket Weld`, `Threaded`, `Lap Joint` still exist
- Optional: change-folder verify script asserting nest shape + sample Auto-apply `wt`

#### Manual Verification:

- Spot-check several Auto-apply / accepted Conflict rows match candidates `chart_wt`
- Rejected / Skipped cells absent; no Class 400 or new NPS beyond prior matrix intent

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Prefer completing Phase 3 in the same session before manual UI smoke if the app would otherwise break.

---

## Phase 3: Runtime — WN Schedule Cascade

### Overview

Drive Weld Neck Schedule/NPS/weight from the nested catalog; keep Slip-On / Blind / deferred types on the existing three-level path.

### Changes Required:

#### 1. Cargo selector markup

**File**: `index.html`

**Intent**: Provide a Schedule control for Weld Neck flanges without cluttering SO/Blind or other categories.

**Contract**: Add a Schedule field wrap + `<select>` in the top cargo selector row (after Class / before NPS). Default state disabled with "—" until JS enables it for Flange + Weld Neck.

#### 2. Cargo catalog helpers + sync

**File**: `app.js`

**Intent**: Resolve flange weights correctly for both nest shapes and wire the WN-only Schedule cascade into preview/add/labels.

**Contract**:
- Detect WN nest: when `cat.flanges[typeId][classId]` is a plain object whose values are arrays, treat keys as schedules; when the value is already an array, treat as SO/Blind/deferred (no schedule).
- `getScheduleList("flange", typeId, classId)` (or equivalent) → schedule keys for WN; empty otherwise.
- `getNpsList` for flange → if schedules exist, require selected schedule and return that array; else return `flanges[type][class]` array as today.
- `findItem` / `calcUnitKg` / `updateCargoPreview` / `cargoAddItem` pass schedule when needed; cargo log label includes schedule for WN (e.g. `Flange | Weld Neck | 150 | Sch 40 | NPS 6"`).
- Sync: enable Schedule select only for Flange + Weld Neck; on class change, refill schedules then NPS; on other flange types, disable Schedule ("—") and NPS from class array.
- Keep class label **"Class / Rating"** for flanges; Schedule uses its own label.
- Do not change pipe fill math, fitting schedule path, or valve path beyond shared helper safety.

### Success Criteria:

#### Automated Verification:

- `node --check app.js` passes
- `node --check` not required for HTML; confirm Schedule select id exists in `index.html`
- Repo grep: flange WN path reads nested schedule arrays (no leftover assumption that every flange class value is an array)

#### Manual Verification:

- Flange → Weld Neck → Class → Schedule list matches catalog keys for that class; changing schedule changes NPS when coverage differs
- Preview/add weight equals nested `wt` for selected schedule
- Flange → Slip-On / Blind: Schedule shows "—"; Class → NPS still works; weights match catalog
- Flange → Socket Weld / Threaded / Lap Joint: still selectable; weights unchanged from pre-change behavior
- Fitting / Pipe / Valve cascades unchanged

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Smoke + Handoff

### Overview

Verify end-to-end cargo use of the updated flange catalog and record handoff notes for deferred types / follow-on work.

### Changes Required:

#### 1. Change notes

**File**: `context/changes/b16-5-flange-catalog/change.md`

**Intent**: Capture what shipped, Conflict/Auto-apply policy, WN nest shape, and deferred leftovers so future catalog work does not rediscover gaps.

**Contract**: Update Notes with: mass source policy (charts; Conflict-only Sign-off), core-3 scope, WN nest summary, deferred types left unchanged, pointer to `flange-weight-candidates.md`. Set status per implement skill when done (planner leaves `planned` until implement starts).

### Success Criteria:

#### Automated Verification:

- `change.md` Notes mention chart source policy, WN nest shape, and deferred types

#### Manual Verification:

- Add Weld Neck Class 150 Sch 40 (or another signed schedule) and a heavier schedule if both present — weights differ and match catalog
- Add Slip-On and Blind — no Schedule step; weights match catalog
- Deferred type still appears and adds with prior-style weight
- Mixed list (pipe + flange + fitting) still totals; Send to Cargo Weight still works
- Fill selector does not change flange steel mass

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- None required — repo has no test runner; do not invent one

### Integration Tests:

- None automated; optional local `node --check` on touched JS files; optional change-folder `_verify_p*.cjs` scripts

### Manual Testing Steps:

1. Open Cargo → Flange → Weld Neck → Class 150 → pick Schedule → NPS → confirm kg/pc
2. Change Schedule on same Class/NPS when both exist → weight changes with catalog
3. Slip-On / Blind → Schedule disabled → Class → NPS → add to list
4. Socket Weld (deferred) → still works as before
5. Mixed pipe (with fill) + WN flange → flange kg unchanged by fill; Send updates Te
6. Escape/Reset cargo behavior unchanged

## Performance Considerations

WN schedule nesting grows `piping_catalog.js` modestly vs fittings’ full type×schedule matrix. Keep as static script load. No lazy-loading required for v1.

## Migration Notes

- One-shot reshape for Weld Neck only: class → array becomes class → schedule → array. SO/Blind stay two-level with updated `wt`.
- Ship catalog reshape + runtime Schedule control together to avoid a broken intermediate UI.
- Deferred types intentionally unverified — do not “fix” them opportunistically in Phase 2.

## References

- Roadmap S-05: `context/foundation/roadmap.md` (Stream C)
- Parallel playbook: `context/changes/b16-9-fitting-catalog-schedule/plan.md` (+ `fitting-weight-candidates.md`)
- Pattern: `context/archive/2026-07-18-cargo-catalog-selection/` (gap-candidates Sign-off)
- Pattern: `context/archive/2026-07-18-pipe-fill-cargo-weight/` (wall-thickness Sign-off)
- Runtime: `app.js` cargo helpers (~1663–1919); UI: `index.html` cargo selector (~268–305)
- Standard (product family / dims): `data/ASME B16.5.pdf`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Weight Candidates + Conflicts

#### Automated

- [x] 1.1 flange-weight-candidates.md exists under the change folder — 0fd46bf
- [x] 1.2 Type inventory marks core 3 in-scope and other three deferred — 0fd46bf
- [x] 1.3 Proposed WN schedule keys ⊆ the 18 pipe schedule strings — 0fd46bf
- [x] 1.4 No edits to piping_catalog.js, app.js, or index.html in this phase — 0fd46bf

#### Manual

- [x] 1.5 Conflict Sign-off (or no conflicts) recorded before Phase 2 — 0fd46bf
- [x] 1.6 Source citations and facing/material assumption acceptable — 0fd46bf

### Phase 2: Apply Catalog Data (Core 3 + WN Nest)

#### Automated

- [x] 2.1 node --check data/piping_catalog.js passes
- [x] 2.2 Slip-On / Blind class values are NPS arrays
- [x] 2.3 Weld Neck class values are schedule objects
- [x] 2.4 Deferred types Socket Weld / Threaded / Lap Joint still exist
- [x] 2.5 Optional verify script: nest shape + sample Auto-apply wt

#### Manual

- [x] 2.6 Spot-check Auto-apply / accepted Conflict rows match candidates
- [x] 2.7 Rejected / Skipped cells absent; no coverage expansion

### Phase 3: Runtime — WN Schedule Cascade

#### Automated

- [x] 3.1 node --check app.js passes — 05374a8
- [x] 3.2 Schedule select exists in index.html — 05374a8
- [x] 3.3 Flange WN path reads nested schedule arrays — 05374a8

#### Manual

- [x] 3.4 WN Class → Schedule → NPS cascade matches catalog — 05374a8
- [x] 3.5 WN preview/add weight equals nested wt — 05374a8
- [x] 3.6 Slip-On / Blind: Schedule disabled; Class → NPS works — 05374a8
- [x] 3.7 Deferred flange types still selectable with prior weights — 05374a8
- [x] 3.8 Fitting / Pipe / Valve cascades unchanged — 05374a8

### Phase 4: Smoke + Handoff

#### Automated

- [x] 4.1 change.md Notes mention chart policy, WN nest, deferred types — 417716e

#### Manual

- [x] 4.2 WN two schedules differ and match catalog when both present — 417716e
- [x] 4.3 Slip-On and Blind add without Schedule step — 417716e
- [x] 4.4 Deferred type still adds — 417716e
- [x] 4.5 Mixed list and Send still work — 417716e
- [x] 4.6 Fill does not change flange steel mass — 417716e
