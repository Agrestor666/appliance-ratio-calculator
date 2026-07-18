# Flange weight candidates

Approval artifact for `b16-5-flange-catalog` Phase 1. **Do not edit** `data/piping_catalog.js`, `app.js`, or `index.html` until this file’s `## Sign-off` (or equivalent chat confirmation) resolves Conflicts — Auto-apply rows may proceed after Sign-off records “no conflicts” or accepts/rejects Conflicts.

Product family: ASME B16.5 forged flanges. **Masses are not from the B16.5 PDF** (dimensions/tolerances/markings/facing only). Proposed `wt` values are approximate manufacturer/industry chart kg/pc for **raised-face carbon steel (A105)** flanges.

## Sources

| # | Source | What it provides | Units / material | URL or path |
| - | ------ | ---------------- | ---------------- | ----------- |
| S1 | Wermac.org ASME B16.5 forged flange weight chart (compiled from **Texas Flange** manufacturer data) | Slip-On, Blind, Weld Neck (also Thd/SW/LJ tabulated — deferred) for Class 150–2500 | kg/pc (approx.), carbon steel RF | https://www.wermac.org/flanges/weightchart_asme_b16-5.html |
| S2 | Texas Flange ANSI B16.5 weight tables | Same data family as S1 (lb); Class 150 WN spot-check converted to kg | lb → kg, carbon steel RF | https://www.texasflange.com/wp-content/uploads/2019/05/ANSI-B16.5-Weight-1.pdf |
| S3 | Tesco Steel — Flange weight chart | Independent SO/WN/Blind kg tables Class 150–2500 — Sign-off spot-check only (often differs from S1) | kg/pc approx., A105 | https://www.tescoflanges.com/flange-weight-chart |
| S4 | ASME B16.5 PDF (repo) | **Type inventory / dimensions only** — zero mass tables | n/a | `data/ASME B16.5.pdf` |

Notes:

- Chart publishers state weights are approximate; manufacturer-to-manufacturer variation is expected.
- Primary proposed numbers use **S1 (Wermac / Texas Flange)**. S2 confirms the lb→kg lineage; S3 is corroboration for Sign-off spot-checks only (not used to auto-trigger multi-source Conflicts).
- S2 Class 150 WN lb→kg vs S1: all spot-check cells within 5% (S1 is Texas-derived).
- Material / facing assumption: **carbon steel A105, raised face (RF)**. RTJ / FF splits are not proposed (would be Conflict type (c) if forced).
- Weld Neck charts publish **one mass per class×NPS** assuming **STD / 40S bore**. Separate Sch 80 / XS / XXS flange masses are **not** published — those schedules are Skipped (no invent).

## Type inventory

| Catalog type key | In/out | Notes |
| ---------------- | ------ | ----- |
| `Weld Neck` | **in (rewrite)** | Nest under schedule; chart STD bore + Sch 40 / Sch 40S aliases |
| `Slip-On` | **in (rewrite)** | Keep `class → [{ nps, wt }]`; Class 2500 chart-missing → Skipped |
| `Blind` | **in (rewrite)** | Keep `class → [{ nps, wt }]` |
| `Socket Weld` | **deferred** | Leave unchanged this slice |
| `Threaded` | **deferred** | Leave unchanged this slice |
| `Lap Joint` | **deferred** | Leave unchanged this slice |

## Schedule keys

Pipe catalog vocabulary (18 keys) — Weld Neck proposed schedules must use these strings only:

| Catalog key | Chart alias / proposal rule |
| ----------- | --------------------------- |
| `Sch 5S` | No published WN schedule-specific mass → **Skipped** |
| `Sch 5` | No published WN schedule-specific mass → **Skipped** |
| `Sch 10S` | No published WN schedule-specific mass → **Skipped** |
| `Sch 10` | No published WN schedule-specific mass → **Skipped** |
| `Sch 20` | No published WN schedule-specific mass → **Skipped** |
| `Sch 30` | No published WN schedule-specific mass → **Skipped** |
| `Sch 40S` | Alias of STD chart wt for NPS ≤ 10″; larger NPS → Skipped |
| `Sch 40` | Alias of STD chart wt for NPS ≤ 10″ (B36 wall equality); NPS ≥ 12 → Skipped (STD ≠ Sch 40) |
| `Sch 60` | No published WN schedule-specific mass → **Skipped** |
| `Sch 80S` | No published WN schedule-specific mass → **Skipped** |
| `Sch 80` | No published WN schedule-specific mass → **Skipped** |
| `Sch 100` | No published WN schedule-specific mass → **Skipped** |
| `Sch 120` | No published WN schedule-specific mass → **Skipped** |
| `Sch 140` | No published WN schedule-specific mass → **Skipped** |
| `Sch 160` | No published WN schedule-specific mass → **Skipped** |
| `STD` | Chart default WN bore (S1 / Texas notes: STD / 40S wall) |
| `XS` | No published WN schedule-specific mass → **Skipped** |
| `XXS` | No published WN schedule-specific mass → **Skipped** |

Do **not** invent Sch 80 / XS weights from bore metal deltas. Alias notes stay in this artifact; runtime keys are only the proposed subset.

## Proposed rows

Proposed shapes after Phase 2: `flanges["Weld Neck"][class][schedule] = [{ nps, wt }]`; `flanges["Slip-On"|"Blind"][class] = [{ nps, wt }]`.

### Coverage summary

| Metric | Count |
| ------ | ----- |
| Auto-apply | 175 |
| Conflict | 294 |
| Skipped (listed) | 30 |
| WN schedules with proposed rows | STD, Sch 40 (≤10″), Sch 40S (≤10″) |
| WN schedules skipped (no chart) | `Sch 5S`, `Sch 5`, `Sch 10S`, `Sch 10`, `Sch 20`, `Sch 30`, `Sch 60`, `Sch 80S`, `Sch 80`, `Sch 100`, `Sch 120`, `Sch 140`, `Sch 160`, `XS`, `XXS` |

### Auto-apply

Cells with a single clear S1 chart value and either no prior catalog row, or catalog `wt` within **5%** of chart. Includes new WN schedule nest aliases.

