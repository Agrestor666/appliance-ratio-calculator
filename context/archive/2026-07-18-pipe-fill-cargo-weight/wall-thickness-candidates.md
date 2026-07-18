# Wall-thickness candidates

Approval artifact for `pipe-fill-cargo-weight` Phase 1. **Do not edit** `data/piping_catalog.js` until this file’s `## Sign-off` (or equivalent chat confirmation) accepts a set of rows.

Source of truth remains `data/piping_catalog.js` (`PIPING_CATALOG.pipes`). Proposed field: add-only `t` (nominal wall thickness, mm). Existing `od` / `wt` must not be rewritten.

## Edition / source note

Wall proposals are drawn from published ASME B36.10M (carbon/alloy) and ASME B36.19M (stainless *S schedules) nominal wall tables, as compiled in common engineering charts (Projectmaterials B36.10/19 wall charts; cross-checked against ZC Steel ASME B36.10M-2018 schedule tables). Values use millimetre nominal walls (e.g. STD large sizes **9.53** mm = 0.375″; XS large sizes **12.70** mm = 0.500″).

This is **not** a licensed reprint of the ASME standard. Human sign-off should spot-check critical sizes against an owned B36.10M / B36.19M edition before Phase 2.

## Mapping

### Schedule keys

| Catalog key | ASME designation | Notes |
| ------------ | ---------------- | ----- |
| `Sch 5S` | B36.19M Sch 5S | Aligns with Sch 5 walls for listed NPS |
| `Sch 5` | B36.10M Sch 5 | |
| `Sch 10S` | B36.19M Sch 10S | Thin wall ≥14″ may differ from Sch 10 |
| `Sch 10` | B36.10M Sch 10 | |
| `Sch 20` | B36.10M Sch 20 | |
| `Sch 30` | B36.10M Sch 30 | Small NPS rarely used; catalog wt may look like Sch 40 |
| `Sch 40S` | B36.19M Sch 40S | = Sch 40 ≤10″; = STD (≥12″ → 9.53 mm) |
| `Sch 40` | B36.10M Sch 40 | ≠ STD for NPS ≥12 |
| `Sch 60` | B36.10M Sch 60 | |
| `Sch 80S` | B36.19M Sch 80S | = Sch 80 ≤8″; = XS (≥10″ → 12.70 mm) |
| `Sch 80` | B36.10M Sch 80 | ≠ XS for NPS ≥10 |
| `Sch 100` … `Sch 160` | B36.10M | |
| `STD` | Standard | = Sch 40 ≤10″; fixed 9.53 mm ≥12″ |
| `XS` | Extra Strong | = Sch 80 ≤8″; fixed 12.70 mm ≥10″ |
| `XXS` | Double Extra Strong | Not a schedule number |

### NPS / OD

Catalog `nps` strings are used as-is (`1-1/4`, `2-1/2`, …). Catalog `od` is accepted when within **0.15 mm** of the B36 OD (covers catalog `12″ → 323.8` vs B36 `323.9`).

### Field mapping

| Proposal field | Catalog field | Unit |
| -------------- | ------------- | ---- |
| `t` (new, add-only) | — | mm (nominal wall) |
| (unchanged) | `od` | mm |
| (unchanged) | `wt` | kg/m (mass/length — **not** wall) |
| (unchanged) | `nps` | string |

Internal volume (later phases): `ID = od − 2·t` (mm).

### Coverage summary

| Metric | Count |
| ------ | ----- |
| Catalog pipe rows | 370 |
| Schedules | 18 |
| A. recommended (clean B36 match) | 251 |
| B. needs review | 119 |
| · subset: B36 wall missing | 10 |
| · subset: OD mismatch | 0 |
| · subset: flagged with wt-suspect (may overlap other B reasons) | 89 |

## Proposed wall thicknesses

Proposed catalog shape after Phase 2: `{ nps, od, wt, t }` under `PIPING_CATALOG.pipes[<schedule>]`.

### A. Recommended

Clean matches: B36 wall published, catalog OD within 0.15 mm, `ID > 0`, no STD/XS/S-alias caveat, and catalog `wt` within tolerance of theoretical mass from `od`+`t`.

