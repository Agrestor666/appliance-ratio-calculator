# Pipe Fill → Cargo Weight — Plan Brief

> Full plan: `context/changes/pipe-fill-cargo-weight/plan.md`

## What & Why

Planner picks what a pipe is filled with and sees cargo weight that includes fill (steel + fill from internal volume). This is roadmap S-02 / FR-002–003 — the credibility wedge for cargo weight — building on verified densities (F-01) and catalog→list→Send (S-01).

## Starting Point

Legacy cargo calculator already builds pipe lists and sends Te; mass is steel-only (`wt × length`). `FILL_MEDIA_CATALOG` exists but is not loaded. Pipe rows lack wall thickness, so internal volume cannot be computed yet.

## Desired End State

On the legacy calculator: session fill selector (default Empty); pipe lines use `m = m_steel + V_internal × ρ`; non-pipes stay steel-only; preview/list/Send show final kg with fill; pipe log stores `fillId` (medium visible via label). Ratio formula unchanged — S-03 owns that handoff polish.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| -------- | ------ | ---------------- |
| Fill UX scope | Selector for all categories | Planner keeps one session medium control |
| Fill math scope | Pipes only; non-pipes steel-only | No verified volumes for fittings/flanges/valves |
| Geometry | Curated `t` mm; `ID = OD − 2t` | Auditable ASME walls; don’t derive from `wt` |
| Fill UX model | Session-level select | Fast for same-medium spools; matches NFR on change |
| Default medium | Empty (ρ = 0) | No silent weight inflation vs today’s steel-only |
| Log / report | `fillId` + medium in label; final kg only | FR-003 MVP; auditable without breakdown UI |
| Wall enrichment | Propose → sign-off → SSOT | Same trust gate as S-01 catalog gaps |
| Time cut | Report chrome polish first | Protect fill math + Send path |

## Scope

**In scope:**
- `wall-thickness-candidates.md` + signed-off `t` on pipe rows
- Load `FILL_MEDIA_CATALOG`; session fill UI; pipe fill mass; `fillId` on pipe log lines
- Preview/list/Send final kg with fill; Empty parity; S-03 handoff notes

**Out of scope:**
- Astro port; ratio formula changes; custom density; Empty-as-air; non-pipe fill volume; steel/fill breakdown UI; `pipes.json` runtime; test runner

## Architecture / Approach

Legacy only: enrich `PIPING_CATALOG.pipes` with `t` → load fill catalog → session `<select>` → extend `calcUnitKg` / preview / `cargoAddItem`. Densities from F-01 only. Send path unchanged (sum kg → Te).

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Wall-thickness proposal | Sign-off artifact for `t` | Alias schedules (STD/XS/XXS, S vs non-S) mis-assigned |
| 2. Apply `t` to SSOT | `t` on accepted pipe rows | Editing without sign-off / rewriting `od`/`wt` |
| 3. Wire fill → cargo weight | UI + formula + log fields | Wrong ID/volume or fill applied to non-pipes |
| 4. E2E + S-03 handoff | Verified path + Notes | Calling done without mixed-list Send smoke |

**Prerequisites:** F-01 + S-01 done; human available to sign off Phase 1 walls  
**Estimated effort:** ~2–3 sessions across 4 phases (Phase 1–2 gated on approval)

## Open Risks & Assumptions

- ASME wall tables must be matched carefully for STD/XS/XXS and *S schedules — bucket uncertain rows for review.
- Light oil @ 850 and seawater @ 1025 remain planning values (F-01); custom SDS densities stay later.
- “All categories” means UX presence of the selector; mass effect remains pipes-only unless a future change adds volumes.

## Success Criteria (Summary)

- Planner selects fill; pipe cargo kg includes fill; Empty matches prior steel-only
- Non-pipe lines ignore fill; Send still feeds `#cargoWeight`
- Wall `t` values are signed off before they affect mass
