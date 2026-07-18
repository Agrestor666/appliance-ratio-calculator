# Pipe catalog gap candidates

Approval artifact for `cargo-catalog-selection` Phase 1. **Do not edit** `data/piping_catalog.js` until this file’s `## Sign-off` (or equivalent chat confirmation) accepts a set of rows.

Source of truth remains `data/piping_catalog.js` (`PIPING_CATALOG.pipes`). Candidate source: unused `data/pipes.json` (BOM-prefixed JSON; not loaded at runtime).

## Mapping

### Schedule keys

| pipes.json `schedule` | Catalog key |
| ----------------------- | ----------- |
| `Schedule 5S` | `Sch 5S` |
| `Schedule 5` | `Sch 5` |
| `Schedule 10S` | `Sch 10S` |
| `Schedule 10` | `Sch 10` |
| `Schedule 20` | `Sch 20` |
| `Schedule 30` | `Sch 30` |
| `Schedule 40S` | `Sch 40S` |
| `Schedule 40` | `Sch 40` |
| `Schedule 60` | `Sch 60` |
| `Schedule 80S` | `Sch 80S` |
| `Schedule 80` | `Sch 80` |
| `Schedule 100` | `Sch 100` |
| `Schedule 120` | `Sch 120` |
| `Schedule 140` | `Sch 140` |
| `Schedule 160` | `Sch 160` |
| `Standard (STD)` | `STD` |
| `Extra Strong (XS)` | `XS` |
| `Double Extra Strong (XXS)` | `XXS` |

### NPS normalization

| pipes.json `nps` | Catalog `nps` |
| ------------------ | --------------- |
| `0+1/4`, `0+3/8`, `0+1/2`, `0+3/4` | `1/4`, `3/8`, `1/2`, `3/4` |
| `1+1/4`, `1+1/2`, `2+1/2`, `3+1/2` | `1-1/4`, `1-1/2`, `2-1/2`, `3-1/2` |
| integer sizes (`22`, `34`, …) | unchanged |

### Field mapping

| pipes.json | Catalog |
| ---------- | ------- |
| `od_mm` | `od` (mm) |
| `wt_per_m_kg` | `wt` (kg/m) |

### Diff summary (2026-07-18)

| Metric | Count |
| ------ | ----- |
| Catalog pipe rows | 359 |
| pipes.json pipe rows | 379 |
| Overlap (schedule+NPS after normalize) | 347 |
| Overlap weight agree (Δwt ≤ 0.15) | 142 |
| Overlap OD-only rounding | 12 |
| Overlap weight disagree (Δwt > 0.15) — **not proposed for overwrite** | 193 |
| True gaps, non-zero wt → proposed | 27 |
| Gaps with zero wt → skipped | 5 |

## Proposed additions

Proposed catalog shape: `{ nps, od, wt }` under `PIPING_CATALOG.pipes[<schedule>]`.
OD values below use catalog sibling spellings where known (e.g. 22″ → `558.8`, not JSON’s `559`).

### A. Recommended (typical-load)

| schedule | nps | od | wt | source note |
| -------- | --- | -- | -- | ----------- |
| Sch 10S | 22 | 558.8 | 75.62 | pipes.json `Schedule 10S` / `22` (od rounded 559→558.8) |
| Sch 10S | 30 | 762.0 | 147.29 | pipes.json `Schedule 10S` / `30` (od spelled 762→762.0) |
| Sch 120 | 4 | 114.3 | 28.32 | pipes.json `Schedule 120` / `4` |
| Sch 30 | 1/4 | 13.7 | 0.54 | pipes.json `Schedule 30` / `0+1/4` |
| Sch 30 | 3/8 | 17.1 | 0.7 | pipes.json `Schedule 30` / `0+3/8` |
| Sch 40 | 34 | 863.6 | 364.92 | pipes.json `Schedule 40` / `34` (od rounded 864→863.6) |
| Sch 40 | 36 | 914.4 | 420.45 | pipes.json `Schedule 40` / `36` (od rounded 914→914.4) |
| Sch 60 | 22 | 558.8 | 294.27 | pipes.json `Schedule 60` / `22` (od rounded 559→558.8) |
| Sch 80 | 22 | 558.8 | 373.85 | pipes.json `Schedule 80` / `22` (od rounded 559→558.8) |
| Sch 80S | 22 | 558.8 | 171.55 | pipes.json `Schedule 80S` / `22` (od rounded 559→558.8) |
| XXS | 5 | 141.3 | 57.43 | pipes.json `Double Extra Strong (XXS)` / `5` |