| schedule | nps | od | wt | t (mm) | ID (mm) | source note |
| -------- | --- | -- | -- | ------ | ------- | ----------- |
| Sch 5S | 1/2 | 21.3 | 0.84 | 1.65 | 18.00 | ASME B36 nominal wall |
| Sch 5S | 3/4 | 26.7 | 1.1 | 1.65 | 23.40 | ASME B36 nominal wall |
| Sch 5S | 1 | 33.4 | 1.59 | 1.65 | 30.10 | ASME B36 nominal wall |
| Sch 5S | 1-1/4 | 42.2 | 1.96 | 1.65 | 38.90 | ASME B36 nominal wall |
| Sch 5S | 1-1/2 | 48.3 | 2.24 | 1.65 | 45.00 | ASME B36 nominal wall |
| Sch 5S | 5 | 141.3 | 9.23 | 2.77 | 135.76 | ASME B36 nominal wall |
| Sch 5S | 6 | 168.3 | 11.56 | 2.77 | 162.76 | ASME B36 nominal wall |
| Sch 5S | 8 | 219.1 | 15.8 | 2.77 | 213.56 | ASME B36 nominal wall |
| Sch 5S | 10 | 273.1 | 21.77 | 3.4 | 266.30 | ASME B36 nominal wall |
| Sch 5S | 12 | 323.8 | 28.26 | 3.96 | 315.88 | ASME B36 nominal wall |
| Sch 5 | 1/2 | 21.3 | 0.84 | 1.65 | 18.00 | ASME B36 nominal wall |
| Sch 5 | 3/4 | 26.7 | 1.1 | 1.65 | 23.40 | ASME B36 nominal wall |
| Sch 5 | 1 | 33.4 | 1.59 | 1.65 | 30.10 | ASME B36 nominal wall |
| Sch 5 | 1-1/4 | 42.2 | 1.96 | 1.65 | 38.90 | ASME B36 nominal wall |
| Sch 5 | 1-1/2 | 48.3 | 2.24 | 1.65 | 45.00 | ASME B36 nominal wall |
| Sch 5 | 5 | 141.3 | 9.23 | 2.77 | 135.76 | ASME B36 nominal wall |
| Sch 5 | 6 | 168.3 | 11.56 | 2.77 | 162.76 | ASME B36 nominal wall |
| Sch 5 | 8 | 219.1 | 15.8 | 2.77 | 213.56 | ASME B36 nominal wall |
| Sch 5 | 10 | 273.1 | 21.77 | 3.4 | 266.30 | ASME B36 nominal wall |
| Sch 5 | 12 | 323.8 | 28.26 | 3.96 | 315.88 | ASME B36 nominal wall |
| Sch 5 | 14 | 355.6 | 34.58 | 3.96 | 347.68 | ASME B36 nominal wall |
| Sch 5 | 16 | 406.4 | 44.95 | 4.19 | 398.02 | ASME B36 nominal wall |
| Sch 5 | 20 | 508 | 62.65 | 4.78 | 498.44 | ASME B36 nominal wall |
| Sch 5 | 24 | 609.6 | 86.55 | 5.54 | 598.52 | ASME B36 nominal wall |
| Sch 5 | 30 | 762 | 114.3 | 6.35 | 749.30 | ASME B36 nominal wall |
| Sch 10S | 1/8 | 10.3 | 0.28 | 1.24 | 7.82 | ASME B36 nominal wall |
| Sch 10S | 1/4 | 13.7 | 0.37 | 1.65 | 10.40 | ASME B36 nominal wall |
| Sch 10S | 3/8 | 17.1 | 0.49 | 1.65 | 13.80 | ASME B36 nominal wall |
| Sch 10S | 1/2 | 21.3 | 1 | 2.11 | 17.08 | ASME B36 nominal wall |
| Sch 10S | 3/4 | 26.7 | 1.28 | 2.11 | 22.48 | ASME B36 nominal wall |
| Sch 10S | 1 | 33.4 | 2.09 | 2.77 | 27.86 | ASME B36 nominal wall |
| Sch 10S | 1-1/4 | 42.2 | 2.69 | 2.77 | 36.66 | ASME B36 nominal wall |
| Sch 10S | 1-1/2 | 48.3 | 3.11 | 2.77 | 42.76 | ASME B36 nominal wall |
| Sch 10S | 2 | 60.3 | 3.93 | 2.77 | 54.76 | ASME B36 nominal wall |
| Sch 10S | 2-1/2 | 73 | 5.26 | 3.05 | 66.90 | ASME B36 nominal wall |
| Sch 10S | 3 | 88.9 | 6.46 | 3.05 | 82.80 | ASME B36 nominal wall |
| Sch 10S | 3-1/2 | 101.6 | 7.41 | 3.05 | 95.50 | ASME B36 nominal wall |
| Sch 10S | 4 | 114.3 | 8.37 | 3.05 | 108.20 | ASME B36 nominal wall |
| Sch 10S | 5 | 141.3 | 11.56 | 3.4 | 134.50 | ASME B36 nominal wall |
| Sch 10S | 6 | 168.3 | 13.83 | 3.4 | 161.50 | ASME B36 nominal wall |
| Sch 10S | 8 | 219.1 | 19.97 | 3.76 | 211.58 | ASME B36 nominal wall |
| Sch 10S | 10 | 273.1 | 27.78 | 4.19 | 264.72 | ASME B36 nominal wall |
| Sch 10S | 12 | 323.8 | 35.98 | 4.57 | 314.66 | ASME B36 nominal wall |
| Sch 10 | 1/4 | 13.7 | 0.49 | 1.65 | 10.40 | ASME B36 nominal wall |
| Sch 10 | 3/8 | 17.1 | 0.63 | 1.65 | 13.80 | ASME B36 nominal wall |
| Sch 10 | 1/2 | 21.3 | 1 | 2.11 | 17.08 | ASME B36 nominal wall |
| Sch 10 | 3/4 | 26.7 | 1.28 | 2.11 | 22.48 | ASME B36 nominal wall |
| Sch 10 | 1 | 33.4 | 2.09 | 2.77 | 27.86 | ASME B36 nominal wall |
| Sch 10 | 1-1/4 | 42.2 | 2.69 | 2.77 | 36.66 | ASME B36 nominal wall |
| Sch 10 | 1-1/2 | 48.3 | 3.11 | 2.77 | 42.76 | ASME B36 nominal wall |
| Sch 10 | 2 | 60.3 | 3.93 | 2.77 | 54.76 | ASME B36 nominal wall |
| Sch 10 | 2-1/2 | 73 | 5.26 | 3.05 | 66.90 | ASME B36 nominal wall |
| Sch 10 | 3 | 88.9 | 6.46 | 3.05 | 82.80 | ASME B36 nominal wall |
| Sch 10 | 3-1/2 | 101.6 | 7.41 | 3.05 | 95.50 | ASME B36 nominal wall |
| Sch 10 | 4 | 114.3 | 8.37 | 3.05 | 108.20 | ASME B36 nominal wall |
| Sch 10 | 5 | 141.3 | 11.56 | 3.4 | 134.50 | ASME B36 nominal wall |
| Sch 10 | 6 | 168.3 | 13.83 | 3.4 | 161.50 | ASME B36 nominal wall |
| Sch 10 | 8 | 219.1 | 19.97 | 3.76 | 211.58 | ASME B36 nominal wall |
| Sch 10 | 10 | 273.1 | 27.78 | 4.19 | 264.72 | ASME B36 nominal wall |
| Sch 10 | 12 | 323.8 | 35.98 | 4.57 | 314.66 | ASME B36 nominal wall |
| Sch 10 | 14 | 355.6 | 54.69 | 6.35 | 342.90 | ASME B36 nominal wall |
| Sch 10 | 16 | 406.4 | 62.65 | 6.35 | 393.70 | ASME B36 nominal wall |
| Sch 10 | 18 | 457.2 | 70.57 | 6.35 | 444.50 | ASME B36 nominal wall |
| Sch 10 | 20 | 508 | 78.56 | 6.35 | 495.30 | ASME B36 nominal wall |
| Sch 10 | 22 | 558.8 | 86.55 | 6.35 | 546.10 | ASME B36 nominal wall |
| Sch 10 | 24 | 609.6 | 94.53 | 6.35 | 596.90 | ASME B36 nominal wall |
| Sch 10 | 26 | 660.4 | 127.4 | 7.92 | 644.56 | ASME B36 nominal wall |
| Sch 10 | 28 | 711.2 | 137.3 | 7.92 | 695.36 | ASME B36 nominal wall |
| Sch 10 | 30 | 762 | 147.3 | 7.92 | 746.16 | ASME B36 nominal wall |
| Sch 10 | 32 | 812.8 | 157.3 | 7.92 | 796.96 | ASME B36 nominal wall |
| Sch 10 | 34 | 863.6 | 167.2 | 7.92 | 847.76 | ASME B36 nominal wall |
| Sch 10 | 36 | 914.4 | 177 | 7.92 | 898.56 | ASME B36 nominal wall |
| Sch 20 | 10 | 273.1 | 38.55 | 6.35 | 260.40 | ASME B36 nominal wall |
| Sch 20 | 12 | 323.8 | 52.21 | 6.35 | 311.10 | ASME B36 nominal wall |
| Sch 20 | 14 | 355.6 | 74.52 | 7.92 | 339.76 | ASME B36 nominal wall |
| Sch 20 | 20 | 508 | 120.1 | 9.53 | 488.94 | ASME B36 nominal wall |
| Sch 20 | 22 | 558.8 | 145.5 | 9.53 | 539.74 | ASME B36 nominal wall |
| Sch 20 | 24 | 609.6 | 157.2 | 9.53 | 590.54 | ASME B36 nominal wall |
| Sch 20 | 30 | 762 | 220.1 | 12.7 | 736.60 | ASME B36 nominal wall |
| Sch 20 | 32 | 812.8 | 232.5 | 12.7 | 787.40 | ASME B36 nominal wall |
| Sch 20 | 34 | 863.6 | 247 | 12.7 | 838.20 | ASME B36 nominal wall |
| Sch 20 | 36 | 914.4 | 261.5 | 12.7 | 889.00 | ASME B36 nominal wall |
| Sch 30 | 8 | 219.1 | 33.31 | 7.04 | 205.02 | ASME B36 nominal wall |
| Sch 30 | 10 | 273.1 | 48.74 | 7.8 | 257.50 | ASME B36 nominal wall |
| Sch 30 | 12 | 323.8 | 63.08 | 8.38 | 307.04 | ASME B36 nominal wall |
| Sch 30 | 18 | 457.2 | 138.3 | 11.13 | 434.94 | ASME B36 nominal wall |
| Sch 30 | 20 | 508 | 161.8 | 12.7 | 482.60 | ASME B36 nominal wall |
| Sch 30 | 22 | 558.8 | 184 | 12.7 | 533.40 | ASME B36 nominal wall |
| Sch 30 | 24 | 609.6 | 205.3 | 14.27 | 581.06 | ASME B36 nominal wall |
| Sch 30 | 26 | 660.4 | 228 | 15.88 | 628.64 | ASME B36 nominal wall |
| Sch 30 | 28 | 711.2 | 252 | 15.88 | 679.44 | ASME B36 nominal wall |
| Sch 30 | 30 | 762 | 280 | 15.88 | 730.24 | ASME B36 nominal wall |
| Sch 30 | 32 | 812.8 | 305 | 15.88 | 781.04 | ASME B36 nominal wall |
| Sch 30 | 34 | 863.6 | 330 | 15.88 | 831.84 | ASME B36 nominal wall |
| Sch 30 | 36 | 914.4 | 360 | 15.88 | 882.64 | ASME B36 nominal wall |
| Sch 40S | 1/8 | 10.3 | 0.37 | 1.73 | 6.84 | ASME B36 nominal wall |
| Sch 40S | 1/4 | 13.7 | 0.63 | 2.24 | 9.22 | ASME B36 nominal wall |
| Sch 40S | 3/8 | 17.1 | 0.84 | 2.31 | 12.48 | ASME B36 nominal wall |
| Sch 40S | 1/2 | 21.3 | 1.27 | 2.77 | 15.76 | ASME B36 nominal wall |
| Sch 40S | 3/4 | 26.7 | 1.69 | 2.87 | 20.96 | ASME B36 nominal wall |
| Sch 40S | 1 | 33.4 | 2.5 | 3.38 | 26.64 | ASME B36 nominal wall |
| Sch 40S | 1-1/4 | 42.2 | 3.39 | 3.56 | 35.08 | ASME B36 nominal wall |
| Sch 40S | 1-1/2 | 48.3 | 4.05 | 3.68 | 40.94 | ASME B36 nominal wall |
| Sch 40S | 2 | 60.3 | 5.44 | 3.91 | 52.48 | ASME B36 nominal wall |
| Sch 40S | 2-1/2 | 73 | 8.63 | 5.16 | 62.68 | ASME B36 nominal wall |
| Sch 40S | 3 | 88.9 | 11.29 | 5.49 | 77.92 | ASME B36 nominal wall |
| Sch 40S | 3-1/2 | 101.6 | 13.57 | 5.74 | 90.12 | ASME B36 nominal wall |
| Sch 40S | 4 | 114.3 | 16.08 | 6.02 | 102.26 | ASME B36 nominal wall |
| Sch 40S | 5 | 141.3 | 21.77 | 6.55 | 128.20 | ASME B36 nominal wall |
| Sch 40S | 6 | 168.3 | 28.26 | 7.11 | 154.08 | ASME B36 nominal wall |
| Sch 40S | 8 | 219.1 | 42.55 | 8.18 | 202.74 | ASME B36 nominal wall |
| Sch 40S | 10 | 273.1 | 60.29 | 9.27 | 254.56 | ASME B36 nominal wall |
| Sch 40 | 1/4 | 13.7 | 0.63 | 2.24 | 9.22 | ASME B36 nominal wall |
| Sch 40 | 3/8 | 17.1 | 0.84 | 2.31 | 12.48 | ASME B36 nominal wall |
| Sch 40 | 1/2 | 21.3 | 1.27 | 2.77 | 15.76 | ASME B36 nominal wall |
| Sch 40 | 3/4 | 26.7 | 1.69 | 2.87 | 20.96 | ASME B36 nominal wall |
| Sch 40 | 1 | 33.4 | 2.5 | 3.38 | 26.64 | ASME B36 nominal wall |
| Sch 40 | 1-1/4 | 42.2 | 3.39 | 3.56 | 35.08 | ASME B36 nominal wall |
| Sch 40 | 1-1/2 | 48.3 | 4.05 | 3.68 | 40.94 | ASME B36 nominal wall |
| Sch 40 | 2 | 60.3 | 5.44 | 3.91 | 52.48 | ASME B36 nominal wall |
| Sch 40 | 2-1/2 | 73 | 8.63 | 5.16 | 62.68 | ASME B36 nominal wall |
| Sch 40 | 3 | 88.9 | 11.29 | 5.49 | 77.92 | ASME B36 nominal wall |
| Sch 40 | 3-1/2 | 101.6 | 13.57 | 5.74 | 90.12 | ASME B36 nominal wall |
| Sch 40 | 4 | 114.3 | 16.08 | 6.02 | 102.26 | ASME B36 nominal wall |
| Sch 40 | 5 | 141.3 | 21.77 | 6.55 | 128.20 | ASME B36 nominal wall |
| Sch 40 | 6 | 168.3 | 28.26 | 7.11 | 154.08 | ASME B36 nominal wall |
| Sch 40 | 8 | 219.1 | 42.55 | 8.18 | 202.74 | ASME B36 nominal wall |
| Sch 40 | 10 | 273.1 | 60.29 | 9.27 | 254.56 | ASME B36 nominal wall |
| Sch 40 | 12 | 323.8 | 79.71 | 10.31 | 303.18 | ASME B36 nominal wall |
| Sch 40 | 14 | 355.6 | 94.55 | 11.13 | 333.34 | ASME B36 nominal wall |
| Sch 40 | 16 | 406.4 | 123.3 | 12.7 | 381.00 | ASME B36 nominal wall |
| Sch 40 | 18 | 457.2 | 155.8 | 14.27 | 428.66 | ASME B36 nominal wall |
| Sch 40 | 20 | 508 | 183.4 | 15.09 | 477.82 | ASME B36 nominal wall |
| Sch 40 | 24 | 609.6 | 255.4 | 17.48 | 574.64 | ASME B36 nominal wall |
| Sch 40 | 32 | 812.8 | 342.9 | 17.48 | 777.84 | ASME B36 nominal wall |
| Sch 40 | 34 | 863.6 | 364.92 | 17.48 | 828.64 | ASME B36 nominal wall |
| Sch 40 | 36 | 914.4 | 420.45 | 19.05 | 876.30 | ASME B36 nominal wall |
| Sch 60 | 8 | 219.1 | 52.21 | 10.31 | 198.48 | ASME B36 nominal wall |
| Sch 60 | 10 | 273.1 | 74.52 | 12.7 | 247.70 | ASME B36 nominal wall |
| Sch 60 | 12 | 323.8 | 99.58 | 14.27 | 295.26 | ASME B36 nominal wall |
| Sch 60 | 14 | 355.6 | 115 | 15.09 | 325.42 | ASME B36 nominal wall |
| Sch 60 | 16 | 406.4 | 149.3 | 16.66 | 373.08 | ASME B36 nominal wall |
| Sch 60 | 18 | 457.2 | 188.8 | 19.05 | 419.10 | ASME B36 nominal wall |
| Sch 60 | 20 | 508 | 224.6 | 20.62 | 466.76 | ASME B36 nominal wall |
| Sch 60 | 22 | 558.8 | 294.27 | 22.23 | 514.34 | ASME B36 nominal wall |
| Sch 60 | 24 | 609.6 | 314 | 24.61 | 560.38 | ASME B36 nominal wall |
| Sch 80S | 1/8 | 10.3 | 0.47 | 2.41 | 5.48 | ASME B36 nominal wall |
| Sch 80S | 1/4 | 13.7 | 0.84 | 3.02 | 7.66 | ASME B36 nominal wall |
| Sch 80S | 3/8 | 17.1 | 1.1 | 3.2 | 10.70 | ASME B36 nominal wall |
| Sch 80S | 1/2 | 21.3 | 1.62 | 3.73 | 13.84 | ASME B36 nominal wall |
| Sch 80S | 3/4 | 26.7 | 2.2 | 3.91 | 18.88 | ASME B36 nominal wall |
| Sch 80S | 1 | 33.4 | 3.24 | 4.55 | 24.30 | ASME B36 nominal wall |
| Sch 80S | 1-1/4 | 42.2 | 4.47 | 4.85 | 32.50 | ASME B36 nominal wall |
| Sch 80S | 1-1/2 | 48.3 | 5.41 | 5.08 | 38.14 | ASME B36 nominal wall |
| Sch 80S | 2 | 60.3 | 7.48 | 5.54 | 49.22 | ASME B36 nominal wall |
| Sch 80S | 2-1/2 | 73 | 11.41 | 7.01 | 58.98 | ASME B36 nominal wall |
| Sch 80S | 3 | 88.9 | 15.27 | 7.62 | 73.66 | ASME B36 nominal wall |
| Sch 80S | 3-1/2 | 101.6 | 18.64 | 8.08 | 85.44 | ASME B36 nominal wall |
| Sch 80S | 4 | 114.3 | 22.32 | 8.56 | 97.18 | ASME B36 nominal wall |
| Sch 80S | 5 | 141.3 | 28.32 | 9.53 | 122.24 | ASME B36 nominal wall |
| Sch 80S | 8 | 219.1 | 63.08 | 12.7 | 193.70 | ASME B36 nominal wall |
| Sch 80 | 1/4 | 13.7 | 0.84 | 3.02 | 7.66 | ASME B36 nominal wall |
| Sch 80 | 3/8 | 17.1 | 1.1 | 3.2 | 10.70 | ASME B36 nominal wall |
| Sch 80 | 1/2 | 21.3 | 1.62 | 3.73 | 13.84 | ASME B36 nominal wall |
| Sch 80 | 3/4 | 26.7 | 2.2 | 3.91 | 18.88 | ASME B36 nominal wall |
| Sch 80 | 1 | 33.4 | 3.24 | 4.55 | 24.30 | ASME B36 nominal wall |
| Sch 80 | 1-1/4 | 42.2 | 4.47 | 4.85 | 32.50 | ASME B36 nominal wall |
| Sch 80 | 1-1/2 | 48.3 | 5.41 | 5.08 | 38.14 | ASME B36 nominal wall |
| Sch 80 | 2 | 60.3 | 7.48 | 5.54 | 49.22 | ASME B36 nominal wall |
| Sch 80 | 2-1/2 | 73 | 11.41 | 7.01 | 58.98 | ASME B36 nominal wall |
| Sch 80 | 3 | 88.9 | 15.27 | 7.62 | 73.66 | ASME B36 nominal wall |
| Sch 80 | 3-1/2 | 101.6 | 18.64 | 8.08 | 85.44 | ASME B36 nominal wall |
| Sch 80 | 4 | 114.3 | 22.32 | 8.56 | 97.18 | ASME B36 nominal wall |
| Sch 80 | 5 | 141.3 | 28.32 | 9.53 | 122.24 | ASME B36 nominal wall |
| Sch 80 | 8 | 219.1 | 63.08 | 12.7 | 193.70 | ASME B36 nominal wall |
| Sch 80 | 10 | 273.1 | 90.44 | 15.09 | 242.92 | ASME B36 nominal wall |
| Sch 80 | 22 | 558.8 | 373.85 | 28.58 | 501.64 | ASME B36 nominal wall |
| Sch 100 | 8 | 219.1 | 74.52 | 15.09 | 188.92 | ASME B36 nominal wall |
| Sch 100 | 10 | 273.1 | 109.3 | 18.26 | 236.58 | ASME B36 nominal wall |
| Sch 100 | 12 | 323.8 | 141.7 | 21.44 | 280.92 | ASME B36 nominal wall |
| Sch 120 | 4 | 114.3 | 28.32 | 11.13 | 92.04 | ASME B36 nominal wall |
| Sch 120 | 5 | 141.3 | 38.55 | 12.7 | 115.90 | ASME B36 nominal wall |
| Sch 120 | 6 | 168.3 | 50.03 | 14.27 | 139.76 | ASME B36 nominal wall |
| Sch 120 | 8 | 219.1 | 88.65 | 18.26 | 182.58 | ASME B36 nominal wall |
| Sch 120 | 10 | 273.1 | 130.8 | 21.44 | 230.22 | ASME B36 nominal wall |
| Sch 120 | 12 | 323.8 | 171.7 | 25.4 | 273.00 | ASME B36 nominal wall |
| Sch 140 | 8 | 219.1 | 101 | 20.62 | 177.86 | ASME B36 nominal wall |
| Sch 140 | 10 | 273.1 | 155.2 | 25.4 | 222.30 | ASME B36 nominal wall |
| Sch 140 | 12 | 323.8 | 204.9 | 28.58 | 266.64 | ASME B36 nominal wall |
| Sch 140 | 14 | 355.6 | 230.8 | 31.75 | 292.10 | ASME B36 nominal wall |
| Sch 140 | 16 | 406.4 | 297.2 | 36.53 | 333.34 | ASME B36 nominal wall |
| Sch 140 | 18 | 457.2 | 370.7 | 39.67 | 377.86 | ASME B36 nominal wall |
| Sch 160 | 1 | 33.4 | 4.55 | 6.35 | 20.70 | ASME B36 nominal wall |
| Sch 160 | 1-1/4 | 42.2 | 5.64 | 6.35 | 29.50 | ASME B36 nominal wall |
| Sch 160 | 1-1/2 | 48.3 | 7.24 | 7.14 | 34.02 | ASME B36 nominal wall |
| Sch 160 | 2 | 60.3 | 11.11 | 8.74 | 42.82 | ASME B36 nominal wall |
| Sch 160 | 2-1/2 | 73 | 16.12 | 9.53 | 53.94 | ASME B36 nominal wall |
| Sch 160 | 3 | 88.9 | 21.35 | 11.13 | 66.64 | ASME B36 nominal wall |
| Sch 160 | 4 | 114.3 | 30.94 | 13.49 | 87.32 | ASME B36 nominal wall |
| Sch 160 | 5 | 141.3 | 50.14 | 15.88 | 109.54 | ASME B36 nominal wall |
| Sch 160 | 6 | 168.3 | 64.64 | 18.26 | 131.78 | ASME B36 nominal wall |
| Sch 160 | 8 | 219.1 | 114.7 | 23.01 | 173.08 | ASME B36 nominal wall |
| Sch 160 | 10 | 273.1 | 179.8 | 28.58 | 215.94 | ASME B36 nominal wall |
| Sch 160 | 12 | 323.8 | 240 | 33.32 | 257.16 | ASME B36 nominal wall |
| Sch 160 | 14 | 355.6 | 267.5 | 35.71 | 284.18 | ASME B36 nominal wall |
| Sch 160 | 16 | 406.4 | 340.9 | 40.49 | 325.42 | ASME B36 nominal wall |
| Sch 160 | 18 | 457.2 | 425.2 | 45.24 | 366.72 | ASME B36 nominal wall |
| Sch 160 | 20 | 508 | 507.8 | 50.01 | 407.98 | ASME B36 nominal wall |
| Sch 160 | 24 | 609.6 | 711.4 | 59.54 | 490.52 | ASME B36 nominal wall |
| STD | 1/8 | 10.3 | 0.37 | 1.73 | 6.84 | ASME B36 nominal wall |
| STD | 1/4 | 13.7 | 0.63 | 2.24 | 9.22 | ASME B36 nominal wall |
| STD | 3/8 | 17.1 | 0.84 | 2.31 | 12.48 | ASME B36 nominal wall |
| STD | 1/2 | 21.3 | 1.27 | 2.77 | 15.76 | ASME B36 nominal wall |
| STD | 3/4 | 26.7 | 1.69 | 2.87 | 20.96 | ASME B36 nominal wall |
| STD | 1 | 33.4 | 2.5 | 3.38 | 26.64 | ASME B36 nominal wall |
| STD | 1-1/4 | 42.2 | 3.39 | 3.56 | 35.08 | ASME B36 nominal wall |
| STD | 1-1/2 | 48.3 | 4.05 | 3.68 | 40.94 | ASME B36 nominal wall |
| STD | 2 | 60.3 | 5.44 | 3.91 | 52.48 | ASME B36 nominal wall |
| STD | 2-1/2 | 73 | 8.63 | 5.16 | 62.68 | ASME B36 nominal wall |
| STD | 3 | 88.9 | 11.29 | 5.49 | 77.92 | ASME B36 nominal wall |
| STD | 3-1/2 | 101.6 | 13.57 | 5.74 | 90.12 | ASME B36 nominal wall |
| STD | 4 | 114.3 | 16.08 | 6.02 | 102.26 | ASME B36 nominal wall |
| STD | 5 | 141.3 | 21.77 | 6.55 | 128.20 | ASME B36 nominal wall |
| STD | 6 | 168.3 | 28.26 | 7.11 | 154.08 | ASME B36 nominal wall |
| STD | 8 | 219.1 | 42.55 | 8.18 | 202.74 | ASME B36 nominal wall |
| STD | 10 | 273.1 | 60.29 | 9.27 | 254.56 | ASME B36 nominal wall |
| XS | 1/8 | 10.3 | 0.47 | 2.41 | 5.48 | ASME B36 nominal wall |
| XS | 1/4 | 13.7 | 0.84 | 3.02 | 7.66 | ASME B36 nominal wall |
| XS | 3/8 | 17.1 | 1.1 | 3.2 | 10.70 | ASME B36 nominal wall |
| XS | 1/2 | 21.3 | 1.62 | 3.73 | 13.84 | ASME B36 nominal wall |
| XS | 3/4 | 26.7 | 2.2 | 3.91 | 18.88 | ASME B36 nominal wall |
| XS | 1 | 33.4 | 3.24 | 4.55 | 24.30 | ASME B36 nominal wall |
| XS | 1-1/4 | 42.2 | 4.47 | 4.85 | 32.50 | ASME B36 nominal wall |
| XS | 1-1/2 | 48.3 | 5.41 | 5.08 | 38.14 | ASME B36 nominal wall |
| XS | 2 | 60.3 | 7.48 | 5.54 | 49.22 | ASME B36 nominal wall |
| XS | 2-1/2 | 73 | 11.41 | 7.01 | 58.98 | ASME B36 nominal wall |
| XS | 3 | 88.9 | 15.27 | 7.62 | 73.66 | ASME B36 nominal wall |
| XS | 3-1/2 | 101.6 | 18.64 | 8.08 | 85.44 | ASME B36 nominal wall |
| XS | 4 | 114.3 | 22.32 | 8.56 | 97.18 | ASME B36 nominal wall |
| XS | 5 | 141.3 | 28.32 | 9.53 | 122.24 | ASME B36 nominal wall |
| XS | 8 | 219.1 | 63.08 | 12.7 | 193.70 | ASME B36 nominal wall |
| XXS | 1 | 33.4 | 5.45 | 9.09 | 15.22 | ASME B36 nominal wall |
| XXS | 1-1/4 | 42.2 | 7.08 | 9.7 | 22.80 | ASME B36 nominal wall |
| XXS | 1-1/2 | 48.3 | 9.1 | 10.15 | 28.00 | ASME B36 nominal wall |
| XXS | 2 | 60.3 | 13.44 | 11.07 | 38.16 | ASME B36 nominal wall |
| XXS | 2-1/2 | 73 | 19.27 | 14.02 | 44.96 | ASME B36 nominal wall |
| XXS | 3 | 88.9 | 27.68 | 15.24 | 58.42 | ASME B36 nominal wall |
| XXS | 4 | 114.3 | 36.45 | 17.12 | 80.06 | ASME B36 nominal wall |
| XXS | 5 | 141.3 | 57.43 | 19.05 | 103.20 | ASME B36 nominal wall |
| XXS | 8 | 219.1 | 109 | 22.23 | 174.64 | ASME B36 nominal wall |
| XXS | 10 | 273.1 | 163.5 | 25.4 | 222.30 | ASME B36 nominal wall |

