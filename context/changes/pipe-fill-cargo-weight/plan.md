# Pipe Fill → Cargo Weight Implementation Plan

## Overview

Ship roadmap S-02 (US-01, FR-002, FR-003): on the legacy calculator, a planner can choose pipe fill from the verified F-01 media list and see cargo weight = steel mass + fill mass from internal volume. Prerequisites F-01 and S-01 are done; this change enriches pipe geometry with signed-off wall thickness, wires `FILL_MEDIA_CATALOG` into the cargo modal, and extends mass math — without Appliance Ratio formula changes (S-03) or Astro migration.

## Current State Analysis

- Cargo path works: Category → cascade → Add → list → Send → `#cargoWeight` → `recompute()` (`app.js` ~1726–2110, `index.html` ~249–325). Manual Te entry preserved.
- Pipe steel mass today: `calcUnitKg` → `item.wt * lenM` (`app.js:1784–1793`). `wt` is kg/m, not wall thickness.
- Pipe rows: `{ nps, od, wt }` in `data/piping_catalog.js` (~18 schedules, ~370 rows). No wall / ID. `data/pipes.json` also lacks wall thickness.
- F-01 delivered `data/fill_media_catalog.js` → `window.FILL_MEDIA_CATALOG` (Empty=0, fresh water=1000, seawater=1025, light oil=850 kg/m³). Not loaded in `index.html` (scripts: catalog → piping → app only).
- Cargo log items: `{ id, label, qty, unitKg, totalKg }`. Report renders `label` / `qty` / `unitKg` / `totalKg` from `sentLog` only.
- Select-from-catalog pattern: `fillSelect` + cargo cascade (`app.js:1797–1878`). Reuse for fill media.
- Astro `src/` has no calculator UI. Host remains legacy per AGENTS.md / S-01.

## Desired End State

A planner opens Cargo calculator, sees a session-level fill selector (default Empty), builds a cargo list, and for pipe lines the unit/total kg include fill mass from `V_internal × ρ`. Non-pipe lines stay steel-only. Preview and list show final kg (no steel/fill breakdown). Pipe log lines store `fillId` (+ label in the display string) so Send/report remain auditable. Empty keeps parity with today’s steel-only weights. S-03 can assume fill-aware cargo totals feed `#cargoWeight` via existing Send.

### Key Discoveries:

- Volume is blocked on geometry: need curated `t` (mm) on pipe rows; `ID = OD − 2t` (`piping_catalog.js:9–10`, S-01 handoff).
- Fill UI + math are unwired; catalog contract is ready (`fill_media_catalog.js`, F-01 Notes).
- FR-003 MVP = final weight with fill; breakdown not required. NFR = immediate perceived response after fill change → re-run preview on fill `change`.
- ~370 rows / 18 schedules need ASME B36 wall proposal + sign-off (mirror S-01 `gap-candidates.md`).

## What We're NOT Doing

- Migrating cargo UI into Astro `src/`
- Changing Appliance Ratio / utilization formula or chart logic (S-03 owns FR-004/005 close-out)
- Full fill-media catalog, custom density input, or treating Empty as air
- Inventing internal volumes or approximate fill mass for fittings / flanges / valves
- Steel vs fill breakdown UI (beyond optional medium name in the line label)
- Overwriting existing `od` / `wt` during wall enrichment
- Loading `pipes.json` at runtime
- Auth, DB migration, full UI redesign
- Inventing a test runner (repo has none)

## Implementation Approach

1. Propose ASME B36.10M / B36.19M nominal wall thickness `t` (mm) for every pipe row, matched by schedule + NPS + OD; write `wall-thickness-candidates.md` and pause for human sign-off.
2. Add-only field `t` on accepted rows in `data/piping_catalog.js` (never rewrite `od`/`wt`).
3. Load `FILL_MEDIA_CATALOG`, add a session-level fill `<select>` (default `empty`), and compute pipe `unitKg = m_steel + V_m3 × ρ` with `V` from `ID = OD − 2t`. Non-pipes ignore density. Store `fillId` / `fillLabel` on pipe log lines; append medium to `label` for report visibility without a breakdown table.
4. Smoke the Empty / wet / mixed-list / Send / Reset / Escape paths; leave S-03 handoff notes. If time is tight, ship without dedicated report chrome for medium (label string is enough).