Catalog-ready rows:

- `Sch 10S`: `{ nps: "22", od: 558.8, wt: 75.62 }`
- `Sch 10S`: `{ nps: "30", od: 762.0, wt: 147.29 }`
- `Sch 120`: `{ nps: "4", od: 114.3, wt: 28.32 }`
- `Sch 30`: `{ nps: "1/4", od: 13.7, wt: 0.54 }`
- `Sch 30`: `{ nps: "3/8", od: 17.1, wt: 0.7 }`
- `Sch 40`: `{ nps: "34", od: 863.6, wt: 364.92 }`
- `Sch 40`: `{ nps: "36", od: 914.4, wt: 420.45 }`
- `Sch 60`: `{ nps: "22", od: 558.8, wt: 294.27 }`
- `Sch 80`: `{ nps: "22", od: 558.8, wt: 373.85 }`
- `Sch 80S`: `{ nps: "22", od: 558.8, wt: 171.55 }`
- `XXS`: `{ nps: "5", od: 141.3, wt: 57.43 }`

### B. Optional / atypical (review carefully)

Very large NPS (38–48″) or heavy-wall Sch 100–160 @ 22″. Weaker provenance; easy to accept later if needed.

| schedule | nps | od | wt | source note |
| -------- | --- | -- | -- | ----------- |
| Sch 100 | 22 | 558.8 | 451.45 | pipes.json `Schedule 100` / `22` (od rounded 559→558.8) |
| Sch 120 | 22 | 558.8 | 527.05 | pipes.json `Schedule 120` / `22` (od rounded 559→558.8) |
| Sch 140 | 22 | 558.8 | 600.67 | pipes.json `Schedule 140` / `22` (od rounded 559→558.8) |
| Sch 160 | 22 | 558.8 | 672.3 | pipes.json `Schedule 160` / `22` (od rounded 559→558.8) |
| STD | 38 | 965.2 | 224.56 | pipes.json `Standard (STD)` / `38` (od rounded 965→965.2) |
| STD | 40 | 1016 | 236.54 | pipes.json `Standard (STD)` / `40` |
| STD | 42 | 1066.8 | 248.53 | pipes.json `Standard (STD)` / `42` (od rounded 1067→1066.8) |
| STD | 44 | 1117.6 | 260.52 | pipes.json `Standard (STD)` / `44` (od rounded 1118→1117.6) |
| STD | 46 | 1168.4 | 272.27 | pipes.json `Standard (STD)` / `46` (od rounded 1168→1168.4) |
| STD | 48 | 1219.2 | 284.25 | pipes.json `Standard (STD)` / `48` (od rounded 1219→1219.2) |
| XS | 38 | 965.2 | 298.26 | pipes.json `Extra Strong (XS)` / `38` (od rounded 965→965.2) |
| XS | 40 | 1016 | 314.23 | pipes.json `Extra Strong (XS)` / `40` |
| XS | 42 | 1066.8 | 330.21 | pipes.json `Extra Strong (XS)` / `42` (od rounded 1067→1066.8) |
| XS | 44 | 1117.6 | 346.18 | pipes.json `Extra Strong (XS)` / `44` (od rounded 1118→1117.6) |
| XS | 46 | 1168.4 | 361.84 | pipes.json `Extra Strong (XS)` / `46` (od rounded 1168→1168.4) |
| XS | 48 | 1219.2 | 377.81 | pipes.json `Extra Strong (XS)` / `48` (od rounded 1219→1219.2) |