Catalog-ready `t` additions (schedule → nps → t):

```
Sch 5S:
  { nps: "1/2", od: 21.3, wt: 0.84, t: 1.65 }
  { nps: "3/4", od: 26.7, wt: 1.1, t: 1.65 }
  { nps: "1", od: 33.4, wt: 1.59, t: 1.65 }
  { nps: "1-1/4", od: 42.2, wt: 1.96, t: 1.65 }
  { nps: "1-1/2", od: 48.3, wt: 2.24, t: 1.65 }
  { nps: "5", od: 141.3, wt: 9.23, t: 2.77 }
  { nps: "6", od: 168.3, wt: 11.56, t: 2.77 }
  { nps: "8", od: 219.1, wt: 15.8, t: 2.77 }
  { nps: "10", od: 273.1, wt: 21.77, t: 3.4 }
  { nps: "12", od: 323.8, wt: 28.26, t: 3.96 }
Sch 5:
  { nps: "1/2", od: 21.3, wt: 0.84, t: 1.65 }
  { nps: "3/4", od: 26.7, wt: 1.1, t: 1.65 }
  { nps: "1", od: 33.4, wt: 1.59, t: 1.65 }
  { nps: "1-1/4", od: 42.2, wt: 1.96, t: 1.65 }
  { nps: "1-1/2", od: 48.3, wt: 2.24, t: 1.65 }
  { nps: "5", od: 141.3, wt: 9.23, t: 2.77 }
  { nps: "6", od: 168.3, wt: 11.56, t: 2.77 }
  { nps: "8", od: 219.1, wt: 15.8, t: 2.77 }
  { nps: "10", od: 273.1, wt: 21.77, t: 3.4 }
  { nps: "12", od: 323.8, wt: 28.26, t: 3.96 }
  { nps: "14", od: 355.6, wt: 34.58, t: 3.96 }
  { nps: "16", od: 406.4, wt: 44.95, t: 4.19 }
  { nps: "20", od: 508, wt: 62.65, t: 4.78 }
  { nps: "24", od: 609.6, wt: 86.55, t: 5.54 }
  { nps: "30", od: 762, wt: 114.3, t: 6.35 }
Sch 10S:
  { nps: "1/8", od: 10.3, wt: 0.28, t: 1.24 }
  { nps: "1/4", od: 13.7, wt: 0.37, t: 1.65 }
  { nps: "3/8", od: 17.1, wt: 0.49, t: 1.65 }
  { nps: "1/2", od: 21.3, wt: 1, t: 2.11 }
  { nps: "3/4", od: 26.7, wt: 1.28, t: 2.11 }
  { nps: "1", od: 33.4, wt: 2.09, t: 2.77 }
  { nps: "1-1/4", od: 42.2, wt: 2.69, t: 2.77 }
  { nps: "1-1/2", od: 48.3, wt: 3.11, t: 2.77 }
  { nps: "2", od: 60.3, wt: 3.93, t: 2.77 }
  { nps: "2-1/2", od: 73, wt: 5.26, t: 3.05 }
  { nps: "3", od: 88.9, wt: 6.46, t: 3.05 }
  { nps: "3-1/2", od: 101.6, wt: 7.41, t: 3.05 }
  { nps: "4", od: 114.3, wt: 8.37, t: 3.05 }
  { nps: "5", od: 141.3, wt: 11.56, t: 3.4 }
  { nps: "6", od: 168.3, wt: 13.83, t: 3.4 }
  { nps: "8", od: 219.1, wt: 19.97, t: 3.76 }
  { nps: "10", od: 273.1, wt: 27.78, t: 4.19 }
  { nps: "12", od: 323.8, wt: 35.98, t: 4.57 }
Sch 10:
  { nps: "1/4", od: 13.7, wt: 0.49, t: 1.65 }
  { nps: "3/8", od: 17.1, wt: 0.63, t: 1.65 }
  { nps: "1/2", od: 21.3, wt: 1, t: 2.11 }
  { nps: "3/4", od: 26.7, wt: 1.28, t: 2.11 }
  { nps: "1", od: 33.4, wt: 2.09, t: 2.77 }
  { nps: "1-1/4", od: 42.2, wt: 2.69, t: 2.77 }
  { nps: "1-1/2", od: 48.3, wt: 3.11, t: 2.77 }
  { nps: "2", od: 60.3, wt: 3.93, t: 2.77 }
  { nps: "2-1/2", od: 73, wt: 5.26, t: 3.05 }
  { nps: "3", od: 88.9, wt: 6.46, t: 3.05 }
  { nps: "3-1/2", od: 101.6, wt: 7.41, t: 3.05 }
  { nps: "4", od: 114.3, wt: 8.37, t: 3.05 }
  { nps: "5", od: 141.3, wt: 11.56, t: 3.4 }
  { nps: "6", od: 168.3, wt: 13.83, t: 3.4 }
  { nps: "8", od: 219.1, wt: 19.97, t: 3.76 }
  { nps: "10", od: 273.1, wt: 27.78, t: 4.19 }
  { nps: "12", od: 323.8, wt: 35.98, t: 4.57 }
  { nps: "14", od: 355.6, wt: 54.69, t: 6.35 }
  { nps: "16", od: 406.4, wt: 62.65, t: 6.35 }
  { nps: "18", od: 457.2, wt: 70.57, t: 6.35 }
  { nps: "20", od: 508, wt: 78.56, t: 6.35 }
  { nps: "22", od: 558.8, wt: 86.55, t: 6.35 }
  { nps: "24", od: 609.6, wt: 94.53, t: 6.35 }
  { nps: "26", od: 660.4, wt: 127.4, t: 7.92 }
  { nps: "28", od: 711.2, wt: 137.3, t: 7.92 }
  { nps: "30", od: 762, wt: 147.3, t: 7.92 }
  { nps: "32", od: 812.8, wt: 157.3, t: 7.92 }
  { nps: "34", od: 863.6, wt: 167.2, t: 7.92 }
  { nps: "36", od: 914.4, wt: 177, t: 7.92 }
Sch 20:
  { nps: "10", od: 273.1, wt: 38.55, t: 6.35 }
  { nps: "12", od: 323.8, wt: 52.21, t: 6.35 }
  { nps: "14", od: 355.6, wt: 74.52, t: 7.92 }
  { nps: "20", od: 508, wt: 120.1, t: 9.53 }
  { nps: "22", od: 558.8, wt: 145.5, t: 9.53 }
  { nps: "24", od: 609.6, wt: 157.2, t: 9.53 }
  { nps: "30", od: 762, wt: 220.1, t: 12.7 }
  { nps: "32", od: 812.8, wt: 232.5, t: 12.7 }
  { nps: "34", od: 863.6, wt: 247, t: 12.7 }
  { nps: "36", od: 914.4, wt: 261.5, t: 12.7 }
Sch 30:
  { nps: "8", od: 219.1, wt: 33.31, t: 7.04 }
  { nps: "10", od: 273.1, wt: 48.74, t: 7.8 }
  { nps: "12", od: 323.8, wt: 63.08, t: 8.38 }
  { nps: "18", od: 457.2, wt: 138.3, t: 11.13 }
  { nps: "20", od: 508, wt: 161.8, t: 12.7 }
  { nps: "22", od: 558.8, wt: 184, t: 12.7 }
  { nps: "24", od: 609.6, wt: 205.3, t: 14.27 }
  { nps: "26", od: 660.4, wt: 228, t: 15.88 }
  { nps: "28", od: 711.2, wt: 252, t: 15.88 }
  { nps: "30", od: 762, wt: 280, t: 15.88 }
  { nps: "32", od: 812.8, wt: 305, t: 15.88 }
  { nps: "34", od: 863.6, wt: 330, t: 15.88 }
  { nps: "36", od: 914.4, wt: 360, t: 15.88 }
Sch 40S:
  { nps: "1/8", od: 10.3, wt: 0.37, t: 1.73 }
  { nps: "1/4", od: 13.7, wt: 0.63, t: 2.24 }
  { nps: "3/8", od: 17.1, wt: 0.84, t: 2.31 }
  { nps: "1/2", od: 21.3, wt: 1.27, t: 2.77 }
  { nps: "3/4", od: 26.7, wt: 1.69, t: 2.87 }
  { nps: "1", od: 33.4, wt: 2.5, t: 3.38 }
  { nps: "1-1/4", od: 42.2, wt: 3.39, t: 3.56 }
  { nps: "1-1/2", od: 48.3, wt: 4.05, t: 3.68 }
  { nps: "2", od: 60.3, wt: 5.44, t: 3.91 }
  { nps: "2-1/2", od: 73, wt: 8.63, t: 5.16 }
  { nps: "3", od: 88.9, wt: 11.29, t: 5.49 }
  { nps: "3-1/2", od: 101.6, wt: 13.57, t: 5.74 }
  { nps: "4", od: 114.3, wt: 16.08, t: 6.02 }
  { nps: "5", od: 141.3, wt: 21.77, t: 6.55 }
  { nps: "6", od: 168.3, wt: 28.26, t: 7.11 }
  { nps: "8", od: 219.1, wt: 42.55, t: 8.18 }
  { nps: "10", od: 273.1, wt: 60.29, t: 9.27 }
Sch 40:
  { nps: "1/4", od: 13.7, wt: 0.63, t: 2.24 }
  { nps: "3/8", od: 17.1, wt: 0.84, t: 2.31 }
  { nps: "1/2", od: 21.3, wt: 1.27, t: 2.77 }
  { nps: "3/4", od: 26.7, wt: 1.69, t: 2.87 }
  { nps: "1", od: 33.4, wt: 2.5, t: 3.38 }
  { nps: "1-1/4", od: 42.2, wt: 3.39, t: 3.56 }
  { nps: "1-1/2", od: 48.3, wt: 4.05, t: 3.68 }
  { nps: "2", od: 60.3, wt: 5.44, t: 3.91 }
  { nps: "2-1/2", od: 73, wt: 8.63, t: 5.16 }
  { nps: "3", od: 88.9, wt: 11.29, t: 5.49 }
  { nps: "3-1/2", od: 101.6, wt: 13.57, t: 5.74 }
  { nps: "4", od: 114.3, wt: 16.08, t: 6.02 }
  { nps: "5", od: 141.3, wt: 21.77, t: 6.55 }
  { nps: "6", od: 168.3, wt: 28.26, t: 7.11 }
  { nps: "8", od: 219.1, wt: 42.55, t: 8.18 }
  { nps: "10", od: 273.1, wt: 60.29, t: 9.27 }
  { nps: "12", od: 323.8, wt: 79.71, t: 10.31 }
  { nps: "14", od: 355.6, wt: 94.55, t: 11.13 }
  { nps: "16", od: 406.4, wt: 123.3, t: 12.7 }
  { nps: "18", od: 457.2, wt: 155.8, t: 14.27 }
  { nps: "20", od: 508, wt: 183.4, t: 15.09 }
  { nps: "24", od: 609.6, wt: 255.4, t: 17.48 }
  { nps: "32", od: 812.8, wt: 342.9, t: 17.48 }
  { nps: "34", od: 863.6, wt: 364.92, t: 17.48 }
  { nps: "36", od: 914.4, wt: 420.45, t: 19.05 }
Sch 60:
  { nps: "8", od: 219.1, wt: 52.21, t: 10.31 }
  { nps: "10", od: 273.1, wt: 74.52, t: 12.7 }
  { nps: "12", od: 323.8, wt: 99.58, t: 14.27 }
  { nps: "14", od: 355.6, wt: 115, t: 15.09 }
  { nps: "16", od: 406.4, wt: 149.3, t: 16.66 }
  { nps: "18", od: 457.2, wt: 188.8, t: 19.05 }
  { nps: "20", od: 508, wt: 224.6, t: 20.62 }
  { nps: "22", od: 558.8, wt: 294.27, t: 22.23 }
  { nps: "24", od: 609.6, wt: 314, t: 24.61 }
Sch 80S:
  { nps: "1/8", od: 10.3, wt: 0.47, t: 2.41 }
  { nps: "1/4", od: 13.7, wt: 0.84, t: 3.02 }
  { nps: "3/8", od: 17.1, wt: 1.1, t: 3.2 }
  { nps: "1/2", od: 21.3, wt: 1.62, t: 3.73 }
  { nps: "3/4", od: 26.7, wt: 2.2, t: 3.91 }
  { nps: "1", od: 33.4, wt: 3.24, t: 4.55 }
  { nps: "1-1/4", od: 42.2, wt: 4.47, t: 4.85 }
  { nps: "1-1/2", od: 48.3, wt: 5.41, t: 5.08 }
  { nps: "2", od: 60.3, wt: 7.48, t: 5.54 }
  { nps: "2-1/2", od: 73, wt: 11.41, t: 7.01 }
  { nps: "3", od: 88.9, wt: 15.27, t: 7.62 }
  { nps: "3-1/2", od: 101.6, wt: 18.64, t: 8.08 }
  { nps: "4", od: 114.3, wt: 22.32, t: 8.56 }
  { nps: "5", od: 141.3, wt: 28.32, t: 9.53 }
  { nps: "8", od: 219.1, wt: 63.08, t: 12.7 }
Sch 80:
  { nps: "1/4", od: 13.7, wt: 0.84, t: 3.02 }
  { nps: "3/8", od: 17.1, wt: 1.1, t: 3.2 }
  { nps: "1/2", od: 21.3, wt: 1.62, t: 3.73 }
  { nps: "3/4", od: 26.7, wt: 2.2, t: 3.91 }
  { nps: "1", od: 33.4, wt: 3.24, t: 4.55 }
  { nps: "1-1/4", od: 42.2, wt: 4.47, t: 4.85 }
  { nps: "1-1/2", od: 48.3, wt: 5.41, t: 5.08 }
  { nps: "2", od: 60.3, wt: 7.48, t: 5.54 }
  { nps: "2-1/2", od: 73, wt: 11.41, t: 7.01 }
  { nps: "3", od: 88.9, wt: 15.27, t: 7.62 }
  { nps: "3-1/2", od: 101.6, wt: 18.64, t: 8.08 }
  { nps: "4", od: 114.3, wt: 22.32, t: 8.56 }
  { nps: "5", od: 141.3, wt: 28.32, t: 9.53 }
  { nps: "8", od: 219.1, wt: 63.08, t: 12.7 }
  { nps: "10", od: 273.1, wt: 90.44, t: 15.09 }
  { nps: "22", od: 558.8, wt: 373.85, t: 28.58 }
Sch 100:
  { nps: "8", od: 219.1, wt: 74.52, t: 15.09 }
  { nps: "10", od: 273.1, wt: 109.3, t: 18.26 }
  { nps: "12", od: 323.8, wt: 141.7, t: 21.44 }
Sch 120:
  { nps: "4", od: 114.3, wt: 28.32, t: 11.13 }
  { nps: "5", od: 141.3, wt: 38.55, t: 12.7 }
  { nps: "6", od: 168.3, wt: 50.03, t: 14.27 }
  { nps: "8", od: 219.1, wt: 88.65, t: 18.26 }
  { nps: "10", od: 273.1, wt: 130.8, t: 21.44 }
  { nps: "12", od: 323.8, wt: 171.7, t: 25.4 }
Sch 140:
  { nps: "8", od: 219.1, wt: 101, t: 20.62 }
  { nps: "10", od: 273.1, wt: 155.2, t: 25.4 }
  { nps: "12", od: 323.8, wt: 204.9, t: 28.58 }
  { nps: "14", od: 355.6, wt: 230.8, t: 31.75 }
  { nps: "16", od: 406.4, wt: 297.2, t: 36.53 }
  { nps: "18", od: 457.2, wt: 370.7, t: 39.67 }
Sch 160:
  { nps: "1", od: 33.4, wt: 4.55, t: 6.35 }
  { nps: "1-1/4", od: 42.2, wt: 5.64, t: 6.35 }
  { nps: "1-1/2", od: 48.3, wt: 7.24, t: 7.14 }
  { nps: "2", od: 60.3, wt: 11.11, t: 8.74 }
  { nps: "2-1/2", od: 73, wt: 16.12, t: 9.53 }
  { nps: "3", od: 88.9, wt: 21.35, t: 11.13 }
  { nps: "4", od: 114.3, wt: 30.94, t: 13.49 }
  { nps: "5", od: 141.3, wt: 50.14, t: 15.88 }
  { nps: "6", od: 168.3, wt: 64.64, t: 18.26 }
  { nps: "8", od: 219.1, wt: 114.7, t: 23.01 }
  { nps: "10", od: 273.1, wt: 179.8, t: 28.58 }
  { nps: "12", od: 323.8, wt: 240, t: 33.32 }
  { nps: "14", od: 355.6, wt: 267.5, t: 35.71 }
  { nps: "16", od: 406.4, wt: 340.9, t: 40.49 }
  { nps: "18", od: 457.2, wt: 425.2, t: 45.24 }
  { nps: "20", od: 508, wt: 507.8, t: 50.01 }
  { nps: "24", od: 609.6, wt: 711.4, t: 59.54 }
STD:
  { nps: "1/8", od: 10.3, wt: 0.37, t: 1.73 }
  { nps: "1/4", od: 13.7, wt: 0.63, t: 2.24 }
  { nps: "3/8", od: 17.1, wt: 0.84, t: 2.31 }
  { nps: "1/2", od: 21.3, wt: 1.27, t: 2.77 }
  { nps: "3/4", od: 26.7, wt: 1.69, t: 2.87 }
  { nps: "1", od: 33.4, wt: 2.5, t: 3.38 }
  { nps: "1-1/4", od: 42.2, wt: 3.39, t: 3.56 }
  { nps: "1-1/2", od: 48.3, wt: 4.05, t: 3.68 }
  { nps: "2", od: 60.3, wt: 5.44, t: 3.91 }
  { nps: "2-1/2", od: 73, wt: 8.63, t: 5.16 }
  { nps: "3", od: 88.9, wt: 11.29, t: 5.49 }
  { nps: "3-1/2", od: 101.6, wt: 13.57, t: 5.74 }
  { nps: "4", od: 114.3, wt: 16.08, t: 6.02 }
  { nps: "5", od: 141.3, wt: 21.77, t: 6.55 }
  { nps: "6", od: 168.3, wt: 28.26, t: 7.11 }
  { nps: "8", od: 219.1, wt: 42.55, t: 8.18 }
  { nps: "10", od: 273.1, wt: 60.29, t: 9.27 }
XS:
  { nps: "1/8", od: 10.3, wt: 0.47, t: 2.41 }
  { nps: "1/4", od: 13.7, wt: 0.84, t: 3.02 }
  { nps: "3/8", od: 17.1, wt: 1.1, t: 3.2 }
  { nps: "1/2", od: 21.3, wt: 1.62, t: 3.73 }
  { nps: "3/4", od: 26.7, wt: 2.2, t: 3.91 }
  { nps: "1", od: 33.4, wt: 3.24, t: 4.55 }
  { nps: "1-1/4", od: 42.2, wt: 4.47, t: 4.85 }
  { nps: "1-1/2", od: 48.3, wt: 5.41, t: 5.08 }
  { nps: "2", od: 60.3, wt: 7.48, t: 5.54 }
  { nps: "2-1/2", od: 73, wt: 11.41, t: 7.01 }
  { nps: "3", od: 88.9, wt: 15.27, t: 7.62 }
  { nps: "3-1/2", od: 101.6, wt: 18.64, t: 8.08 }
  { nps: "4", od: 114.3, wt: 22.32, t: 8.56 }
  { nps: "5", od: 141.3, wt: 28.32, t: 9.53 }
  { nps: "8", od: 219.1, wt: 63.08, t: 12.7 }
XXS:
  { nps: "1", od: 33.4, wt: 5.45, t: 9.09 }
  { nps: "1-1/4", od: 42.2, wt: 7.08, t: 9.7 }
  { nps: "1-1/2", od: 48.3, wt: 9.1, t: 10.15 }
  { nps: "2", od: 60.3, wt: 13.44, t: 11.07 }
  { nps: "2-1/2", od: 73, wt: 19.27, t: 14.02 }
  { nps: "3", od: 88.9, wt: 27.68, t: 15.24 }
  { nps: "4", od: 114.3, wt: 36.45, t: 17.12 }
  { nps: "5", od: 141.3, wt: 57.43, t: 19.05 }
  { nps: "8", od: 219.1, wt: 109, t: 22.23 }
  { nps: "10", od: 273.1, wt: 163.5, t: 25.4 }
```

