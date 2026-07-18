# Verified Fill Media v1 — Implementation Plan

## Overview

Ship a small, verified fill-media list (Empty, fresh water, seawater, light oil) with densities in kg/m³ and per-medium source citations, packaged as a static data module under `data/`. This unblocks S-02 (`pipe-fill-cargo-weight`) so fill mass can use credible densities without inventing numbers at calculation time.

## Current State Analysis

- No fill-media or density data exists in the runtime tree. Cargo pipe weight today is catalog lookup: `unitKg = wt × length` in `app.js` (`calcUnitKg`); no internal volume, wall thickness, or fill selector.
- Legacy catalogs follow a clear pattern: `data/catalog.js` → `window.RIGGING_CATALOG` (versioned object) and `data/piping_catalog.js` → `window.PIPING_CATALOG`, loaded from `index.html` via script tags.
- PRD FR-002 keeps fill as must-have with Socrates resolution: **mała lista zweryfikowanych mediów w v1**. Full fill-media catalog is a Non-Goal.
- Roadmap F-01 outcome: list with densities **and source**, ready to plug into fill mass. Concrete media/sources were the open unknown — locked in this planning session.
- Astro `src/` has no cargo/fill path yet; this change does not migrate catalogs into Astro.

### Key Discoveries:

- Active pipe catalog shape: `{ nps, od (mm), wt (kg/m) }` in `data/piping_catalog.js` — OD present, wall thickness / ID absent (volume math is S-02 / catalog enrichment, not F-01).
- `data/pipes.json` is an unused alternate schedule dump; do not treat it as the fill-media home.
- Rigging catalog already uses `version: 1` at the root — reuse that convention for the fill-media module.

## Desired End State

`data/fill_media_catalog.js` exists and exposes `window.FILL_MEDIA_CATALOG` with exactly four media items, each carrying `id`, `label`, `densityKgPerM3`, `source`, and `notes`. Densities match the locked planning values (0 / 1000 / 1025 / 850). Sources and reference conditions are stored next to each row. Nothing in `index.html` or `app.js` consumes the file yet — S-02 will load and use it.

**Verify by:** opening the file and confirming the four rows + top-level `version` / `unit`; confirming no script-tag or cargo-UI changes; confirming IDs and field names match the S-02 handoff contract below.

## What We're NOT Doing

- Fill selector UI or cargo weight formula (`steel + fill from internal volume`) — that is S-02
- Wiring a `<script>` tag in `index.html` or reading the catalog from `app.js`
- Adding wall thickness / ID to the pipe catalog
- Full fill-media catalog (oils by grade, muds, cement, custom density input)
- Modeling Empty as air (~1.225 kg/m³)
- Astro/`src/` TypeScript ports of this catalog
- Changes to Appliance Ratio formula, auth, or database

## Implementation Approach

Add one static JS module mirroring `window.RIGGING_CATALOG`: versioned root, explicit unit, and an `items` array. Put citation strings and condition caveats in the data itself (not only in `context/`) so the numbers S-02 loads cannot drift from their verification notes. Leave the legacy app unloaded until S-02 intentionally integrates the module.

**Locked media set and values:**

| id | label | densityKgPerM3 | Role |
|---|---|---:|---|
| `empty` | Empty | 0 | Planning convention: zero fill mass (not air) |
| `fresh-water` | Fresh water | 1000 | Pure water max-density / SI convenience (~4 °C, 1 atm) |
| `seawater` | Seawater | 1025 | Typical surface-ocean planning average (~S=35, 1 atm) |
| `light-oil` | Light oil | 850 | Generic petroleum planning value (~15 °C / ~35 °API class); products vary ~800–900 |

**S-02 handoff contract (stable):**

- Global: `window.FILL_MEDIA_CATALOG`
- Root: `{ version: number, unit: "kg/m3", items: FillMediaItem[] }`
- Item: `{ id: string, label: string, densityKgPerM3: number, source: string, notes: string }`
- Stable IDs: `empty` | `fresh-water` | `seawater` | `light-oil`
- Density unit is always kg/m³; fill mass later is `V_m3 × densityKgPerM3`

## Phase 1: Fill-media catalog module

### Overview

Create the verified media list as a loadable data module under `data/`, with per-medium sources and notes.

### Changes Required:

#### 1. Fill media catalog data file

**File**: `data/fill_media_catalog.js`

**Intent**: Introduce the v1 verified fill-media list as a browser-global catalog so S-02 can consume densities and citations without inventing values.