| type | class | schedule | nps | current_wt | chart_wt | source note |
| ---- | ----- | -------- | --- | ---------- | -------- | ----------- |
| Blind | 150 | — | 8 | 22.2 | 21.2 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Blind | 300 | — | 8 | 35.4 | 36.5 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Blind | 300 | — | 10 | 56.7 | 55.8 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Blind | 300 | — | 12 | 83.9 | 83.3 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Blind | 600 | — | 8 | 63.5 | 63 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Blind | 600 | — | 10 | 104.3 | 103 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Blind | 1500 | — | 4 | 34 | 32.9 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Slip-On | 150 | — | 3-1/2 | 4.1 | 4 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Slip-On | 300 | — | 8 | 27.2 | 26.1 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Slip-On | 600 | — | 3-1/2 | 9.1 | 9.5 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Slip-On | 900 | — | 8 | 79.4 | 77.4 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Slip-On | 1500 | — | 8 | 117.5 | 117 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Slip-On | 1500 | — | 24 | 1327.4 | 1271 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 1/2 | — | 0.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 3/4 | — | 0.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 1 | — | 1.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 1-1/4 | — | 1.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 1-1/2 | — | 1.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 2 | — | 2.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 2-1/2 | — | 4.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 3 | — | 5.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 3-1/2 | — | 5.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 4 | — | 7.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 5 | — | 9.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 6 | — | 11.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 8 | — | 18.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40 | 10 | — | 24.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 1/2 | — | 0.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 3/4 | — | 0.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 1 | — | 1.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 1-1/4 | — | 1.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 1-1/2 | — | 1.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 2 | — | 2.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 2-1/2 | — | 4.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 3 | — | 5.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 3-1/2 | — | 5.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 4 | — | 7.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 5 | — | 9.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 6 | — | 11.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 8 | — | 18.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | Sch 40S | 10 | — | 24.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | STD | 3-1/2 | 5.4 | 5.4 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Weld Neck | 150 | STD | 5 | 9.5 | 9.5 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 1/2 | — | 0.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 3/4 | — | 1.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 1 | — | 1.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 1-1/4 | — | 2.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 1-1/2 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 2 | — | 4.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 2-1/2 | — | 5.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 3 | — | 8.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 3-1/2 | — | 9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 4 | — | 11.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 5 | — | 16.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 6 | — | 20.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 8 | — | 31.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40 | 10 | — | 45 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 1/2 | — | 0.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 3/4 | — | 1.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 1 | — | 1.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 1-1/4 | — | 2.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 1-1/2 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 2 | — | 4.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 2-1/2 | — | 5.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 3 | — | 8.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 3-1/2 | — | 9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 4 | — | 11.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 5 | — | 16.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 6 | — | 20.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 8 | — | 31.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 300 | Sch 40S | 10 | — | 45 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 1/2 | — | 1.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 3/4 | — | 1.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 1 | — | 1.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 1-1/4 | — | 2.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 1-1/2 | — | 3.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 2 | — | 5.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 2-1/2 | — | 8.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 3 | — | 10.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 3-1/2 | — | 11.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 4 | — | 18.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 5 | — | 30.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 6 | — | 36.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 8 | — | 54 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40 | 10 | — | 85.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 1/2 | — | 1.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 3/4 | — | 1.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 1 | — | 1.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 1-1/4 | — | 2.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 1-1/2 | — | 3.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 2 | — | 5.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 2-1/2 | — | 8.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 3 | — | 10.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 3-1/2 | — | 11.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 4 | — | 18.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 5 | — | 30.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 6 | — | 36.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 8 | — | 54 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | Sch 40S | 10 | — | 85.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 600 | STD | 1-1/4 | 2.7 | 2.7 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 1/2 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 3/4 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 1 | — | 3.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 1-1/4 | — | 4.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 1-1/2 | — | 6.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 2 | — | 10.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 2-1/2 | — | 13.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 3 | — | 16.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 4 | — | 23.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 6 | — | 49.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 8 | — | 84.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40 | 10 | — | 120.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 1/2 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 3/4 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 1 | — | 3.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 1-1/4 | — | 4.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 1-1/2 | — | 6.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 2 | — | 10.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 2-1/2 | — | 13.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 3 | — | 16.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 4 | — | 23.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 6 | — | 49.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 8 | — | 84.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 900 | Sch 40S | 10 | — | 120.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 1/2 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 3/4 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 1 | — | 4.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 1-1/4 | — | 4.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 1-1/2 | — | 6.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 2 | — | 11.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 2-1/2 | — | 16.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 3 | — | 21.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 4 | — | 32.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 6 | — | 74.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 8 | — | 123.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40 | 10 | — | 204.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 1/2 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 3/4 | — | 3.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 1 | — | 4.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 1-1/4 | — | 4.5 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 1-1/2 | — | 6.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 2 | — | 11.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 2-1/2 | — | 16.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 3 | — | 21.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 4 | — | 32.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 6 | — | 74.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 8 | — | 123.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | Sch 40S | 10 | — | 204.8 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | STD | 1-1/2 | 6.4 | 6.3 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Weld Neck | 1500 | STD | 4 | 34 | 32.9 | within 5% of catalog; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 1/2 | — | 3.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 3/4 | — | 4.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 1 | — | 5.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 1-1/4 | — | 9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 1-1/2 | — | 12.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 2 | — | 18.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 2-1/2 | — | 23.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 3 | — | 42.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 4 | — | 65.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 6 | — | 170.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 8 | — | 259.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40 | 10 | — | 480.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 1/2 | — | 3.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 3/4 | — | 4.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 1 | — | 5.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 1-1/4 | — | 9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 1-1/2 | — | 12.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 2 | — | 18.9 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 2-1/2 | — | 23.4 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 3 | — | 42.3 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 4 | — | 65.7 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 6 | — | 170.1 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 8 | — | 259.2 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | Sch 40S | 10 | — | 480.6 | alias of STD chart bore (new nest cell); same wt as STD; S1 Wermac/Texas RF CS |
| Weld Neck | 2500 | STD | 2-1/2 | 22.7 | 23.4 | within 5% of catalog; S1 Wermac/Texas RF CS |

### Conflict

Cells where existing catalog `wt` and S1 `chart_wt` differ by more than **5%** relative (`|chart − catalog| / catalog > 0.05`). Phase 2 must not write these until Sign-off accepts / rejects / edits them.

