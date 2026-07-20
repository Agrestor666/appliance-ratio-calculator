# Schedule weight candidates

Approval artifact for `full-schedule-flange-fitting` Phase 1. **Do not edit** `src/lib/data/piping-catalog.js` or `legacy/data/piping_catalog.js` until this file’s `## Sign-off` (or equivalent chat confirmation) accepts a set of rows.

Goal (roadmap S-07): expand Weld Neck flanges and in-catalog BW fittings toward the **18 pipe schedule keys**. **Fittings** stay manufacturer-chart only (omit when no cell). **Weld Neck** keeps chart masses for `STD` / `Sch 40` / `Sch 40S` and **calculates** missing schedule×NPS masses via the bore-metal Δm model below. Success is **max coverage under this dual policy + honest Skip list**, not a hard every-type×18 gate.

## Sources

| # | Source | What it provides | Units / material | URL or path |
| --- | --- | --- | --- | --- |
| S1 | Wermac.org BW fitting weight tables (**Hackney Ladish, Inc.**) | Elbows / returns / 3D / tees / caps / reducers — STD / XS / Sch 160 / XXS where published (chart) | kg/pc (approx.), carbon steel BW | https://www.wermac.org/fittings/weights_bw_elbows.html ; …/weights_bw_elbows_180.html ; …/weights_bw_elbows_3d.html ; …/weights_bw_tees.html ; …/dim_caps.html ; …/weights_bw_reducers.html ; …/weights_bw_reducers_xs.html ; …/weights_bw_reducers_160.html ; …/weights_bw_reducers_xxs.html |
| S2 | Catalog WN `STD` (from S-05 / Wermac–Texas chart) | Weld Neck baseline mass per class×NPS — **not overwritten**; Δm baseline for calculated schedules | kg/pc (approx.), RF carbon steel A105 | `src/lib/data/piping-catalog.js` → `flanges["Weld Neck"][class].STD` ; original chart https://www.wermac.org/flanges/weightchart_asme_b16-5.html |
| S3 | `flanges/FLG{150,300,600,900,1500,2500}.csv` | Per-NPS `wn thk` (mm) used as cylinder length L for WN Δm; CSV `wn kg` is **not** the mass baseline | mm (geometry) | `flanges/FLG150.csv` … `FLG2500.csv` |
| S4 | Catalog pipe `od` / `t` | OD and wall for STD and target schedule at each NPS (ID = OD − 2t) | mm | `src/lib/data/piping-catalog.js` → `pipes[schedule]` |
| S5 | Archived S-04 / S-05 candidates + Sign-off | Prior Accept of STD/XS/Sch40/80 aliases + Sch160/XXS for core types; WN Sch40/40S/STD nest (chart) | n/a | `context/archive/2026-07-18-b16-9-fitting-catalog-schedule/fitting-weight-candidates.md` ; `context/archive/2026-07-18-b16-5-flange-catalog/flange-weight-candidates.md` |

Notes:

- Fitting proposed numbers use **S1 (chart)**. WN baseline uses **S2 (catalog STD)**; WN non-baseline proposals use **calculated** masses from S2 + S3 + S4.
- Material assumption: **carbon steel** BW fittings / **A105 RF** flanges — same as S-04/S-05.
- Calculated WN kg/pc are a cylindrical bore-metal approximation — **not** claimed as ASME B16.5 manufacturer schedule-specific masses.
- ASME B16.9 / B16.5 PDFs are **not** mass sources (dimensions/tolerances only).

## Schedule keys

Pipe catalog vocabulary (18 keys) — proposed fitting/WN schedules must use these strings only:

| Catalog key | This change — proposal rule |
| --- | --- |
| `Sch 5S` … `Sch 30`, `Sch 60`, `Sch 100`–`Sch 140` | Fittings: no S1 cells → **Skipped**. WN: **calculate** when pipe `od`/`t` + `wn thk` + STD baseline exist; else Skip |
| `Sch 40S` | Fittings: propose alias copies for returns / 3D / long stub (≤10″) from catalog Sch 40. WN: already chart-present — keep |
| `Sch 40` | Already in catalog (fitting + WN chart) — no rewrite |
| `Sch 80S` | Fittings: propose alias copies for returns / 3D / long stub (≤8″) from catalog Sch 80. WN: **calculate** (missing from chart nest) |
| `Sch 80` / `XS` / `Sch 160` / `XXS` | Fittings: chart where published (reducers Sch 160/XXS proposed). WN: **calculate** missing schedules |
| `STD` | Already in catalog — WN Δm baseline; no rewrite |

Do **not** invent `Sch 20S`. Do not invent fitting masses. Do not invent pipe `t` or `wn thk`.

## WN calc contract

Locked model for **Weld Neck** schedules that do **not** already have chart rows (`STD` / `Sch 40` / `Sch 40S` kept as-is):

1. **Scope:** each catalog WN class × each NPS that has a catalog `STD` mass × each missing schedule among the 18 keys.
2. **Inputs required:** pipe row with numeric `od` and `t` for both `STD` and target `sch` at that NPS; numeric `wn thk` (mm) from `flanges/FLG{class}.csv` for that NPS; numeric catalog `STD` `wt`.
3. **Geometry:** `ID = OD − 2t` (mm). Convert lengths to metres for volume.
4. **Volume delta:** `ΔV = (π/4) · L · (ID_STD² − ID_sch²)` with `L = wn thk` (same OD for STD and sch).
5. **Mass delta:** `Δm = ρ · ΔV` with `ρ = 7850 kg/m³`.
6. **Result:** `wt = max(wt_STD + Δm, 0.01)` then round to **1 decimal** kg (catalog presentation).
7. **Source note:** `calculated (ρ=7850, L=wn thk)`.
8. **Skip when:** missing pipe `t`/`od`, missing `wn thk`, no STD baseline, OD mismatch, or Class 400 (out of scope).
9. **Do not** overwrite existing chart `STD` / `Sch 40` / `Sch 40S` rows. CSV `wn kg` is geometry context only — not the Δm base.

## Gap inventory

Snapshot from `src/lib/data/piping-catalog.js` (2026-07-19).

### Fittings — present vs missing of 18

| type | present schedules | missing of 18 |
| --- | --- | --- |
| 90° LR Elbow | Sch 40S, Sch 40, Sch 80S, Sch 80, Sch 160, STD, XS, XXS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 100, Sch 120, Sch 140 |
| 90° SR Elbow | Sch 40S, Sch 40, Sch 80S, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 100, Sch 120, Sch 140, Sch 160, XXS |
| 45° LR Elbow | Sch 40S, Sch 40, Sch 80S, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 100, Sch 120, Sch 140, Sch 160, XXS |
| 180° LR Return | Sch 40, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 40S, Sch 60, Sch 80S, Sch 100, Sch 120, Sch 140, Sch 160, XXS |
| 180° SR Return | Sch 40, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 40S, Sch 60, Sch 80S, Sch 100, Sch 120, Sch 140, Sch 160, XXS |
| 90° 3D Elbow | Sch 40, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 40S, Sch 60, Sch 80S, Sch 100, Sch 120, Sch 140, Sch 160, XXS |
| 45° 3D Elbow | Sch 40, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 40S, Sch 60, Sch 80S, Sch 100, Sch 120, Sch 140, Sch 160, XXS |
| Equal Tee | Sch 40S, Sch 40, Sch 80S, Sch 80, Sch 160, STD, XS, XXS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 100, Sch 120, Sch 140 |
| Cap | Sch 40S, Sch 40, Sch 80S, Sch 80, Sch 160, STD, XS, XXS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 100, Sch 120, Sch 140 |
| Concentric Reducer | Sch 40S, Sch 40, Sch 80S, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 100, Sch 120, Sch 140, Sch 160, XXS |
| Eccentric Reducer | Sch 40S, Sch 40, Sch 80S, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 100, Sch 120, Sch 140, Sch 160, XXS |
| Lap Joint Stub End (Long) | Sch 40, Sch 80, STD, XS | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 40S, Sch 60, Sch 80S, Sch 100, Sch 120, Sch 140, Sch 160, XXS |

### Weld Neck — present vs missing of 18 (per class)

