---
project: appliance-ratio-calculator
version: 5
status: draft
created: 2026-07-17
updated: 2026-07-22
prd_version: 1
main_goal: speed
top_blocker: time
---

# Roadmap: Appliance Ratio Calculator

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

Istniejący kalkulator dla osób budujących lifting plany ma łączyć w jednym narzędziu Appliance Ratio, cargo weight i rigging weight. Największy ból dziś to wiarygodna waga cargo (głównie orurowanie); ta zmiana dodaje wybór wypełnienia rury wpływający na masę, bez psucia wzoru utilization / Appliance Ratio. Wedge produktu — cecha, bez której narzędzie znika w tłumie arkuszy i PDF-ów ASME — to spójne 3-w-1 (ratio + cargo + rigging), a nie kolejny samotny kalkulator.

## North star

**S-01: Planner może zbudować listę cargo z elementów piping z katalogu** — pierwszy validation milestone (najwcześniejszy dowód, że hipoteza produktu działa w rękach użytkownika) przy `main_goal: speed`: potwierdza, że katalog pokrywa typowy ładunek zanim dokładamy fill i handoff do ratio.

> North star tu znaczy: najmniejszy end-to-end slice, którego dostarczenie dowodzi core hypothesis — założenia, że planner woli katalog + fill w jednym narzędziu niż Excel/PDF/sieć — umieszczony tak wcześnie, jak pozwalają Prerequisites, bo reszta ma sens tylko jeśli to działa.

## At a glance

| ID | Change ID | Outcome (user can …) | Prerequisites | PRD refs | Status |
|---|---|---|---|---|---|
| F-01 | verified-fill-media-v1 | (foundation) mała, zweryfikowana lista mediów wypełnienia z gęstościami gotowa do użycia w kalkulacji | — | FR-002, NFR (immediate fill response) | done |
| S-01 | cargo-catalog-selection | Planner może wybrać elementy piping z katalogu do listy cargo | — | US-01, FR-001 | done |
| S-02 | pipe-fill-cargo-weight | Planner może wybrać wypełnienie rury i zobaczyć wagę cargo uwzględniającą fill | F-01, S-01 | US-01, FR-002, FR-003 | done |
| S-03 | cargo-weight-to-ratio | Planner może przekazać wagę cargo do wejść Appliance Ratio bez regresji wzoru i raportu | S-02 | US-01, FR-004, FR-005 | done |
| S-04 | b16-9-fitting-catalog-schedule | Planner może wybrać butt-weld fitting po typie, NPS i schedule z wagami zgodnymi z ASME B16.9 | S-01 | US-01, FR-001 | done |
| S-05 | b16-5-flange-catalog | Planner może wybrać flange z katalogu zgodnego z ASME B16.5 (w tym wybór schedule tam, gdzie brakuje) | S-01 | US-01, FR-001 | done |
| S-06 | astro-migrate-ux-redesign | Planner może użyć całego kalkulatora (ratio + cargo + rigging) w aplikacji Astro z przeprojektowanym UX | S-03 | US-01, FR-004, FR-005 | done |
| S-07 | full-schedule-flange-fitting | Planner może wybrać flange i fitting po pełnym zestawie 18 podstawowych schedule (Sch 5 / 5S → XXS, jak w pipes) | S-04, S-05 | US-01, FR-001 | done |
| S-08 | calculator-help-flow-metrics | Planner może otworzyć stronę pomocy z opisem flow kalkulatora i definicjami wszystkich wskaźników wejściowych i wyliczanych (bez detali wewnątrz cargo / rigging) | S-06 | US-01, FR-004, FR-005 | done |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme | Chain | Note |
|---|---|---|---|
| A | Katalog cargo | `S-01` → `S-02` → `S-03` → `S-06` → `S-08` | Must-have path pod `speed`; S-08 po shellu Astro — pomoc do flow ratio, nie do katalogów cargo/rigging. |
| B | Dane fill | `F-01` | Joins Stream A at `S-02` — parallel z `S-01` przy blokerze `time`. |
| C | Zgodność katalogu ASME | `S-04` ∥ `S-05` → `S-07` | Catalog fidelity po S-01; `S-07` domyka 18 schedule (flange + fitting = pipe keys); parallel z `S-06` — nie blokuje migracji UX. |

## Baseline

