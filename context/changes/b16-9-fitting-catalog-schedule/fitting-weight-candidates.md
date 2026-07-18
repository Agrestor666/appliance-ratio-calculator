# Fitting weight candidates

Approval artifact for `b16-9-fitting-catalog-schedule` Phase 1. **Do not edit** `data/piping_catalog.js` or `app.js` until this file’s `## Sign-off` (or equivalent chat confirmation) accepts a set of rows.

Product family: ASME B16.9 wrought butt-welding fittings. **Masses are not from the B16.9 PDF** (dimensions/tolerances/markings only). Proposed `wt` values are approximate manufacturer/industry chart kg/pc for carbon steel BW fittings.

## Sources

| # | Source | What it provides | Units / material | URL or path |
| - | ------ | ---------------- | ---------------- | ----------- |
| S1 | Wermac.org BW fitting weight tables (compiled from **Hackney Ladish, Inc.** manufacturer data) | 90°/45° LR & SR elbows, 180° returns, 3D elbows, equal tees, caps, concentric/eccentric reducers — STD / XS / Sch 160 / XXS where published | kg/pc (approx.), carbon steel | https://www.wermac.org/fittings/weights_bw_elbows.html ; …/weights_bw_elbows_180.html ; …/weights_bw_elbows_3d.html ; …/weights_bw_tees.html ; …/dim_caps.html ; …/weights_bw_reducers.html ; …/weights_bw_reducers_xs.html |
| S2 | Atlas Steels — Carbon & Stainless Steel Buttwelding Fittings (weights sheet) | Cross-check STD/XS elbows, returns, tees, caps, reducers, stub ends | kg/unit approx., carbon steel; SS guide notes | https://www.atlassteels.com.au/documents/carbon-steel-fittings-dimensions.pdf |
| S3 | Ozlinc Industries — ANSI flanges & buttweld fittings weights | Spot-check popular NPS Sch 40/80 elbows, tees, reducers | kg/ea approx. | https://www.ozlinc.com.au/ansi-flanges-buttweld-fittings-weights/ |
| S4 | ASME B16.9-2024 PDF (repo) | **Type inventory / dimensions only** — zero mass tables | n/a | `data/ASME B16.9.pdf` |

Notes:

- Chart publishers state weights are approximate; manufacturer-to-manufacturer variation is expected.
- Primary proposed numbers use **S1 (Wermac / Hackney Ladish)**. S2/S3 are corroboration references for Sign-off spot-checks.
- Material assumption: **carbon steel** BW. Stainless: charts often suggest ≈ CS Sch 40S/80S or ×1.015 — not applied here (steel-only cargo path).

## Type inventory

| B16.9 table (approx.) | Proposed catalog type key | In/out | Notes |
| --------------------- | ------------------------- | ------ | ----- |
| 6.1-1 | `90° LR Elbow` | **in** | Existing |
| 6.1-4 | `90° SR Elbow` | **in** | Existing; chart STD starts NPS 1 (no ½/¾) |
| 6.1-1 | `45° LR Elbow` | **in** | Existing |
| 6.1-2 | `LR Reducing Elbow` | **in** | New — **no numeric rows this round** (see Skipped) |
| 6.1-3 | `180° LR Return` | **in** | New — Bucket B |
| 6.1-5 | `180° SR Return` | **in** | New — Bucket B |
| 6.1-6 | `90° 3D Elbow` | **in** | New — Bucket B |
| 6.1-6 | `45° 3D Elbow` | **in** | New — Bucket B |
| 6.1-7 | `Equal Tee` | **in** | Existing |
| 6.1-7 | `Reducing Tee` | **in** | New — **no numeric rows this round** (see Skipped) |
| 6.1-8 | `Equal Cross` | **in** | New — **no numeric rows this round** (see Skipped) |
| 6.1-8 | `Reducing Cross` | **in** | New — **no numeric rows this round** (see Skipped) |
| 6.1-9 | `Lap Joint Stub End (Long)` | **in** | New — Bucket B (Wermac stub-end kg) |
| 6.1-9 | `Lap Joint Stub End (Short)` | **in** | New — **no numeric rows this round** (MSS short pattern; see Skipped) |
| 6.1-10 | `Cap` | **in** | Existing |
| 6.1-11 | `Concentric Reducer` | **in** | Existing; compound `large×small` |
| 6.1-11 | `Eccentric Reducer` | **in** | Existing; same chart wt as concentric (S1) |
| — | Laterals | **out** | Outside B16.9 §1.3 |
| — | 45° SR Elbow (separate type) | **out** | Not tabulated as separate type in B16.9 6.1-4 |

## Schedule keys

Pipe catalog vocabulary (18 keys) — fittings must use these strings only:

| Catalog key | Chart alias / proposal rule |
| ----------- | --------------------------- |
| `Sch 5S` | No S1 cells → **Skipped** |
| `Sch 5` | No S1 cells → **Skipped** |
| `Sch 10S` | No S1 cells → **Skipped** |
| `Sch 10` | No S1 cells → **Skipped** |
| `Sch 20` | No S1 cells → **Skipped** |
| `Sch 30` | No S1 cells → **Skipped** |
| `Sch 40S` | Bucket B alias of STD/Sch 40 wt for NPS ≤ 10″ (B36.19 wall equality) |
| `Sch 40` | = chart **STD** weight (alias) |
| `Sch 60` | No S1 cells → **Skipped** |
| `Sch 80S` | Bucket B alias of XS/Sch 80 wt for NPS ≤ 8″ (B36.19 wall equality) |
| `Sch 80` | = chart **XS** weight (alias) |
| `Sch 100` | No S1 cells → **Skipped** |
| `Sch 120` | No S1 cells → **Skipped** |
| `Sch 140` | No S1 cells → **Skipped** |
| `Sch 160` | Chart Sch 160 where published (Bucket B) |
| `STD` | Chart STD (same wt as Sch 40 rows) |
| `XS` | Chart XS (same wt as Sch 80 rows) |
| `XXS` | Chart XXS where published (Bucket B) |

Do **not** invent `Sch 20S`. Do not keep `FITTING_SCH_FACTORS` as a fill-in for missing schedule cells.

## Proposed rows

Proposed nested catalog shape after Phase 2: `fittings[type][schedule] = [{ nps, wt }]`.

### Coverage summary

| Metric | Count |
| ------ | ----- |
| A. recommended | 1160 |
| B. needs review | 771 |
| Schedules with proposed rows | Sch 40S, Sch 40, Sch 80S, Sch 80, Sch 160, STD, XS, XXS |

### A. Recommended

Core cargo types × primary walls (Sch 40/STD + Sch 80/XS) from S1. Prefer these for Phase 2 v1 if Sign-off accepts “A only”.

