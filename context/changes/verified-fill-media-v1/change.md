---
change_id: verified-fill-media-v1
title: Verified fill media v1
status: implementing
created: 2026-07-17
updated: 2026-07-18
archived_at: null
---

## Notes

Plan: `context/changes/verified-fill-media-v1/plan.md` (citation rationale and locked densities)
Brief: `context/changes/verified-fill-media-v1/plan-brief.md`

### S-02 handoff contract (F-01 delivered)

- **Path**: `data/fill_media_catalog.js`
- **Global**: `window.FILL_MEDIA_CATALOG`
- **Root fields**: `{ version: number, unit: "kg/m3", items: FillMediaItem[] }`
- **Item fields**: `{ id: string, label: string, densityKgPerM3: number, source: string, notes: string }`
- **Density unit**: always kg/m³; fill mass later is `V_m3 × densityKgPerM3`
- **Media (stable ids)**:
  - `empty` → 0
  - `fresh-water` → 1000
  - `seawater` → 1025
  - `light-oil` → 850
- **Not wired in F-01**: catalog is not loaded by `index.html` or read by `app.js`. No fill selector UI and no cargo fill-mass formula here — that is S-02 (`pipe-fill-cargo-weight`).
