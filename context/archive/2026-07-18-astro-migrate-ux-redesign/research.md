---
date: 2026-07-18T20:28:51+01:00
researcher: Cursor Agent
git_commit: 9e5a17eb92677d19b2f5fe0a3a09e47ae6bae2f4
branch: master
repository: Appliance Ratio Calculator
topic: "astro-migrate-ux-redesign — design system + layout inspiration + migration surface"
tags: [research, codebase, shadcn, astro, ux, layout, design-system, lifting-calculator]
status: complete
last_updated: 2026-07-18
last_updated_by: Cursor Agent
---

# Research: Design system + layout inspiration for Astro migration

**Date**: 2026-07-18T20:28:51+01:00  
**Researcher**: Cursor Agent  
**Git Commit**: 9e5a17eb92677d19b2f5fe0a3a09e47ae6bae2f4  
**Branch**: master  
**Repository**: Appliance Ratio Calculator

## Research Question

Dla S-06 (`astro-migrate-ux-redesign`): jaki design system jest najbardziej odpowiedni dla tego typu aplikacji (kalkulator lifting / Appliance Ratio + cargo + rigging), oraz skąd czerpać inspirację do kompletnie czytelniejszego layoutu — bez gotowych wireframe’ów (inspiration board).

**Uzgodniony zakres:** pełny pakiet (codebase + design system + layout) / focus w ekosystemie stacku (shadcn + Tailwind) / głębokość layoutu = inspiration board.

## Summary

**Rekomendacja design systemu: zostać przy shadcn/ui (new-york) + Tailwind 4 + Radix**, już zainicjowanym w scaffoldzie. To najlepsze dopasowanie do Astro React islands, własności kodu, gęstych formularzy inżynierskich i ograniczenia bundle (browser-local tool). Ant Design / Mantine dają bogatsze tabele „enterprise”, ale walczą z Tailwindem 4, dublują stack i są nadwymiarowe dla jednego kalkulatora.

**Layout (wnioski z inspiracji, nie wireframe):** branżowe narzędzia (SlingCalc, LiftPlanner Pro, widgety load-chart) i klasyczne kalkulatory (Desmos) dzielą ekran na **panel wejść ↔ panel wyniku w czasie rzeczywistym**, z kolorowym statusem utilization (zielony / amber / czerwony) i raportem jako wyjściem, nie centrum IA. Legacy app robi coś podobnego (2 karty), ale psuje to numeracją Excel, modalami zamiast tras i ciemnym „glass/purple” szumem.

**Migracja:** kalkulator nadal żyje tylko w `index.html` / `app.js` / `styles.css`; `src/` ma tokeny + jeden `Button`. Największy koszt to przepisanie kontraktu DOM ID + globals katalogów na React state / imports — nie wybór innej biblioteki UI.

## Detailed Findings

### 1. Legacy UI surface (co migrujemy)

Jedna strona bez tabów na poziomie aplikacji; 2-kolumnowy grid (inputs/results | chart/report), trzy modale, bot Dialogflow, raport przez `window.open`.

| Surface | Rola | Ref |
|--------|------|-----|
| Sticky topbar + Utilization pill | brand + status | `index.html:16–24` |
| `#inputs` | rigging/cargo weight, contingency, DAF, WLL (numery Excel 1–6) | `index.html:27–74` |
| Results metrics | total / ratio / used / remaining + alerts | `index.html:78–114` |
| Chart card | thresholds, doughnut, Generate Technical Report | `index.html:117–138` |
| Rigging modal | katalog + log + sheet tabs | `index.html:145–194` |
| Cargo modal | piping cascade + fill + log | `index.html:250–335` |
| LiftSpec Bot | Dialogflow, osobny motyw | `index.html:338–447` |
| Report | HTML popup z logami + chart PNG | `app.js:1174–1408` |

**Problemy IA widoczne w kodzie:**
- Płaska hierarchia + pod-kalkulatory schowane w modalach (łatwo przeoczyć vs. primary path).
- Numeracja Excel / formuła w labelach (`index.html:43–92`) — wygląda jak arkusz, nie produkt.
- CTA raportu na karcie Chart, nie przy wynikach (`index.html:117–125`).
- Ciemny purple/teal + system fonts (`styles.css:1–30`) — wysoki szum wizualny jak na narzędzie pracy.
- Gęste `.field` / wrap rows (`styles.css:92–94`, `409–418`).