### B. Needs review

Includes: missing B36 wall for schedule×NPS; OD mismatch; STD/XS vs Sch 40/80 divergence; Sch *S vs non-S alias risk; Sch 30 small-NPS designation doubt; catalog `wt` far from theoretical mass for the proposed `t`.

| schedule | nps | od | wt | proposed t (mm) | ID (mm) | review reason |
| -------- | --- | -- | -- | --------------- | ------- | ------------- |
| Sch 5S | 2 | 60.3 | 2.9 | 1.65 | 57.00 | wt-suspect: catalog wt=2.9 vs theo≈2.39 (Δ=0.51) |
| Sch 5S | 2-1/2 | 73 | 4.25 | 2.11 | 68.78 | wt-suspect: catalog wt=4.25 vs theo≈3.69 (Δ=0.56) |
| Sch 5S | 3 | 88.9 | 5.45 | 2.11 | 84.68 | wt-suspect: catalog wt=5.45 vs theo≈4.52 (Δ=0.93) |
| Sch 5S | 3-1/2 | 101.6 | 6.33 | 2.11 | 97.38 | wt-suspect: catalog wt=6.33 vs theo≈5.18 (Δ=1.15) |
| Sch 5S | 4 | 114.3 | 7.21 | 2.11 | 110.08 | wt-suspect: catalog wt=7.21 vs theo≈5.84 (Δ=1.37) |
| Sch 5S | 14 | 355.6 | 34.58 | 3.96 | 347.68 | Sch 5S beyond common B36.19 chart range; using Sch 5 wall |
| Sch 5S | 16 | 406.4 | 44.95 | 4.19 | 398.02 | Sch 5S beyond common B36.19 chart range; using Sch 5 wall |
| Sch 5S | 18 | 457.2 | 55.31 | 4.19 | 448.82 | Sch 5S beyond common B36.19 chart range; using Sch 5 wall; wt-suspect: catalog wt=55.31 vs theo≈46.81 (Δ=8.50) |
| Sch 5S | 20 | 508 | 62.65 | 4.78 | 498.44 | Sch 5S beyond common B36.19 chart range; using Sch 5 wall |
| Sch 5S | 22 | 558.8 | 78.56 | 4.78 | 549.24 | Sch 5S beyond common B36.19 chart range; using Sch 5 wall; wt-suspect: catalog wt=78.56 vs theo≈65.31 (Δ=13.25) |
| Sch 5S | 24 | 609.6 | 86.55 | 5.54 | 598.52 | Sch 5S beyond common B36.19 chart range; using Sch 5 wall |
| Sch 5S | 30 | 762 | 114.3 | 6.35 | 749.30 | Sch 5S beyond common B36.19 chart range; using Sch 5 wall |
| Sch 5S | 36 | 914.4 | 136.5 | 6.35 | 901.70 | Sch 5S beyond common B36.19 chart range; using Sch 5 wall |
| Sch 5 | 2 | 60.3 | 2.9 | 1.65 | 57.00 | wt-suspect: catalog wt=2.9 vs theo≈2.39 (Δ=0.51) |
| Sch 5 | 2-1/2 | 73 | 4.25 | 2.11 | 68.78 | wt-suspect: catalog wt=4.25 vs theo≈3.69 (Δ=0.56) |
| Sch 5 | 3 | 88.9 | 5.45 | 2.11 | 84.68 | wt-suspect: catalog wt=5.45 vs theo≈4.52 (Δ=0.93) |
| Sch 5 | 3-1/2 | 101.6 | 6.33 | 2.11 | 97.38 | wt-suspect: catalog wt=6.33 vs theo≈5.18 (Δ=1.15) |
| Sch 5 | 4 | 114.3 | 7.21 | 2.11 | 110.08 | wt-suspect: catalog wt=7.21 vs theo≈5.84 (Δ=1.37) |
| Sch 5 | 18 | 457.2 | 55.31 | 4.19 | 448.82 | wt-suspect: catalog wt=55.31 vs theo≈46.81 (Δ=8.50) |
| Sch 5 | 22 | 558.8 | 78.56 | 4.78 | 549.24 | wt-suspect: catalog wt=78.56 vs theo≈65.31 (Δ=13.25) |
| Sch 10S | 14 | 355.6 | 54.69 | 4.78 | 346.04 | Sch 10S≥14 thin wall (B36.19); catalog wt may match Sch 10 6.35 instead; wt-suspect: catalog wt=54.69 vs theo≈41.36 (Δ=13.33) |
| Sch 10S | 16 | 406.4 | 62.65 | 4.78 | 396.84 | Sch 10S≥14 thin wall (B36.19); catalog wt may match Sch 10 6.35 instead; wt-suspect: catalog wt=62.65 vs theo≈47.34 (Δ=15.31) |
| Sch 10S | 18 | 457.2 | 70.57 | 4.78 | 447.64 | Sch 10S≥14 thin wall (B36.19); catalog wt may match Sch 10 6.35 instead; wt-suspect: catalog wt=70.57 vs theo≈53.33 (Δ=17.24) |
| Sch 10S | 20 | 508 | 78.56 | 5.54 | 496.92 | Sch 10S≥14 thin wall (B36.19); catalog wt may match Sch 10 6.35 instead; wt-suspect: catalog wt=78.56 vs theo≈68.65 (Δ=9.91) |
| Sch 10S | 22 | 558.8 | 75.62 | 5.54 | 547.72 | Sch 10S≥14 thin wall (B36.19); catalog wt may match Sch 10 6.35 instead |
| Sch 10S | 24 | 609.6 | 94.53 | 6.35 | 596.90 | Sch 10S≥14 thin wall (B36.19); catalog wt may match Sch 10 6.35 instead |
| Sch 10S | 30 | 762 | 147.29 | 7.92 | 746.16 | Sch 10S≥14 thin wall (B36.19); catalog wt may match Sch 10 6.35 instead |
| Sch 20 | 8 | 219.1 | 28.26 | 6.35 | 206.40 | wt-suspect: catalog wt=28.26 vs theo≈33.32 (Δ=5.06) |
| Sch 20 | 16 | 406.4 | 88.65 | 7.92 | 390.56 | wt-suspect: catalog wt=88.65 vs theo≈77.83 (Δ=10.82) |
| Sch 20 | 18 | 457.2 | 105.3 | 7.92 | 441.36 | wt-suspect: catalog wt=105.3 vs theo≈87.75 (Δ=17.55) |
| Sch 20 | 26 | 660.4 | 174.5 | 12.7 | 635.00 | wt-suspect: catalog wt=174.5 vs theo≈202.86 (Δ=28.36) |
| Sch 20 | 28 | 711.2 | 188 | 12.7 | 685.80 | wt-suspect: catalog wt=188 vs theo≈218.77 (Δ=30.77) |
| Sch 30 | 1/4 | 13.7 | 0.54 | 1.85 | 10.00 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation |
| Sch 30 | 3/8 | 17.1 | 0.7 | 1.85 | 13.40 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation |
| Sch 30 | 1/2 | 21.3 | 1.27 | 2.41 | 16.48 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation |
| Sch 30 | 3/4 | 26.7 | 1.69 | 2.41 | 21.88 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation |
| Sch 30 | 1 | 33.4 | 2.5 | 2.9 | 27.60 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation |
| Sch 30 | 1-1/4 | 42.2 | 3.39 | 2.97 | 36.26 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation; wt-suspect: catalog wt=3.39 vs theo≈2.87 (Δ=0.52) |
| Sch 30 | 1-1/2 | 48.3 | 4.05 | 3.17 | 41.96 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation; wt-suspect: catalog wt=4.05 vs theo≈3.53 (Δ=0.52) |
| Sch 30 | 2 | 60.3 | 5.44 | 3.17 | 53.96 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation; wt-suspect: catalog wt=5.44 vs theo≈4.47 (Δ=0.97) |
| Sch 30 | 2-1/2 | 73 | 8.63 | 4.78 | 63.44 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation |
| Sch 30 | 3 | 88.9 | 11.29 | 4.78 | 79.34 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation; wt-suspect: catalog wt=11.29 vs theo≈9.92 (Δ=1.37) |
| Sch 30 | 3-1/2 | 101.6 | 13.57 | 4.78 | 92.04 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation; wt-suspect: catalog wt=13.57 vs theo≈11.41 (Δ=2.16) |
| Sch 30 | 4 | 114.3 | 16.08 | 4.78 | 104.74 | Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation; wt-suspect: catalog wt=16.08 vs theo≈12.91 (Δ=3.17) |
| Sch 30 | 5 | 141.3 | 21.77 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 30 | 6 | 168.3 | 28.26 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 30 | 14 | 355.6 | 94.55 | 9.53 | 336.54 | wt-suspect: catalog wt=94.55 vs theo≈81.33 (Δ=13.22) |
| Sch 30 | 16 | 406.4 | 119.3 | 9.53 | 387.34 | wt-suspect: catalog wt=119.3 vs theo≈93.27 (Δ=26.03) |
| Sch 40S | 12 | 323.8 | 73.88 | 9.53 | 304.74 | Sch 40S≥12 = STD wall 9.53; verify vs catalog wt |
| Sch 40S | 14 | 355.6 | 94.55 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 40S | 16 | 406.4 | 123.3 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 40S | 18 | 457.2 | 155.8 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 40S | 20 | 508 | 183.4 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 40S | 24 | 609.6 | 255.4 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 80S | 6 | 168.3 | 35.64 | 10.97 | 146.36 | wt-suspect: catalog wt=35.64 vs theo≈42.56 (Δ=6.92) |
| Sch 80S | 10 | 273.1 | 90.44 | 12.7 | 247.70 | Sch 80S≥10 = XS wall 12.70; verify vs catalog wt |
| Sch 80S | 12 | 323.8 | 114.7 | 12.7 | 298.40 | Sch 80S≥10 = XS wall 12.70; verify vs catalog wt; wt-suspect: catalog wt=114.7 vs theo≈97.44 (Δ=17.26) |
| Sch 80S | 14 | 355.6 | 135.2 | 12.7 | 330.20 | Sch 80S≥10 = XS wall 12.70; verify vs catalog wt; wt-suspect: catalog wt=135.2 vs theo≈107.40 (Δ=27.80) |
| Sch 80S | 16 | 406.4 | 175.2 | 12.7 | 381.00 | Sch 80S≥10 = XS wall 12.70; verify vs catalog wt; wt-suspect: catalog wt=175.2 vs theo≈123.31 (Δ=51.89) |
| Sch 80S | 18 | 457.2 | 219.8 | 12.7 | 431.80 | Sch 80S≥10 = XS wall 12.70; verify vs catalog wt; wt-suspect: catalog wt=219.8 vs theo≈139.22 (Δ=80.58) |
| Sch 80S | 20 | 508 | 262.9 | 12.7 | 482.60 | Sch 80S≥10 = XS wall 12.70; verify vs catalog wt; wt-suspect: catalog wt=262.9 vs theo≈155.13 (Δ=107.77) |
| Sch 80S | 22 | 558.8 | 171.55 | 12.7 | 533.40 | Sch 80S≥10 = XS wall 12.70; verify vs catalog wt |
| Sch 80S | 24 | 609.6 | 371.4 | 12.7 | 584.20 | Sch 80S≥10 = XS wall 12.70; verify vs catalog wt; wt-suspect: catalog wt=371.4 vs theo≈186.95 (Δ=184.45) |
| Sch 80 | 6 | 168.3 | 35.64 | 10.97 | 146.36 | wt-suspect: catalog wt=35.64 vs theo≈42.56 (Δ=6.92) |
| Sch 80 | 12 | 323.8 | 114.7 | 17.48 | 288.84 | wt-suspect: catalog wt=114.7 vs theo≈132.05 (Δ=17.35) |
| Sch 80 | 14 | 355.6 | 135.2 | 19.05 | 317.50 | wt-suspect: catalog wt=135.2 vs theo≈158.11 (Δ=22.91) |
| Sch 80 | 16 | 406.4 | 175.2 | 21.44 | 363.52 | wt-suspect: catalog wt=175.2 vs theo≈203.54 (Δ=28.34) |
| Sch 80 | 18 | 457.2 | 219.8 | 23.83 | 409.54 | wt-suspect: catalog wt=219.8 vs theo≈254.68 (Δ=34.88) |
| Sch 80 | 20 | 508 | 262.9 | 26.19 | 455.62 | wt-suspect: catalog wt=262.9 vs theo≈311.19 (Δ=48.29) |
| Sch 80 | 24 | 609.6 | 371.4 | 30.96 | 547.68 | wt-suspect: catalog wt=371.4 vs theo≈441.80 (Δ=70.40) |
| Sch 100 | 14 | 355.6 | 163.9 | 23.83 | 307.94 | wt-suspect: catalog wt=163.9 vs theo≈194.98 (Δ=31.08) |
| Sch 100 | 16 | 406.4 | 211.6 | 26.19 | 354.02 | wt-suspect: catalog wt=211.6 vs theo≈245.57 (Δ=33.97) |
| Sch 100 | 18 | 457.2 | 265.3 | 29.36 | 398.48 | wt-suspect: catalog wt=265.3 vs theo≈309.78 (Δ=44.48) |
| Sch 100 | 20 | 508 | 317.8 | 32.54 | 442.92 | wt-suspect: catalog wt=317.8 vs theo≈381.55 (Δ=63.75) |
| Sch 100 | 24 | 609.6 | 447.8 | 38.89 | 531.82 | wt-suspect: catalog wt=447.8 vs theo≈547.36 (Δ=99.56) |
| Sch 120 | 14 | 355.6 | 194.5 | 27.79 | 300.02 | wt-suspect: catalog wt=194.5 vs theo≈224.66 (Δ=30.16) |
| Sch 120 | 16 | 406.4 | 251.4 | 30.96 | 344.48 | wt-suspect: catalog wt=251.4 vs theo≈286.66 (Δ=35.26) |
| Sch 120 | 18 | 457.2 | 313.7 | 34.93 | 387.34 | wt-suspect: catalog wt=313.7 vs theo≈363.75 (Δ=50.05) |
| Sch 120 | 20 | 508 | 375.6 | 38.1 | 431.80 | wt-suspect: catalog wt=375.6 vs theo≈441.52 (Δ=65.92) |
| Sch 120 | 24 | 609.6 | 527.3 | 46.02 | 517.56 | wt-suspect: catalog wt=527.3 vs theo≈639.62 (Δ=112.32) |
| Sch 120 | 26 | 660.4 | 580 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 120 | 28 | 711.2 | 635 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |
| Sch 140 | 20 | 508 | 444.9 | 44.45 | 419.10 | wt-suspect: catalog wt=444.9 vs theo≈508.15 (Δ=63.25) |
| Sch 140 | 24 | 609.6 | 619 | 52.37 | 504.86 | wt-suspect: catalog wt=619 vs theo≈719.68 (Δ=100.68) |
| Sch 160 | 1/2 | 21.3 | 2.55 | 4.78 | 11.74 | wt-suspect: catalog wt=2.55 vs theo≈1.95 (Δ=0.60) |
| Sch 160 | 3/4 | 26.7 | 3.64 | 5.56 | 15.58 | wt-suspect: catalog wt=3.64 vs theo≈2.90 (Δ=0.74) |
| STD | 12 | 323.8 | 73.88 | 9.53 | 304.74 | STD≥12 uses fixed 9.53 mm (≠ Sch 40) |
| STD | 14 | 355.6 | 94.55 | 9.53 | 336.54 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=94.55 vs theo≈81.33 (Δ=13.22) |
| STD | 16 | 406.4 | 123.3 | 9.53 | 387.34 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=123.3 vs theo≈93.27 (Δ=30.03) |
| STD | 18 | 457.2 | 155.8 | 9.53 | 438.14 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=155.8 vs theo≈105.21 (Δ=50.59) |
| STD | 20 | 508 | 183.4 | 9.53 | 488.94 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=183.4 vs theo≈117.15 (Δ=66.25) |
| STD | 22 | 558.8 | 205.5 | 9.53 | 539.74 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=205.5 vs theo≈129.09 (Δ=76.41) |
| STD | 24 | 609.6 | 255.4 | 9.53 | 590.54 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=255.4 vs theo≈141.03 (Δ=114.37) |
| STD | 26 | 660.4 | 283.5 | 9.53 | 641.34 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=283.5 vs theo≈152.97 (Δ=130.53) |
| STD | 28 | 711.2 | 305.9 | 9.53 | 692.14 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=305.9 vs theo≈164.91 (Δ=140.99) |
| STD | 30 | 762 | 331.3 | 9.53 | 742.94 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=331.3 vs theo≈176.85 (Δ=154.45) |
| STD | 32 | 812.8 | 354 | 9.53 | 793.74 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=354 vs theo≈188.79 (Δ=165.21) |
| STD | 34 | 863.6 | 376.9 | 9.53 | 844.54 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=376.9 vs theo≈200.73 (Δ=176.17) |
| STD | 36 | 914.4 | 400.3 | 9.53 | 895.34 | STD≥12 uses fixed 9.53 mm (≠ Sch 40); wt-suspect: catalog wt=400.3 vs theo≈212.67 (Δ=187.63) |
| XS | 6 | 168.3 | 35.64 | 10.97 | 146.36 | wt-suspect: catalog wt=35.64 vs theo≈42.56 (Δ=6.92) |
| XS | 10 | 273.1 | 90.44 | 12.7 | 247.70 | XS≥10 uses fixed 12.70 mm (≠ Sch 80) |
| XS | 12 | 323.8 | 114.7 | 12.7 | 298.40 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=114.7 vs theo≈97.44 (Δ=17.26) |
| XS | 14 | 355.6 | 135.2 | 12.7 | 330.20 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=135.2 vs theo≈107.40 (Δ=27.80) |
| XS | 16 | 406.4 | 175.2 | 12.7 | 381.00 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=175.2 vs theo≈123.31 (Δ=51.89) |
| XS | 18 | 457.2 | 219.8 | 12.7 | 431.80 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=219.8 vs theo≈139.22 (Δ=80.58) |
| XS | 20 | 508 | 262.9 | 12.7 | 482.60 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=262.9 vs theo≈155.13 (Δ=107.77) |
| XS | 22 | 558.8 | 310.7 | 12.7 | 533.40 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=310.7 vs theo≈171.04 (Δ=139.66) |
| XS | 24 | 609.6 | 371.4 | 12.7 | 584.20 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=371.4 vs theo≈186.95 (Δ=184.45) |
| XS | 26 | 660.4 | 416 | 12.7 | 635.00 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=416 vs theo≈202.86 (Δ=213.14) |
| XS | 28 | 711.2 | 449.5 | 12.7 | 685.80 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=449.5 vs theo≈218.77 (Δ=230.73) |
| XS | 30 | 762 | 487 | 12.7 | 736.60 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=487 vs theo≈234.68 (Δ=252.32) |
| XS | 32 | 812.8 | 521.3 | 12.7 | 787.40 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=521.3 vs theo≈250.59 (Δ=270.71) |
| XS | 34 | 863.6 | 555.7 | 12.7 | 838.20 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=555.7 vs theo≈266.50 (Δ=289.20) |
| XS | 36 | 914.4 | 590.1 | 12.7 | 889.00 | XS≥10 uses fixed 12.70 mm (≠ Sch 80); wt-suspect: catalog wt=590.1 vs theo≈282.41 (Δ=307.69) |
| XXS | 1/2 | 21.3 | 3.23 | 7.47 | 6.36 | wt-suspect: catalog wt=3.23 vs theo≈2.55 (Δ=0.68) |
| XXS | 3/4 | 26.7 | 4.57 | 7.82 | 11.06 | wt-suspect: catalog wt=4.57 vs theo≈3.64 (Δ=0.93) |
| XXS | 6 | 168.3 | 64.64 | 21.95 | 124.40 | wt-suspect: catalog wt=64.64 vs theo≈79.22 (Δ=14.58) |
| XXS | 12 | 323.8 | 219.9 | 25.4 | 273.00 | wt-suspect: catalog wt=219.9 vs theo≈186.92 (Δ=32.98) |
| XXS | 14 | 355.6 | 249 | — | — | B36-missing: no published wall for this schedule×NPS in sources used |

## Conflict policy

- **Do not rewrite** existing `od` or `wt` during Phase 2.
- Only **add** `t` on accepted rows.
- Skip rejected / unsigned bucket-B rows (leave without `t`; Phase 3 treats missing/`ID≤0` as fill mass 0 + geometry-unavailable).
- If a bucket-B row is accepted, record the chosen `t` explicitly in Sign-off (may differ from the proposed column).

## Out of scope

- Deriving `t` from `wt` (steel density back-calc)
- Loading `pipes.json` at runtime
- Changing fittings / flanges / valves
- Fill-media UI / mass math (Phase 3)
- Appliance Ratio formula (S-03)

## Sign-off

| Field | Value |
| ----- | ----- |
| Reviewer | User (chat confirmation) |
| Date | 2026-07-18 |
| Decision | accept all A + accept all B rows that have a proposed `t` |
| Accepted set | All section A; all section B with numeric proposed `t` (use proposed value as-is) |
| Notes | B36-missing rows (proposed `t` = —) remain without `t` — nothing to apply. Chat: “akceptuje wszystko”. |

Phase 2 may edit `data/piping_catalog.js` to add `t` on the accepted set above.