| class | present schedules | missing of 18 |
| --- | --- | --- |
| 150 | Sch 40S, Sch 40, STD | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 80S, Sch 80, Sch 100, Sch 120, Sch 140, Sch 160, XS, XXS |
| 300 | Sch 40S, Sch 40, STD | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 80S, Sch 80, Sch 100, Sch 120, Sch 140, Sch 160, XS, XXS |
| 600 | Sch 40S, Sch 40, STD | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 80S, Sch 80, Sch 100, Sch 120, Sch 140, Sch 160, XS, XXS |
| 900 | Sch 40S, Sch 40, STD | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 80S, Sch 80, Sch 100, Sch 120, Sch 140, Sch 160, XS, XXS |
| 1500 | Sch 40S, Sch 40, STD | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 80S, Sch 80, Sch 100, Sch 120, Sch 140, Sch 160, XS, XXS |
| 2500 | Sch 40S, Sch 40, STD | Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 80S, Sch 80, Sch 100, Sch 120, Sch 140, Sch 160, XS, XXS |

### Out of schedule-nest scope (unchanged)

- Slip-On / Blind remain class-only (no schedule nest) — deferred from this change by design.
- Socket Weld / Threaded / Lap Joint flanges remain hidden / deferred (S-05).
- Class 400: out of scope (not in current catalog classes).

## Proposed rows

Only **new** rows not already present as schedule keys in the live catalog. Nested shape after apply: `fittings[type][schedule] = [{ nps, wt }]`; `flanges["Weld Neck"][class][schedule] = [{ nps, wt }]`.

### Coverage summary

| Metric | Count |
| --- | --- |
| A. recommended (new fitting chart cells) | 118 |
| B. needs review (fitting alias extensions) | 108 |
| C. WN calculated (missing schedules) | 1280 |
| Skipped schedule×type/class combos (listed) | 135 |
| Chart cells omitted (NPS pair outside current matrix) | 64 |
| WN per-NPS Skip cells (input gaps) | 355 |
| Schedules with new proposed rows | Sch 160, XXS, Sch 40S, Sch 80S, Sch 5S, Sch 5, Sch 10S, Sch 10, Sch 20, Sch 30, Sch 60, Sch 80, Sch 100, Sch 120, Sch 140, XS |

### A. Recommended (fittings — chart)

Concentric + Eccentric reducer **Sch 160** and **XXS** from S1 (same wt for con/ecc). Intersected with NPS pairs already present under Sch 40/STD/Sch 80/XS so this change does not expand the reducer matrix.

| kind | type | schedule | nps | wt | source note |
| --- | --- | --- | --- | --- | --- |
| fitting | Concentric Reducer | Sch 160 | 3/4x1/2 | 0.13 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 1x1/2 | 0.23 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 1x3/4 | 0.23 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 1-1/4x1/2 | 0.27 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 1-1/4x3/4 | 0.29 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 1-1/4x1 | 0.29 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 1-1/2x1/2 | 0.33 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 1-1/2x3/4 | 0.34 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 1-1/2x1 | 0.36 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 2x3/4 | 0.66 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 2x1 | 0.68 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 2-1/2x1 | 1 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 2-1/2x2 | 1.13 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 3x2 | 1.54 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 4x2 | 2.45 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 4x3 | 2.9 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 5x2 | 4.54 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 5x3 | 4.99 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 5x4 | 5.67 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 6x3 | 7.03 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 6x4 | 7.48 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 6x5 | 8.5 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 8x4 | 10.66 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 8x5 | 12.34 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 8x6 | 14.06 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 10x4 | 22.68 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 10x5 | 23.59 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 10x6 | 24.49 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 10x8 | 26.08 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 12x5 | 36.29 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 12x6 | 37.65 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 12x8 | 39.46 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | Sch 160 | 12x10 | 43.54 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Concentric Reducer | XXS | 1x1/2 | 0.34 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 1x3/4 | 0.36 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 1-1/4x1/2 | 0.45 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 1-1/4x3/4 | 0.45 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 1-1/4x1 | 0.45 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 1-1/2x1/2 | 0.57 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 1-1/2x3/4 | 0.63 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 1-1/2x1 | 0.68 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 2x3/4 | 0.91 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 2x1 | 0.98 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 2-1/2x1 | 1.59 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 2-1/2x2 | 1.81 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 3x2 | 2.27 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 3-1/2x2 | 3.18 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 3-1/2x3 | 3.63 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 4x2 | 3.74 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 4x3 | 4.08 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 5x2 | 6.35 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 5x3 | 6.58 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 5x4 | 7.26 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 6x3 | 9.07 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 6x4 | 9.98 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 6x5 | 10.43 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 8x4 | 14.97 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 8x5 | 15.88 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Concentric Reducer | XXS | 8x6 | 16.33 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 3/4x1/2 | 0.13 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 1x1/2 | 0.23 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 1x3/4 | 0.23 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 1-1/4x1/2 | 0.27 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 1-1/4x3/4 | 0.29 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 1-1/4x1 | 0.29 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 1-1/2x1/2 | 0.33 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 1-1/2x3/4 | 0.34 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 1-1/2x1 | 0.36 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 2x3/4 | 0.66 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 2x1 | 0.68 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 2-1/2x1 | 1 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 2-1/2x2 | 1.13 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 3x2 | 1.54 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 4x2 | 2.45 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 4x3 | 2.9 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 5x2 | 4.54 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 5x3 | 4.99 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 5x4 | 5.67 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 6x3 | 7.03 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 6x4 | 7.48 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 6x5 | 8.5 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 8x4 | 10.66 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 8x5 | 12.34 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 8x6 | 14.06 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 10x4 | 22.68 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 10x5 | 23.59 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 10x6 | 24.49 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 10x8 | 26.08 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 12x5 | 36.29 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 12x6 | 37.65 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 12x8 | 39.46 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | Sch 160 | 12x10 | 43.54 | chart Wermac/Hackney Ladish Sch 160 (con=ecc) |
| fitting | Eccentric Reducer | XXS | 1x1/2 | 0.34 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 1x3/4 | 0.36 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 1-1/4x1/2 | 0.45 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 1-1/4x3/4 | 0.45 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 1-1/4x1 | 0.45 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 1-1/2x1/2 | 0.57 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 1-1/2x3/4 | 0.63 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 1-1/2x1 | 0.68 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 2x3/4 | 0.91 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 2x1 | 0.98 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 2-1/2x1 | 1.59 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 2-1/2x2 | 1.81 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 3x2 | 2.27 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 3-1/2x2 | 3.18 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 3-1/2x3 | 3.63 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 4x2 | 3.74 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 4x3 | 4.08 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 5x2 | 6.35 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 5x3 | 6.58 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 5x4 | 7.26 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 6x3 | 9.07 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 6x4 | 9.98 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 6x5 | 10.43 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 8x4 | 14.97 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 8x5 | 15.88 | chart Wermac/Hackney Ladish XXS (con=ecc) |
| fitting | Eccentric Reducer | XXS | 8x6 | 16.33 | chart Wermac/Hackney Ladish XXS (con=ecc) |

### B. Needs review (fittings — alias)

Sch 40S / Sch 80S **alias** extensions for Bucket-B types that already have Sch 40/80 in catalog but never received the S-suffix aliases in S-04. Same B36.19 wall-equality limits as S-04 (≤10″ / ≤8″). Weights copied from existing catalog Sch 40 / Sch 80 rows (already signed).

