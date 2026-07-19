# Astro Migrate + UX Redesign — Plan Brief

> Full plan: `context/changes/astro-migrate-ux-redesign/plan.md`  
> Research: `context/changes/astro-migrate-ux-redesign/research.md`

## What & Why

Przenieść cały kalkulator (Appliance Ratio + cargo + rigging + chart + raport) z legacy root do Astro z czytelniejszą IA — split inputs | live results, Sheets zamiast modalExcel, light industrial UI. Cel: UX XXI wieku bez regresji formuły i bez bota.

## Starting Point

Astro już serwuje `/` (Welcome); kalkulator żyje w `index.html`/`app.js` poza `public/` (nie w runtime Astro). Scaffold ma shadcn new-york + tokeny, ale tylko `Button`. Formuła i golden S-03 są znane; cargo/fill działają na legacy.

## Desired End State

Planner na `/` widzi light split-workspace: lewo wagi + Sheets cargo/rigging, prawo utilization hero + metrics + chart + visual alerts + report (print). Ręczne Te działa. Formuła = golden. Dialogflow nie ma. Legacy w `legacy/`.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| -------- | ------ | ---------------- | ------ |
| Design system | shadcn/ui + Tailwind 4 | Już w stacku; najlepszy fit Astro islands | Research |
| Layout direction | Split L\|R + Sheets + utilization hero | Wzorzec industrial calculators / research board | Research |
| v1 scope | Ratio+cargo+rigging+chart+report; bez bota | Pełny 3-w-1 bez AI out-of-scope | Plan |
| Redesign depth | Nowa IA (nie reskin Excel) | Realna czytelność | Plan |
| Cutover | Hard switch `/`; legacy → `legacy/` | Jedna prawda; Astro i tak wygrywa `/` | Plan |
| Chart | Chart.js (npm) | Parity z legacy doughnut | Plan |
| Report | In-app print view | Bez popup CDN blank; Cloudflare-friendly | Plan |
| Brand | Light industrial-neutral | Czytelność narzędziowa | Plan |
| Alerts | Visual only | Bez beep/speech friction | Plan |
| Verify | Golden S-03 + E2E smoke | Bez nowego test runnera | Plan |

## Scope

**In scope:** Astro `/` calculator; extract formula to `src/lib/`; cargo/rigging Sheets + catalogs; Chart.js; visual alerts; print report + mismatch disclosure; move legacy to `legacy/`.

**Out of scope:** Bot, auth/DB, formula rewrite, audio alerts, Recharts, dual-serve `/legacy`, test runner, S-05 flange work as part of this change.

## Architecture / Approach

Jedna (główna) React island z shared state: inputs → `computeFromInputs` w `src/lib/` → results/chart/alerts. Sheets mutują listy i Sendują Te. Katalogi jako moduły ES zamiast `window.*`. Raport = ten sam stan → print view. Cutover = zamiana Welcome + `git mv` legacy.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Shell & design kit | `/` chrome L\|R + shadcn + light theme | Zbyt wczesne dodawanie całego UI kitu |
| 2. Core ratio engine | Pure lib + live results + golden | Przypadkowa zmiana algebry |
| 3. Cargo & Rigging Sheets | Catalog Send parity | Utrata fill/Send edge cases |
| 4. Chart & visual alerts | Chart.js + warn/crit UI | Lifecycle Chart w React |
| 5. Technical report | In-app print + mismatch disclosure | Parity treści vs. legacy HTML |
| 6. Cutover & smoke | `legacy/` + E2E | Broken imports po `git mv` |

**Prerequisites:** S-03 done (golden + handoff semantics); research complete; npm mirror active.  
**Estimated effort:** ~6 implement sessions (one phase each), plus human smoke gates between phases.

## Open Risks & Assumptions

- Chart image w raporcie jest best-effort — numery + logi są must-have.
- Import ścieżek `data/` może wymagać dostosowania Vite przy przenosinach do `legacy/`.
- S-05 (flanges) może być niedokończony równolegle — v1 zużywa aktualny katalog as-is.
- Help modal rigging jest nice-to-have względem Send path.

## Success Criteria (Summary)

- Planner robi pełną ścieżkę cargo+fill+rigging→ratio→report na Astro `/` bez legacy hosta
- Golden E6/E8 nadal prawdziwe; brak Dialogflow; UI light split czytelny na desktop i mobile
