---
change_id: cargo-catalog-selection
title: Cargo catalog selection
status: implementing
created: 2026-07-18
updated: 2026-07-18
archived_at: null
---

## Notes

Legacy validate + curated pipe NPS gap-fill (`pipes.json` → propose → sign-off → `piping_catalog.js`) + path-critical harden (Escape, Reset clears cargo log/sentLog). No Astro, no fill, no line-model prep.

### Gap fill (approved)

Sign-off and full candidate/skip tables: [`gap-candidates.md`](./gap-candidates.md).

- **Accepted (11 rows, set A):** Sch 10S 22 & 30; Sch 120 4; Sch 30 1/4 & 3/8; Sch 40 34 & 36; Sch 60 / 80 / 80S 22; XXS 5 — applied add-only into `data/piping_catalog.js`.
- **Deferred (set B):** Sch 100–160 @ 22″; STD/XS 38–48″.
- **Skipped:** 5 zero-wt JSON gaps; 193 overlap weight conflicts (catalog SSOT, no overwrite). `pipes.json` remains unused at runtime.

### Harden behaviors shipped

- Escape closes the cargo modal (same global `keydown` path as rigging → `hideCargoModal()`).
- Main Reset clears `cargoState.log`, `sentLog`, and `sentSumKg`, then refreshes cargo UI / main hint so report cargo breakdown cannot go stale. Rigging state untouched.

### S-02 handoff (prerequisites)

Catalog selection (FR-001 / S-01) is validated. Next roadmap slice still needs:

1. **Internal volume / wall thickness (or ID)** on pipe (and line) catalog rows — current `{ nps, od, wt }` has no wall/ID; fill mass cannot be computed from OD + wt alone.
2. **Wire `FILL_MEDIA_CATALOG`** (`data/fill_media_catalog.js`, F-01 already available) into cargo/line UI and mass math — data-only today; no fill UI in this change.

Do not treat S-01 as having prepared the line model or fill path beyond this note.