| kind | type | schedule | nps | wt | source note |
| --- | --- | --- | --- | --- | --- |
| fitting | 180° LR Return | Sch 40S | 1/2 | 0.16 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 3/4 | 0.18 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 1 | 0.34 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 1-1/4 | 0.57 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 1-1/2 | 0.85 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 2 | 1.47 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 2-1/2 | 2.95 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 3 | 4.65 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 3-1/2 | 5.9 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 4 | 8.39 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 5 | 13.61 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 6 | 22.68 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 8 | 43.09 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 40S | 10 | 53.07 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 3/4 | 0.29 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 1 | 0.45 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 1-1/4 | 0.79 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 1-1/2 | 1.08 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 2 | 2 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 2-1/2 | 3.63 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 3 | 5.9 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 3-1/2 | 7.6 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 4 | 11.34 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 5 | 19.96 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 6 | 31.75 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° LR Return | Sch 80S | 8 | 64.41 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 1 | 0.23 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 1-1/4 | 0.36 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 1-1/2 | 0.51 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 2 | 0.91 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 2-1/2 | 1.93 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 3 | 2.72 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 3-1/2 | 4.08 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 4 | 5.67 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 5 | 8.62 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 6 | 15.88 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 8 | 30.84 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 40S | 10 | 52.16 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 1-1/2 | 0.68 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 2 | 1.36 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 2-1/2 | 2.54 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 3 | 3.86 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 3-1/2 | 5.44 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 4 | 7.71 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 5 | 12.7 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 6 | 20.87 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 180° SR Return | Sch 80S | 8 | 45.36 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 2 | 0.68 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 2-1/2 | 1.36 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 3 | 2.27 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 3-1/2 | 3.18 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 4 | 4.08 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 5 | 6.8 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 6 | 10.43 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 8 | 20.41 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 40S | 10 | 36.29 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 80S | 2 | 0.95 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 80S | 2-1/2 | 1.81 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 80S | 3 | 3.18 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 80S | 3-1/2 | 4.08 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 80S | 4 | 5.9 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 80S | 5 | 9.98 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 80S | 6 | 15.88 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 45° 3D Elbow | Sch 80S | 8 | 31.75 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 2 | 1.36 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 2-1/2 | 2.72 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 3 | 4.54 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 3-1/2 | 5.9 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 4 | 8.16 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 5 | 13.15 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 6 | 20.41 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 8 | 40.82 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 40S | 10 | 72.12 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 80S | 2 | 1.81 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 80S | 2-1/2 | 3.63 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 80S | 3 | 5.9 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 80S | 3-1/2 | 8.16 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 80S | 4 | 11.34 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 80S | 5 | 19.5 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 80S | 6 | 31.75 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | 90° 3D Elbow | Sch 80S | 8 | 63.5 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 1/2 | 0.16 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 3/4 | 0.23 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 1 | 0.35 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 1-1/4 | 0.5 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 1-1/2 | 0.61 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 2 | 1.1 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 2-1/2 | 1.5 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 3 | 2.1 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 3-1/2 | 2.5 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 4 | 3 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 5 | 5.4 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 6 | 7.3 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 8 | 11.6 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 40S | 10 | 18 | chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 1/2 | 0.2 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 3/4 | 0.3 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 1 | 0.4 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 1-1/4 | 0.6 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 1-1/2 | 0.7 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 2 | 1.4 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 2-1/2 | 2 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 3 | 2.9 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 3-1/2 | 3.4 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 4 | 4.1 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 5 | 7.5 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 6 | 10 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |
| fitting | Lap Joint Stub End (Long) | Sch 80S | 8 | 16 | chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy |

### C. Weld Neck — calculated

Missing schedules per class×NPS where inputs exist. Chart `STD` / `Sch 40` / `Sch 40S` are **not** listed (kept as-is). Source note is always `calculated (ρ=7850, L=wn thk)`.