What's already in place in the codebase as of `2026-07-17` (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — per `tech-stack.md` (Astro + React islands + TypeScript + Tailwind); legacy calculator still in `index.html` / `app.js`
- **Backend / API:** partial — SSR scaffold + starter auth API routes; calculator logic remains client-side
- **Data:** partial — static catalogs in `data/` (pipes, rigging JSON); Supabase client scaffold, no SQL migrations
- **Auth:** absent (intentional) — per `tech-stack.md` / PRD Non-Goals: open access, no login
- **Deploy / infra:** present — per `tech-stack.md` (Cloudflare + GitHub Actions)
- **Observability:** partial — platform flag in Wrangler only; no app-level error tracking

## Foundations

### F-01: Verified fill-media list (v1)

- **Outcome:** (foundation) mała, zweryfikowana lista mediów wypełnienia z gęstościami i źródłem jest gotowa do podpięcia pod masę fill.
- **Change ID:** verified-fill-media-v1
- **PRD refs:** FR-002 (Socrates: mała lista zweryfikowanych mediów w v1); Constraints quality — immediate perceived response after fill change
- **Unlocks:** S-02; Unknown „które media i jakie gęstości w v1”
- **Prerequisites:** —
- **Parallel with:** S-01
- **Blockers:** —
- **Unknowns:**
  - Które media (np. woda / powietrze / inne) i skąd pochodzą gęstości w v1? — Owner: user. Block: no (to jest wynik tej foundation).
- **Risk:** Sequenced early and parallel with S-01 so S-02 nie czeka na decyzję o mediach po skończeniu katalogu; bez tej listy fill daje niewiarygodne wagi.
- **Status:** done

## Slices

### S-01: Cargo catalog selection

- **Outcome:** Planner może wybrać elementy piping z katalogu do listy cargo (z zachowaną możliwością ręcznego wpisania wagi).
- **Change ID:** cargo-catalog-selection
- **PRD refs:** US-01, FR-001
- **Prerequisites:** —
- **Parallel with:** F-01
- **Blockers:** —
- **Unknowns:**
  - Jaki jest blast radius zmian w ścieżce cargo/katalog względem reszty aplikacji? — Owner: user. Block: no (odkrywane w `/10x-plan`; nie blokuje startu).
- **Risk:** North star first — kontrargument Socrates przy FR-001 (katalog za wąski) to założenie o najwyższym ryzyku przed fillem; przy `time` nie odkładamy walidacji katalogu za polish UX.
- **Status:** done

### S-02: Pipe fill → cargo weight

- **Outcome:** Planner może wybrać, czym jest wypełniona rura, i zobaczyć wagę cargo = masa stali + masa fill z objętości wewnętrznej.
- **Change ID:** pipe-fill-cargo-weight
- **PRD refs:** US-01, FR-002, FR-003
- **Prerequisites:** F-01, S-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Zależy od listy mediów (F-01) i działającej listy cargo (S-01); bez obu Primary Success Criterion zostaje dziurawe.
- **Status:** done

### S-03: Cargo weight into Appliance Ratio

- **Outcome:** Planner może przekazać wyliczoną wagę cargo do wejść Appliance Ratio; wzór utilization / Appliance Ratio i generowanie raportu technicznego nie regresują; ręczne wpisanie wagi nadal działa.
- **Change ID:** cargo-weight-to-ratio
- **PRD refs:** US-01, FR-004, FR-005
- **Prerequisites:** S-02
- **Parallel with:** S-04, S-05
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Domknięcie Primary Success Criterion; przed S-06, żeby migracja/redesign nie szła na niedokończonym handoffie cargo→ratio.
- **Status:** done

### S-04: ASME B16.9 butt-weld fittings + schedule

- **Outcome:** Planner może wybrać butt-weld fitting (typ, NPS, schedule) do listy cargo z wagą zgodną z ASME B16.9; katalog w `data/piping_catalog.js` (i powiązana logika wag) jest uzgodniony z `data/ASME B16.9.pdf` — nie opiera SSOT na samej bazie Sch 40 + przybliżonych mnożnikach schedule.
- **Change ID:** b16-9-fitting-catalog-schedule
- **PRD refs:** US-01, FR-001 (wiarygodność katalogu piping — Socrates: katalog musi pokrywać typowy ładunek)
- **Prerequisites:** S-01
- **Parallel with:** S-03, S-05
- **Blockers:** —
- **Unknowns:**
  - Które typy BW i zakres NPS×schedule wchodzą do v1 vs później? — Owner: user. Block: no (rozstrzygane w `/10x-plan` / sign-off jak przy wall-thickness).
  - B16.9 to głównie wymiary — skąd dokładnie brać masy (kg/pc) przy braku tablic wag w standardzie? — Owner: user / plan. Block: surfaces in planning; nie blokuje startu research.