Catalog-ready rows:

- `Sch 100`: `{ nps: "22", od: 558.8, wt: 451.45 }`
- `Sch 120`: `{ nps: "22", od: 558.8, wt: 527.05 }`
- `Sch 140`: `{ nps: "22", od: 558.8, wt: 600.67 }`
- `Sch 160`: `{ nps: "22", od: 558.8, wt: 672.3 }`
- `STD`: `{ nps: "38", od: 965.2, wt: 224.56 }`
- `STD`: `{ nps: "40", od: 1016, wt: 236.54 }`
- `STD`: `{ nps: "42", od: 1066.8, wt: 248.53 }`
- `STD`: `{ nps: "44", od: 1117.6, wt: 260.52 }`
- `STD`: `{ nps: "46", od: 1168.4, wt: 272.27 }`
- `STD`: `{ nps: "48", od: 1219.2, wt: 284.25 }`
- `XS`: `{ nps: "38", od: 965.2, wt: 298.26 }`
- `XS`: `{ nps: "40", od: 1016, wt: 314.23 }`
- `XS`: `{ nps: "42", od: 1066.8, wt: 330.21 }`
- `XS`: `{ nps: "44", od: 1117.6, wt: 346.18 }`
- `XS`: `{ nps: "46", od: 1168.4, wt: 361.84 }`
- `XS`: `{ nps: "48", od: 1219.2, wt: 377.81 }`

## Skipped

### Zero weight in pipes.json

| schedule | nps | od | wt | reason |
| -------- | --- | -- | -- | ------ |
| Sch 40S | 22 | 559 | 0 | zero wt in pipes.json (PIPE40S / Schedule 40S) |
| Sch 40S | 30 | 762 | 0 | zero wt in pipes.json (PIPE40S / Schedule 40S) |
| Sch 5S | 1/4 | 13.7 | 0 | zero wt in pipes.json (PIPE5S / Schedule 5S) |
| Sch 5S | 3/8 | 17.1 | 0 | zero wt in pipes.json (PIPE5S / Schedule 5S) |
| Sch 80S | 30 | 762 | 0 | zero wt in pipes.json (PIPE80S / Schedule 80S) |

### Conflict policy (existing catalog rows)

**193** schedule+NPS pairs exist in both sources with weight disagreement > 0.15 kg/m (max Δwt ≈ 308). Per plan: **do not overwrite** `PIPING_CATALOG` weights from `pipes.json`. These are not listed as additions.

Notable: Sch 5 / Sch 5S / Sch 30 / heavy schedules show systematic wt drift vs the active catalog — another reason to treat JSON as candidate-only.

### Out of scope

- Fittings / flanges / valves (no alternate dump)
- Wall thickness / ID enrichment (S-02)
- Loading `pipes.json` at runtime

## Sign-off

Record the decision below (or confirm the same choice in chat) **before Phase 2**.

| Field | Value |
| ----- | ----- |
| Decision | `accept recommended (A)` |
| Accepted rows | all of A (11 rows): Sch 10S 22 & 30; Sch 120 4; Sch 30 1/4 & 3/8; Sch 40 34 & 36; Sch 60/80/80S 22; XXS 5 |
| Rejected / deferred | all of B deferred (Sch 100–160 @ 22″; STD/XS 38–48″) |
| Signed by | user (chat) |
| Date | 2026-07-18 |

Phase 2 will add **only** accepted rows into `data/piping_catalog.js` (add-only; existing objects untouched).

### Post-apply note (impl-review F1)

Add-only inserts for **Sch 10S NPS 22** (`wt: 75.62`) and **Sch 80S NPS 22** (`wt: 171.55`) are source-faithful to `pipes.json`, but sit between larger pre-existing *S neighbors that appear aliased from the matching non-S schedule. Result: kg/m is non-monotonic across 20 → 22 → 24 for those two series. Per conflict policy, neighbors were **not** overwritten. Planners comparing adjacent large NPS on Sch 10S / Sch 80S should treat the series as mixed provenance.