| kind | class | schedule | nps | wt | source note |
| --- | --- | --- | --- | --- | --- |
| wn | 150 | Sch 5S | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 3/4 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 1 | 1.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 1-1/4 | 1.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 1-1/2 | 1.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 2 | 2.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 2-1/2 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 3 | 4.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 3-1/2 | 4.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 4 | 6.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 5 | 8.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 6 | 10.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 8 | 16.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 10 | 20.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 12 | 34.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 14 | 45.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 16 | 56.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 18 | 66.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 20 | 80.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5S | 24 | 111.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 3/4 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 1 | 1.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 1-1/4 | 1.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 1-1/2 | 1.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 2 | 2.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 2-1/2 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 3 | 4.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 3-1/2 | 4.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 4 | 6.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 5 | 8.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 6 | 10.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 8 | 16.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 10 | 20.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 12 | 34.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 14 | 45.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 16 | 56.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 18 | 66.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 20 | 80.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 5 | 24 | 111.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 3/4 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 1 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 1-1/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 1-1/2 | 1.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 2 | 2.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 2-1/2 | 4.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 3 | 4.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 3-1/2 | 5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 4 | 6.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 5 | 8.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 6 | 10.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 8 | 16.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 10 | 21 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 12 | 35.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 14 | 46.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 16 | 57.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 18 | 67.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 20 | 81.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10S | 24 | 113.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 3/4 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 1 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 1-1/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 1-1/2 | 1.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 2 | 2.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 2-1/2 | 4.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 3 | 4.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 3-1/2 | 5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 4 | 6.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 5 | 8.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 6 | 10.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 8 | 16.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 10 | 21 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 12 | 35.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 14 | 48 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 16 | 59.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 18 | 69.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 20 | 83.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 10 | 24 | 113.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 20 | 8 | 18 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 20 | 10 | 22.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 20 | 12 | 36.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 20 | 14 | 49.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 20 | 16 | 61.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 20 | 18 | 71.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 20 | 20 | 88.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 20 | 24 | 120.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 3/4 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 1 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 1-1/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 1-1/2 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 2 | 2.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 2-1/2 | 4.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 3 | 5.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 3-1/2 | 5.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 4 | 7.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 8 | 18.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 10 | 23.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 12 | 38.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 14 | 51.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 16 | 63 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 18 | 76.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 20 | 94.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 30 | 24 | 130.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 60 | 8 | 20 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 60 | 10 | 26.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 60 | 12 | 43.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 60 | 14 | 57 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 60 | 16 | 71.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 60 | 18 | 88.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 60 | 20 | 107.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 60 | 24 | 152.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 3/4 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 1 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 1-1/4 | 1.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 1-1/2 | 1.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 2 | 2.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 2-1/2 | 4.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 3 | 5.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 3-1/2 | 5.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 4 | 7.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 5 | 10.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 6 | 12.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 8 | 21.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 10 | 26.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 12 | 42.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 14 | 54.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 16 | 66.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 18 | 79 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 20 | 94.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80S | 24 | 127.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 3/4 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 1 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 1-1/4 | 1.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 1-1/2 | 1.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 2 | 2.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 2-1/2 | 4.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 3 | 5.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 3-1/2 | 5.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 4 | 7.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 5 | 10.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 6 | 12.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 8 | 21.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 10 | 27.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 12 | 46.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 14 | 60.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 16 | 76.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 18 | 94.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 20 | 116.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 80 | 24 | 166 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 100 | 8 | 22.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 100 | 10 | 29.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 100 | 12 | 49.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 100 | 14 | 65.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 100 | 16 | 82 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 100 | 18 | 102.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 100 | 20 | 126.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 100 | 24 | 182 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 4 | 8.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 5 | 11.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 6 | 14 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 8 | 23.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 10 | 31.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 12 | 52.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 14 | 69.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 16 | 87.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 18 | 110 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 20 | 135.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 120 | 24 | 195.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 140 | 8 | 24.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 140 | 10 | 33.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 140 | 12 | 54.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 140 | 14 | 72.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 140 | 16 | 93 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 140 | 18 | 116.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 140 | 20 | 144.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 140 | 24 | 208 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 3/4 | 1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 1 | 1.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 1-1/4 | 1.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 1-1/2 | 2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 2 | 3.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 2-1/2 | 4.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 3 | 5.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 4 | 8.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 5 | 11.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 6 | 15.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 8 | 25.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 10 | 35.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 12 | 58.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 14 | 76.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 16 | 97 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 18 | 123.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 20 | 152.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | Sch 160 | 24 | 221.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 3/4 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 1 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 1-1/4 | 1.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 1-1/2 | 1.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 2 | 2.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 2-1/2 | 4.7 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 3 | 5.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 3-1/2 | 5.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 4 | 7.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 5 | 10.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 6 | 12.9 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 8 | 21.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 10 | 26.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 12 | 42.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 14 | 54.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 16 | 66.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 18 | 79 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 20 | 94.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XS | 24 | 127.5 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 1/2 | 1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 3/4 | 1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 1 | 1.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 1-1/4 | 1.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 1-1/2 | 2.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 2-1/2 | 5.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 3 | 6.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 4 | 9.3 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 5 | 12.6 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 6 | 16.1 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 8 | 25.4 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 10 | 33.8 | calculated (ρ=7850, L=wn thk) |
| wn | 150 | XXS | 12 | 52.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 1 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 1-1/4 | 4.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 1-1/2 | 6.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 2 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 2-1/2 | 15.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 3 | 20.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 4 | 31.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 6 | 71.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 8 | 117.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 10 | 195.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 12 | 298.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 14 | 409 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 16 | 546.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 18 | 712.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 20 | 901.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5S | 24 | 1472.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 1 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 1-1/4 | 4.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 1-1/2 | 6.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 2 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 2-1/2 | 15.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 3 | 20.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 4 | 31.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 6 | 71.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 8 | 117.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 10 | 195.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 12 | 298.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 14 | 409 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 16 | 546.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 18 | 712.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 20 | 901.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 5 | 24 | 1472.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 1 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 1-1/4 | 4.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 1-1/2 | 6.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 2 | 11.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 2-1/2 | 15.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 3 | 21 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 4 | 31.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 6 | 71.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 8 | 119 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 10 | 196.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 12 | 299.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 14 | 411.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 16 | 548.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 18 | 714.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 20 | 905.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10S | 24 | 1477.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 1 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 1-1/4 | 4.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 1-1/2 | 6.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 2 | 11.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 2-1/2 | 15.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 3 | 21 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 4 | 31.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 6 | 71.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 8 | 119 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 10 | 196.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 12 | 299.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 14 | 415.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 16 | 553 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 18 | 720 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 20 | 908.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 10 | 24 | 1477.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 20 | 8 | 121.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 20 | 10 | 200.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 20 | 12 | 303.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 20 | 14 | 419 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 20 | 16 | 557.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 20 | 18 | 725.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 20 | 20 | 922.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 20 | 24 | 1496 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 1 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 1-1/4 | 4.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 1-1/2 | 6.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 2 | 11.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 2-1/2 | 16.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 3 | 21.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 4 | 32.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 8 | 122.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 10 | 202.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 12 | 308 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 14 | 423 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 16 | 562.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 18 | 736.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 20 | 936 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 30 | 24 | 1523.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 60 | 8 | 126 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 60 | 10 | 210.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 60 | 12 | 320.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 60 | 14 | 436.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 60 | 16 | 583.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 60 | 18 | 764.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 60 | 20 | 969 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 60 | 24 | 1582.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 1 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 1-1/4 | 4.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 1-1/2 | 6.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 2 | 11.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 2-1/2 | 16.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 3 | 22.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 4 | 33.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 6 | 76.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 8 | 128.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 10 | 210.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 12 | 317.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 14 | 430.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 16 | 571.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 18 | 742.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 20 | 936 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80S | 24 | 1514.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 1 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 1-1/4 | 4.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 1-1/2 | 6.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 2 | 11.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 2-1/2 | 16.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 3 | 22.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 4 | 33.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 6 | 76.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 8 | 128.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 10 | 213.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 12 | 327 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 14 | 445.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 16 | 596.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 18 | 780.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 20 | 991.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 80 | 24 | 1618.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 100 | 8 | 130.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 100 | 10 | 218.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 100 | 12 | 334.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 100 | 14 | 456.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 100 | 16 | 609.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 100 | 18 | 798.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 100 | 20 | 1016.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 100 | 24 | 1661 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 4 | 34.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 6 | 78.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 8 | 134 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 10 | 223.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 12 | 342.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 14 | 465.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 16 | 622.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 18 | 815.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 20 | 1038 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 120 | 24 | 1698.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 140 | 8 | 136.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 140 | 10 | 228.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 140 | 12 | 348.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 140 | 14 | 474.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 140 | 16 | 637.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 140 | 18 | 830.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 140 | 20 | 1061.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 140 | 24 | 1730.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 3/4 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 1 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 1-1/4 | 4.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 1-1/2 | 6.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 2 | 11.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 2-1/2 | 16.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 3 | 22.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 4 | 35.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 6 | 81 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 8 | 138.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 10 | 233.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 12 | 357.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 14 | 482.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 16 | 647.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 18 | 847.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 20 | 1081.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | Sch 160 | 24 | 1766.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 1 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 1-1/4 | 4.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 1-1/2 | 6.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 2 | 11.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 2-1/2 | 16.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 3 | 22.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 4 | 33.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 6 | 76.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 8 | 128.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 10 | 210.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 12 | 317.2 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 14 | 430.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 16 | 571.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 18 | 742.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 20 | 936 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XS | 24 | 1514.6 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 1/2 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 3/4 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 1 | 4.3 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 1-1/4 | 4.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 1-1/2 | 6.8 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 2 | 12.1 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 2-1/2 | 17.4 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 3 | 23.5 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 4 | 36 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 6 | 83 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 8 | 137.7 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 10 | 228.9 | calculated (ρ=7850, L=wn thk) |
| wn | 1500 | XXS | 12 | 342.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 3/4 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 1 | 5.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 1-1/4 | 8.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 1-1/2 | 12.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 2 | 18.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 2-1/2 | 22.7 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 3 | 41.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 4 | 63.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 6 | 165.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 8 | 250.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 10 | 464.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5S | 12 | 703.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 3/4 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 1 | 5.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 1-1/4 | 8.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 1-1/2 | 12.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 2 | 18.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 2-1/2 | 22.7 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 3 | 41.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 4 | 63.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 6 | 165.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 8 | 250.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 10 | 464.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 5 | 12 | 703.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 3/4 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 1 | 5.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 1-1/4 | 8.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 1-1/2 | 12.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 2 | 18.7 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 2-1/2 | 22.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 3 | 41.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 4 | 64.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 6 | 166.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 8 | 252 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 10 | 467 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10S | 12 | 706 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 3/4 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 1 | 5.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 1-1/4 | 8.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 1-1/2 | 12.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 2 | 18.7 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 2-1/2 | 22.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 3 | 41.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 4 | 64.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 6 | 166.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 8 | 252 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 10 | 467 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 10 | 12 | 706 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 20 | 8 | 256.3 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 20 | 10 | 472.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 20 | 12 | 712.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 3/4 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 1 | 5.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 1-1/4 | 9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 1-1/2 | 12.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 2 | 18.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 2-1/2 | 23.3 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 3 | 42.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 4 | 65.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 8 | 257.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 10 | 476.7 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 30 | 12 | 719.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 60 | 8 | 262.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 60 | 10 | 489.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 60 | 12 | 739.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 3/4 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 1 | 6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 1-1/4 | 9.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 1-1/2 | 12.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 2 | 19.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 2-1/2 | 23.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 3 | 43 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 4 | 66.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 6 | 174 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 8 | 266.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 10 | 489.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80S | 12 | 734.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 3/4 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 1 | 6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 1-1/4 | 9.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 1-1/2 | 12.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 2 | 19.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 2-1/2 | 23.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 3 | 43 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 4 | 66.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 6 | 174 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 8 | 266.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 10 | 495.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 80 | 12 | 750.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 100 | 8 | 269.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 100 | 10 | 503.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 100 | 12 | 763.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 120 | 4 | 68 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 120 | 6 | 177.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 120 | 8 | 274.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 120 | 10 | 511.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 120 | 12 | 776.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 140 | 8 | 277.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 140 | 10 | 520.3 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 140 | 12 | 785.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 3/4 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 1 | 6.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 1-1/4 | 9.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 1-1/2 | 13 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 2 | 19.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 2-1/2 | 24.3 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 3 | 44 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 4 | 69 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 6 | 180.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 8 | 281.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 10 | 527.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | Sch 160 | 12 | 800.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 3/4 | 4.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 1 | 6 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 1-1/4 | 9.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 1-1/2 | 12.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 2 | 19.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 2-1/2 | 23.8 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 3 | 43 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 4 | 66.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 6 | 174 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 8 | 266.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 10 | 489.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XS | 12 | 734.5 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 1/2 | 3.7 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 3/4 | 4.3 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 1 | 6.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 1-1/4 | 9.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 1-1/2 | 13.2 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 2 | 19.9 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 2-1/2 | 25.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 3 | 45.1 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 4 | 70.4 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 6 | 184 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 8 | 280 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 10 | 520.3 | calculated (ρ=7850, L=wn thk) |
| wn | 2500 | XXS | 12 | 776.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 3/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 1 | 1.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 1-1/4 | 2.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 1-1/2 | 3.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 2 | 3.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 2-1/2 | 5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 3 | 7.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 3-1/2 | 8.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 4 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 5 | 15 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 6 | 18.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 8 | 28 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 10 | 40.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 12 | 58.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 14 | 86.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 16 | 105.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 18 | 134.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 20 | 170.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5S | 24 | 251.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 3/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 1 | 1.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 1-1/4 | 2.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 1-1/2 | 3.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 2 | 3.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 2-1/2 | 5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 3 | 7.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 3-1/2 | 8.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 4 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 5 | 15 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 6 | 18.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 8 | 28 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 10 | 40.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 12 | 58.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 14 | 86.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 16 | 105.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 18 | 134.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 20 | 170.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 5 | 24 | 251.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 3/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 1-1/4 | 2.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 1-1/2 | 3.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 2 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 2-1/2 | 5.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 3 | 7.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 3-1/2 | 8.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 4 | 11.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 5 | 15.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 6 | 18.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 8 | 28.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 10 | 41.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 12 | 59 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 14 | 87.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 16 | 105.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 18 | 135.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 20 | 172.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10S | 24 | 253.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 3/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 1-1/4 | 2.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 1-1/2 | 3.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 2 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 2-1/2 | 5.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 3 | 7.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 3-1/2 | 8.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 4 | 11.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 5 | 15.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 6 | 18.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 8 | 28.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 10 | 41.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 12 | 59 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 14 | 88.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 16 | 108.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 18 | 138.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 20 | 173.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 10 | 24 | 253.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 20 | 8 | 30.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 20 | 10 | 42.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 20 | 12 | 60.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 20 | 14 | 90.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 20 | 16 | 110.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 20 | 18 | 141.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 20 | 20 | 180 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 20 | 24 | 261 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 3/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 1-1/4 | 2.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 1-1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 2 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 2-1/2 | 5.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 3 | 8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 3-1/2 | 8.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 4 | 11.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 8 | 30.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 10 | 43.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 12 | 62.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 14 | 92.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 16 | 112.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 18 | 146.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 20 | 186.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 30 | 24 | 272.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 60 | 8 | 32.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 60 | 10 | 47.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 60 | 12 | 68.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 60 | 14 | 99.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 60 | 16 | 122.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 60 | 18 | 159.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 60 | 20 | 200.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 60 | 24 | 296.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 3/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 1-1/4 | 2.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 1-1/2 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 2 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 2-1/2 | 5.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 3 | 8.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 3-1/2 | 9.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 4 | 12.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 5 | 17.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 6 | 21.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 8 | 33.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 10 | 47.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 12 | 66.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 14 | 96.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 16 | 116.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 18 | 149.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 20 | 186.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80S | 24 | 268.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 3/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 1-1/4 | 2.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 1-1/2 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 2 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 2-1/2 | 5.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 3 | 8.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 3-1/2 | 9.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 4 | 12.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 5 | 17.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 6 | 21.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 8 | 33.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 10 | 49.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 12 | 71.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 14 | 103.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 16 | 128.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 18 | 167.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 20 | 211 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 80 | 24 | 311.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 100 | 8 | 34.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 100 | 10 | 51.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 100 | 12 | 75 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 100 | 14 | 108.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 100 | 16 | 134.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 100 | 18 | 176.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 100 | 20 | 222.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 100 | 24 | 328.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 4 | 12.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 5 | 18 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 6 | 22.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 8 | 36.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 10 | 53.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 12 | 78.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 14 | 112.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 16 | 140.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 18 | 184.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 20 | 231.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 120 | 24 | 344.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 140 | 8 | 37.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 140 | 10 | 56 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 140 | 12 | 81.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 140 | 14 | 117 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 140 | 16 | 147.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 140 | 18 | 191.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 140 | 20 | 242.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 140 | 24 | 357.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 3/4 | 1.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 1 | 1.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 1-1/4 | 2.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 1-1/2 | 3.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 2 | 4.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 2-1/2 | 5.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 3 | 8.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 4 | 13.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 5 | 18.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 6 | 24.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 8 | 38.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 10 | 58 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 12 | 85.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 14 | 121 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 16 | 151.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 18 | 199.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 20 | 251.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | Sch 160 | 24 | 372.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 1/2 | 0.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 3/4 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 1-1/4 | 2.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 1-1/2 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 2 | 4.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 2-1/2 | 5.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 3 | 8.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 3-1/2 | 9.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 4 | 12.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 5 | 17.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 6 | 21.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 8 | 33.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 10 | 47.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 12 | 66.9 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 14 | 96.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 16 | 116.8 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 18 | 149.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 20 | 186.1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XS | 24 | 268.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 1/2 | 1 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 3/4 | 1.5 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 1 | 2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 1-1/4 | 2.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 1-1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 2 | 4.6 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 2-1/2 | 6.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 3 | 9.4 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 4 | 14 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 5 | 19.7 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 6 | 25.2 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 8 | 38.3 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 10 | 56 | calculated (ρ=7850, L=wn thk) |
| wn | 300 | XXS | 12 | 78.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 3/4 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 1 | 1.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 1-1/4 | 2.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 1-1/2 | 3.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 2 | 5.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 2-1/2 | 7.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 3 | 9.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 3-1/2 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 4 | 17.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 5 | 29.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 6 | 34.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 8 | 50.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 10 | 79.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 12 | 95.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 14 | 148.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 16 | 207.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 18 | 239.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 20 | 299.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5S | 24 | 427.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 3/4 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 1 | 1.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 1-1/4 | 2.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 1-1/2 | 3.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 2 | 5.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 2-1/2 | 7.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 3 | 9.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 3-1/2 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 4 | 17.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 5 | 29.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 6 | 34.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 8 | 50.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 10 | 79.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 12 | 95.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 14 | 148.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 16 | 207.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 18 | 239.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 20 | 299.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 5 | 24 | 427.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 3/4 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 1-1/4 | 2.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 1-1/2 | 3.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 2 | 5.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 2-1/2 | 7.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 3 | 10 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 3-1/2 | 11.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 4 | 18.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 5 | 29.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 6 | 34.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 8 | 51 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 10 | 80.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 12 | 95.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 14 | 149.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 16 | 208.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 18 | 240.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 20 | 301.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10S | 24 | 430.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 3/4 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 1-1/4 | 2.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 1-1/2 | 3.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 2 | 5.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 2-1/2 | 7.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 3 | 10 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 3-1/2 | 11.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 4 | 18.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 5 | 29.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 6 | 34.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 8 | 51 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 10 | 80.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 12 | 95.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 14 | 151.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 16 | 211 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 18 | 243.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 20 | 303.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 10 | 24 | 430.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 20 | 8 | 52.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 20 | 10 | 82.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 20 | 12 | 97.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 20 | 14 | 154 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 20 | 16 | 213.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 20 | 18 | 246.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 20 | 20 | 310.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 20 | 24 | 439.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 3/4 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 1-1/4 | 2.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 1-1/2 | 3.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 2 | 5.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 2-1/2 | 8.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 3 | 10.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 3-1/2 | 11.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 4 | 18.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 8 | 53.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 10 | 84.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 12 | 100.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 14 | 156.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 16 | 216.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 18 | 253 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 20 | 317.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 30 | 24 | 453.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 60 | 8 | 55.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 60 | 10 | 88.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 60 | 12 | 107.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 60 | 14 | 163.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 60 | 16 | 228.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 60 | 18 | 268.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 60 | 20 | 335.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 60 | 24 | 483.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 3/4 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 1-1/4 | 2.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 1-1/2 | 3.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 2 | 5.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 2-1/2 | 8.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 3 | 10.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 3-1/2 | 12.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 4 | 19.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 5 | 31.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 6 | 38.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 8 | 56.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 10 | 88.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 12 | 105.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 14 | 160.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 16 | 221.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 18 | 256.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 20 | 317.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80S | 24 | 449 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 3/4 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 1-1/4 | 2.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 1-1/2 | 3.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 2 | 5.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 2-1/2 | 8.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 3 | 10.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 3-1/2 | 12.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 4 | 19.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 5 | 31.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 6 | 38.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 8 | 56.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 10 | 90.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 12 | 110.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 14 | 168.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 16 | 236.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 18 | 277.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 20 | 347.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 80 | 24 | 500.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 100 | 8 | 58.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 100 | 10 | 93.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 100 | 12 | 115.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 100 | 14 | 175 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 100 | 16 | 243.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 100 | 18 | 287.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 100 | 20 | 360.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 100 | 24 | 522.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 4 | 20.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 5 | 32.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 6 | 39.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 8 | 60.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 10 | 96.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 12 | 119.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 14 | 179.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 16 | 250.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 18 | 297.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 20 | 372.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 120 | 24 | 540.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 140 | 8 | 61.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 140 | 10 | 99.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 140 | 12 | 122.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 140 | 14 | 184.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 140 | 16 | 259.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 140 | 18 | 305.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 140 | 20 | 384.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 140 | 24 | 557.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 3/4 | 1.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 1 | 1.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 1-1/4 | 2.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 1-1/2 | 3.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 2 | 5.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 2-1/2 | 8.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 3 | 11.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 4 | 20.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 5 | 33.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 6 | 41.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 8 | 63.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 10 | 102.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 12 | 127.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 14 | 189.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 16 | 264.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 18 | 315 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 20 | 395.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | Sch 160 | 24 | 575 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 1/2 | 1.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 3/4 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 1 | 1.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 1-1/4 | 2.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 1-1/2 | 3.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 2 | 5.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 2-1/2 | 8.3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 3 | 10.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 3-1/2 | 12.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 4 | 19.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 5 | 31.6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 6 | 38.2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 8 | 56.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 10 | 88.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 12 | 105.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 14 | 160.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 16 | 221.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 18 | 256.1 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 20 | 317.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XS | 24 | 449 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 1/2 | 1.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 3/4 | 1.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 1 | 2 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 1-1/4 | 3 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 1-1/2 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 2 | 6 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 2-1/2 | 9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 3 | 11.8 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 4 | 21.4 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 5 | 34.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 6 | 42.5 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 8 | 62.7 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 10 | 99.9 | calculated (ρ=7850, L=wn thk) |
| wn | 600 | XXS | 12 | 119.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 1 | 3.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 1-1/4 | 4.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 1-1/2 | 6.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 2 | 10.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 2-1/2 | 13.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 3 | 15.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 4 | 22.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 6 | 47.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 8 | 79.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 10 | 113.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 12 | 158.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 14 | 242.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 16 | 297.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 18 | 402.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 20 | 509.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5S | 24 | 931.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 1 | 3.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 1-1/4 | 4.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 1-1/2 | 6.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 2 | 10.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 2-1/2 | 13.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 3 | 15.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 4 | 22.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 6 | 47.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 8 | 79.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 10 | 113.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 12 | 158.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 14 | 242.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 16 | 297.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 18 | 402.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 20 | 509.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 5 | 24 | 931.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 1 | 3.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 1-1/4 | 4.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 1-1/2 | 6.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 2 | 10.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 2-1/2 | 13.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 3 | 15.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 4 | 23 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 6 | 47.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 8 | 80.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 10 | 114.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 12 | 159.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 14 | 244.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 16 | 298.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 18 | 403.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 20 | 511.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10S | 24 | 934.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 1 | 3.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 1-1/4 | 4.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 1-1/2 | 6.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 2 | 10.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 2-1/2 | 13.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 3 | 15.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 4 | 23 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 6 | 47.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 8 | 80.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 10 | 114.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 12 | 159.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 14 | 247.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 16 | 301.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 18 | 407.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 20 | 514.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 10 | 24 | 934.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 20 | 8 | 82.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 20 | 10 | 117.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 20 | 12 | 162.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 20 | 14 | 250 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 20 | 16 | 305 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 20 | 18 | 411.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 20 | 20 | 523.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 20 | 24 | 948.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 1 | 3.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 1-1/4 | 4.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 1-1/2 | 6.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 2 | 10.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 2-1/2 | 13.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 3 | 16.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 4 | 23.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 8 | 83.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 10 | 118.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 12 | 165.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 14 | 252.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 16 | 308.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 18 | 419.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 20 | 533.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 30 | 24 | 968.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 60 | 8 | 85.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 60 | 10 | 124.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 60 | 12 | 174.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 60 | 14 | 262.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 60 | 16 | 322.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 60 | 18 | 438.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 60 | 20 | 556.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 60 | 24 | 1010.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 1 | 3.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 1-1/4 | 4.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 1-1/2 | 6.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 2 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 2-1/2 | 14.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 3 | 16.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 4 | 24.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 6 | 51.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 8 | 87.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 10 | 124.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 12 | 172.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 14 | 258.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 16 | 314.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 18 | 423.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 20 | 533.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80S | 24 | 961.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 1 | 3.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 1-1/4 | 4.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 1-1/2 | 6.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 2 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 2-1/2 | 14.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 3 | 16.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 4 | 24.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 6 | 51.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 8 | 87.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 10 | 127.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 12 | 179 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 14 | 269.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 16 | 332.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 18 | 450 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 20 | 571.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 80 | 24 | 1036 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 100 | 8 | 89.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 100 | 10 | 130.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 100 | 12 | 184.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 100 | 14 | 277.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 100 | 16 | 341.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 100 | 18 | 462.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 100 | 20 | 589.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 100 | 24 | 1066.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 4 | 25.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 6 | 53.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 8 | 92 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 10 | 134 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 12 | 190 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 14 | 283.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 16 | 350.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 18 | 475 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 20 | 604.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 120 | 24 | 1093.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 140 | 8 | 93.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 140 | 10 | 138.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 140 | 12 | 194.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 140 | 14 | 289.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 140 | 16 | 360.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 140 | 18 | 485.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 140 | 20 | 620.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 140 | 24 | 1117.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 3/4 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 1 | 3.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 1-1/4 | 4.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 1-1/2 | 6.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 2 | 11.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 2-1/2 | 14.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 3 | 17.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 4 | 25.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 6 | 55 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 8 | 95.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 10 | 141.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 12 | 200.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 14 | 295.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 16 | 367.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 18 | 497 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 20 | 634.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | Sch 160 | 24 | 1142.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 1/2 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 3/4 | 3.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 1 | 3.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 1-1/4 | 4.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 1-1/2 | 6.4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 2 | 11 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 2-1/2 | 14.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 3 | 16.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 4 | 24.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 6 | 51.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 8 | 87.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 10 | 124.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 12 | 172.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 14 | 258.5 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 16 | 314.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 18 | 423.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 20 | 533.2 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XS | 24 | 961.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 1/2 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 3/4 | 3.3 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 1 | 4 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 1-1/4 | 4.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 1-1/2 | 6.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 2 | 11.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 2-1/2 | 15.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 3 | 17.9 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 4 | 26.7 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 6 | 56.6 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 8 | 94.8 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 10 | 138.1 | calculated (ρ=7850, L=wn thk) |
| wn | 900 | XXS | 12 | 190 | calculated (ρ=7850, L=wn thk) |