| type | class | schedule | nps | current_wt | chart_wt | conflict reason |
| ---- | ----- | -------- | --- | ---------- | -------- | --------------- |
| Blind | 150 | — | 1/2 | 0.3 | 0.9 | catalog vs S1 >5% (Δ 200.0%) |
| Blind | 150 | — | 3/4 | 0.5 | 0.9 | catalog vs S1 >5% (Δ 80.0%) |
| Blind | 150 | — | 1 | 0.7 | 0.9 | catalog vs S1 >5% (Δ 28.6%) |
| Blind | 150 | — | 1-1/4 | 1 | 1.4 | catalog vs S1 >5% (Δ 40.0%) |
| Blind | 150 | — | 1-1/2 | 1.3 | 1.8 | catalog vs S1 >5% (Δ 38.5%) |
| Blind | 150 | — | 2 | 1.8 | 2.3 | catalog vs S1 >5% (Δ 27.8%) |
| Blind | 150 | — | 2-1/2 | 2.6 | 3.2 | catalog vs S1 >5% (Δ 23.1%) |
| Blind | 150 | — | 3 | 3.6 | 4.1 | catalog vs S1 >5% (Δ 13.9%) |
| Blind | 150 | — | 3-1/2 | 4.8 | 5.9 | catalog vs S1 >5% (Δ 22.9%) |
| Blind | 150 | — | 4 | 6.1 | 7.7 | catalog vs S1 >5% (Δ 26.2%) |
| Blind | 150 | — | 5 | 9.5 | 9 | catalog vs S1 >5% (Δ 5.3%) |
| Blind | 150 | — | 6 | 13.1 | 12.2 | catalog vs S1 >5% (Δ 6.9%) |
| Blind | 150 | — | 10 | 35.4 | 31.5 | catalog vs S1 >5% (Δ 11.0%) |
| Blind | 150 | — | 12 | 50.8 | 55.4 | catalog vs S1 >5% (Δ 9.1%) |
| Blind | 150 | — | 14 | 74.8 | 63 | catalog vs S1 >5% (Δ 15.8%) |
| Blind | 150 | — | 16 | 97.5 | 81 | catalog vs S1 >5% (Δ 16.9%) |
| Blind | 150 | — | 18 | 124.7 | 99 | catalog vs S1 >5% (Δ 20.6%) |
| Blind | 150 | — | 20 | 156.5 | 128.3 | catalog vs S1 >5% (Δ 18.0%) |
| Blind | 150 | — | 24 | 235.9 | 193.5 | catalog vs S1 >5% (Δ 18.0%) |
| Blind | 300 | — | 1/2 | 0.5 | 0.9 | catalog vs S1 >5% (Δ 80.0%) |
| Blind | 300 | — | 3/4 | 0.7 | 1.4 | catalog vs S1 >5% (Δ 100.0%) |
| Blind | 300 | — | 1 | 1 | 1.8 | catalog vs S1 >5% (Δ 80.0%) |
| Blind | 300 | — | 1-1/4 | 1.4 | 2.7 | catalog vs S1 >5% (Δ 92.9%) |
| Blind | 300 | — | 1-1/2 | 1.8 | 3.2 | catalog vs S1 >5% (Δ 77.8%) |
| Blind | 300 | — | 2 | 2.7 | 3.6 | catalog vs S1 >5% (Δ 33.3%) |
| Blind | 300 | — | 2-1/2 | 3.8 | 5.4 | catalog vs S1 >5% (Δ 42.1%) |
| Blind | 300 | — | 3 | 5.4 | 7.2 | catalog vs S1 >5% (Δ 33.3%) |
| Blind | 300 | — | 3-1/2 | 7 | 9.5 | catalog vs S1 >5% (Δ 35.7%) |
| Blind | 300 | — | 4 | 9.1 | 12.6 | catalog vs S1 >5% (Δ 38.5%) |
| Blind | 300 | — | 5 | 13.6 | 16.7 | catalog vs S1 >5% (Δ 22.8%) |
| Blind | 300 | — | 6 | 19.1 | 22.5 | catalog vs S1 >5% (Δ 17.8%) |
| Blind | 300 | — | 14 | 121.6 | 112.5 | catalog vs S1 >5% (Δ 7.5%) |
| Blind | 300 | — | 16 | 159.8 | 141.8 | catalog vs S1 >5% (Δ 11.3%) |
| Blind | 300 | — | 18 | 207.7 | 186.3 | catalog vs S1 >5% (Δ 10.3%) |
| Blind | 300 | — | 20 | 263.1 | 231.8 | catalog vs S1 >5% (Δ 11.9%) |
| Blind | 300 | — | 24 | 401.9 | 360 | catalog vs S1 >5% (Δ 10.4%) |
| Blind | 600 | — | 1/2 | 0.7 | 1.4 | catalog vs S1 >5% (Δ 100.0%) |
| Blind | 600 | — | 3/4 | 1 | 1.8 | catalog vs S1 >5% (Δ 80.0%) |
| Blind | 600 | — | 1 | 1.4 | 1.8 | catalog vs S1 >5% (Δ 28.6%) |
| Blind | 600 | — | 1-1/4 | 2 | 2.7 | catalog vs S1 >5% (Δ 35.0%) |
| Blind | 600 | — | 1-1/2 | 2.6 | 3.6 | catalog vs S1 >5% (Δ 38.5%) |
| Blind | 600 | — | 2 | 3.8 | 4.5 | catalog vs S1 >5% (Δ 18.4%) |
| Blind | 600 | — | 2-1/2 | 5.9 | 6.8 | catalog vs S1 >5% (Δ 15.3%) |
| Blind | 600 | — | 3 | 8.2 | 9 | catalog vs S1 >5% (Δ 9.8%) |
| Blind | 600 | — | 3-1/2 | 11.3 | 13 | catalog vs S1 >5% (Δ 15.0%) |
| Blind | 600 | — | 4 | 15 | 18.5 | catalog vs S1 >5% (Δ 23.3%) |
| Blind | 600 | — | 5 | 22.7 | 30.6 | catalog vs S1 >5% (Δ 34.8%) |
| Blind | 600 | — | 6 | 33.1 | 38.7 | catalog vs S1 >5% (Δ 16.9%) |
| Blind | 600 | — | 12 | 154.2 | 132.8 | catalog vs S1 >5% (Δ 13.9%) |
| Blind | 600 | — | 14 | 226.8 | 170.1 | catalog vs S1 >5% (Δ 25.0%) |
| Blind | 600 | — | 16 | 302.4 | 237.2 | catalog vs S1 >5% (Δ 21.6%) |
| Blind | 600 | — | 18 | 395 | 299.3 | catalog vs S1 >5% (Δ 24.2%) |
| Blind | 600 | — | 20 | 504 | 384.8 | catalog vs S1 >5% (Δ 23.7%) |
| Blind | 600 | — | 24 | 776.2 | 562.5 | catalog vs S1 >5% (Δ 27.5%) |
| Blind | 900 | — | 1/2 | 0.9 | 1.8 | catalog vs S1 >5% (Δ 100.0%) |
| Blind | 900 | — | 3/4 | 1.3 | 2.7 | catalog vs S1 >5% (Δ 107.7%) |
| Blind | 900 | — | 1 | 2 | 4.1 | catalog vs S1 >5% (Δ 105.0%) |
| Blind | 900 | — | 1-1/4 | 2.7 | 4.5 | catalog vs S1 >5% (Δ 66.7%) |
| Blind | 900 | — | 1-1/2 | 3.4 | 6.3 | catalog vs S1 >5% (Δ 85.3%) |
| Blind | 900 | — | 2 | 5.4 | 11.3 | catalog vs S1 >5% (Δ 109.3%) |
| Blind | 900 | — | 2-1/2 | 8.2 | 14.4 | catalog vs S1 >5% (Δ 75.6%) |
| Blind | 900 | — | 3 | 12.2 | 15.8 | catalog vs S1 >5% (Δ 29.5%) |
| Blind | 900 | — | 4 | 21.3 | 24.3 | catalog vs S1 >5% (Δ 14.1%) |
| Blind | 900 | — | 6 | 57.2 | 51.8 | catalog vs S1 >5% (Δ 9.4%) |
| Blind | 900 | — | 8 | 113.4 | 90 | catalog vs S1 >5% (Δ 20.6%) |
| Blind | 900 | — | 10 | 184.2 | 130.5 | catalog vs S1 >5% (Δ 29.2%) |
| Blind | 900 | — | 12 | 272.2 | 186.8 | catalog vs S1 >5% (Δ 31.4%) |
| Blind | 900 | — | 14 | 394.6 | 234 | catalog vs S1 >5% (Δ 40.7%) |
| Blind | 900 | — | 16 | 527.8 | 278.6 | catalog vs S1 >5% (Δ 47.2%) |
| Blind | 900 | — | 18 | 685.2 | 396 | catalog vs S1 >5% (Δ 42.2%) |
| Blind | 900 | — | 20 | 876.7 | 498.2 | catalog vs S1 >5% (Δ 43.2%) |
| Blind | 900 | — | 24 | 1342.7 | 944.6 | catalog vs S1 >5% (Δ 29.6%) |
| Blind | 1500 | — | 1/2 | 1.3 | 1.8 | catalog vs S1 >5% (Δ 38.5%) |
| Blind | 1500 | — | 3/4 | 1.8 | 2.7 | catalog vs S1 >5% (Δ 50.0%) |
| Blind | 1500 | — | 1 | 2.7 | 4.1 | catalog vs S1 >5% (Δ 51.9%) |
| Blind | 1500 | — | 1-1/4 | 4.1 | 4.5 | catalog vs S1 >5% (Δ 9.8%) |
| Blind | 1500 | — | 1-1/2 | 5.4 | 6.3 | catalog vs S1 >5% (Δ 16.7%) |
| Blind | 1500 | — | 2 | 8.2 | 11.3 | catalog vs S1 >5% (Δ 37.8%) |
| Blind | 1500 | — | 2-1/2 | 13.1 | 15.8 | catalog vs S1 >5% (Δ 20.6%) |
| Blind | 1500 | — | 3 | 19.1 | 21.6 | catalog vs S1 >5% (Δ 13.1%) |
| Blind | 1500 | — | 6 | 88.5 | 72 | catalog vs S1 >5% (Δ 18.6%) |
| Blind | 1500 | — | 8 | 177.4 | 135.9 | catalog vs S1 >5% (Δ 23.4%) |
| Blind | 1500 | — | 10 | 294.8 | 229.5 | catalog vs S1 >5% (Δ 22.2%) |
| Blind | 1500 | — | 12 | 445 | 348.8 | catalog vs S1 >5% (Δ 21.6%) |
| Blind | 1500 | — | 14 | 653 | 438.8 | catalog vs S1 >5% (Δ 32.8%) |
| Blind | 1500 | — | 16 | 883 | 585 | catalog vs S1 >5% (Δ 33.7%) |
| Blind | 1500 | — | 18 | 1154 | 787.5 | catalog vs S1 >5% (Δ 31.8%) |
| Blind | 1500 | — | 20 | 1483 | 1001 | catalog vs S1 >5% (Δ 32.5%) |
| Blind | 2500 | — | 1/2 | 2 | 3.2 | catalog vs S1 >5% (Δ 60.0%) |
| Blind | 2500 | — | 3/4 | 3 | 4.5 | catalog vs S1 >5% (Δ 50.0%) |
| Blind | 2500 | — | 1 | 4.5 | 5.4 | catalog vs S1 >5% (Δ 20.0%) |
| Blind | 2500 | — | 1-1/4 | 6.4 | 8.1 | catalog vs S1 >5% (Δ 26.6%) |
| Blind | 2500 | — | 1-1/2 | 8.6 | 11.3 | catalog vs S1 >5% (Δ 31.4%) |
| Blind | 2500 | — | 2 | 13.6 | 17.6 | catalog vs S1 >5% (Δ 29.4%) |
| Blind | 2500 | — | 2-1/2 | 22.7 | 25.2 | catalog vs S1 >5% (Δ 11.0%) |
| Blind | 2500 | — | 3 | 33.1 | 38.7 | catalog vs S1 >5% (Δ 16.9%) |
| Blind | 2500 | — | 4 | 63.5 | 59.9 | catalog vs S1 >5% (Δ 5.7%) |
| Blind | 2500 | — | 6 | 165.6 | 155.3 | catalog vs S1 >5% (Δ 6.2%) |
| Blind | 2500 | — | 8 | 341 | 239.8 | catalog vs S1 >5% (Δ 29.7%) |
| Blind | 2500 | — | 10 | 572.3 | 461.3 | catalog vs S1 >5% (Δ 19.4%) |
| Blind | 2500 | — | 12 | 872.7 | 658.8 | catalog vs S1 >5% (Δ 24.5%) |
| Slip-On | 150 | — | 1/2 | 0.4 | 0.5 | catalog vs S1 >5% (Δ 25.0%) |
| Slip-On | 150 | — | 3/4 | 0.5 | 0.9 | catalog vs S1 >5% (Δ 80.0%) |
| Slip-On | 150 | — | 1 | 0.7 | 0.9 | catalog vs S1 >5% (Δ 28.6%) |
| Slip-On | 150 | — | 1-1/4 | 1 | 1.4 | catalog vs S1 >5% (Δ 40.0%) |
| Slip-On | 150 | — | 1-1/2 | 1.3 | 1.4 | catalog vs S1 >5% (Δ 7.7%) |
| Slip-On | 150 | — | 2 | 1.7 | 2.3 | catalog vs S1 >5% (Δ 35.3%) |
| Slip-On | 150 | — | 2-1/2 | 2.4 | 3.6 | catalog vs S1 >5% (Δ 50.0%) |
| Slip-On | 150 | — | 3 | 3.2 | 4.1 | catalog vs S1 >5% (Δ 28.1%) |
| Slip-On | 150 | — | 4 | 5 | 5.9 | catalog vs S1 >5% (Δ 18.0%) |
| Slip-On | 150 | — | 5 | 7.5 | 6.8 | catalog vs S1 >5% (Δ 9.3%) |
| Slip-On | 150 | — | 6 | 9.9 | 8.6 | catalog vs S1 >5% (Δ 13.1%) |
| Slip-On | 150 | — | 8 | 16.8 | 13.5 | catalog vs S1 >5% (Δ 19.6%) |
| Slip-On | 150 | — | 10 | 24.9 | 19.4 | catalog vs S1 >5% (Δ 22.1%) |
| Slip-On | 150 | — | 12 | 35.4 | 28.8 | catalog vs S1 >5% (Δ 18.6%) |
| Slip-On | 150 | — | 14 | 50.8 | 40.5 | catalog vs S1 >5% (Δ 20.3%) |
| Slip-On | 150 | — | 16 | 65.3 | 47.7 | catalog vs S1 >5% (Δ 27.0%) |
| Slip-On | 150 | — | 18 | 83.9 | 58.5 | catalog vs S1 >5% (Δ 30.3%) |
| Slip-On | 150 | — | 20 | 104.3 | 74.3 | catalog vs S1 >5% (Δ 28.8%) |
| Slip-On | 150 | — | 24 | 156.5 | 99 | catalog vs S1 >5% (Δ 36.7%) |
| Slip-On | 300 | — | 1/2 | 0.5 | 0.9 | catalog vs S1 >5% (Δ 80.0%) |
| Slip-On | 300 | — | 3/4 | 0.7 | 1.4 | catalog vs S1 >5% (Δ 100.0%) |
| Slip-On | 300 | — | 1 | 1 | 1.4 | catalog vs S1 >5% (Δ 40.0%) |
| Slip-On | 300 | — | 1-1/4 | 1.4 | 2 | catalog vs S1 >5% (Δ 42.9%) |
| Slip-On | 300 | — | 1-1/2 | 1.7 | 2.9 | catalog vs S1 >5% (Δ 70.6%) |
| Slip-On | 300 | — | 2 | 2.4 | 3.2 | catalog vs S1 >5% (Δ 33.3%) |
| Slip-On | 300 | — | 2-1/2 | 3.4 | 4.5 | catalog vs S1 >5% (Δ 32.4%) |
| Slip-On | 300 | — | 3 | 4.8 | 5.9 | catalog vs S1 >5% (Δ 22.9%) |
| Slip-On | 300 | — | 3-1/2 | 6.1 | 7.7 | catalog vs S1 >5% (Δ 26.2%) |
| Slip-On | 300 | — | 4 | 7.7 | 10.6 | catalog vs S1 >5% (Δ 37.7%) |
| Slip-On | 300 | — | 5 | 11.3 | 13 | catalog vs S1 >5% (Δ 15.0%) |
| Slip-On | 300 | — | 6 | 15.4 | 17.6 | catalog vs S1 >5% (Δ 14.3%) |
| Slip-On | 300 | — | 10 | 41.3 | 36.5 | catalog vs S1 >5% (Δ 11.6%) |
| Slip-On | 300 | — | 12 | 59 | 51.8 | catalog vs S1 >5% (Δ 12.2%) |
| Slip-On | 300 | — | 14 | 84.8 | 74.3 | catalog vs S1 >5% (Δ 12.4%) |
| Slip-On | 300 | — | 16 | 110.7 | 94.5 | catalog vs S1 >5% (Δ 14.6%) |
| Slip-On | 300 | — | 18 | 142.9 | 113.9 | catalog vs S1 >5% (Δ 20.3%) |
| Slip-On | 300 | — | 20 | 178.3 | 141.8 | catalog vs S1 >5% (Δ 20.5%) |
| Slip-On | 300 | — | 24 | 270.3 | 220.5 | catalog vs S1 >5% (Δ 18.4%) |
| Slip-On | 600 | — | 1/2 | 0.7 | 0.9 | catalog vs S1 >5% (Δ 28.6%) |
| Slip-On | 600 | — | 3/4 | 0.9 | 1.4 | catalog vs S1 >5% (Δ 55.6%) |
| Slip-On | 600 | — | 1 | 1.4 | 1.8 | catalog vs S1 >5% (Δ 28.6%) |
| Slip-On | 600 | — | 1-1/4 | 1.8 | 2.3 | catalog vs S1 >5% (Δ 27.8%) |
| Slip-On | 600 | — | 1-1/2 | 2.3 | 3.2 | catalog vs S1 >5% (Δ 39.1%) |
| Slip-On | 600 | — | 2 | 3.4 | 4.1 | catalog vs S1 >5% (Δ 20.6%) |
| Slip-On | 600 | — | 2-1/2 | 5 | 5.9 | catalog vs S1 >5% (Δ 18.0%) |
| Slip-On | 600 | — | 3 | 6.8 | 7.2 | catalog vs S1 >5% (Δ 5.9%) |
| Slip-On | 600 | — | 4 | 11.8 | 16.7 | catalog vs S1 >5% (Δ 41.5%) |
| Slip-On | 600 | — | 5 | 18.1 | 28.4 | catalog vs S1 >5% (Δ 56.9%) |
| Slip-On | 600 | — | 6 | 25.4 | 36 | catalog vs S1 >5% (Δ 41.7%) |
| Slip-On | 600 | — | 8 | 47.6 | 51.8 | catalog vs S1 >5% (Δ 8.8%) |
| Slip-On | 600 | — | 10 | 74.8 | 79.7 | catalog vs S1 >5% (Δ 6.6%) |
| Slip-On | 600 | — | 12 | 109.3 | 96.8 | catalog vs S1 >5% (Δ 11.4%) |
| Slip-On | 600 | — | 14 | 157.4 | 116.6 | catalog vs S1 >5% (Δ 25.9%) |
| Slip-On | 600 | — | 16 | 206.4 | 164.7 | catalog vs S1 >5% (Δ 20.2%) |
| Slip-On | 600 | — | 18 | 266.1 | 214.2 | catalog vs S1 >5% (Δ 19.5%) |
| Slip-On | 600 | — | 20 | 335.7 | 275.4 | catalog vs S1 >5% (Δ 18.0%) |
| Slip-On | 600 | — | 24 | 514 | 394.2 | catalog vs S1 >5% (Δ 23.3%) |
| Slip-On | 900 | — | 1/2 | 0.9 | 2.7 | catalog vs S1 >5% (Δ 200.0%) |
| Slip-On | 900 | — | 3/4 | 1.2 | 2.7 | catalog vs S1 >5% (Δ 125.0%) |
| Slip-On | 900 | — | 1 | 1.8 | 3.4 | catalog vs S1 >5% (Δ 88.9%) |
| Slip-On | 900 | — | 1-1/4 | 2.4 | 4.5 | catalog vs S1 >5% (Δ 87.5%) |
| Slip-On | 900 | — | 1-1/2 | 3 | 6.3 | catalog vs S1 >5% (Δ 110.0%) |
| Slip-On | 900 | — | 2 | 4.4 | 9.9 | catalog vs S1 >5% (Δ 125.0%) |
| Slip-On | 900 | — | 2-1/2 | 6.6 | 13.9 | catalog vs S1 >5% (Δ 110.6%) |
| Slip-On | 900 | — | 3 | 9.5 | 16.2 | catalog vs S1 >5% (Δ 70.5%) |
| Slip-On | 900 | — | 4 | 16.3 | 23.9 | catalog vs S1 >5% (Δ 46.6%) |
| Slip-On | 900 | — | 6 | 42.5 | 49.5 | catalog vs S1 >5% (Δ 16.5%) |
| Slip-On | 900 | — | 10 | 122.5 | 110.3 | catalog vs S1 >5% (Δ 10.0%) |
| Slip-On | 900 | — | 12 | 178.6 | 146.7 | catalog vs S1 >5% (Δ 17.9%) |
| Slip-On | 900 | — | 14 | 256.3 | 180 | catalog vs S1 >5% (Δ 29.8%) |
| Slip-On | 900 | — | 16 | 339.3 | 206.6 | catalog vs S1 >5% (Δ 39.1%) |
| Slip-On | 900 | — | 18 | 434 | 291.2 | catalog vs S1 >5% (Δ 32.9%) |
| Slip-On | 900 | — | 20 | 558.1 | 356.4 | catalog vs S1 >5% (Δ 36.1%) |
| Slip-On | 900 | — | 24 | 853 | 666 | catalog vs S1 >5% (Δ 21.9%) |
| Slip-On | 1500 | — | 1/2 | 1.2 | 2.7 | catalog vs S1 >5% (Δ 125.0%) |
| Slip-On | 1500 | — | 3/4 | 1.6 | 2.7 | catalog vs S1 >5% (Δ 68.8%) |
| Slip-On | 1500 | — | 1 | 2.5 | 3.6 | catalog vs S1 >5% (Δ 44.0%) |
| Slip-On | 1500 | — | 1-1/4 | 3.5 | 4.5 | catalog vs S1 >5% (Δ 28.6%) |
| Slip-On | 1500 | — | 1-1/2 | 4.5 | 6.3 | catalog vs S1 >5% (Δ 40.0%) |
| Slip-On | 1500 | — | 2 | 6.4 | 11.3 | catalog vs S1 >5% (Δ 76.6%) |
| Slip-On | 1500 | — | 2-1/2 | 10 | 16.2 | catalog vs S1 >5% (Δ 62.0%) |
| Slip-On | 1500 | — | 3 | 14.5 | 21.6 | catalog vs S1 >5% (Δ 49.0%) |
| Slip-On | 1500 | — | 4 | 24.9 | 32.9 | catalog vs S1 >5% (Δ 32.1%) |
| Slip-On | 1500 | — | 6 | 62.1 | 74.3 | catalog vs S1 >5% (Δ 19.6%) |
| Slip-On | 1500 | — | 10 | 184.8 | 196.2 | catalog vs S1 >5% (Δ 6.2%) |
| Slip-On | 1500 | — | 12 | 270.8 | 300.2 | catalog vs S1 >5% (Δ 10.9%) |
| Slip-On | 1500 | — | 14 | 391.3 | 423 | catalog vs S1 >5% (Δ 8.1%) |
| Slip-On | 1500 | — | 16 | 525.1 | 562.5 | catalog vs S1 >5% (Δ 7.1%) |
| Slip-On | 1500 | — | 18 | 679.8 | 731.3 | catalog vs S1 >5% (Δ 7.6%) |
| Slip-On | 1500 | — | 20 | 868.4 | 922.5 | catalog vs S1 >5% (Δ 6.2%) |
| Weld Neck | 150 | STD | 1/2 | 0.5 | 0.9 | catalog vs S1 >5% (Δ 80.0%) |
| Weld Neck | 150 | STD | 3/4 | 0.7 | 0.9 | catalog vs S1 >5% (Δ 28.6%) |
| Weld Neck | 150 | STD | 1 | 1 | 1.4 | catalog vs S1 >5% (Δ 40.0%) |
| Weld Neck | 150 | STD | 1-1/4 | 1.3 | 1.4 | catalog vs S1 >5% (Δ 7.7%) |
| Weld Neck | 150 | STD | 1-1/2 | 1.7 | 1.8 | catalog vs S1 >5% (Δ 5.9%) |
| Weld Neck | 150 | STD | 2 | 2.3 | 2.7 | catalog vs S1 >5% (Δ 17.4%) |
| Weld Neck | 150 | STD | 2-1/2 | 3.2 | 4.5 | catalog vs S1 >5% (Δ 40.6%) |
| Weld Neck | 150 | STD | 3 | 4.1 | 5.2 | catalog vs S1 >5% (Δ 26.8%) |
| Weld Neck | 150 | STD | 4 | 6.4 | 7.4 | catalog vs S1 >5% (Δ 15.6%) |
| Weld Neck | 150 | STD | 6 | 12.7 | 11.7 | catalog vs S1 >5% (Δ 7.9%) |
| Weld Neck | 150 | STD | 8 | 21.3 | 18.9 | catalog vs S1 >5% (Δ 11.3%) |
| Weld Neck | 150 | STD | 10 | 31.8 | 24.3 | catalog vs S1 >5% (Δ 23.6%) |
| Weld Neck | 150 | STD | 12 | 44.5 | 39.6 | catalog vs S1 >5% (Δ 11.0%) |
| Weld Neck | 150 | STD | 14 | 63.5 | 51.3 | catalog vs S1 >5% (Δ 19.2%) |
| Weld Neck | 150 | STD | 16 | 81.6 | 63 | catalog vs S1 >5% (Δ 22.8%) |
| Weld Neck | 150 | STD | 18 | 104.3 | 74.3 | catalog vs S1 >5% (Δ 28.8%) |
| Weld Neck | 150 | STD | 20 | 130 | 88.7 | catalog vs S1 >5% (Δ 31.8%) |
| Weld Neck | 150 | STD | 24 | 195 | 120.6 | catalog vs S1 >5% (Δ 38.2%) |
| Weld Neck | 300 | STD | 1/2 | 0.7 | 0.9 | catalog vs S1 >5% (Δ 28.6%) |
| Weld Neck | 300 | STD | 3/4 | 0.9 | 1.4 | catalog vs S1 >5% (Δ 55.6%) |
| Weld Neck | 300 | STD | 1 | 1.4 | 1.8 | catalog vs S1 >5% (Δ 28.6%) |
| Weld Neck | 300 | STD | 1-1/4 | 1.8 | 2.3 | catalog vs S1 >5% (Δ 27.8%) |
| Weld Neck | 300 | STD | 1-1/2 | 2.3 | 3.2 | catalog vs S1 >5% (Δ 39.1%) |
| Weld Neck | 300 | STD | 2 | 3.2 | 4.1 | catalog vs S1 >5% (Δ 28.1%) |
| Weld Neck | 300 | STD | 2-1/2 | 4.5 | 5.4 | catalog vs S1 >5% (Δ 20.0%) |
| Weld Neck | 300 | STD | 3 | 5.9 | 8.1 | catalog vs S1 >5% (Δ 37.3%) |
| Weld Neck | 300 | STD | 3-1/2 | 7.7 | 9 | catalog vs S1 >5% (Δ 16.9%) |
| Weld Neck | 300 | STD | 4 | 9.5 | 11.9 | catalog vs S1 >5% (Δ 25.3%) |
| Weld Neck | 300 | STD | 5 | 14.1 | 16.2 | catalog vs S1 >5% (Δ 14.9%) |
| Weld Neck | 300 | STD | 6 | 19.1 | 20.3 | catalog vs S1 >5% (Δ 6.3%) |
| Weld Neck | 300 | STD | 8 | 33.1 | 31.1 | catalog vs S1 >5% (Δ 6.0%) |
| Weld Neck | 300 | STD | 10 | 50.8 | 45 | catalog vs S1 >5% (Δ 11.4%) |
| Weld Neck | 300 | STD | 12 | 72.6 | 63.9 | catalog vs S1 >5% (Δ 12.0%) |
| Weld Neck | 300 | STD | 14 | 104.3 | 92.7 | catalog vs S1 >5% (Δ 11.1%) |
| Weld Neck | 300 | STD | 16 | 136.1 | 112.5 | catalog vs S1 >5% (Δ 17.3%) |
| Weld Neck | 300 | STD | 18 | 174.6 | 144 | catalog vs S1 >5% (Δ 17.5%) |
| Weld Neck | 300 | STD | 20 | 217.7 | 180 | catalog vs S1 >5% (Δ 17.3%) |
| Weld Neck | 300 | STD | 24 | 329.3 | 261 | catalog vs S1 >5% (Δ 20.7%) |
| Weld Neck | 600 | STD | 1/2 | 0.9 | 1.4 | catalog vs S1 >5% (Δ 55.6%) |
| Weld Neck | 600 | STD | 3/4 | 1.4 | 1.8 | catalog vs S1 >5% (Δ 28.6%) |
| Weld Neck | 600 | STD | 1 | 2.1 | 1.8 | catalog vs S1 >5% (Δ 14.3%) |
| Weld Neck | 600 | STD | 1-1/2 | 3.4 | 3.6 | catalog vs S1 >5% (Δ 5.9%) |
| Weld Neck | 600 | STD | 2 | 4.8 | 5.4 | catalog vs S1 >5% (Δ 12.5%) |
| Weld Neck | 600 | STD | 2-1/2 | 7.3 | 8.1 | catalog vs S1 >5% (Δ 11.0%) |
| Weld Neck | 600 | STD | 3 | 9.5 | 10.4 | catalog vs S1 >5% (Δ 9.5%) |
| Weld Neck | 600 | STD | 3-1/2 | 12.7 | 11.7 | catalog vs S1 >5% (Δ 7.9%) |
| Weld Neck | 600 | STD | 4 | 16.8 | 18.9 | catalog vs S1 >5% (Δ 12.5%) |
| Weld Neck | 600 | STD | 5 | 25.4 | 30.6 | catalog vs S1 >5% (Δ 20.5%) |
| Weld Neck | 600 | STD | 6 | 34 | 36.5 | catalog vs S1 >5% (Δ 7.4%) |
| Weld Neck | 600 | STD | 8 | 63.5 | 54 | catalog vs S1 >5% (Δ 15.0%) |
| Weld Neck | 600 | STD | 10 | 100.7 | 85.5 | catalog vs S1 >5% (Δ 15.1%) |
| Weld Neck | 600 | STD | 12 | 143.8 | 101.7 | catalog vs S1 >5% (Δ 29.3%) |
| Weld Neck | 600 | STD | 14 | 204.1 | 156.2 | catalog vs S1 >5% (Δ 23.5%) |
| Weld Neck | 600 | STD | 16 | 267.6 | 216.5 | catalog vs S1 >5% (Δ 19.1%) |
| Weld Neck | 600 | STD | 18 | 344.7 | 249.8 | catalog vs S1 >5% (Δ 27.5%) |
| Weld Neck | 600 | STD | 20 | 435.9 | 310.5 | catalog vs S1 >5% (Δ 28.8%) |
| Weld Neck | 600 | STD | 24 | 666.8 | 439.7 | catalog vs S1 >5% (Δ 34.1%) |
| Weld Neck | 900 | STD | 1/2 | 1.4 | 3.2 | catalog vs S1 >5% (Δ 128.6%) |
| Weld Neck | 900 | STD | 3/4 | 1.8 | 3.2 | catalog vs S1 >5% (Δ 77.8%) |
| Weld Neck | 900 | STD | 1 | 2.7 | 3.8 | catalog vs S1 >5% (Δ 40.7%) |
| Weld Neck | 900 | STD | 1-1/4 | 3.6 | 4.5 | catalog vs S1 >5% (Δ 25.0%) |
| Weld Neck | 900 | STD | 1-1/2 | 4.5 | 6.3 | catalog vs S1 >5% (Δ 40.0%) |
| Weld Neck | 900 | STD | 2 | 6.4 | 10.8 | catalog vs S1 >5% (Δ 68.8%) |
| Weld Neck | 900 | STD | 2-1/2 | 9.5 | 13.9 | catalog vs S1 >5% (Δ 46.3%) |
| Weld Neck | 900 | STD | 3 | 13.6 | 16.2 | catalog vs S1 >5% (Δ 19.1%) |
| Weld Neck | 900 | STD | 4 | 22.7 | 23.9 | catalog vs S1 >5% (Δ 5.3%) |
| Weld Neck | 900 | STD | 6 | 59 | 49.5 | catalog vs S1 >5% (Δ 16.1%) |
| Weld Neck | 900 | STD | 8 | 109 | 84.2 | catalog vs S1 >5% (Δ 22.8%) |
| Weld Neck | 900 | STD | 10 | 167.4 | 120.6 | catalog vs S1 >5% (Δ 28.0%) |
| Weld Neck | 900 | STD | 12 | 239.5 | 167.4 | catalog vs S1 >5% (Δ 30.1%) |
| Weld Neck | 900 | STD | 14 | 340.2 | 252.9 | catalog vs S1 >5% (Δ 25.7%) |
| Weld Neck | 900 | STD | 16 | 449.1 | 308.3 | catalog vs S1 >5% (Δ 31.4%) |
| Weld Neck | 900 | STD | 18 | 576.5 | 415.8 | catalog vs S1 >5% (Δ 27.9%) |
| Weld Neck | 900 | STD | 20 | 735.5 | 523.8 | catalog vs S1 >5% (Δ 28.8%) |
| Weld Neck | 900 | STD | 24 | 1117.8 | 948.2 | catalog vs S1 >5% (Δ 15.2%) |
| Weld Neck | 1500 | STD | 1/2 | 1.8 | 3.2 | catalog vs S1 >5% (Δ 77.8%) |
| Weld Neck | 1500 | STD | 3/4 | 2.3 | 3.2 | catalog vs S1 >5% (Δ 39.1%) |
| Weld Neck | 1500 | STD | 1 | 3.6 | 4.1 | catalog vs S1 >5% (Δ 13.9%) |
| Weld Neck | 1500 | STD | 1-1/4 | 5 | 4.5 | catalog vs S1 >5% (Δ 10.0%) |
| Weld Neck | 1500 | STD | 2 | 9.1 | 11.3 | catalog vs S1 >5% (Δ 24.2%) |
| Weld Neck | 1500 | STD | 2-1/2 | 14.1 | 16.2 | catalog vs S1 >5% (Δ 14.9%) |
| Weld Neck | 1500 | STD | 3 | 20.4 | 21.6 | catalog vs S1 >5% (Δ 5.9%) |
| Weld Neck | 1500 | STD | 6 | 84.8 | 74.3 | catalog vs S1 >5% (Δ 12.4%) |
| Weld Neck | 1500 | STD | 8 | 159.4 | 123.8 | catalog vs S1 >5% (Δ 22.3%) |
| Weld Neck | 1500 | STD | 10 | 249.5 | 204.8 | catalog vs S1 >5% (Δ 17.9%) |
| Weld Neck | 1500 | STD | 12 | 362.9 | 310.5 | catalog vs S1 >5% (Δ 14.4%) |
| Weld Neck | 1500 | STD | 14 | 521.6 | 423 | catalog vs S1 >5% (Δ 18.9%) |
| Weld Neck | 1500 | STD | 16 | 694.9 | 562.5 | catalog vs S1 >5% (Δ 19.1%) |
| Weld Neck | 1500 | STD | 18 | 898.1 | 731.3 | catalog vs S1 >5% (Δ 18.6%) |
| Weld Neck | 1500 | STD | 20 | 1143.5 | 922.5 | catalog vs S1 >5% (Δ 19.3%) |
| Weld Neck | 1500 | STD | 24 | 1746.4 | 1496 | catalog vs S1 >5% (Δ 14.3%) |
| Weld Neck | 2500 | STD | 1/2 | 2.7 | 3.6 | catalog vs S1 >5% (Δ 33.3%) |
| Weld Neck | 2500 | STD | 3/4 | 3.6 | 4.1 | catalog vs S1 >5% (Δ 13.9%) |
| Weld Neck | 2500 | STD | 1 | 5.4 | 5.9 | catalog vs S1 >5% (Δ 9.3%) |
| Weld Neck | 2500 | STD | 1-1/4 | 7.7 | 9 | catalog vs S1 >5% (Δ 16.9%) |
| Weld Neck | 2500 | STD | 1-1/2 | 10 | 12.6 | catalog vs S1 >5% (Δ 26.0%) |
| Weld Neck | 2500 | STD | 2 | 14.5 | 18.9 | catalog vs S1 >5% (Δ 30.3%) |
| Weld Neck | 2500 | STD | 3 | 33.6 | 42.3 | catalog vs S1 >5% (Δ 25.9%) |
| Weld Neck | 2500 | STD | 4 | 59 | 65.7 | catalog vs S1 >5% (Δ 11.4%) |
| Weld Neck | 2500 | STD | 6 | 147.4 | 170.1 | catalog vs S1 >5% (Δ 15.4%) |
| Weld Neck | 2500 | STD | 8 | 283.5 | 259.2 | catalog vs S1 >5% (Δ 8.6%) |
| Weld Neck | 2500 | STD | 10 | 453.6 | 480.6 | catalog vs S1 >5% (Δ 6.0%) |
| Weld Neck | 2500 | STD | 12 | 671.3 | 723.6 | catalog vs S1 >5% (Δ 7.8%) |