| type | schedule | nps | wt | source note |
| ---- | -------- | --- | -- | ----------- |
| 45° LR Elbow | Sch 40 | 1/2 | 0.04 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 3/4 | 0.04 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 1 | 0.11 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 1-1/4 | 0.17 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 1-1/2 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 2 | 0.37 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 2-1/2 | 0.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 3 | 1.19 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 3-1/2 | 1.59 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 4 | 2.04 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 5 | 3.4 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 6 | 5.44 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 8 | 10.43 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 10 | 19.5 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 12 | 28.12 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 14 | 36.29 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 16 | 45.36 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 18 | 57.15 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 20 | 72.57 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 22 | 89.36 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 24 | 107.95 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 26 | 124.74 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 30 | 166.47 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 40 | 36 | 240.86 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° LR Elbow | Sch 80 | 1/2 | 0.09 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 3/4 | 0.09 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 1 | 0.14 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 1-1/4 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 1-1/2 | 0.31 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 2 | 0.54 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 2-1/2 | 0.97 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 3 | 1.59 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 3-1/2 | 2.04 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 4 | 2.77 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 5 | 4.85 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 6 | 7.94 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 8 | 15.88 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 10 | 24.04 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 12 | 38.1 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 14 | 45.36 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 16 | 61.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 18 | 75.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 20 | 93.44 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 22 | 117.93 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 24 | 136.08 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 26 | 165.56 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 30 | 221.35 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | Sch 80 | 36 | 320.24 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° LR Elbow | STD | 1/2 | 0.04 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 3/4 | 0.04 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 1 | 0.11 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 1-1/4 | 0.17 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 1-1/2 | 0.18 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 2 | 0.37 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 2-1/2 | 0.79 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 3 | 1.19 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 3-1/2 | 1.59 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 4 | 2.04 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 5 | 3.4 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 6 | 5.44 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 8 | 10.43 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 10 | 19.5 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 12 | 28.12 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 14 | 36.29 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 16 | 45.36 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 18 | 57.15 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 20 | 72.57 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 22 | 89.36 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 24 | 107.95 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 26 | 124.74 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 30 | 166.47 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | STD | 36 | 240.86 | Wermac/Hackney Ladish STD |
| 45° LR Elbow | XS | 1/2 | 0.09 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 3/4 | 0.09 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 1 | 0.14 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 1-1/4 | 0.23 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 1-1/2 | 0.31 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 2 | 0.54 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 2-1/2 | 0.97 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 3 | 1.59 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 3-1/2 | 2.04 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 4 | 2.77 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 5 | 4.85 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 6 | 7.94 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 8 | 15.88 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 10 | 24.04 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 12 | 38.1 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 14 | 45.36 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 16 | 61.23 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 18 | 75.75 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 20 | 93.44 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 22 | 117.93 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 24 | 136.08 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 26 | 165.56 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 30 | 221.35 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | XS | 36 | 320.24 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | Sch 40 | 1/2 | 0.08 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 3/4 | 0.09 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 1 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 1-1/4 | 0.27 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 1-1/2 | 0.41 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 2 | 0.73 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 2-1/2 | 1.47 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 3 | 2.27 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 3-1/2 | 3.06 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 4 | 4.08 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 5 | 6.8 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 6 | 11.11 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 8 | 22.68 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 10 | 39.92 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 12 | 56.7 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 14 | 72.57 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 16 | 93.44 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 18 | 117.93 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 20 | 145.15 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 22 | 178.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 24 | 208.65 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 26 | 249.48 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 30 | 332.94 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 40 | 36 | 481.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° LR Elbow | Sch 80 | 1/2 | 0.11 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 3/4 | 0.11 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 1 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 1-1/4 | 0.41 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 1-1/2 | 0.52 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 2 | 1 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 2-1/2 | 1.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 3 | 2.95 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 3-1/2 | 3.79 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 4 | 6.12 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 5 | 9.98 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 6 | 15.88 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 8 | 32.21 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 10 | 48.53 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 12 | 72.57 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 14 | 92.99 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 16 | 125.19 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 18 | 154.22 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 20 | 190.51 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 22 | 235.87 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 24 | 272.16 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 26 | 330.67 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 30 | 442.25 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | Sch 80 | 36 | 640.47 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° LR Elbow | STD | 1/2 | 0.08 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 3/4 | 0.09 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 1 | 0.18 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 1-1/4 | 0.27 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 1-1/2 | 0.41 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 2 | 0.73 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 2-1/2 | 1.47 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 3 | 2.27 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 3-1/2 | 3.06 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 4 | 4.08 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 5 | 6.8 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 6 | 11.11 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 8 | 22.68 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 10 | 39.92 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 12 | 56.7 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 14 | 72.57 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 16 | 93.44 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 18 | 117.93 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 20 | 145.15 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 22 | 178.72 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 24 | 208.65 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 26 | 249.48 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 30 | 332.94 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | STD | 36 | 481.72 | Wermac/Hackney Ladish STD |
| 90° LR Elbow | XS | 1/2 | 0.11 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 3/4 | 0.11 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 1 | 0.23 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 1-1/4 | 0.41 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 1-1/2 | 0.52 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 2 | 1 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 2-1/2 | 1.81 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 3 | 2.95 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 3-1/2 | 3.79 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 4 | 6.12 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 5 | 9.98 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 6 | 15.88 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 8 | 32.21 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 10 | 48.53 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 12 | 72.57 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 14 | 92.99 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 16 | 125.19 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 18 | 154.22 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 20 | 190.51 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 22 | 235.87 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 24 | 272.16 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 26 | 330.67 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 30 | 442.25 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | XS | 36 | 640.47 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | Sch 40 | 1 | 0.11 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 1-1/4 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 1-1/2 | 0.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 2 | 0.45 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 2-1/2 | 0.97 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 3 | 1.36 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 3-1/2 | 2.04 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 4 | 2.83 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 5 | 4.35 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 6 | 8.16 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 8 | 15.42 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 10 | 26.31 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 12 | 36.29 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 14 | 47.63 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 16 | 59.87 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 18 | 75.75 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 20 | 95.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 40 | 24 | 135.17 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° SR Elbow | Sch 80 | 1-1/2 | 0.34 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 2 | 0.68 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 2-1/2 | 1.27 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 3 | 1.93 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 3-1/2 | 2.72 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 4 | 3.86 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 5 | 6.35 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 6 | 10.43 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 8 | 21.55 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 10 | 31.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 12 | 47.17 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 14 | 63.5 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 16 | 78.93 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 18 | 99.34 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 20 | 124.74 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | Sch 80 | 24 | 177.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° SR Elbow | STD | 1 | 0.11 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 1-1/4 | 0.18 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 1-1/2 | 0.25 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 2 | 0.45 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 2-1/2 | 0.97 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 3 | 1.36 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 3-1/2 | 2.04 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 4 | 2.83 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 5 | 4.35 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 6 | 8.16 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 8 | 15.42 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 10 | 26.31 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 12 | 36.29 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 14 | 47.63 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 16 | 59.87 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 18 | 75.75 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 20 | 95.25 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | STD | 24 | 135.17 | Wermac/Hackney Ladish STD |
| 90° SR Elbow | XS | 1-1/2 | 0.34 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 2 | 0.68 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 2-1/2 | 1.27 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 3 | 1.93 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 3-1/2 | 2.72 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 4 | 3.86 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 5 | 6.35 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 6 | 10.43 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 8 | 21.55 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 10 | 31.75 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 12 | 47.17 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 14 | 63.5 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 16 | 78.93 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 18 | 99.34 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 20 | 124.74 | Wermac/Hackney Ladish XS |
| 90° SR Elbow | XS | 24 | 177.81 | Wermac/Hackney Ladish XS |
| Cap | Sch 40 | 1 | 0.09 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 1-1/4 | 0.14 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 1-1/2 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 2 | 0.27 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 2-1/2 | 0.41 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 3 | 0.68 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 3-1/2 | 0.91 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 4 | 1.13 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 5 | 2.04 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 6 | 2.95 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 8 | 5.44 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 10 | 9.07 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 12 | 13.61 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 14 | 16.33 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 16 | 18.14 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 18 | 24.49 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 20 | 34.02 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 22 | 42.64 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 24 | 43.54 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 26 | 53.98 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 40 | 30 | 78.02 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Cap | Sch 80 | 1 | 0.14 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 1-1/4 | 0.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 1-1/2 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 2 | 0.34 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 2-1/2 | 0.45 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 3 | 0.79 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 3-1/2 | 1.13 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 4 | 1.36 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 5 | 2.49 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 6 | 4.08 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 8 | 7.26 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 10 | 11.34 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 12 | 16.33 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 14 | 20.41 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 16 | 24.49 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 18 | 32.66 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 20 | 39.01 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 22 | 56.7 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 24 | 58.97 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 26 | 72.12 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | Sch 80 | 30 | 103.87 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Cap | STD | 1 | 0.09 | Wermac/Hackney Ladish STD |
| Cap | STD | 1-1/4 | 0.14 | Wermac/Hackney Ladish STD |
| Cap | STD | 1-1/2 | 0.18 | Wermac/Hackney Ladish STD |
| Cap | STD | 2 | 0.27 | Wermac/Hackney Ladish STD |
| Cap | STD | 2-1/2 | 0.41 | Wermac/Hackney Ladish STD |
| Cap | STD | 3 | 0.68 | Wermac/Hackney Ladish STD |
| Cap | STD | 3-1/2 | 0.91 | Wermac/Hackney Ladish STD |
| Cap | STD | 4 | 1.13 | Wermac/Hackney Ladish STD |
| Cap | STD | 5 | 2.04 | Wermac/Hackney Ladish STD |
| Cap | STD | 6 | 2.95 | Wermac/Hackney Ladish STD |
| Cap | STD | 8 | 5.44 | Wermac/Hackney Ladish STD |
| Cap | STD | 10 | 9.07 | Wermac/Hackney Ladish STD |
| Cap | STD | 12 | 13.61 | Wermac/Hackney Ladish STD |
| Cap | STD | 14 | 16.33 | Wermac/Hackney Ladish STD |
| Cap | STD | 16 | 18.14 | Wermac/Hackney Ladish STD |
| Cap | STD | 18 | 24.49 | Wermac/Hackney Ladish STD |
| Cap | STD | 20 | 34.02 | Wermac/Hackney Ladish STD |
| Cap | STD | 22 | 42.64 | Wermac/Hackney Ladish STD |
| Cap | STD | 24 | 43.54 | Wermac/Hackney Ladish STD |
| Cap | STD | 26 | 53.98 | Wermac/Hackney Ladish STD |
| Cap | STD | 30 | 78.02 | Wermac/Hackney Ladish STD |
| Cap | XS | 1 | 0.14 | Wermac/Hackney Ladish XS |
| Cap | XS | 1-1/4 | 0.18 | Wermac/Hackney Ladish XS |
| Cap | XS | 1-1/2 | 0.23 | Wermac/Hackney Ladish XS |
| Cap | XS | 2 | 0.34 | Wermac/Hackney Ladish XS |
| Cap | XS | 2-1/2 | 0.45 | Wermac/Hackney Ladish XS |
| Cap | XS | 3 | 0.79 | Wermac/Hackney Ladish XS |
| Cap | XS | 3-1/2 | 1.13 | Wermac/Hackney Ladish XS |
| Cap | XS | 4 | 1.36 | Wermac/Hackney Ladish XS |
| Cap | XS | 5 | 2.49 | Wermac/Hackney Ladish XS |
| Cap | XS | 6 | 4.08 | Wermac/Hackney Ladish XS |
| Cap | XS | 8 | 7.26 | Wermac/Hackney Ladish XS |
| Cap | XS | 10 | 11.34 | Wermac/Hackney Ladish XS |
| Cap | XS | 12 | 16.33 | Wermac/Hackney Ladish XS |
| Cap | XS | 14 | 20.41 | Wermac/Hackney Ladish XS |
| Cap | XS | 16 | 24.49 | Wermac/Hackney Ladish XS |
| Cap | XS | 18 | 32.66 | Wermac/Hackney Ladish XS |
| Cap | XS | 20 | 39.01 | Wermac/Hackney Ladish XS |
| Cap | XS | 22 | 56.7 | Wermac/Hackney Ladish XS |
| Cap | XS | 24 | 58.97 | Wermac/Hackney Ladish XS |
| Cap | XS | 26 | 72.12 | Wermac/Hackney Ladish XS |
| Cap | XS | 30 | 103.87 | Wermac/Hackney Ladish XS |
| Concentric Reducer | Sch 40 | 3/4x1/2 | 0.08 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1x1/2 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1x3/4 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1-1/4x1/2 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1-1/4x3/4 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1-1/4x1 | 0.23 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1-1/2x1/2 | 0.23 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1-1/2x3/4 | 0.24 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1-1/2x1 | 0.28 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 1-1/2x1-1/4 | 0.32 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 2x3/4 | 0.32 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 2x1 | 0.34 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 2x1-1/4 | 0.38 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 2x1-1/2 | 0.41 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 2-1/2x1 | 0.57 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 2-1/2x1-1/4 | 0.57 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 2-1/2x1-1/2 | 0.63 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 2-1/2x2 | 0.68 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3x1-1/4 | 0.73 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3x1-1/2 | 0.77 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3x2 | 0.82 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3x2-1/2 | 0.91 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3-1/2x1-1/4 | 1.09 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3-1/2x1-1/2 | 1.13 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3-1/2x2 | 1.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3-1/2x2-1/2 | 1.31 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 3-1/2x3 | 1.43 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 4x1-1/2 | 1.31 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 4x2 | 1.36 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 4x2-1/2 | 1.47 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 4x3 | 1.53 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 4x3-1/2 | 1.59 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 5x2 | 2.27 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 5x2-1/2 | 2.38 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 5x3 | 2.49 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 5x3-1/2 | 2.61 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 5x4 | 2.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 6x2-1/2 | 3.29 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 6x3 | 3.63 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 6x3-1/2 | 3.74 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 6x4 | 3.74 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 6x5 | 3.86 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 8x3-1/2 | 4.99 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 8x4 | 4.99 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 8x5 | 5.44 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 8x6 | 5.99 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 10x4 | 9.07 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 10x5 | 9.53 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 10x6 | 9.75 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 10x8 | 9.98 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 12x5 | 13.61 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 12x6 | 14.06 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 12x8 | 14.51 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 12x10 | 15.42 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 14x6 | 26.31 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 14x8 | 26.54 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 14x10 | 26.85 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 14x12 | 27.22 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 16x8 | 31.07 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 16x10 | 31.52 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 16x12 | 31.75 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 16x14 | 32.21 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 18x10 | 37.19 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 18x12 | 37.65 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 18x14 | 38.1 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 18x16 | 38.56 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 20x12 | 54.43 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 20x14 | 55.34 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 20x16 | 56.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 20x18 | 56.7 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 22x14 | 55.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 22x16 | 59.42 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 22x18 | 62.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 22x20 | 64.41 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 24x16 | 65.77 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 24x18 | 67.13 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 24x20 | 68.04 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 26x18 | 82.55 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 26x20 | 86.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 26x22 | 90.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 26x24 | 93.89 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 28x20 | 90.26 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 28x22 | 95.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 28x24 | 97.98 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 28x26 | 101.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 30x20 | 99.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 30x22 | 99.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 30x24 | 101.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 30x26 | 105.23 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 40 | 30x28 | 109.32 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Concentric Reducer | Sch 80 | 3/4x1/2 | 0.1 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1x1/2 | 0.2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1x3/4 | 0.2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1-1/4x1/2 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1-1/4x3/4 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1-1/4x1 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1-1/2x1/2 | 0.29 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1-1/2x3/4 | 0.32 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1-1/2x1 | 0.34 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 1-1/2x1-1/4 | 0.35 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 2x3/4 | 0.45 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 2x1 | 0.5 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 2x1-1/4 | 0.52 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 2x1-1/2 | 0.54 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 2-1/2x1 | 0.79 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 2-1/2x1-1/4 | 0.84 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 2-1/2x1-1/2 | 0.86 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 2-1/2x2 | 0.91 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3x1-1/4 | 1.09 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3x1-1/2 | 1.13 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3x2 | 1.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3x2-1/2 | 1.25 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3-1/2x1-1/4 | 1.47 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3-1/2x1-1/2 | 1.47 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3-1/2x2 | 1.59 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3-1/2x2-1/2 | 1.59 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 3-1/2x3 | 1.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 4x1-1/2 | 1.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 4x2 | 1.93 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 4x2-1/2 | 1.99 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 4x3 | 2.04 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 4x3-1/2 | 2.15 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 5x2 | 2.95 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 5x2-1/2 | 3.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 5x3 | 3.4 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 5x3-1/2 | 3.52 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 5x4 | 3.74 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 6x2-1/2 | 4.54 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 6x3 | 4.76 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 6x3-1/2 | 4.99 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 6x4 | 5.22 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 6x5 | 5.44 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 8x3-1/2 | 7.48 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 8x4 | 7.71 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 8x5 | 8.16 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 8x6 | 8.48 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 10x4 | 11.57 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 10x5 | 12.7 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 10x6 | 13.38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 10x8 | 13.38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 12x5 | 17.69 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 12x6 | 18.14 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 12x8 | 19.05 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 12x10 | 19.73 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 14x6 | 35.38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 14x8 | 35.61 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 14x10 | 35.92 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 14x12 | 36.29 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 16x8 | 40.14 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 16x10 | 40.37 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 16x12 | 40.82 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 16x14 | 41.28 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 18x10 | 50.8 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 18x12 | 51.26 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 18x14 | 51.71 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 18x16 | 52.16 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 20x12 | 75.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 20x14 | 76.2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 20x16 | 76.66 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 20x18 | 77.11 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 22x14 | 73.94 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 22x16 | 78.47 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 22x18 | 82.55 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 22x20 | 84.37 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 24x16 | 86.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 24x18 | 88.45 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 24x20 | 90.72 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 26x18 | 109.77 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 26x20 | 114.76 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 26x22 | 123.38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 26x24 | 125.19 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 28x20 | 119.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 28x22 | 113.4 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 28x24 | 130.63 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 28x26 | 135.62 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 30x20 | 124.3 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 30x22 | 129.27 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 30x24 | 135.62 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 30x26 | 140.61 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | Sch 80 | 30x28 | 146.06 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Concentric Reducer | STD | 3/4x1/2 | 0.08 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1x1/2 | 0.18 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1x3/4 | 0.18 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1-1/4x1/2 | 0.18 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1-1/4x3/4 | 0.18 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1-1/4x1 | 0.23 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1-1/2x1/2 | 0.23 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1-1/2x3/4 | 0.24 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1-1/2x1 | 0.28 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 1-1/2x1-1/4 | 0.32 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 2x3/4 | 0.32 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 2x1 | 0.34 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 2x1-1/4 | 0.38 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 2x1-1/2 | 0.41 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 2-1/2x1 | 0.57 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 2-1/2x1-1/4 | 0.57 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 2-1/2x1-1/2 | 0.63 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 2-1/2x2 | 0.68 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3x1-1/4 | 0.73 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3x1-1/2 | 0.77 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3x2 | 0.82 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3x2-1/2 | 0.91 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3-1/2x1-1/4 | 1.09 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3-1/2x1-1/2 | 1.13 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3-1/2x2 | 1.25 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3-1/2x2-1/2 | 1.31 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 3-1/2x3 | 1.43 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 4x1-1/2 | 1.31 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 4x2 | 1.36 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 4x2-1/2 | 1.47 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 4x3 | 1.53 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 4x3-1/2 | 1.59 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 5x2 | 2.27 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 5x2-1/2 | 2.38 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 5x3 | 2.49 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 5x3-1/2 | 2.61 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 5x4 | 2.72 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 6x2-1/2 | 3.29 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 6x3 | 3.63 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 6x3-1/2 | 3.74 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 6x4 | 3.74 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 6x5 | 3.86 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 8x3-1/2 | 4.99 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 8x4 | 4.99 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 8x5 | 5.44 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 8x6 | 5.99 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 10x4 | 9.07 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 10x5 | 9.53 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 10x6 | 9.75 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 10x8 | 9.98 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 12x5 | 13.61 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 12x6 | 14.06 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 12x8 | 14.51 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 12x10 | 15.42 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 14x6 | 26.31 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 14x8 | 26.54 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 14x10 | 26.85 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 14x12 | 27.22 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 16x8 | 31.07 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 16x10 | 31.52 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 16x12 | 31.75 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 16x14 | 32.21 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 18x10 | 37.19 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 18x12 | 37.65 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 18x14 | 38.1 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 18x16 | 38.56 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 20x12 | 54.43 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 20x14 | 55.34 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 20x16 | 56.25 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 20x18 | 56.7 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 22x14 | 55.79 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 22x16 | 59.42 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 22x18 | 62.6 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 22x20 | 64.41 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 24x16 | 65.77 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 24x18 | 67.13 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 24x20 | 68.04 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 26x18 | 82.55 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 26x20 | 86.18 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 26x22 | 90.72 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 26x24 | 93.89 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 28x20 | 90.26 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 28x22 | 95.25 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 28x24 | 97.98 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 28x26 | 101.6 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 30x20 | 99.79 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 30x22 | 99.79 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 30x24 | 101.6 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 30x26 | 105.23 | Wermac/Hackney Ladish STD |
| Concentric Reducer | STD | 30x28 | 109.32 | Wermac/Hackney Ladish STD |
| Concentric Reducer | XS | 3/4x1/2 | 0.1 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1x1/2 | 0.2 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1x3/4 | 0.2 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1-1/4x1/2 | 0.23 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1-1/4x3/4 | 0.23 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1-1/4x1 | 0.23 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1-1/2x1/2 | 0.29 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1-1/2x3/4 | 0.32 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1-1/2x1 | 0.34 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 1-1/2x1-1/4 | 0.35 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 2x3/4 | 0.45 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 2x1 | 0.5 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 2x1-1/4 | 0.52 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 2x1-1/2 | 0.54 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 2-1/2x1 | 0.79 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 2-1/2x1-1/4 | 0.84 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 2-1/2x1-1/2 | 0.86 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 2-1/2x2 | 0.91 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3x1-1/4 | 1.09 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3x1-1/2 | 1.13 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3x2 | 1.18 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3x2-1/2 | 1.25 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3-1/2x1-1/4 | 1.47 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3-1/2x1-1/2 | 1.47 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3-1/2x2 | 1.59 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3-1/2x2-1/2 | 1.59 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 3-1/2x3 | 1.81 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 4x1-1/2 | 1.81 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 4x2 | 1.93 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 4x2-1/2 | 1.99 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 4x3 | 2.04 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 4x3-1/2 | 2.15 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 5x2 | 2.95 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 5x2-1/2 | 3.18 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 5x3 | 3.4 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 5x3-1/2 | 3.52 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 5x4 | 3.74 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 6x2-1/2 | 4.54 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 6x3 | 4.76 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 6x3-1/2 | 4.99 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 6x4 | 5.22 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 6x5 | 5.44 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 8x3-1/2 | 7.48 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 8x4 | 7.71 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 8x5 | 8.16 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 8x6 | 8.48 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 10x4 | 11.57 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 10x5 | 12.7 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 10x6 | 13.38 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 10x8 | 13.38 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 12x5 | 17.69 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 12x6 | 18.14 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 12x8 | 19.05 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 12x10 | 19.73 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 14x6 | 35.38 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 14x8 | 35.61 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 14x10 | 35.92 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 14x12 | 36.29 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 16x8 | 40.14 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 16x10 | 40.37 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 16x12 | 40.82 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 16x14 | 41.28 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 18x10 | 50.8 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 18x12 | 51.26 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 18x14 | 51.71 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 18x16 | 52.16 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 20x12 | 75.75 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 20x14 | 76.2 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 20x16 | 76.66 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 20x18 | 77.11 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 22x14 | 73.94 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 22x16 | 78.47 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 22x18 | 82.55 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 22x20 | 84.37 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 24x16 | 86.18 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 24x18 | 88.45 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 24x20 | 90.72 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 26x18 | 109.77 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 26x20 | 114.76 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 26x22 | 123.38 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 26x24 | 125.19 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 28x20 | 119.75 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 28x22 | 113.4 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 28x24 | 130.63 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 28x26 | 135.62 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 30x20 | 124.3 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 30x22 | 129.27 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 30x24 | 135.62 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 30x26 | 140.61 | Wermac/Hackney Ladish XS |
| Concentric Reducer | XS | 30x28 | 146.06 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | Sch 40 | 3/4x1/2 | 0.08 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1x1/2 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1x3/4 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1-1/4x1/2 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1-1/4x3/4 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1-1/4x1 | 0.23 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1-1/2x1/2 | 0.23 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1-1/2x3/4 | 0.24 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1-1/2x1 | 0.28 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 1-1/2x1-1/4 | 0.32 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 2x3/4 | 0.32 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 2x1 | 0.34 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 2x1-1/4 | 0.38 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 2x1-1/2 | 0.41 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 2-1/2x1 | 0.57 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 2-1/2x1-1/4 | 0.57 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 2-1/2x1-1/2 | 0.63 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 2-1/2x2 | 0.68 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3x1-1/4 | 0.73 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3x1-1/2 | 0.77 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3x2 | 0.82 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3x2-1/2 | 0.91 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3-1/2x1-1/4 | 1.09 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3-1/2x1-1/2 | 1.13 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3-1/2x2 | 1.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3-1/2x2-1/2 | 1.31 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 3-1/2x3 | 1.43 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 4x1-1/2 | 1.31 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 4x2 | 1.36 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 4x2-1/2 | 1.47 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 4x3 | 1.53 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 4x3-1/2 | 1.59 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 5x2 | 2.27 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 5x2-1/2 | 2.38 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 5x3 | 2.49 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 5x3-1/2 | 2.61 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 5x4 | 2.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 6x2-1/2 | 3.29 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 6x3 | 3.63 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 6x3-1/2 | 3.74 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 6x4 | 3.74 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 6x5 | 3.86 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 8x3-1/2 | 4.99 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 8x4 | 4.99 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 8x5 | 5.44 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 8x6 | 5.99 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 10x4 | 9.07 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 10x5 | 9.53 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 10x6 | 9.75 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 10x8 | 9.98 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 12x5 | 13.61 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 12x6 | 14.06 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 12x8 | 14.51 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 12x10 | 15.42 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 14x6 | 26.31 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 14x8 | 26.54 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 14x10 | 26.85 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 14x12 | 27.22 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 16x8 | 31.07 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 16x10 | 31.52 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 16x12 | 31.75 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 16x14 | 32.21 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 18x10 | 37.19 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 18x12 | 37.65 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 18x14 | 38.1 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 18x16 | 38.56 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 20x12 | 54.43 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 20x14 | 55.34 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 20x16 | 56.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 20x18 | 56.7 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 22x14 | 55.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 22x16 | 59.42 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 22x18 | 62.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 22x20 | 64.41 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 24x16 | 65.77 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 24x18 | 67.13 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 24x20 | 68.04 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 26x18 | 82.55 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 26x20 | 86.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 26x22 | 90.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 26x24 | 93.89 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 28x20 | 90.26 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 28x22 | 95.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 28x24 | 97.98 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 28x26 | 101.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 30x20 | 99.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 30x22 | 99.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 30x24 | 101.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 30x26 | 105.23 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 40 | 30x28 | 109.32 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Eccentric Reducer | Sch 80 | 3/4x1/2 | 0.1 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1x1/2 | 0.2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1x3/4 | 0.2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1-1/4x1/2 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1-1/4x3/4 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1-1/4x1 | 0.23 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1-1/2x1/2 | 0.29 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1-1/2x3/4 | 0.32 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1-1/2x1 | 0.34 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 1-1/2x1-1/4 | 0.35 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 2x3/4 | 0.45 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 2x1 | 0.5 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 2x1-1/4 | 0.52 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 2x1-1/2 | 0.54 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 2-1/2x1 | 0.79 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 2-1/2x1-1/4 | 0.84 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 2-1/2x1-1/2 | 0.86 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 2-1/2x2 | 0.91 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3x1-1/4 | 1.09 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3x1-1/2 | 1.13 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3x2 | 1.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3x2-1/2 | 1.25 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3-1/2x1-1/4 | 1.47 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3-1/2x1-1/2 | 1.47 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3-1/2x2 | 1.59 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3-1/2x2-1/2 | 1.59 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 3-1/2x3 | 1.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 4x1-1/2 | 1.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 4x2 | 1.93 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 4x2-1/2 | 1.99 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 4x3 | 2.04 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 4x3-1/2 | 2.15 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 5x2 | 2.95 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 5x2-1/2 | 3.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 5x3 | 3.4 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 5x3-1/2 | 3.52 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 5x4 | 3.74 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 6x2-1/2 | 4.54 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 6x3 | 4.76 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 6x3-1/2 | 4.99 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 6x4 | 5.22 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 6x5 | 5.44 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 8x3-1/2 | 7.48 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 8x4 | 7.71 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 8x5 | 8.16 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 8x6 | 8.48 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 10x4 | 11.57 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 10x5 | 12.7 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 10x6 | 13.38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 10x8 | 13.38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 12x5 | 17.69 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 12x6 | 18.14 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 12x8 | 19.05 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 12x10 | 19.73 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 14x6 | 35.38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 14x8 | 35.61 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 14x10 | 35.92 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 14x12 | 36.29 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 16x8 | 40.14 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 16x10 | 40.37 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 16x12 | 40.82 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 16x14 | 41.28 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 18x10 | 50.8 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 18x12 | 51.26 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 18x14 | 51.71 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 18x16 | 52.16 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 20x12 | 75.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 20x14 | 76.2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 20x16 | 76.66 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 20x18 | 77.11 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 22x14 | 73.94 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 22x16 | 78.47 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 22x18 | 82.55 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 22x20 | 84.37 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 24x16 | 86.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 24x18 | 88.45 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 24x20 | 90.72 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 26x18 | 109.77 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 26x20 | 114.76 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 26x22 | 123.38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 26x24 | 125.19 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 28x20 | 119.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 28x22 | 113.4 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 28x24 | 130.63 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 28x26 | 135.62 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 30x20 | 124.3 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 30x22 | 129.27 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 30x24 | 135.62 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 30x26 | 140.61 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | Sch 80 | 30x28 | 146.06 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Eccentric Reducer | STD | 3/4x1/2 | 0.08 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1x1/2 | 0.18 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1x3/4 | 0.18 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1-1/4x1/2 | 0.18 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1-1/4x3/4 | 0.18 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1-1/4x1 | 0.23 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1-1/2x1/2 | 0.23 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1-1/2x3/4 | 0.24 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1-1/2x1 | 0.28 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 1-1/2x1-1/4 | 0.32 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 2x3/4 | 0.32 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 2x1 | 0.34 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 2x1-1/4 | 0.38 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 2x1-1/2 | 0.41 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 2-1/2x1 | 0.57 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 2-1/2x1-1/4 | 0.57 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 2-1/2x1-1/2 | 0.63 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 2-1/2x2 | 0.68 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3x1-1/4 | 0.73 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3x1-1/2 | 0.77 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3x2 | 0.82 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3x2-1/2 | 0.91 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3-1/2x1-1/4 | 1.09 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3-1/2x1-1/2 | 1.13 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3-1/2x2 | 1.25 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3-1/2x2-1/2 | 1.31 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 3-1/2x3 | 1.43 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 4x1-1/2 | 1.31 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 4x2 | 1.36 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 4x2-1/2 | 1.47 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 4x3 | 1.53 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 4x3-1/2 | 1.59 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 5x2 | 2.27 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 5x2-1/2 | 2.38 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 5x3 | 2.49 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 5x3-1/2 | 2.61 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 5x4 | 2.72 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 6x2-1/2 | 3.29 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 6x3 | 3.63 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 6x3-1/2 | 3.74 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 6x4 | 3.74 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 6x5 | 3.86 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 8x3-1/2 | 4.99 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 8x4 | 4.99 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 8x5 | 5.44 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 8x6 | 5.99 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 10x4 | 9.07 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 10x5 | 9.53 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 10x6 | 9.75 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 10x8 | 9.98 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 12x5 | 13.61 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 12x6 | 14.06 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 12x8 | 14.51 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 12x10 | 15.42 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 14x6 | 26.31 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 14x8 | 26.54 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 14x10 | 26.85 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 14x12 | 27.22 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 16x8 | 31.07 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 16x10 | 31.52 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 16x12 | 31.75 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 16x14 | 32.21 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 18x10 | 37.19 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 18x12 | 37.65 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 18x14 | 38.1 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 18x16 | 38.56 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 20x12 | 54.43 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 20x14 | 55.34 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 20x16 | 56.25 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 20x18 | 56.7 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 22x14 | 55.79 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 22x16 | 59.42 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 22x18 | 62.6 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 22x20 | 64.41 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 24x16 | 65.77 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 24x18 | 67.13 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 24x20 | 68.04 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 26x18 | 82.55 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 26x20 | 86.18 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 26x22 | 90.72 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 26x24 | 93.89 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 28x20 | 90.26 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 28x22 | 95.25 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 28x24 | 97.98 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 28x26 | 101.6 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 30x20 | 99.79 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 30x22 | 99.79 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 30x24 | 101.6 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 30x26 | 105.23 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | STD | 30x28 | 109.32 | Wermac/Hackney Ladish STD |
| Eccentric Reducer | XS | 3/4x1/2 | 0.1 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1x1/2 | 0.2 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1x3/4 | 0.2 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1-1/4x1/2 | 0.23 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1-1/4x3/4 | 0.23 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1-1/4x1 | 0.23 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1-1/2x1/2 | 0.29 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1-1/2x3/4 | 0.32 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1-1/2x1 | 0.34 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 1-1/2x1-1/4 | 0.35 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 2x3/4 | 0.45 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 2x1 | 0.5 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 2x1-1/4 | 0.52 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 2x1-1/2 | 0.54 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 2-1/2x1 | 0.79 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 2-1/2x1-1/4 | 0.84 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 2-1/2x1-1/2 | 0.86 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 2-1/2x2 | 0.91 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3x1-1/4 | 1.09 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3x1-1/2 | 1.13 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3x2 | 1.18 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3x2-1/2 | 1.25 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3-1/2x1-1/4 | 1.47 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3-1/2x1-1/2 | 1.47 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3-1/2x2 | 1.59 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3-1/2x2-1/2 | 1.59 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 3-1/2x3 | 1.81 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 4x1-1/2 | 1.81 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 4x2 | 1.93 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 4x2-1/2 | 1.99 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 4x3 | 2.04 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 4x3-1/2 | 2.15 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 5x2 | 2.95 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 5x2-1/2 | 3.18 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 5x3 | 3.4 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 5x3-1/2 | 3.52 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 5x4 | 3.74 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 6x2-1/2 | 4.54 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 6x3 | 4.76 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 6x3-1/2 | 4.99 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 6x4 | 5.22 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 6x5 | 5.44 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 8x3-1/2 | 7.48 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 8x4 | 7.71 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 8x5 | 8.16 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 8x6 | 8.48 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 10x4 | 11.57 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 10x5 | 12.7 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 10x6 | 13.38 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 10x8 | 13.38 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 12x5 | 17.69 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 12x6 | 18.14 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 12x8 | 19.05 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 12x10 | 19.73 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 14x6 | 35.38 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 14x8 | 35.61 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 14x10 | 35.92 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 14x12 | 36.29 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 16x8 | 40.14 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 16x10 | 40.37 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 16x12 | 40.82 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 16x14 | 41.28 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 18x10 | 50.8 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 18x12 | 51.26 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 18x14 | 51.71 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 18x16 | 52.16 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 20x12 | 75.75 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 20x14 | 76.2 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 20x16 | 76.66 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 20x18 | 77.11 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 22x14 | 73.94 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 22x16 | 78.47 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 22x18 | 82.55 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 22x20 | 84.37 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 24x16 | 86.18 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 24x18 | 88.45 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 24x20 | 90.72 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 26x18 | 109.77 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 26x20 | 114.76 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 26x22 | 123.38 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 26x24 | 125.19 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 28x20 | 119.75 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 28x22 | 113.4 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 28x24 | 130.63 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 28x26 | 135.62 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 30x20 | 124.3 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 30x22 | 129.27 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 30x24 | 135.62 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 30x26 | 140.61 | Wermac/Hackney Ladish XS |
| Eccentric Reducer | XS | 30x28 | 146.06 | Wermac/Hackney Ladish XS |
| Equal Tee | Sch 40 | 1/2 | 0.16 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 3/4 | 0.2 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 1 | 0.34 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 1-1/4 | 0.59 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 1-1/2 | 0.91 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 2 | 1.59 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 2-1/2 | 2.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 3 | 3.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 3-1/2 | 4.08 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 4 | 5.44 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 5 | 9.53 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 6 | 15.42 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 8 | 24.95 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 10 | 38.56 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 12 | 54.43 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 14 | 74.84 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 16 | 88.45 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 18 | 112.94 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 20 | 155.13 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 22 | 187.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 24 | 239.5 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 26 | 349.27 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 30 | 480.81 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 40 | 36 | 675.85 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Equal Tee | Sch 80 | 1/2 | 0.2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 3/4 | 0.27 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 1 | 0.4 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 1-1/4 | 0.73 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 1-1/2 | 1.02 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 2 | 1.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 2-1/2 | 3.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 3 | 3.86 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 3-1/2 | 5.44 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 4 | 7.17 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 5 | 11.79 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 6 | 18.14 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 8 | 34.02 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 10 | 47.63 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 12 | 72.57 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 14 | 108.86 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 16 | 127.01 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 18 | 150.59 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 20 | 217.72 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 22 | 249.48 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 24 | 276.69 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 26 | 396.89 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 30 | 544.31 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | Sch 80 | 36 | 771.11 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Equal Tee | STD | 1/2 | 0.16 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 3/4 | 0.2 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 1 | 0.34 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 1-1/4 | 0.59 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 1-1/2 | 0.91 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 2 | 1.59 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 2-1/2 | 2.72 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 3 | 3.18 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 3-1/2 | 4.08 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 4 | 5.44 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 5 | 9.53 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 6 | 15.42 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 8 | 24.95 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 10 | 38.56 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 12 | 54.43 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 14 | 74.84 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 16 | 88.45 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 18 | 112.94 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 20 | 155.13 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 22 | 187.79 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 24 | 239.5 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 26 | 349.27 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 30 | 480.81 | Wermac/Hackney Ladish STD |
| Equal Tee | STD | 36 | 675.85 | Wermac/Hackney Ladish STD |
| Equal Tee | XS | 1/2 | 0.2 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 3/4 | 0.27 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 1 | 0.4 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 1-1/4 | 0.73 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 1-1/2 | 1.02 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 2 | 1.81 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 2-1/2 | 3.18 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 3 | 3.86 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 3-1/2 | 5.44 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 4 | 7.17 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 5 | 11.79 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 6 | 18.14 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 8 | 34.02 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 10 | 47.63 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 12 | 72.57 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 14 | 108.86 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 16 | 127.01 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 18 | 150.59 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 20 | 217.72 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 22 | 249.48 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 24 | 276.69 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 26 | 396.89 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 30 | 544.31 | Wermac/Hackney Ladish XS |
| Equal Tee | XS | 36 | 771.11 | Wermac/Hackney Ladish XS |

