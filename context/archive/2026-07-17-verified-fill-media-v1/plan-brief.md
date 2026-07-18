# Verified Fill Media v1 — Plan Brief

> Full plan: `context/changes/verified-fill-media-v1/plan.md`
> Research: (none — decisions locked in `/10x-plan`)

## What & Why

Ship a small verified fill-media list with densities and sources so pipe fill can produce credible cargo weights. PRD FR-002 kept fill as must-have only if v1 uses a small verified list — without that list, fill yields unreliable weights and S-02 cannot proceed.

## Starting Point

Cargo pipe weight today is `wt × length` with no fill media, densities, or volume path. Catalogs already live as `data/*.js` globals (`RIGGING_CATALOG`, `PIPING_CATALOG`); no fill-media file exists.

## Desired End State

`data/fill_media_catalog.js` exposes `window.FILL_MEDIA_CATALOG` with Empty (0), fresh water (1000), seawater (1025), and light oil (850) kg/m³ — each with a citation and conditions. Data only; not loaded by the app until S-02.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| -------- | ------ | ---------------- | ------ |
| Media set | Empty + fresh water + seawater + light oil | Broader than water-only; still a small verified list | Plan |
| Empty representation | Explicit Empty at ρ = 0 | Uniform selector model; air mass is negligible for planning | Plan |
| Deliverable shape | Data module only (no UI / no script tag) | Matches F-01 foundation; keeps S-02 for wiring + formula | Plan / Roadmap |
| Light oil value | Generic “Light oil” @ 850 kg/m³ | Common mid-range planning value; note ~800–900 variance | Plan |
| Verification standard | Per-medium `source` + `notes` (conditions/caveats) | Satisfies FR-002 “wiarygodne gęstości/źródła” next to the numbers | Plan |

## Scope

**In scope:**
- `data/fill_media_catalog.js` with four media rows, units, sources, notes
- Handoff notes in `change.md` for S-02

**Out of scope:**
- Fill UI, volume math, wall thickness/ID, script-tag wiring
- Full media catalog, custom density input, Empty-as-air
- Astro/`src` port, Appliance Ratio changes

## Architecture / Approach

One static module: `window.FILL_MEDIA_CATALOG = { version, unit: "kg/m3", items[] }` with fields `id`, `label`, `densityKgPerM3`, `source`, `notes`. Same browser-global pattern as existing catalogs; intentionally unloaded until S-02 adds the script tag and `m_fill = V × ρ`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Fill-media catalog module | Verified `data/fill_media_catalog.js` | Weak or empty citations undermine “verified” |
| 2. Handoff verification | Notes contract for S-02 | S-02 re-opens media/density decisions if Notes are vague |

**Prerequisites:** None (parallel with S-01)
**Estimated effort:** ~1 short session across 2 phases

## Open Risks & Assumptions

- Light oil @ 850 is a planning convention, not a named product — planners with SDS densities may need a later custom-density feature (out of scope).
- Seawater @ 1025 is a rounded surface average (TEOS-10 ~1026 at 15 °C / standard salinity) — acceptable for lift planning, not oceanographic precision.
- S-02 still needs pipe internal volume (wall thickness / ID) — F-01 only supplies ρ.

## Success Criteria (Summary)

- Four media with locked densities and non-empty sources live in `data/fill_media_catalog.js`
- Catalog is ready for S-02 (`FILL_MEDIA_CATALOG` contract documented) and not yet wired into cargo UI/calc
- Full fill-media catalog remains explicitly out of scope
