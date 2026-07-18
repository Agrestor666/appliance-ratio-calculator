---
change_id: pipe-fill-cargo-weight
title: Pipe fill cargo weight
status: implemented
created: 2026-07-18
updated: 2026-07-18
archived_at: null
---

## Notes

### S-03 handoff

- **Cargo Weight Te is fill-aware on Send.** Pipe lines already include fill mass (`m_steel + V_internal × ρ`) in `unitKg` / `totalKg`. `cargoSendBtn` writes `lastSumKg / 1000` into `#cargoWeight` and calls `recompute()` — S-03 can assume `#cargoWeight` reflects that total without re-deriving fill.
- **Pipe log / `sentLog` may carry `fillId` and `fillLabel`.** Medium is also appended to the line `label` string (e.g. `| Fresh water`) so the existing technical report table surfaces it without new columns.
- **S-03 owns** Appliance Ratio / utilization formula and chart close-out (FR-004/005), ratio/report regression guardrails, and any dedicated report columns for fill medium beyond the label string.
- **Out of scope (remains):** fill mass on fittings / flanges / valves; custom density input; steel vs fill breakdown UI; Astro migration of the cargo calculator.
