---
change_id: astro-migrate-ux-redesign
title: Migrate calculator to Astro and redesign UX
status: impl_reviewed
created: 2026-07-18
updated: 2026-07-19
archived_at: null
---

## Notes

Roadmap S-06. Research scope (user): full package (codebase + design system + layout) / stack-ecosystem focus (shadcn + Tailwind) / inspiration board (no wireframes).

Plan decisions: full calculator without bot; Sheets in one shell; new IA (split L|R); hard switch `/`; Chart.js npm; in-app print report; light neutral; visual alerts only; golden S-03 + E2E smoke.

Phase 4 landed in `2e57036` (chart + visual alerts).

Phase 5 landed in `ed5e8d2` (in-app technical report + S-03 mismatch disclosure).

### Phase 6 cutover

- Relocated root calculator to `legacy/` (`index.html`, `app.js`, `styles.css`, `data/`). Not under `public/`. Astro app uses `src/lib/data/*` catalogs only.
- `AGENTS.md` + ESLint ignores point at `legacy/`.

### Smoke checklist (Phase 6)

- [x] Defaults / golden Total Weight & Utilization (display rounding OK)
- [x] Fill-aware cargo Send → cargo Te + utilization update
- [x] Rigging Send → rigging Te + recompute
- [x] Visual alerts + chart at warn/crit; no audio
- [x] Report + Te/`sentLog` mismatch disclosure
- [x] Manual Te entry after Send still recomputes
- [x] Reset → defaults; clears cargo/rigging send state
- [x] Mobile glance usable
- [x] No Dialogflow / no Welcome on `/`
- [x] Astro app runs without needing `legacy/` at runtime

**Residual risks:** chart-in-report PNG is best-effort (canvas snapshot at report open); if unavailable, numeric results + logs still ship. Legacy under `legacy/` kept for reference / emergency static host outside Astro. Calculator island uses `client:only="react"` plus Vite React dedupe/`react-dom/server.edge` prebundle to avoid Astro 6 + Cloudflare workerd “Invalid hook call” white screen in `astro dev`.