### B. Needs review

New B16.9 types (returns, 3D, stub ends), heavier walls (Sch 160 / XXS), and Sch 40S/80S wall-alias copies. Accept selectively.

| type | schedule | nps | wt | source note |
| ---- | -------- | --- | -- | ----------- |
| 180° LR Return | Sch 40 | 1/2 | 0.16 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 3/4 | 0.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 1 | 0.34 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 1-1/4 | 0.57 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 1-1/2 | 0.85 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 2 | 1.47 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 2-1/2 | 2.95 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 3 | 4.65 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 3-1/2 | 5.9 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 4 | 8.39 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 5 | 13.61 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 6 | 22.68 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 8 | 43.09 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 10 | 53.07 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 12 | 104.33 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 14 | 147.42 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 16 | 186.88 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 18 | 231.33 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 20 | 290.3 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 22 | 356.98 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 40 | 24 | 403.7 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° LR Return | Sch 80 | 3/4 | 0.29 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 1 | 0.45 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 1-1/4 | 0.79 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 1-1/2 | 1.08 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 2 | 2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 2-1/2 | 3.63 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 3 | 5.9 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 3-1/2 | 7.6 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 4 | 11.34 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 5 | 19.96 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 6 | 31.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 8 | 64.41 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 10 | 97.52 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 12 | 145.15 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 14 | 181.44 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 16 | 249.48 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 18 | 312.98 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 20 | 376.48 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 22 | 471.74 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | Sch 80 | 24 | 544.31 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° LR Return | STD | 1/2 | 0.16 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 3/4 | 0.18 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 1 | 0.34 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 1-1/4 | 0.57 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 1-1/2 | 0.85 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 2 | 1.47 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 2-1/2 | 2.95 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 3 | 4.65 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 3-1/2 | 5.9 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 4 | 8.39 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 5 | 13.61 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 6 | 22.68 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 8 | 43.09 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 10 | 53.07 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 12 | 104.33 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 14 | 147.42 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 16 | 186.88 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 18 | 231.33 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 20 | 290.3 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 22 | 356.98 | Wermac/Hackney Ladish STD |
| 180° LR Return | STD | 24 | 403.7 | Wermac/Hackney Ladish STD |
| 180° LR Return | XS | 3/4 | 0.29 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 1 | 0.45 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 1-1/4 | 0.79 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 1-1/2 | 1.08 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 2 | 2 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 2-1/2 | 3.63 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 3 | 5.9 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 3-1/2 | 7.6 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 4 | 11.34 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 5 | 19.96 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 6 | 31.75 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 8 | 64.41 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 10 | 97.52 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 12 | 145.15 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 14 | 181.44 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 16 | 249.48 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 18 | 312.98 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 20 | 376.48 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 22 | 471.74 | Wermac/Hackney Ladish XS |
| 180° LR Return | XS | 24 | 544.31 | Wermac/Hackney Ladish XS |
| 180° SR Return | Sch 40 | 1 | 0.23 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 1-1/4 | 0.36 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 1-1/2 | 0.51 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 2 | 0.91 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 2-1/2 | 1.93 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 3 | 2.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 3-1/2 | 4.08 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 4 | 5.67 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 5 | 8.62 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 6 | 15.88 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 8 | 30.84 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 10 | 52.16 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 12 | 70.31 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 14 | 95.25 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 16 | 117.93 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 18 | 149.69 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 20 | 185.97 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 40 | 24 | 267.62 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 180° SR Return | Sch 80 | 1-1/2 | 0.68 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 2 | 1.36 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 2-1/2 | 2.54 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 3 | 3.86 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 3-1/2 | 5.44 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 4 | 7.71 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 5 | 12.7 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 6 | 20.87 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 8 | 45.36 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 10 | 63.5 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 12 | 98.88 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 14 | 124.74 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 16 | 154.22 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 18 | 195.04 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 20 | 249.48 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | Sch 80 | 24 | 353.8 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 180° SR Return | STD | 1 | 0.23 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 1-1/4 | 0.36 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 1-1/2 | 0.51 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 2 | 0.91 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 2-1/2 | 1.93 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 3 | 2.72 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 3-1/2 | 4.08 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 4 | 5.67 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 5 | 8.62 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 6 | 15.88 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 8 | 30.84 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 10 | 52.16 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 12 | 70.31 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 14 | 95.25 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 16 | 117.93 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 18 | 149.69 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 20 | 185.97 | Wermac/Hackney Ladish STD |
| 180° SR Return | STD | 24 | 267.62 | Wermac/Hackney Ladish STD |
| 180° SR Return | XS | 1-1/2 | 0.68 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 2 | 1.36 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 2-1/2 | 2.54 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 3 | 3.86 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 3-1/2 | 5.44 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 4 | 7.71 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 5 | 12.7 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 6 | 20.87 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 8 | 45.36 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 10 | 63.5 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 12 | 98.88 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 14 | 124.74 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 16 | 154.22 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 18 | 195.04 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 20 | 249.48 | Wermac/Hackney Ladish XS |
| 180° SR Return | XS | 24 | 353.8 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | Sch 40 | 2 | 0.68 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 2-1/2 | 1.36 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 3 | 2.27 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 3-1/2 | 3.18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 4 | 4.08 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 5 | 6.8 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 6 | 10.43 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 8 | 20.41 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 10 | 36.29 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 12 | 53.07 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 14 | 67.59 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 16 | 88.45 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 18 | 112.49 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 20 | 138.35 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 22 | 166.92 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 24 | 198.67 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 26 | 233.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 30 | 310.71 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 40 | 36 | 446.79 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 45° 3D Elbow | Sch 80 | 2 | 0.95 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 2-1/2 | 1.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 3 | 3.18 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 3-1/2 | 4.08 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 4 | 5.9 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 5 | 9.98 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 6 | 15.88 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 8 | 31.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 10 | 49.44 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 12 | 70.31 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 14 | 90.72 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 16 | 117.93 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 18 | 149.69 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 20 | 183.7 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 22 | 222.26 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 24 | 265.35 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 26 | 310.71 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 30 | 415.04 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | Sch 80 | 36 | 596.47 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 45° 3D Elbow | STD | 2 | 0.68 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 2-1/2 | 1.36 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 3 | 2.27 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 3-1/2 | 3.18 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 4 | 4.08 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 5 | 6.8 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 6 | 10.43 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 8 | 20.41 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 10 | 36.29 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 12 | 53.07 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 14 | 67.59 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 16 | 88.45 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 18 | 112.49 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 20 | 138.35 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 22 | 166.92 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 24 | 198.67 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 26 | 233.6 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 30 | 310.71 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | STD | 36 | 446.79 | Wermac/Hackney Ladish STD |
| 45° 3D Elbow | XS | 2 | 0.95 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 2-1/2 | 1.81 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 3 | 3.18 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 3-1/2 | 4.08 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 4 | 5.9 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 5 | 9.98 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 6 | 15.88 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 8 | 31.75 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 10 | 49.44 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 12 | 70.31 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 14 | 90.72 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 16 | 117.93 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 18 | 149.69 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 20 | 183.7 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 22 | 222.26 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 24 | 265.35 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 26 | 310.71 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 30 | 415.04 | Wermac/Hackney Ladish XS |
| 45° 3D Elbow | XS | 36 | 596.47 | Wermac/Hackney Ladish XS |
| 45° LR Elbow | Sch 40S | 1/2 | 0.04 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 3/4 | 0.04 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 1 | 0.11 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 1-1/4 | 0.17 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 1-1/2 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 2 | 0.37 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 2-1/2 | 0.79 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 3 | 1.19 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 3-1/2 | 1.59 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 4 | 2.04 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 5 | 3.4 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 6 | 5.44 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 8 | 10.43 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 40S | 10 | 19.5 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 45° LR Elbow | Sch 80S | 1/2 | 0.09 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 3/4 | 0.09 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 1 | 0.14 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 1-1/4 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 1-1/2 | 0.31 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 2 | 0.54 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 2-1/2 | 0.97 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 3 | 1.59 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 3-1/2 | 2.04 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 4 | 2.77 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 5 | 4.85 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 6 | 7.94 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 45° LR Elbow | Sch 80S | 8 | 15.88 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° 3D Elbow | Sch 40 | 2 | 1.36 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 2-1/2 | 2.72 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 3 | 4.54 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 3-1/2 | 5.9 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 4 | 8.16 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 5 | 13.15 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 6 | 20.41 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 8 | 40.82 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 10 | 72.12 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 12 | 105.69 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 14 | 135.17 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 16 | 176.9 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 18 | 224.53 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 20 | 276.69 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 22 | 333.39 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 24 | 396.89 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 26 | 467.2 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 30 | 621.42 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 40 | 36 | 893.58 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| 90° 3D Elbow | Sch 80 | 2 | 1.81 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 2-1/2 | 3.63 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 3 | 5.9 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 3-1/2 | 8.16 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 4 | 11.34 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 5 | 19.5 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 6 | 31.75 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 8 | 63.5 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 10 | 98.88 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 12 | 140.61 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 14 | 181.44 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 16 | 235.87 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 18 | 299.37 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 20 | 367.41 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 22 | 444.52 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 24 | 530.7 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 26 | 621.42 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 30 | 830.07 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | Sch 80 | 36 | 1192.95 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| 90° 3D Elbow | STD | 2 | 1.36 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 2-1/2 | 2.72 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 3 | 4.54 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 3-1/2 | 5.9 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 4 | 8.16 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 5 | 13.15 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 6 | 20.41 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 8 | 40.82 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 10 | 72.12 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 12 | 105.69 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 14 | 135.17 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 16 | 176.9 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 18 | 224.53 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 20 | 276.69 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 22 | 333.39 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 24 | 396.89 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 26 | 467.2 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 30 | 621.42 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | STD | 36 | 893.58 | Wermac/Hackney Ladish STD |
| 90° 3D Elbow | XS | 2 | 1.81 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 2-1/2 | 3.63 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 3 | 5.9 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 3-1/2 | 8.16 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 4 | 11.34 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 5 | 19.5 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 6 | 31.75 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 8 | 63.5 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 10 | 98.88 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 12 | 140.61 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 14 | 181.44 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 16 | 235.87 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 18 | 299.37 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 20 | 367.41 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 22 | 444.52 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 24 | 530.7 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 26 | 621.42 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 30 | 830.07 | Wermac/Hackney Ladish XS |
| 90° 3D Elbow | XS | 36 | 1192.95 | Wermac/Hackney Ladish XS |
| 90° LR Elbow | Sch 40S | 1/2 | 0.08 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 3/4 | 0.09 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 1 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 1-1/4 | 0.27 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 1-1/2 | 0.41 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 2 | 0.73 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 2-1/2 | 1.47 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 3 | 2.27 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 3-1/2 | 3.06 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 4 | 4.08 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 5 | 6.8 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 6 | 11.11 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 8 | 22.68 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 40S | 10 | 39.92 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° LR Elbow | Sch 80S | 1/2 | 0.11 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 3/4 | 0.11 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 1 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 1-1/4 | 0.41 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 1-1/2 | 0.52 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 2 | 1 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 2-1/2 | 1.81 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 3 | 2.95 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 3-1/2 | 3.79 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 4 | 6.12 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 5 | 9.98 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 6 | 15.88 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 80S | 8 | 32.21 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° LR Elbow | Sch 160 | 1 | 0.27 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 1-1/4 | 0.45 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 1-1/2 | 0.82 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 2 | 1.47 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 2-1/2 | 2.33 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 3 | 3.86 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 4 | 8.16 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 5 | 14.51 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 6 | 25.85 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 8 | 54.43 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 10 | 117.93 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 12 | 204.12 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | Sch 160 | 14 | 259.45 | Wermac/Hackney Ladish Sch 160 |
| 90° LR Elbow | XXS | 1 | 0.34 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 1-1/4 | 0.63 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 1-1/2 | 0.68 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 2 | 1.59 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 2-1/2 | 3.18 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 3 | 4.99 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 3-1/2 | 7.26 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 4 | 9.07 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 5 | 16.33 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 6 | 29.48 | Wermac/Hackney Ladish XXS |
| 90° LR Elbow | XXS | 8 | 53.52 | Wermac/Hackney Ladish XXS |
| 90° SR Elbow | Sch 40S | 1 | 0.11 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 1-1/4 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 1-1/2 | 0.25 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 2 | 0.45 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 2-1/2 | 0.97 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 3 | 1.36 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 3-1/2 | 2.04 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 4 | 2.83 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 5 | 4.35 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 6 | 8.16 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 8 | 15.42 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 40S | 10 | 26.31 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| 90° SR Elbow | Sch 80S | 1-1/2 | 0.34 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° SR Elbow | Sch 80S | 2 | 0.68 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° SR Elbow | Sch 80S | 2-1/2 | 1.27 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° SR Elbow | Sch 80S | 3 | 1.93 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° SR Elbow | Sch 80S | 3-1/2 | 2.72 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° SR Elbow | Sch 80S | 4 | 3.86 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° SR Elbow | Sch 80S | 5 | 6.35 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° SR Elbow | Sch 80S | 6 | 10.43 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| 90° SR Elbow | Sch 80S | 8 | 21.55 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 40S | 1 | 0.09 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 1-1/4 | 0.14 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 1-1/2 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 2 | 0.27 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 2-1/2 | 0.41 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 3 | 0.68 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 3-1/2 | 0.91 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 4 | 1.13 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 5 | 2.04 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 6 | 2.95 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 8 | 5.44 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 40S | 10 | 9.07 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Cap | Sch 80S | 1 | 0.14 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 1-1/4 | 0.18 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 1-1/2 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 2 | 0.34 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 2-1/2 | 0.45 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 3 | 0.79 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 3-1/2 | 1.13 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 4 | 1.36 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 5 | 2.49 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 6 | 4.08 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 80S | 8 | 7.26 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Cap | Sch 160 | 1 | 0.18 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 1-1/4 | 0.23 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 1-1/2 | 0.27 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 2 | 0.57 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 2-1/2 | 0.79 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 3 | 1.32 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 4 | 2.68 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 5 | 4.54 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 6 | 6.8 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 8 | 14.06 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 10 | 25.85 | Wermac/Hackney Ladish Sch 160 |
| Cap | Sch 160 | 12 | 43.09 | Wermac/Hackney Ladish Sch 160 |
| Cap | XXS | 1 | 0.23 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 1-1/4 | 0.34 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 1-1/2 | 0.41 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 2 | 0.68 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 2-1/2 | 1.13 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 3 | 1.81 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 3-1/2 | 2.72 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 4 | 3.4 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 5 | 5.44 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 6 | 8.16 | Wermac/Hackney Ladish XXS |
| Cap | XXS | 8 | 13.61 | Wermac/Hackney Ladish XXS |
| Concentric Reducer | Sch 40S | 3/4x1/2 | 0.08 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1x1/2 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1x3/4 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1-1/4x1/2 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1-1/4x3/4 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1-1/4x1 | 0.23 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1-1/2x1/2 | 0.23 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1-1/2x3/4 | 0.24 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1-1/2x1 | 0.28 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 1-1/2x1-1/4 | 0.32 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 2x3/4 | 0.32 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 2x1 | 0.34 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 2x1-1/4 | 0.38 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 2x1-1/2 | 0.41 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 2-1/2x1 | 0.57 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 2-1/2x1-1/4 | 0.57 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 2-1/2x1-1/2 | 0.63 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 2-1/2x2 | 0.68 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3x1-1/4 | 0.73 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3x1-1/2 | 0.77 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3x2 | 0.82 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3x2-1/2 | 0.91 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3-1/2x1-1/4 | 1.09 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3-1/2x1-1/2 | 1.13 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3-1/2x2 | 1.25 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3-1/2x2-1/2 | 1.31 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 3-1/2x3 | 1.43 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 4x1-1/2 | 1.31 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 4x2 | 1.36 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 4x2-1/2 | 1.47 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 4x3 | 1.53 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 4x3-1/2 | 1.59 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 5x2 | 2.27 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 5x2-1/2 | 2.38 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 5x3 | 2.49 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 5x3-1/2 | 2.61 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 5x4 | 2.72 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 6x2-1/2 | 3.29 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 6x3 | 3.63 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 6x3-1/2 | 3.74 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 6x4 | 3.74 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 6x5 | 3.86 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 8x3-1/2 | 4.99 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 8x4 | 4.99 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 8x5 | 5.44 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 8x6 | 5.99 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 10x4 | 9.07 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 10x5 | 9.53 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 10x6 | 9.75 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 40S | 10x8 | 9.98 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Concentric Reducer | Sch 80S | 3/4x1/2 | 0.1 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1x1/2 | 0.2 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1x3/4 | 0.2 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1-1/4x1/2 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1-1/4x3/4 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1-1/4x1 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1-1/2x1/2 | 0.29 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1-1/2x3/4 | 0.32 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1-1/2x1 | 0.34 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 1-1/2x1-1/4 | 0.35 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 2x3/4 | 0.45 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 2x1 | 0.5 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 2x1-1/4 | 0.52 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 2x1-1/2 | 0.54 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 2-1/2x1 | 0.79 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 2-1/2x1-1/4 | 0.84 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 2-1/2x1-1/2 | 0.86 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 2-1/2x2 | 0.91 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3x1-1/4 | 1.09 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3x1-1/2 | 1.13 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3x2 | 1.18 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3x2-1/2 | 1.25 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3-1/2x1-1/4 | 1.47 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3-1/2x1-1/2 | 1.47 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3-1/2x2 | 1.59 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3-1/2x2-1/2 | 1.59 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 3-1/2x3 | 1.81 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 4x1-1/2 | 1.81 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 4x2 | 1.93 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 4x2-1/2 | 1.99 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 4x3 | 2.04 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 4x3-1/2 | 2.15 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 5x2 | 2.95 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 5x2-1/2 | 3.18 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 5x3 | 3.4 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 5x3-1/2 | 3.52 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 5x4 | 3.74 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 6x2-1/2 | 4.54 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 6x3 | 4.76 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 6x3-1/2 | 4.99 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 6x4 | 5.22 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 6x5 | 5.44 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 8x3-1/2 | 7.48 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 8x4 | 7.71 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 8x5 | 8.16 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Concentric Reducer | Sch 80S | 8x6 | 8.48 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 40S | 3/4x1/2 | 0.08 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1x1/2 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1x3/4 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1-1/4x1/2 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1-1/4x3/4 | 0.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1-1/4x1 | 0.23 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1-1/2x1/2 | 0.23 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1-1/2x3/4 | 0.24 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1-1/2x1 | 0.28 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 1-1/2x1-1/4 | 0.32 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 2x3/4 | 0.32 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 2x1 | 0.34 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 2x1-1/4 | 0.38 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 2x1-1/2 | 0.41 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 2-1/2x1 | 0.57 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 2-1/2x1-1/4 | 0.57 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 2-1/2x1-1/2 | 0.63 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 2-1/2x2 | 0.68 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3x1-1/4 | 0.73 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3x1-1/2 | 0.77 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3x2 | 0.82 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3x2-1/2 | 0.91 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3-1/2x1-1/4 | 1.09 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3-1/2x1-1/2 | 1.13 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3-1/2x2 | 1.25 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3-1/2x2-1/2 | 1.31 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 3-1/2x3 | 1.43 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 4x1-1/2 | 1.31 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 4x2 | 1.36 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 4x2-1/2 | 1.47 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 4x3 | 1.53 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 4x3-1/2 | 1.59 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 5x2 | 2.27 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 5x2-1/2 | 2.38 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 5x3 | 2.49 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 5x3-1/2 | 2.61 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 5x4 | 2.72 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 6x2-1/2 | 3.29 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 6x3 | 3.63 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 6x3-1/2 | 3.74 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 6x4 | 3.74 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 6x5 | 3.86 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 8x3-1/2 | 4.99 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 8x4 | 4.99 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 8x5 | 5.44 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 8x6 | 5.99 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 10x4 | 9.07 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 10x5 | 9.53 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 10x6 | 9.75 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 40S | 10x8 | 9.98 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Eccentric Reducer | Sch 80S | 3/4x1/2 | 0.1 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1x1/2 | 0.2 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1x3/4 | 0.2 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1-1/4x1/2 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1-1/4x3/4 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1-1/4x1 | 0.23 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1-1/2x1/2 | 0.29 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1-1/2x3/4 | 0.32 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1-1/2x1 | 0.34 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 1-1/2x1-1/4 | 0.35 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 2x3/4 | 0.45 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 2x1 | 0.5 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 2x1-1/4 | 0.52 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 2x1-1/2 | 0.54 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 2-1/2x1 | 0.79 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 2-1/2x1-1/4 | 0.84 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 2-1/2x1-1/2 | 0.86 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 2-1/2x2 | 0.91 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3x1-1/4 | 1.09 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3x1-1/2 | 1.13 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3x2 | 1.18 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3x2-1/2 | 1.25 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3-1/2x1-1/4 | 1.47 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3-1/2x1-1/2 | 1.47 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3-1/2x2 | 1.59 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3-1/2x2-1/2 | 1.59 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 3-1/2x3 | 1.81 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 4x1-1/2 | 1.81 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 4x2 | 1.93 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 4x2-1/2 | 1.99 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 4x3 | 2.04 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 4x3-1/2 | 2.15 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 5x2 | 2.95 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 5x2-1/2 | 3.18 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 5x3 | 3.4 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 5x3-1/2 | 3.52 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 5x4 | 3.74 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 6x2-1/2 | 4.54 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 6x3 | 4.76 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 6x3-1/2 | 4.99 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 6x4 | 5.22 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 6x5 | 5.44 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 8x3-1/2 | 7.48 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 8x4 | 7.71 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 8x5 | 8.16 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Eccentric Reducer | Sch 80S | 8x6 | 8.48 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 40S | 1/2 | 0.16 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 3/4 | 0.2 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 1 | 0.34 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 1-1/4 | 0.59 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 1-1/2 | 0.91 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 2 | 1.59 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 2-1/2 | 2.72 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 3 | 3.18 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 3-1/2 | 4.08 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 4 | 5.44 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 5 | 9.53 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 6 | 15.42 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 8 | 24.95 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 40S | 10 | 38.56 | Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″) |
| Equal Tee | Sch 80S | 1/2 | 0.2 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 3/4 | 0.27 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 1 | 0.4 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 1-1/4 | 0.73 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 1-1/2 | 1.02 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 2 | 1.81 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 2-1/2 | 3.18 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 3 | 3.86 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 3-1/2 | 5.44 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 4 | 7.17 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 5 | 11.79 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 6 | 18.14 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 80S | 8 | 34.02 | Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″) |
| Equal Tee | Sch 160 | 1/2 | 0.16 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 3/4 | 0.26 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 1 | 0.45 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 1-1/4 | 0.91 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 1-1/2 | 1.36 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 2 | 2.27 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 2-1/2 | 3.63 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 3 | 4.54 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 4 | 11.34 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 5 | 24.95 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 6 | 28.12 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 8 | 49.9 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 10 | 117.93 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | Sch 160 | 12 | 217.72 | Wermac/Hackney Ladish Sch 160 |
| Equal Tee | XXS | 1 | 0.57 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 1-1/4 | 1.13 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 1-1/2 | 1.53 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 2 | 2.83 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 2-1/2 | 4.76 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 3 | 6.12 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 3-1/2 | 8.16 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 4 | 11.34 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 5 | 18.14 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 6 | 30.84 | Wermac/Hackney Ladish XXS |
| Equal Tee | XXS | 8 | 54.43 | Wermac/Hackney Ladish XXS |
| Lap Joint Stub End (Long) | Sch 40 | 1/2 | 0.16 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 3/4 | 0.23 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 1 | 0.35 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 1-1/4 | 0.5 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 1-1/2 | 0.61 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 2 | 1.1 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 2-1/2 | 1.5 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 3 | 2.1 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 3-1/2 | 2.5 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 4 | 3 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 5 | 5.4 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 6 | 7.3 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 8 | 11.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 10 | 18 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 12 | 25.6 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 14 | 34 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 16 | 39 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 18 | 44 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 20 | 53 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 40 | 24 | 76 | Wermac/Hackney Ladish STD (alias→Sch 40) |
| Lap Joint Stub End (Long) | Sch 80 | 1/2 | 0.2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 3/4 | 0.3 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 1 | 0.4 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 1-1/4 | 0.6 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 1-1/2 | 0.7 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 2 | 1.4 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 2-1/2 | 2 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 3 | 2.9 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 3-1/2 | 3.4 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 4 | 4.1 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 5 | 7.5 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 6 | 10 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 8 | 16 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 10 | 24 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 12 | 29 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 14 | 38 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 16 | 43 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 18 | 49 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 20 | 63 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | Sch 80 | 24 | 76 | Wermac/Hackney Ladish XS (alias→Sch 80) |
| Lap Joint Stub End (Long) | STD | 1/2 | 0.16 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 3/4 | 0.23 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 1 | 0.35 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 1-1/4 | 0.5 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 1-1/2 | 0.61 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 2 | 1.1 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 2-1/2 | 1.5 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 3 | 2.1 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 3-1/2 | 2.5 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 4 | 3 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 5 | 5.4 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 6 | 7.3 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 8 | 11.6 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 10 | 18 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 12 | 25.6 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 14 | 34 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 16 | 39 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 18 | 44 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 20 | 53 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | STD | 24 | 76 | Wermac/Hackney Ladish STD |
| Lap Joint Stub End (Long) | XS | 1/2 | 0.2 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 3/4 | 0.3 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 1 | 0.4 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 1-1/4 | 0.6 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 1-1/2 | 0.7 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 2 | 1.4 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 2-1/2 | 2 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 3 | 2.9 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 3-1/2 | 3.4 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 4 | 4.1 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 5 | 7.5 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 6 | 10 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 8 | 16 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 10 | 24 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 12 | 29 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 14 | 38 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 16 | 43 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 18 | 49 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 20 | 63 | Wermac/Hackney Ladish XS |
| Lap Joint Stub End (Long) | XS | 24 | 76 | Wermac/Hackney Ladish XS |