## Skipped

### Chart-missing / deferred / out-of-scope

| type | class | schedule | nps | current_wt | chart_wt | reason |
| ---- | ----- | -------- | --- | ---------- | -------- | ------ |
| Blind | 150 | — | 22 | — | 159.8 | out-of-scope coverage expansion (not in current catalog matrix) |
| Blind | 300 | — | 22 | — | 288 | out-of-scope coverage expansion (not in current catalog matrix) |
| Blind | 600 | — | 22 | — | 450 | out-of-scope coverage expansion (not in current catalog matrix) |
| Blind | 900 | — | 5 | — | 39.2 | out-of-scope coverage expansion (not in current catalog matrix) |
| Blind | 1500 | — | 5 | — | 63 | out-of-scope coverage expansion (not in current catalog matrix) |
| Blind | 1500 | — | 24 | — | 1631 | out-of-scope coverage expansion (not in current catalog matrix) |
| Blind | 2500 | — | 5 | — | 100.4 | out-of-scope coverage expansion (not in current catalog matrix) |
| Lap Joint | all | — | (105 rows) | unchanged | — | deferred this slice — leave catalog rows byte-stable |
| Slip-On | 150 | — | 22 | — | 83.3 | out-of-scope coverage expansion (not in current catalog matrix) |
| Slip-On | 300 | — | 22 | — | 166.5 | out-of-scope coverage expansion (not in current catalog matrix) |
| Slip-On | 600 | — | 22 | — | 265.5 | out-of-scope coverage expansion (not in current catalog matrix) |
| Slip-On | 900 | — | 5 | — | 37.4 | out-of-scope coverage expansion (not in current catalog matrix) |
| Slip-On | 1500 | — | 5 | — | 59.4 | out-of-scope coverage expansion (not in current catalog matrix) |
| Slip-On | 2500 | — | 1/2 | 2 | — | S1 does not publish Slip-On Class 2500 |
| Slip-On | 2500 | — | 3/4 | 2.7 | — | S1 does not publish Slip-On Class 2500 |
| Slip-On | 2500 | — | 1 | 4.1 | — | S1 does not publish Slip-On Class 2500 |
| Slip-On | 2500 | — | 1-1/4 | 5.9 | — | S1 does not publish Slip-On Class 2500 |
| Slip-On | 2500 | — | 1-1/2 | 7.5 | — | S1 does not publish Slip-On Class 2500 |
| Slip-On | 2500 | — | 2 | 10.9 | — | S1 does not publish Slip-On Class 2500 |
| Slip-On | 2500 | — | 2-1/2 | 17.2 | — | S1 does not publish Slip-On Class 2500 |
| Slip-On | 2500 | — | 3 | 25.4 | — | S1 does not publish Slip-On Class 2500 |
| Slip-On | 2500 | — | 4 | 45.4 | — | S1 does not publish Slip-On Class 2500 |
| Socket Weld | all | — | (48 rows) | unchanged | — | deferred this slice — leave catalog rows byte-stable |
| Threaded | all | — | (59 rows) | unchanged | — | deferred this slice — leave catalog rows byte-stable |
| Weld Neck | 150 | STD | 22 | — | 101.3 | out-of-scope coverage expansion (not in current catalog matrix) |
| Weld Neck | 300 | STD | 22 | — | 209.3 | out-of-scope coverage expansion (not in current catalog matrix) |
| Weld Neck | 600 | STD | 22 | — | 324 | out-of-scope coverage expansion (not in current catalog matrix) |
| Weld Neck | 900 | STD | 5 | — | 38.7 | out-of-scope coverage expansion (not in current catalog matrix) |
| Weld Neck | 1500 | STD | 5 | — | 59.4 | out-of-scope coverage expansion (not in current catalog matrix) |
| Weld Neck | 2500 | STD | 5 | — | 109.8 | out-of-scope coverage expansion (not in current catalog matrix) |