- **Risk:** Dziś fittingi mają wybór schedule w UI, ale baza to Sch 40 equiv. + `FITTING_SCH_FACTORS` (B36 wall ratio) — ryzyko niewiarygodnych wag względem B16.9; Stream C naprawia fiducial katalogu bez blokowania S-03.
- **Status:** done

### S-05: ASME B16.5 flanges (+ schedule gap)

- **Outcome:** Planner może wybrać flange do listy cargo z wagą / pokryciem zgodnym z ASME B16.5 (`data/ASME B16.5.pdf`); uzupełniony jest brakujący wybór po schedule tam, gdzie aplikacja / matching do rury tego wymaga (dziś flansze: typ + class, bez schedule).
- **Change ID:** b16-5-flange-catalog
- **PRD refs:** US-01, FR-001
- **Prerequisites:** S-01
- **Parallel with:** S-03, S-04, S-06
- **Blockers:** —
- **Unknowns:**
  - Dla których typów flanszy schedule jest wymagany w UI (np. Weld Neck bore vs class-only RF/SO)? — Owner: user. Block: no (decyzja w `/10x-plan`).
  - Zakres class / NPS w v1 vs pełne B16.5? — Owner: user. Block: no.
- **Risk:** Obecna baza deklaruje B16.5, ale bez weryfikacji względem PDF i bez schedule — niespójność z pipe/fitting path; niezależne od S-04 (inny standard), więc parallel OK.
- **Status:** done

### S-06: Astro migration + UX redesign

- **Outcome:** Planner może użyć całego kalkulatora (Appliance Ratio + cargo weight + rigging) w aplikacji Astro — zamiast legacy `index.html` / `app.js` — z przeprojektowanym layoutem i UX XXI wieku; wzór utilization / Appliance Ratio, fill→cargo, handoff do ratio oraz raport techniczny nie regresują; ręczne wpisanie wagi nadal działa.
- **Change ID:** astro-migrate-ux-redesign
- **PRD refs:** US-01, FR-004, FR-005; PRD §Current System Overview (system design / layout → UX XXI wieku); §Change category (architectural/UX improvement)
- **Prerequisites:** S-03
- **Parallel with:** S-07
- **Blockers:** —
- **Unknowns:**
  - Czy migracja przenosi 1:1 całą powierzchnię legacy (wszystkie zakładki / raport / rigging), czy v1 Astro pokrywa tylko ścieżkę ratio+cargo a reszta później? — Owner: user. Block: no (rozstrzygane w `/10x-plan`).
  - Jak daleko idzie redesign w tym slice (nowa hierarchia informacji / nawigacja vs. głównie nowy shell wizualny przy tej samej strukturze flow)? — Owner: user. Block: no.
- **Risk:** Po S-03, żeby nie utrzymywać podwójnie niedokończonego handoffu cargo→ratio w legacy i w Astro; parallel z S-07 OK (pełny schedule to dane katalogu, nie shell). Duży blast radius — jedna `/10x-plan` może rozbić na pod-change'e (shell vs. cargo island vs. raport).
- **Status:** done

### S-07: Full 18-schedule coverage (flange + fitting)

- **Outcome:** Planner może wybrać Weld Neck flange oraz butt-weld fitting po pełnym zestawie 18 podstawowych schedule zgodnym z kluczami pipes — od Sch 5 / Sch 5S przez Sch 10/10S, 20, 30, 40/40S, 60, 80/80S, 100, 120, 140, 160, STD, XS aż do XXS — z wagami w katalogu (nie tylko wąski podzbiór Sch 40/80/STD jak dziś).
- **Change ID:** full-schedule-flange-fitting
- **PRD refs:** US-01, FR-001 (wiarygodność katalogu piping — typowy ładunek wymaga matching schedule rura↔fitting↔flange)
- **Prerequisites:** S-04, S-05
- **Parallel with:** S-06
- **Blockers:** —
- **Unknowns:**
  - (settled in plan) Fittings: chart-only omit. WN: keep chart STD/40/40S; calculate missing schedules via bore Δm (ρ=7850, L=`wn thk`); Skip when pipe `t` or `wn thk` missing. SO/Blind stay class-only. Class 400 out of scope.