## Skipped

### Chart-missing schedules (all types)

| schedule | reason |
| -------- | ------ |
| Sch 5S | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 5 | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 10S | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 10 | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 20 | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 30 | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 60 | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 100 | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 120 | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |
| Sch 140 | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |

### Types locked in but without numeric proposals this round

| type | reason |
| ---- | ------ |
| `LR Reducing Elbow` | Wermac has a reducing-elbow weight page; not transcribed into rows yet — defer to Sign-off round 2 |
| `Reducing Tee` | Wermac reducing-tee weights not transcribed; omit until chart extract |
| `Equal Cross` / `Reducing Cross` | No S1 kg tables used this round; omit rather than invent (= tee × factor) |
| `Lap Joint Stub End (Short)` | Short-pattern MSS lengths not fully paired with kg in transcribed sources |

### Existing-catalog cells without chart counterpart

| type | nps | reason |
| ---- | --- | ------ |
| `90° LR Elbow` | 28, 32, 34 (and other catalog-only sizes) | Present in current Sch40 SSOT but absent from S1 STD table → omit unless another chart is signed |
| `90° SR Elbow` | 1/2, 3/4 | Current catalog has them; S1 STD SR starts at NPS 1 (aligns with B16.9 SR practice) → omit ½/¾ |
| `Cap` | 1/2, 3/4, 36 | Catalog has ½/¾/36; S1 cap table starts at NPS 1 and stops at 30 → omit missing |
| Reducers | `36x30` etc. | Catalog pair beyond S1 extract → omit |