**Contract**:
- Assign `window.FILL_MEDIA_CATALOG` with `version: 1`, `unit: "kg/m3"`, and `items` containing exactly the four rows above.
- Header comment should briefly state purpose (pipe fill mass planning) and that Empty is zero fill mass, not air.
- Each item’s `source` is a one-line citation; `notes` holds reference conditions and caveats.
- Recommended citation content (implementer may tighten wording but must keep the same density values and intent):
  - **empty** — `source`: planning convention, zero fill mass (not air density). `notes`: no fill mass contribution; do not treat as ~1.2 kg/m³ air.
  - **fresh-water** — `source`: Engineering Toolbox / equivalent engineering reference for pure water ≈1000 kg/m³ at 4 °C, 1 atm. `notes`: CIPM/IAPWS max ≈999.97; ~998–999 at 15–20 °C; 1000 is the planning value.
  - **seawater** — `source`: TEOS-10 / ITTC seawater density convention; ~1026 kg/m³ at 15 °C, SA≈35.2 g/kg; store **1025** as surface-average planning value. `notes`: surface range typically ~1020–1029.
  - **light-oil** — `source`: ASTM D1298 density/API gravity reference temperature 15 °C; 850 kg/m³ ≈ mid light-oil / ~35 °API planning value. `notes`: real products typically ~800–900 kg/m³; use SDS/spec when known.
- Do not add fetch/async; plain script assignable like `data/catalog.js`.

### Success Criteria:

#### Automated Verification:

- File exists at `data/fill_media_catalog.js`
- Node can evaluate the file and assert: `version === 1`, `unit === "kg/m3"`, `items.length === 4`, and densities for ids `empty`/`fresh-water`/`seawater`/`light-oil` are `0`/`1000`/`1025`/`850`
- `npm run lint` still passes (no new lint targets required if the file is plain data JS outside ESLint scope; if lint includes it, fix any issues)

#### Manual Verification:

- Spot-check each `source` and `notes` string for clarity and non-empty content
- Confirm file is not referenced from `index.html` or `app.js` in this change

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Handoff verification

### Overview

Record the S-02 contract in the change folder so the next slice can load the catalog without rediscovering field names or density units.

### Changes Required:

#### 1. Change notes handoff

**File**: `context/changes/verified-fill-media-v1/change.md`

**Intent**: Capture the delivered schema, media IDs, and “not wired yet” boundary so S-02 planning/implementation does not re-open F-01 decisions.

**Contract**: Under `## Notes`, document:
- Path: `data/fill_media_catalog.js`
- Global name and root/item field list
- The four ids and densities
- Explicit note: not loaded by `index.html` until S-02
- Pointer to this plan for citation rationale

### Success Criteria:

#### Automated Verification:

- `change.md` still has valid frontmatter with `status: planned` during planning / `status: done` only after archive — for this phase, ensure Notes section is non-empty and mentions `FILL_MEDIA_CATALOG`

#### Manual Verification:

- A reader can answer from Notes alone: where the file lives, which four media exist, density unit, and that UI/calc wiring is out of scope for F-01

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before treating F-01 as ready to archive / hand off to S-02.

---

## Testing Strategy

### Unit Tests:

- No formal test runner in repo yet (AGENTS.md). Use a one-off Node check in Phase 1 automated verification (evaluate script in `vm`/`fs` + assert densities) rather than inventing a test framework.

### Integration Tests:

- None for F-01 — catalog is intentionally unloaded. Integration belongs to S-02 when the script tag and fill math land.

### Manual Testing Steps:

1. Open `data/fill_media_catalog.js` and confirm four items and units.
2. Grep the repo for `FILL_MEDIA_CATALOG` / `fill_media_catalog` — only the new data file and change notes should appear (not `index.html` / `app.js`).
3. Skim sources: each medium has a non-empty citation and a conditions/caveat note.

## Performance Considerations

Negligible — four static rows. No fetch, no parse beyond script evaluation when S-02 loads it.

## Migration Notes

None. Additive file only. S-02 will add the script tag beside existing catalog loads in `index.html` (or equivalent Astro asset path if that slice moves first).

## References

- Roadmap F-01: `context/foundation/roadmap.md`
- PRD FR-002 / Non-Goals: `context/foundation/prd.md`
- Pattern: `data/catalog.js` (`window.RIGGING_CATALOG`)
- Pattern: `data/piping_catalog.js` (`window.PIPING_CATALOG`)
- Consumer (future): S-02 `pipe-fill-cargo-weight`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Fill-media catalog module

#### Automated

- [x] 1.1 File exists at `data/fill_media_catalog.js` — 414d63d
- [x] 1.2 Node evaluation asserts version, unit, four items, and densities 0/1000/1025/850 — 414d63d
- [x] 1.3 `npm run lint` still passes (or confirms file out of lint scope) — 414d63d

#### Manual

- [x] 1.4 Spot-check each `source` and `notes` string for clarity and non-empty content — 414d63d
- [x] 1.5 Confirm file is not referenced from `index.html` or `app.js` in this change — 414d63d

### Phase 2: Handoff verification

#### Automated

- [x] 2.1 `change.md` Notes section mentions `FILL_MEDIA_CATALOG` and is non-empty — 89ab1a2

#### Manual

- [x] 2.2 Reader can answer from Notes alone: path, four media, density unit, and no UI/calc wiring in F-01 — 89ab1a2