## Skipped

Schedule×type (fitting) or schedule×class (WN) combinations with **no** proposed numeric rows, plus WN per-NPS input gaps. Prefer an honest hole over inventing mass or geometry.

### Fitting / WN schedule skips

| kind | type / class | schedule | reason |
| --- | --- | --- | --- |
| fitting | 180° LR Return | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° LR Return | Sch 160 | chart-missing: S1 has no Sch 160 weight table for this type (only STD/XS published) — Skip |
| fitting | 180° LR Return | XXS | chart-missing: S1 has no XXS weight table for this type (only STD/XS published) — Skip |
| fitting | 180° SR Return | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 180° SR Return | Sch 160 | chart-missing: S1 has no Sch 160 weight table for this type (only STD/XS published) — Skip |
| fitting | 180° SR Return | XXS | chart-missing: S1 has no XXS weight table for this type (only STD/XS published) — Skip |
| fitting | 45° 3D Elbow | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° 3D Elbow | Sch 160 | chart-missing: S1 has no Sch 160 weight table for this type (only STD/XS published) — Skip |
| fitting | 45° 3D Elbow | XXS | chart-missing: S1 has no XXS weight table for this type (only STD/XS published) — Skip |
| fitting | 45° LR Elbow | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 45° LR Elbow | Sch 160 | chart-missing: S1 has no Sch 160 weight table for this type (only STD/XS published) — Skip |
| fitting | 45° LR Elbow | XXS | chart-missing: S1 has no XXS weight table for this type (only STD/XS published) — Skip |
| fitting | 90° 3D Elbow | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° 3D Elbow | Sch 160 | chart-missing: S1 has no Sch 160 weight table for this type (only STD/XS published) — Skip |
| fitting | 90° 3D Elbow | XXS | chart-missing: S1 has no XXS weight table for this type (only STD/XS published) — Skip |
| fitting | 90° LR Elbow | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° LR Elbow | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | 90° SR Elbow | Sch 160 | chart-missing: S1 has no Sch 160 weight table for this type (only STD/XS published) — Skip |
| fitting | 90° SR Elbow | XXS | chart-missing: S1 has no XXS weight table for this type (only STD/XS published) — Skip |
| fitting | Cap | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Cap | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Concentric Reducer | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Eccentric Reducer | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Equal Tee | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 5S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 5 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 10S | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 10 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 20 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 30 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 60 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 100 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 120 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 140 | chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36) |
| fitting | Lap Joint Stub End (Long) | Sch 160 | chart-missing: S1 has no Sch 160 weight table for this type (only STD/XS published) — Skip |
| fitting | Lap Joint Stub End (Long) | XXS | chart-missing: S1 has no XXS weight table for this type (only STD/XS published) — Skip |
| wn | WN class 400 | (all) | out-of-scope: Class 400 not in current catalog classes (FLG400.csv exists but not applied this change) |