**Coupling utrudniający Astro:**
- `el(id)` cache wszystkich kontrolek przy starcie (`app.js:1–22`, `450–462`) — islands muszą zachować ID albo przepisać referencje.
- `window.RIGGING_CATALOG` / `PIPING_CATALOG` / `FILL_MEDIA_CATALOG` + Chart.js global.
- Imperative `innerHTML` tabele / steppers; `riggingState` / `cargoState` → write-back do `#riggingWeight` / `#cargoWeight` → `recompute()`.
- ~2.1k linii w jednym skrypcie — brak granic komponentów.

### 2. Astro scaffold (co już jest)

| Piece | Status | Ref |
|--------|--------|-----|
| Astro 6 SSR + React 19 + Tailwind 4 + Cloudflare | present | `package.json`, `astro.config.mjs` |
| shadcn **new-york**, `rsc: false`, lucide, CSS vars | present | `components.json:2–21` |
| Theme tokens light/dark | present | `src/styles/global.css:5–111` |
| `cn()` | present | `src/lib/utils.ts` |
| shadcn `Button` only | partial | `src/components/ui/button.tsx` |
| Calculator under `src/` | **absent** | `src/pages/index.astro` = starter Welcome |
| Font package / product branding | absent | Layout title still starter |

Konwencje: Astro layout + React islands (`client:*`); `npx shadcn@latest add`; nie zastępować legacy drzewa bez planu (`AGENTS.md`).

**Braki do hostowania kalkulatora:** route/strona produktu; Input/Select/Tabs/Table/Dialog/Sheet/Card; import katalogów do `src/`; chart lib w island; raport bez `window.open` (prefer print route / blob w tej samej app).

### 3. Design system — porównanie w ekosystemie stacku