## Critical Implementation Details

**Approval gate:** Phase 2 must not edit `piping_catalog.js` until Phase 1’s wall list is signed off (artifact `## Sign-off` or chat). Bad `t` silently corrupts fill mass.

**Fill scope (locked):** Selector is visible for all cargo categories (session-level). Mass math applies fill only to pipes. Fittings/flanges/valves always use the existing steel `calcUnitKg` path.

**Geometry failure:** If a pipe row lacks `t`, or `ID = od - 2*t <= 0`, fill mass is 0 and preview must indicate geometry unavailable (do not invent `t` or derive from `wt`).

**Formula (pipes):** `m_steel = wt * L`; `idMm = od - 2*t`; `V_m3 = Math.PI * (idMm/2000)**2 * L`; `m_fill = V_m3 * densityKgPerM3`; `unitKg = m_steel + m_fill`. Densities only from `FILL_MEDIA_CATALOG` (unit `kg/m3`). Empty → `m_fill = 0`.

**Preview NFR:** Changing fill must call `updateCargoPreview` immediately (same pattern as NPS/length listeners).

---

## Phase 1: Wall-Thickness Proposal

### Overview

Produce an approval artifact proposing `t` (mm) for pipe rows from published ASME B36 tables, without editing the catalog SSOT.

### Changes Required:

#### 1. Wall-thickness candidate artifact

**File**: `context/changes/pipe-fill-cargo-weight/wall-thickness-candidates.md`

**Intent**: List proposed wall thickness per schedule×NPS matched to current catalog OD, with alias/coverage risks called out, so the human can accept, trim, or reject before any SSOT edit.

**Contract**: Markdown mirroring S-01 `gap-candidates.md` structure: purpose/banner → mapping (schedule keys, NPS, field `t` mm) → coverage summary (matched / OD-mismatch / B36-missing / alias notes) → **A. recommended** proposals → **B. needs review** (STD/XS/XXS ranges, S vs non-S, missing NPS) → conflict policy (do not rewrite `od`/`wt`) → out of scope → `## Sign-off`. Cite ASME B36.10M / B36.19M edition note. Do not modify `data/piping_catalog.js` in this phase.

### Success Criteria:

#### Automated Verification:

- `wall-thickness-candidates.md` exists under the change folder
- Proposed rows reference existing schedule+NPS keys present in `PIPING_CATALOG.pipes` (spot-checkable)
- No edits to `data/piping_catalog.js` in this phase

#### Manual Verification:

- Human reviews proposals and records sign-off (accept all / accept subset / reject) in `## Sign-off` or chat before Phase 2

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Apply Approved Wall Thickness

### Overview

Add signed-off `t` (mm) onto pipe rows in the active catalog so S-02 can compute internal volume.

### Changes Required:

#### 1. Active piping catalog

**File**: `data/piping_catalog.js`

**Intent**: Enrich accepted pipe rows with wall thickness so `ID = OD − 2t` is available at runtime.

**Contract**: Add-only field `t` (mm, number) on accepted pipe objects under `PIPING_CATALOG.pipes[<schedule>]`. Preserve existing `nps` / `od` / `wt`. Skip rejected / bucket-B-unsigned rows. Update the pipes header comment to document `{ nps, od, wt, t }` (t = wall mm). Do not change fittings/flanges/valves. Do not load `pipes.json`.

### Success Criteria:

#### Automated Verification:

- `node --check data/piping_catalog.js` passes
- Every signed-off accepted row has numeric `t > 0` and `od - 2*t > 0`
- Spot-check: pre-change `od`/`wt` samples unchanged

#### Manual Verification:

- Spot-check a few Sch 40 / Sch 80 / STD rows: `t` matches the signed-off proposal

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 3: Wire Fill → Cargo Weight

### Overview

