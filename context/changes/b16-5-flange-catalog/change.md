---
change_id: b16-5-flange-catalog
title: B16 5 flange catalog
status: implemented
created: 2026-07-18
updated: 2026-07-18
archived_at: null
---

## Notes

### Shipped (S-05 / US-01)

- **Mass source policy:** kg/pc from manufacturer/industry charts (Wermac/Texas Flange primary, RF carbon steel A105) — not from ASME B16.5 PDF. Approval artifact: `flange-weight-candidates.md`. Auto-apply non-conflicts; human Sign-off only on Conflict rows (decision 8C; Phase 1 accepted all Conflicts → S1 `chart_wt`).
- **Core-3 scope:** rewritten `Weld Neck`, `Slip-On`, `Blind` within the prior class×NPS matrix (no Class 400 / NPS expansion).
- **WN nest shape:** `flanges["Weld Neck"][class][schedule] → [{ nps, wt }]`. Runtime Schedule cascade (Phase 3, `05374a8`) enables Schedule only for Flange + Weld Neck. Signed schedule keys: `STD`, `Sch 40` (NPS ≤ 10″), `Sch 40S` (NPS ≤ 10″) — aliases of chart STD/40S bore; other pipe schedules skipped (no published WN masses; no invent).
- **SO / Blind shape:** unchanged `type → class → [{ nps, wt }]` with chart-aligned weights.
- **Deferred (left unchanged):** `Socket Weld`, `Threaded`, `Lap Joint` — still selectable; weights unverified this slice.
- Phase 1 Progress stamp: `0fd46bf` / `0ceae37`. Phase 2 catalog: `7219577`. Phase 3 runtime: `05374a8`. Phase 4 notes / epilogue: `417716e` / `3da7b50`.