### Existing Sch 40 vs proposed chart (conflict sample — 90° LR Elbow)

Current `piping_catalog.js` Sch40-equiv weights are often **heavier** than S1. Conflict policy: **replace with signed chart wt**; do not average; do not keep Sch40×factor.

| type | schedule | nps | catalog wt | proposed wt | action |
| ---- | -------- | --- | ---------- | ------------ | ------ |
| 90° LR Elbow | Sch 40 | 1-1/4 | 0.45 | 0.27 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 1-1/2 | 0.61 | 0.41 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 2 | 0.95 | 0.73 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 3-1/2 | 3.35 | 3.06 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 4 | 4.67 | 4.08 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 5 | 7.48 | 6.8 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 6 | 11.34 | 11.11 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 10 | 41.28 | 39.92 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 12 | 63.5 | 56.7 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 14 | 95.26 | 72.57 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 16 | 135.2 | 93.44 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 18 | 181.4 | 117.93 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 20 | 235.9 | 145.15 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 22 | 298.8 | 178.72 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 24 | 362.9 | 208.65 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 26 | 453.6 | 249.48 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 30 | 634.9 | 332.94 | replace with chart (do not keep old) |
| 90° LR Elbow | Sch 40 | 36 | 1000 | 481.72 | replace with chart (do not keep old) |