### WN per-NPS Skip cells (missing inputs)

Individual class×schedule×NPS cells that could not be calculated. Schedules with zero calculable NPS also appear in the summary table above.

| kind | class | schedule | nps | reason |
| --- | --- | --- | --- | --- |
| wn | 150 | Sch 20 | 1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 3/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 1 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 1-1/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 1-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 2-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 3 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 3-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 5 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 20 | 6 | missing pipe t/od for Sch 20 at this NPS |
| wn | 150 | Sch 30 | 5 | missing pipe t/od for Sch 30 at this NPS |
| wn | 150 | Sch 30 | 6 | missing pipe t/od for Sch 30 at this NPS |
| wn | 150 | Sch 60 | 1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 3/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 1 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 1-1/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 1-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 2-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 3 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 3-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 5 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 60 | 6 | missing pipe t/od for Sch 60 at this NPS |
| wn | 150 | Sch 100 | 1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 3/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 1 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 1-1/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 1-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 2-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 3 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 3-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 5 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 100 | 6 | missing pipe t/od for Sch 100 at this NPS |
| wn | 150 | Sch 120 | 1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 120 | 3/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 120 | 1 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 120 | 1-1/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 120 | 1-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 120 | 2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 120 | 2-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 120 | 3 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 120 | 3-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 150 | Sch 140 | 1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 3/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 1 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 1-1/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 1-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 2-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 3 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 3-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 5 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 140 | 6 | missing pipe t/od for Sch 140 at this NPS |
| wn | 150 | Sch 160 | 3-1/2 | missing pipe t/od for Sch 160 at this NPS |
| wn | 150 | XXS | 3-1/2 | missing pipe t/od for XXS at this NPS |
| wn | 150 | XXS | 14 | missing pipe t/od for XXS at this NPS |
| wn | 150 | XXS | 16 | missing pipe t/od for XXS at this NPS |
| wn | 150 | XXS | 18 | missing pipe t/od for XXS at this NPS |
| wn | 150 | XXS | 20 | missing pipe t/od for XXS at this NPS |
| wn | 150 | XXS | 24 | missing pipe t/od for XXS at this NPS |
| wn | 1500 | Sch 20 | 1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 3/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 1 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 1-1/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 1-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 2-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 3 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 20 | 6 | missing pipe t/od for Sch 20 at this NPS |
| wn | 1500 | Sch 30 | 6 | missing pipe t/od for Sch 30 at this NPS |
| wn | 1500 | Sch 60 | 1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 3/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 1 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 1-1/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 1-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 2-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 3 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 60 | 6 | missing pipe t/od for Sch 60 at this NPS |
| wn | 1500 | Sch 100 | 1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 3/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 1 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 1-1/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 1-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 2-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 3 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 100 | 6 | missing pipe t/od for Sch 100 at this NPS |
| wn | 1500 | Sch 120 | 1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 1500 | Sch 120 | 3/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 1500 | Sch 120 | 1 | missing pipe t/od for Sch 120 at this NPS |
| wn | 1500 | Sch 120 | 1-1/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 1500 | Sch 120 | 1-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 1500 | Sch 120 | 2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 1500 | Sch 120 | 2-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 1500 | Sch 120 | 3 | missing pipe t/od for Sch 120 at this NPS |
| wn | 1500 | Sch 140 | 1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 3/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 1 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 1-1/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 1-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 2-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 3 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | Sch 140 | 6 | missing pipe t/od for Sch 140 at this NPS |
| wn | 1500 | XXS | 14 | missing pipe t/od for XXS at this NPS |
| wn | 1500 | XXS | 16 | missing pipe t/od for XXS at this NPS |
| wn | 1500 | XXS | 18 | missing pipe t/od for XXS at this NPS |
| wn | 1500 | XXS | 20 | missing pipe t/od for XXS at this NPS |
| wn | 1500 | XXS | 24 | missing pipe t/od for XXS at this NPS |
| wn | 2500 | Sch 20 | 1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 3/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 1 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 1-1/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 1-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 2-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 3 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 20 | 6 | missing pipe t/od for Sch 20 at this NPS |
| wn | 2500 | Sch 30 | 6 | missing pipe t/od for Sch 30 at this NPS |
| wn | 2500 | Sch 60 | 1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 3/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 1 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 1-1/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 1-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 2-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 3 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 60 | 6 | missing pipe t/od for Sch 60 at this NPS |
| wn | 2500 | Sch 100 | 1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 3/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 1 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 1-1/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 1-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 2-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 3 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 100 | 6 | missing pipe t/od for Sch 100 at this NPS |
| wn | 2500 | Sch 120 | 1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 2500 | Sch 120 | 3/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 2500 | Sch 120 | 1 | missing pipe t/od for Sch 120 at this NPS |
| wn | 2500 | Sch 120 | 1-1/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 2500 | Sch 120 | 1-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 2500 | Sch 120 | 2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 2500 | Sch 120 | 2-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 2500 | Sch 120 | 3 | missing pipe t/od for Sch 120 at this NPS |
| wn | 2500 | Sch 140 | 1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 3/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 1 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 1-1/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 1-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 2-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 3 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 2500 | Sch 140 | 6 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 20 | 1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 3/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 1 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 1-1/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 1-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 2-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 3 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 3-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 5 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 20 | 6 | missing pipe t/od for Sch 20 at this NPS |
| wn | 300 | Sch 30 | 5 | missing pipe t/od for Sch 30 at this NPS |
| wn | 300 | Sch 30 | 6 | missing pipe t/od for Sch 30 at this NPS |
| wn | 300 | Sch 60 | 1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 3/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 1 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 1-1/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 1-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 2-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 3 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 3-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 5 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 60 | 6 | missing pipe t/od for Sch 60 at this NPS |
| wn | 300 | Sch 100 | 1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 3/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 1 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 1-1/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 1-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 2-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 3 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 3-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 5 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 100 | 6 | missing pipe t/od for Sch 100 at this NPS |
| wn | 300 | Sch 120 | 1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 120 | 3/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 120 | 1 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 120 | 1-1/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 120 | 1-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 120 | 2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 120 | 2-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 120 | 3 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 120 | 3-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 300 | Sch 140 | 1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 3/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 1 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 1-1/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 1-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 2-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 3 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 3-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 5 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 140 | 6 | missing pipe t/od for Sch 140 at this NPS |
| wn | 300 | Sch 160 | 3-1/2 | missing pipe t/od for Sch 160 at this NPS |
| wn | 300 | XXS | 3-1/2 | missing pipe t/od for XXS at this NPS |
| wn | 300 | XXS | 14 | missing pipe t/od for XXS at this NPS |
| wn | 300 | XXS | 16 | missing pipe t/od for XXS at this NPS |
| wn | 300 | XXS | 18 | missing pipe t/od for XXS at this NPS |
| wn | 300 | XXS | 20 | missing pipe t/od for XXS at this NPS |
| wn | 300 | XXS | 24 | missing pipe t/od for XXS at this NPS |
| wn | 600 | Sch 20 | 1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 3/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 1 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 1-1/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 1-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 2-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 3 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 3-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 5 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 20 | 6 | missing pipe t/od for Sch 20 at this NPS |
| wn | 600 | Sch 30 | 5 | missing pipe t/od for Sch 30 at this NPS |
| wn | 600 | Sch 30 | 6 | missing pipe t/od for Sch 30 at this NPS |
| wn | 600 | Sch 60 | 1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 3/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 1 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 1-1/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 1-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 2-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 3 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 3-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 5 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 60 | 6 | missing pipe t/od for Sch 60 at this NPS |
| wn | 600 | Sch 100 | 1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 3/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 1 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 1-1/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 1-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 2-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 3 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 3-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 5 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 100 | 6 | missing pipe t/od for Sch 100 at this NPS |
| wn | 600 | Sch 120 | 1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 120 | 3/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 120 | 1 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 120 | 1-1/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 120 | 1-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 120 | 2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 120 | 2-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 120 | 3 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 120 | 3-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 600 | Sch 140 | 1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 3/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 1 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 1-1/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 1-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 2-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 3 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 3-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 5 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 140 | 6 | missing pipe t/od for Sch 140 at this NPS |
| wn | 600 | Sch 160 | 3-1/2 | missing pipe t/od for Sch 160 at this NPS |
| wn | 600 | XXS | 3-1/2 | missing pipe t/od for XXS at this NPS |
| wn | 600 | XXS | 14 | missing pipe t/od for XXS at this NPS |
| wn | 600 | XXS | 16 | missing pipe t/od for XXS at this NPS |
| wn | 600 | XXS | 18 | missing pipe t/od for XXS at this NPS |
| wn | 600 | XXS | 20 | missing pipe t/od for XXS at this NPS |
| wn | 600 | XXS | 24 | missing pipe t/od for XXS at this NPS |
| wn | 900 | Sch 20 | 1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 3/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 1 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 1-1/4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 1-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 2-1/2 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 3 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 4 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 20 | 6 | missing pipe t/od for Sch 20 at this NPS |
| wn | 900 | Sch 30 | 6 | missing pipe t/od for Sch 30 at this NPS |
| wn | 900 | Sch 60 | 1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 3/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 1 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 1-1/4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 1-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 2-1/2 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 3 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 4 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 60 | 6 | missing pipe t/od for Sch 60 at this NPS |
| wn | 900 | Sch 100 | 1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 3/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 1 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 1-1/4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 1-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 2-1/2 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 3 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 4 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 100 | 6 | missing pipe t/od for Sch 100 at this NPS |
| wn | 900 | Sch 120 | 1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 900 | Sch 120 | 3/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 900 | Sch 120 | 1 | missing pipe t/od for Sch 120 at this NPS |
| wn | 900 | Sch 120 | 1-1/4 | missing pipe t/od for Sch 120 at this NPS |
| wn | 900 | Sch 120 | 1-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 900 | Sch 120 | 2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 900 | Sch 120 | 2-1/2 | missing pipe t/od for Sch 120 at this NPS |
| wn | 900 | Sch 120 | 3 | missing pipe t/od for Sch 120 at this NPS |
| wn | 900 | Sch 140 | 1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 3/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 1 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 1-1/4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 1-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 2-1/2 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 3 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 4 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | Sch 140 | 6 | missing pipe t/od for Sch 140 at this NPS |
| wn | 900 | XXS | 14 | missing pipe t/od for XXS at this NPS |
| wn | 900 | XXS | 16 | missing pipe t/od for XXS at this NPS |
| wn | 900 | XXS | 18 | missing pipe t/od for XXS at this NPS |
| wn | 900 | XXS | 20 | missing pipe t/od for XXS at this NPS |
| wn | 900 | XXS | 24 | missing pipe t/od for XXS at this NPS |