Load the fill-media catalog, add session fill UI (default Empty), and make pipe unit/total kg include fill mass; non-pipes remain steel-only.

### Changes Required:

#### 1. Load fill-media catalog

**File**: `index.html`

**Intent**: Make `FILL_MEDIA_CATALOG` available before `app.js` runs.

**Contract**: Add `<script src="./data/fill_media_catalog.js"></script>` after `piping_catalog.js` and before `app.js`. Do not change F-01 density values in this phase unless a defect is found.

#### 2. Fill selector markup + styles

**Files**: `index.html`, `styles.css` (cargo selector region)

**Intent**: Session-level fill control visible for all cargo categories so the planner can choose medium once per modal session.

**Contract**: Add a fill `<select>` in the cargo selector UI (near Length/Qty). Populate from `FILL_MEDIA_CATALOG.items` via existing `fillSelect` helper (`id` / `label`). Default selected value `empty` when the modal opens / selects are (re)built. Changing fill triggers `updateCargoPreview`. Do not hide the control for non-pipe categories.

#### 3. Pipe mass math + preview + log fields

**File**: `app.js`

**Intent**: Pipe cargo weight reflects steel + fill; list/Send totals stay trustworthy; non-pipes ignore fill.

**Contract**:
- Extend `calcUnitKg` (or a small helper it calls) for pipes: steel + `V_m3 × ρ` using the Critical Implementation Details formula; read density by selected `fillId` from `FILL_MEDIA_CATALOG`; non-pipe branches unchanged.
- `updateCargoPreview`: show final kg/pc (and enough context that fill is included when ≠ Empty) — no required steel/fill breakdown.
- `cargoAddItem`: for pipes, persist `fillId` and `fillLabel` on the log entry; include medium in `label` (e.g. suffix) so the existing report table surfaces it without new columns. Non-pipes omit fill fields / do not claim a medium effect.
- Send snapshot continues to shallow-copy log entries (already copies new fields). Reset/Escape behavior from S-01 must keep working.
- If geometry unavailable (`t` missing or ID ≤ 0): fill contribution 0 + clear preview indication; do not block the whole modal.

### Success Criteria:

#### Automated Verification:

- `node --check app.js` and `node --check data/fill_media_catalog.js` pass
- `index.html` includes `fill_media_catalog.js` before `app.js`
- Spot-check in Node (or equivalent): for a known pipe with `t`, Empty → unitKg equals `wt*L`; fresh-water → unitKg equals steel + `V*1000` within rounding

#### Manual Verification:

- Cargo modal: fill select lists Empty / Fresh water / Seawater / Light oil; default Empty
- Pipe + Empty: preview matches prior steel-only behavior
- Pipe + Fresh water (or Seawater): preview/list total increases vs Empty; change fill updates preview immediately
- Add fitting/flange/valve with Seawater selected: mass unchanged vs Empty (steel-only)
- Send writes Te = list sum/1000 into `#cargoWeight` and recomputes ratio
- Escape still closes cargo; Reset still clears cargo log / `sentLog`

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 4: E2E Smoke + S-03 Handoff

### Overview

Confirm the primary success path end-to-end and leave explicit notes for S-03. Report chrome beyond the label string is optional (cut first if time is tight).

### Changes Required:

#### 1. Handoff notes

**File**: `context/changes/pipe-fill-cargo-weight/change.md`

**Intent**: Record what S-03 can assume and what remains out of scope.

**Contract**: Notes state: (1) Send already delivers fill-aware Te to `#cargoWeight`; (2) log may include `fillId`/`fillLabel` on pipe lines; (3) S-03 owns ratio/report regression guardrails and any dedicated report columns; (4) non-pipe fill mass remains out of scope.

### Success Criteria:

#### Automated Verification:

- `change.md` Notes contain S-03 handoff bullets above

#### Manual Verification:

- Multi-item list: ≥1 pipe with fill ≠ Empty + ≥1 non-pipe → Send → Cargo Weight Te matches list sum/1000
- Manual Te entry still works after using the cargo calculator
- Technical report still generates; pipe rows show medium via label (dedicated report column not required)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Testing Strategy