| Opcja | Fit do Astro + Tailwind 4 | Fit do dense calculator | Werdykt |
|-------|---------------------------|-------------------------|---------|
| **shadcn/ui + Radix** | Oficjalny [Astro install](https://ui.shadcn.com/docs/installation/astro); już w repo | Field/FieldGroup, compact forms, Dialog/Sheet, Table, Resizable — składasz gęsty UI; własność kodu | **Recommend** |
| Mantine | Działa w React islands, ale CSS Modules / własny theme — drugi system stylów obok Tailwind 4 | Bogate formy/tabele „out of the box” | Reject — dubluje stack |
| Ant Design | CSS-in-JS, duży bundle; słaba synergia z Tailwind | Najlepsze enterprise tables | Reject — ciężkie i „Ant look” vs. custom product |
| Headless-only (Radix bez shadcn) | OK | Więcej ręcznej pracy | Niepotrzebne — shadcn już jest cienką warstwą nad Radix |

**Dlaczego shadcn wygrywa dla *tego* produktu:**
1. Stack już zablokowany (`tech-stack.md`: Astro + React islands + Tailwind); shadcn jest natywnym companionem.
2. Kalkulator = dużo Select/Input/Table/Dialog — dodajesz tylko potrzebne części CLI (`add select dialog sheet table tabs card field …`), bez 1.3 MB Ant.
3. Dense forms: oficjalne wzorce Field / FieldGroup / horizontal-responsive ([Field docs](https://ui.shadcn.com/docs/components/base/field)); compact blocks w ekosystemie shadcn.
4. Split layout: `Resizable` (react-resizable-panels) — wzorzec „inputs | results” jak w load-chart widgets.
5. Brand: tokeny w `global.css` (już neutral) — łatwo odejść od legacy purple bez zmiany biblioteki.

**Czego *nie* brać jako „design system”:** Industrial UI / Altara-style HMI kits — to shop-floor dashboards, nie browser lifting planner; inny język wizualny i integracja.

**Uzupełnienia (nie zamienniki):**
- Chart: Recharts lub zachować Chart.js w island (legacy już Chart.js).
- Walidacja: Zod (+ RHF opcjonalnie) — docs projektu już wspominają Zod, brak w `package.json`.
- Ikony: lucide (już w `components.json`).

### 4. Inspiration board — produkty i wnioski (bez wireframe)

#### A. [SlingCalc](https://slingcalc.com/) — najbliższy domenowo

- **Pattern:** Control panel (właściwości ładunku / konfiguracja / hook) + live 3D / physics summary.
- **Status language:** STABLE, kolorowe strzałki sił (zielony / yellow / red), stability region.
- **Dokumentacja:** PDF report z snapshotem stanu — osobny artefakt, nie główny ekran edycji.
- **Wniosek dla nas:** Rigging/cargo to *side workflow* zasilający główne inputs; wynik Appliance Ratio + utilization powinien być zawsze widoczny jak „Load Summary”, nie schowany pod chartem.

#### B. [LiftPlanner Pro](https://liftplannerpro.com/)

- **Pattern:** Workflow w krokach (draw → simulate → document), 2D/3D jako centrum.
- **Wniosek:** My nie budujemy CAD — nie kopiować „3D-first”. Brać tylko **jasny pipeline**: zbierz wagi → policz ratio → wyeksportuj raport. Kroki jako sekcje / sticky progress, nie pełny wizard jeśli użytkownik wraca często do tych samych pól.

#### C. Alberta Crane / load-chart widgets ([przykład](https://www.albertacraneservice.com/news/load-chart-feature))

- **Pattern:** inputs (boom, radius, weight) + **side-by-side metrics** + **utilization progress bar** (green &lt;90% / amber 90–100% / red over).
- **Unit toggle** na miejscu.
- **Wniosek:** Utilization jako dominant visual (macie już pill w topbarze — przenieść sens na duży, czytelny indicator w panelu wyników). Status banner + „headroom remaining” to dokładny odpowiednik waszych `used` / `remaining`.

#### D. [Premier Lifting — Lift Plan Generator](https://premierliftingfl.com/crane-lift-plan)

- **Pattern:** klasyczny **split**: lewa kolumna Job & Crane Details, prawa Geometry & Capacity Check; Generate / Print na dole.
- **Wniosek:** To najprostszy layout do skopiowania mentalnie dla Appliance Ratio — lewo: cargo/rigging/contingency/DAF/WLL; prawo: ratio, utilization, chart, alerts, report CTA.

#### E. [Desmos](https://www.desmos.com/) (meta-wzorzec kalkulatora)

- **Pattern:** expressions list | live output; poniżej ~450px stack; toolbar globalnych akcji.
- **Wniosek:** Natychmiastowy feedback przy każdej zmianie inputu (już macie w PRD „immediate perceived response” dla fill) — layout musi trzymać wynik w viewportcie, nie pod długim scrolliem formularza.

#### F. Czego unikać (anti-patterns z legacy + rynku)

- Marketing-hero + kalkulator w kartach glassmorphism (obecny `styles.css`).
- Excel-numbered fields jako primary IA.
- Chatbot (Dialogflow) konkurujący o uwagę z wynikami bezpieczeństwa.
- Wszystko w modalach — na desktopie cargo/rigging zasługują na Sheet / osobną sekcję / route, nie pełnoekranowy overlay za każdym razem.

### 5. Przekład na ten produkt (kierunek IA, nie wireframe)

Z inspiracji wynika spójny kierunek (do rozstrzygnięcia w `/10x-plan` / design pass):

1. **Workspace split:** Inputs (L) | Live results + utilization + chart (R); na mobile stack z wynikiem sticky / na górze po pierwszym compute.
2. **Cargo & Rigging:** Sheet lub collapsible sections w lewym panelu (lista + sum), nie ukryte za jednym przyciskiem „Calc” bez kontekstu listy.
3. **Semantic labels:** „Cargo weight”, „Rigging weight”, „Contingency”, „DAF”, „WLL” — bez „1…6 / Excel C3”.
4. **Utilization as hero metric** w prawym panelu (pasek + kolor + remaining).
5. **Report:** secondary CTA w panelu wyników (Print / Download), nie właściciel layoutu.
6. **Bot:** parked / minimized — nie w first viewport (PRD nie wymaga AI; stack out-of-scope AI).
7. **Visual language:** light, industrial-neutral (tokeny shadcn neutral już w `global.css`); accent tylko na status (safe/warn/crit) i primary actions — nie purple glass.

## Code References

- `index.html:16–138` — shell + main grid surfaces
- `index.html:145–335` — rigging/cargo/help modals
- `styles.css:1–30` — legacy theme tokens
- `app.js:1–22` — DOM id cache
- `app.js:1174–1408` — technical report popup
- `app.js:1595–2157` — cargo module (after `init`)
- `components.json:2–21` — shadcn new-york config
- `src/styles/global.css:5–39` — design tokens ready for product theme
- `src/components/ui/button.tsx` — only shadcn primitive today
- `src/pages/index.astro` — starter, no calculator
- `context/foundation/roadmap.md` — S-06 outcome + unknowns (scope / redesign depth)

## Architecture Insights

1. **Design system decision is mostly already made by bootstrap** — research potwierdza, nie odwraca: extend shadcn, don’t replace.
2. **Migration cost is state/DOM, not CSS framework** — przepisanie `recompute` + catalog state do React jest trzonem S-06; UI kit to tylko powierzchnia.
3. **Vertical slice risk:** pełna powierzchnia (ratio + cargo + rigging + report + bot) vs. najpierw ratio+cargo shell — roadmap unknown; inspiration sugeruje **najpierw split workspace + ratio path**, cargo/rigging jako Sheets w tym samym shellu, bot opcjonalnie później.
4. **Progressive disclosure shadcn:** dodać komponenty w momencie potrzeby (Input, Select, Dialog/Sheet, Table, Tabs, Card, Badge, Progress, Resizable, Alert) — nie „pełny kit day one”.
5. **AGENTS.md:** nowe UI pod `src/`; legacy zostaje do momentu cutover zapisanego w planie.

## Historical Context (from prior changes)

- Wszystkie archived cargo/catalog plans **celowo** trzymały host legacy i odkładały Astro + full redesign do S-06 (`context/archive/2026-07-18-*/plan.md`, `context/changes/b16-5-flange-catalog/plan.md`).
- PRD: redesign **nie** jest Non-Goal; auth/DB/formula rewrite są. Browser-local, open access, preserve report + manual entry (`context/foundation/prd.md`).
- Jedyny prior `research.md` dotykający UX to fittings cascade — nie redesign: `context/archive/2026-07-18-b16-9-fitting-catalog-schedule/research.md`.
- Bootstrap verification: Astro + React + Tailwind + Cloudflare; AI/auth out of scope (`context/changes/bootstrap-verification/verification.md`).

## Related Research

- `context/archive/2026-07-18-b16-9-fitting-catalog-schedule/research.md` — schedule UX (katalog), nie shell
- `context/foundation/roadmap.md` §S-06 — target slice
- `context/foundation/tech-stack.md` — stack lock

## Open Questions

1. **Migrate scope v1:** pełna powierzchnia legacy (w tym bot + report parity) vs. ratio+cargo+rigging bez Dialogflow? (roadmap Q8)
2. **Redesign depth:** nowa IA (split + Sheets + semantic labels) vs. tylko nowy skin przy tej samej strukturze modal/Excel? Research rekomenduje **nową IA**; user confirm w planie. (roadmap Q9)
3. **Chart library:** Chart.js (parity) vs. Recharts (React-native)?
4. **Cutover:** dual-serve legacy + Astro podczas migracji, czy hard switch jednej trasy `/`?
5. **Brand tokens:** zostać przy shadcn neutral light, czy wprowadzić własny accent (nie purple) — decyzja wizualna w planie / implementacji.

## Recommendation for `/10x-plan`

- **Lock design system:** shadcn/ui new-york + Tailwind 4 tokens; expand primitives as needed; no Mantine/Ant.
- **Lock layout direction (from inspiration, not wireframe):** Premier/Alberta-style split (inputs | live utilization + results); SlingCalc-style status language; Desmos-style always-visible output; cargo/rigging as Sheets/sections; report secondary; bot out of first viewport.
- **Plan work packages:** (1) shell + theme + route, (2) ratio compute island, (3) cargo/rigging Sheets + catalogs, (4) chart + alerts, (5) report, (6) cutover / remove legacy entry — adjust if scope unknown resolves to smaller v1.