### Chart cells outside current NPS matrix (not proposed)

These S1 reducer cells exist on Wermac but the `large×small` pair is not in the current catalog — omitted under “no Class/NPS matrix growth”.

| kind | type | schedule | nps | reason |
| --- | --- | --- | --- | --- |
| fitting | Concentric Reducer | Sch 160 | 3/4x3/8 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 1-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 2-1/2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 2-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 3-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 3-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 3-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 4-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 4-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 5-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | Sch 160 | 6-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 1-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 2-1/2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 2-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 3-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 3-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 3-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 3-1/2-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 3-1/2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 3-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 4-3x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 4-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 4-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 5-3x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 5-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 6-3x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 6-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Concentric Reducer | XXS | 8-3x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 3/4x3/8 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 1-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 2-1/2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 2-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 3-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 3-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 3-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 4-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 4-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 5-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | Sch 160 | 6-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 1-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 2-1/2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 2-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 3-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 3-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 3-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 3-1/2-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 3-1/2-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 3-1/2-1x1/4 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 4-3x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 4-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 4-1x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 5-3x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 5-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 6-3x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 6-2x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |
| fitting | Eccentric Reducer | XXS | 8-3x1/2 | chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion) |

## Alias notes

Carry-forward from S-04 / S-05 — **no new invent** for fittings beyond the documented wall-equality aliases:

- Fitting chart **STD** ↔ catalog `STD` + `Sch 40` (same wt); chart **XS** ↔ `XS` + `Sch 80`.
- Fitting `Sch 40S` = Sch 40 / STD wt for NPS ≤ 10″; `Sch 80S` = Sch 80 / XS wt for NPS ≤ 8″ (B36.19 wall equality). This change proposes those aliases for returns / 3D / long stub only.
- WN chart STD bore ↔ catalog `STD`; `Sch 40` / `Sch 40S` aliases already Accepted in S-05 (typically NPS ≤ 10″). **No** new chart invent for WN Sch 80 / XS / XXS — those use the calc contract instead.
- Concentric and eccentric reducers share one S1 weight table — propose identical `wt`.

## Conflict / mass policy

1. **Fittings:** omit when the chart has no cell — do not invent `wt`, do not restore B36 wall-ratio multipliers.
2. **WN:** keep chart `STD` / `Sch 40` / `Sch 40S`; **calculate** other missing schedules when inputs exist; Skip when `t`, `wn thk`, or STD baseline is missing.
3. Do not rewrite existing Sch 40/80/STD chart rows unless Sign-off explicitly requests a re-sync (out of scope by default).
4. Chart cells for NPS pairs outside the current reducer matrix are omitted (no matrix growth).
5. Slip-On / Blind stay class-only; deferred flange types stay deferred; Class 400 stays out of scope.
6. UI shows plain kg — no “calculated” badge; calc provenance lives in this artifact + catalog header (Phase 3).

## Sign-off

Record decision before Phase 3 edits either catalog file:

- [ ] **Accept all** — load A + B + C as proposed
- [ ] **Accept subset** — describe below (e.g. “A + B only”, “C for Class 150–600 only”, “drop XXS reducers”)
- [ ] **Reject** — leave catalog schedule coverage as-is

**Decision:** _(empty — Phase 2)_

**Accepted set:** _(empty — Phase 2)_

**Notes / alternate sources:** _(empty — Phase 2)_

**Signer / date:** _(empty — Phase 2)_