### WN non-STD schedules (all classes / NPS in current matrix)

Industry charts (S1/S2) do not publish separate Weld Neck kg/pc by bore schedule beyond the STD/40S assumption. The following pipe keys are **Skipped for all WN class×NPS** (no invent):

- `Sch 5S`
- `Sch 5`
- `Sch 10S`
- `Sch 10`
- `Sch 20`
- `Sch 30`
- `Sch 60`
- `Sch 80S`
- `Sch 80`
- `Sch 100`
- `Sch 120`
- `Sch 140`
- `Sch 160`
- `XS`
- `XXS`

Planner UX after Phase 3: Schedule dropdown lists only keys present under the selected class (STD + aliases where proposed).

## Conflict policy

A proposed cell is a **Conflict** when any of: (a) existing catalog `wt` and chart `wt` differ by more than **5%** relative (`|chart − catalog| / catalog > 0.05`, catalog `wt > 0`); (b) two cited chart sources disagree by more than 5% on the same cell; (c) chart splits facing/material (e.g. RF vs RTJ) and the proposal must pick one without an existing catalog convention.

All other proposed cells with a single clear chart value are **Auto-apply** (including new WN schedule×NPS cells with no prior catalog row).

This artifact uses **S1 as the sole cited chart for numeric proposals**, so rule (b) is not auto-applied against S3. Facing is fixed to **RF CS** (rule (c) avoided). Phase 2 must not write Conflict rows until human Sign-off below — or the Conflict section is empty and Notes say so.

## Sign-off

Recorded from chat (2026-07-18): **Accept all Conflicts → replace with S1 `chart_wt`**. Sources / RF CS A105 assumption accepted.

| Field | Value |
| ----- | ----- |
| Conflict count | 294 |
| Decision | **accept all** — replace with S1 `chart_wt` |
| Accepted Conflict rows | all |
| Rejected Conflict rows | none |
| Edits (type/class/schedule/nps → wt) | none |
| Notes | Phase 2 applies Auto-apply + all 294 Conflict rows at S1 chart_wt. Skipped cells stay omitted. |
| Reviewer | human (chat) |
| Date | 2026-07-18 |