### Unit Tests:

- No test runner in repo — do not invent one. Use `node --check` on touched JS and a small Node assert script (or REPL) for Empty vs water mass on one fixture pipe row if helpful during Phase 3.

### Integration Tests:

- None automated. Rely on manual smoke below.

### Manual Testing Steps:

1. Open legacy calculator → Cargo calculator → confirm fill default Empty.
2. Sch 40 common NPS, length 1 m, Empty → note kg; switch Fresh water → kg increases; Add → list total matches.
3. Add a fitting with Seawater still selected → fitting kg equals steel-only expectation.
4. Send → `#cargoWeight` updates; utilization recomputes.
5. Generate technical report → pipe line label mentions medium; totals coherent.
6. Escape closes modal; Reset clears cargo list/report snapshot; manual Te still editable.

## Performance Considerations

Fill recompute is O(1) per preview (one pipe × density lookup). Catalog enrichment is static. No caching required.

## Migration Notes

- Additive catalog field `t`; older mental model “wt = wall” is wrong — keep comments clear (`wt` = kg/m, `t` = wall mm).
- Existing saved nothing server-side (browser-local). No data migration.
- Rollback: remove fill script/UI and ignore `t` / `fillId` (steel path remains).

## References

- Roadmap S-02: `context/foundation/roadmap.md`
- PRD US-01, FR-002, FR-003: `context/foundation/prd.md`
- F-01 archive: `context/archive/2026-07-17-verified-fill-media-v1/`
- S-01 archive: `context/archive/2026-07-18-cargo-catalog-selection/`
- Fill catalog: `data/fill_media_catalog.js`
- Cargo calc: `app.js` (~1726–2110), `index.html` (~249–325, scripts ~439–441)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wall-Thickness Proposal

#### Automated

- [x] 1.1 `wall-thickness-candidates.md` exists under the change folder — a3f0cbf
- [x] 1.2 Proposed rows reference existing schedule+NPS keys in `PIPING_CATALOG.pipes` — a3f0cbf
- [x] 1.3 No edits to `data/piping_catalog.js` in this phase — a3f0cbf

#### Manual

- [x] 1.4 Human sign-off recorded before Phase 2 — a3f0cbf

### Phase 2: Apply Approved Wall Thickness

#### Automated

- [x] 2.1 `node --check data/piping_catalog.js` passes — fc3882b
- [x] 2.2 Every signed-off accepted row has numeric `t > 0` and `od - 2*t > 0` — fc3882b
- [x] 2.3 Spot-check: pre-change `od`/`wt` samples unchanged — fc3882b

#### Manual

- [x] 2.4 Spot-check Sch 40 / Sch 80 / STD `t` vs signed-off proposal — fc3882b

### Phase 3: Wire Fill → Cargo Weight

#### Automated

- [x] 3.1 `node --check` passes on `app.js` and `fill_media_catalog.js` — 0ef3cf4
- [x] 3.2 `index.html` loads `fill_media_catalog.js` before `app.js` — 0ef3cf4
- [x] 3.3 Fixture check: Empty vs fresh-water unitKg for a known pipe with `t` — 0ef3cf4

#### Manual

- [x] 3.4 Fill select lists four media; default Empty — 0ef3cf4
- [x] 3.5 Pipe Empty matches prior steel-only; wet fill increases mass; fill change updates preview immediately — 0ef3cf4
- [x] 3.6 Non-pipe with Seawater selected stays steel-only — 0ef3cf4
- [x] 3.7 Send → Te + recompute; Escape/Reset cargo behavior preserved — 0ef3cf4

### Phase 4: E2E Smoke + S-03 Handoff

#### Automated

- [x] 4.1 `change.md` Notes contain S-03 handoff bullets — 42d1299

#### Manual

- [x] 4.2 Mixed list (pipe with fill + non-pipe) → Send Te matches sum/1000 — 42d1299
- [x] 4.3 Manual Te still works; report generates with medium visible via label — 42d1299