- **Risk:** Po S-04/S-05 (kształt katalogu już ustalony); parallel z S-06; WN calc is approximate cylinder model — Sign-off owns liability; fittings thin schedules may still Skip.
- **Status:** done

### S-08: Help page — flow + metric definitions

- **Outcome:** Planner może otworzyć stronę pomocy w aplikacji, która wyjaśnia cały flow kalkulatora (cargo weight → rigging weight → czynniki → Appliance Ratio / utilization → alerty / wykres / raport) oraz podaje definicje wszystkich wskaźników wprowadzanych i wyliczanych na ścieżce ratio; **bez** rozbijania wnętrza cargo weight i rigging weight (katalog piping, fill, arkusze pozycji — poza zakresem; te wagi traktowane jako wejścia / sumy).
- **Change ID:** calculator-help-flow-metrics
- **PRD refs:** US-01, FR-004, FR-005; PRD §Current System Overview (ścieżka 3-w-1: ratio wymaga cargo + rigging); §Change category (architectural/UX)
- **Prerequisites:** S-06
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Czy pomoc to osobna trasa (`/help`) z linkiem z shellu, czy modal / panel w kalkulatorze? — Owner: user. Block: no (rozstrzygane w `/10x-plan`).
  - Język treści v1 (EN jak UI kalkulatora vs PL)? — Owner: user. Block: no.
- **Risk:** Po S-06, żeby treść i nawigacja siedziały w aktualnym shellu Astro; zakres świadomie wąski (flow + definicje metryk ratio) — unika dryfu w dokumentację katalogów ASME / rigging sheets.
- **Status:** done

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
|---|---|---|---|---|
| F-01 | verified-fill-media-v1 | Verified v1 fill-media densities for cargo weight | yes | Done — archived |
| S-01 | cargo-catalog-selection | Planner selects piping from catalog into cargo list | yes | Done — archived |
| S-02 | pipe-fill-cargo-weight | Pipe fill choice updates cargo weight | yes | Done — archived |
| S-03 | cargo-weight-to-ratio | Feed cargo weight into Appliance Ratio without regression | yes | Done — archived; unlocks S-06 |
| S-04 | b16-9-fitting-catalog-schedule | Align BW fittings + schedule weights to ASME B16.9 | yes | Done — archived |
| S-05 | b16-5-flange-catalog | Align flanges to ASME B16.5; add schedule where missing | yes | Done — archived |
| S-06 | astro-migrate-ux-redesign | Migrate calculator to Astro + redesign UX | yes | Done — archived |
| S-07 | full-schedule-flange-fitting | Cover all 18 pipe schedules on flanges + fittings (Sch 5→XXS) | yes | Done — archived |
| S-08 | calculator-help-flow-metrics | Help page: calculator flow + definitions of all ratio inputs/outputs | yes | Prerequisites met (S-06 done); omit cargo/rigging internals |

## Open Roadmap Questions

1. **What is the project name?** — Owner: user. Block: no (draft OK; frontmatter uses `appliance-ratio-calculator` from tech-stack until locked).
2. **Secondary success criterion** — nie wskazano during shaping. Owner: user. Block: no.
3. **Blast radius tej zmiany** — użytkownik: not sure. Owner: TBD. Block: surfaces in S-01 planning; not roadmap-wide halt.
4. **Operational constraints** (deploy/CI) — nie podano; assumed none. Owner: user. Block: no.
5. **Quality cross-check (warned):** User accepted finish with the above gaps during `/10x-shape`. Owner: user. Block: no.
6. **Fitting/flange weight source policy** — B16.9/B16.5 primarily define dimensions; confirm accepted mass source when tables lack kg/pc (manufacturer charts vs calculated from geometry). Owner: user. Block: no (S-04 / S-05 planning).
7. **Flange schedule UX scope** — which flange types need schedule selector in v1? Owner: user. Block: no (S-05).
8. **Astro migrate scope** — pełna powierzchnia legacy vs. ścieżka ratio+cargo w v1 Astro? Owner: user. Block: no (S-06).
9. **Redesign depth** — nowa IA/nawigacja vs. nowy shell przy tym samym flow? Owner: user. Block: no (S-06).
10. **Missing mass policy for rare schedules** — empty cell vs hide option vs interpolate when manufacturer chart lacks NPS×schedule? Owner: user. Block: no (S-07).