## Conflict policy

1. **Do not invent `wt`** when the chart has no cell — omit the schedule/NPS from Phase 2.
2. **Do not keep `FITTING_SCH_FACTORS` / Sch40×B36** as a production fill-in for missing schedules.
3. On catalog vs chart disagreement for the same type×schedule×NPS: prefer signed chart value (S1 unless Sign-off names another source).
4. Concentric and eccentric reducers: S1 publishes one weight table for both — propose identical `wt` unless Sign-off splits them.
5. STD/Sch 40 and XS/Sch 80 are **duplicate keys with the same proposed wt** (alias). Phase 2 may load both so the Schedule dropdown matches pipe vocabulary.

## Sign-off

Record decision before Phase 2 edits `data/piping_catalog.js`:

- [x] **Accept all** — load A + B as proposed
- [ ] **Accept subset** — describe below (e.g. “A only”, “A + returns/3D”, “drop Sch 40S/80S aliases”)
- [ ] **Reject** — stay on flat Sch40 catalog until new sources

**Decision:** Accept all A+B

**Accepted set:** All Bucket A (1160) + Bucket B (771) rows as proposed — Sch 40/STD, Sch 80/XS, Sch 40S/80S aliases, Sch 160, XXS; new types with numeric rows (returns, 3D, long stub ends). Deferred types without rows remain omitted (LR Reducing Elbow, Reducing Tee, Equal/Reducing Cross, Short stub end).

**Notes / alternate sources:** Primary S1 (Wermac / Hackney Ladish); S2/S3 acceptable for cargo planning spot-checks. Replace conflicting legacy Sch40 catalog weights with signed chart `wt`.

**Signer / date:** User (chat) / 2026-07-18
