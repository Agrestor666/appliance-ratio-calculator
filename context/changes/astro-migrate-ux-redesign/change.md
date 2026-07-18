---
change_id: astro-migrate-ux-redesign
title: Migrate calculator to Astro and redesign UX
status: implementing
created: 2026-07-18
updated: 2026-07-18
archived_at: null
---

## Notes

Roadmap S-06. Research scope (user): full package (codebase + design system + layout) / stack-ecosystem focus (shadcn + Tailwind) / inspiration board (no wireframes).

Plan decisions: full calculator without bot; Sheets in one shell; new IA (split L|R); hard switch `/`; Chart.js npm; in-app print report; light neutral; visual alerts only; golden S-03 + E2E smoke.

Phase 4 landed in `2e57036` (chart + visual alerts).

Phase 5: in-app technical report (`src/lib/report.ts` + print view) with S-03 Te/`sentLog` mismatch disclosure; Chart.js canvas snapshot best-effort.