## Parked

- **Auth / login** — Why parked: PRD §Non-Goals; open access preserved.
- **Full catalog of all fill media** — Why parked: PRD §Non-Goals; v1 = small verified list only (F-01).
- **Rewriting the Appliance Ratio formula** — Why parked: PRD §Non-Goals; guardrail is no regression.
- **Database / backend migration** — Why parked: PRD §Non-Goals; browser-local calculator remains.

## Done

- **F-01: (foundation) mała, zweryfikowana lista mediów wypełnienia z gęstościami i źródłem jest gotowa do podpięcia pod masę fill.** — Archived 2026-07-18 → `context/archive/2026-07-17-verified-fill-media-v1/`. Lesson: —.
- **S-01: Planner może wybrać elementy piping z katalogu do listy cargo (z zachowaną możliwością ręcznego wpisania wagi).** — Archived 2026-07-18 → `context/archive/2026-07-18-cargo-catalog-selection/`. Lesson: —.
- **S-02: Planner może wybrać, czym jest wypełniona rura, i zobaczyć wagę cargo = masa stali + masa fill z objętości wewnętrznej.** — Archived 2026-07-18 → `context/archive/2026-07-18-pipe-fill-cargo-weight/`. Lesson: —.
- **S-03: Planner może przekazać wyliczoną wagę cargo do wejść Appliance Ratio; wzór utilization / Appliance Ratio i generowanie raportu technicznego nie regresują; ręczne wpisanie wagi nadal działa.** — Archived 2026-07-18 → `context/archive/2026-07-18-cargo-weight-to-ratio/`. Lesson: —.
- **S-04: Planner może wybrać butt-weld fitting (typ, NPS, schedule) do listy cargo z wagą zgodną z ASME B16.9; katalog w `data/piping_catalog.js` (i powiązana logika wag) jest uzgodniony z `data/ASME B16.9.pdf` — nie opiera SSOT na samej bazie Sch 40 + przybliżonych mnożnikach schedule.** — Archived 2026-07-18 → `context/archive/2026-07-18-b16-9-fitting-catalog-schedule/`. Lesson: —.
- **S-05: Planner może wybrać flange do listy cargo z wagą / pokryciem zgodnym z ASME B16.5 (`data/ASME B16.5.pdf`); uzupełniony jest brakujący wybór po schedule tam, gdzie aplikacja / matching do rury tego wymaga (dziś flansze: typ + class, bez schedule).** — Archived 2026-07-18 → `context/archive/2026-07-18-b16-5-flange-catalog/`. Lesson: —.
- **S-06: Planner może użyć całego kalkulatora (Appliance Ratio + cargo weight + rigging) w aplikacji Astro — zamiast legacy `index.html` / `app.js` — z przeprojektowanym layoutem i UX XXI wieku; wzór utilization / Appliance Ratio, fill→cargo, handoff do ratio oraz raport techniczny nie regresują; ręczne wpisanie wagi nadal działa.** — Archived 2026-07-19 → `context/archive/2026-07-18-astro-migrate-ux-redesign/`. Lesson: —.
- **S-07: Planner może wybrać Weld Neck flange oraz butt-weld fitting po pełnym zestawie 18 podstawowych schedule zgodnym z kluczami pipes — od Sch 5 / Sch 5S przez Sch 10/10S, 20, 30, 40/40S, 60, 80/80S, 100, 120, 140, 160, STD, XS aż do XXS — z wagami w katalogu (nie tylko wąski podzbiór Sch 40/80/STD jak dziś).** — Archived 2026-07-20 → `context/archive/2026-07-19-full-schedule-flange-fitting/`. Lesson: —.
- **S-08: Planner może otworzyć stronę pomocy w aplikacji, która wyjaśnia cały flow kalkulatora (cargo weight → rigging weight → czynniki → Appliance Ratio / utilization → alerty / wykres / raport) oraz podaje definicje wszystkich wskaźników wprowadzanych i wyliczanych na ścieżce ratio; bez rozbijania wnętrza cargo weight i rigging weight (katalog piping, fill, arkusze pozycji — poza zakresem; te wagi traktowane jako wejścia / sumy).** — Archived 2026-07-22 → `context/archive/2026-07-21-calculator-help-flow-metrics/`. Lesson: —.
