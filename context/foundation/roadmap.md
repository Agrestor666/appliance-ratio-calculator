---
project: appliance-ratio-calculator
version: 1
status: draft
created: 2026-07-17
updated: 2026-07-18
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
| S-01 | cargo-catalog-selection | Planner może wybrać elementy piping z katalogu do listy cargo | — | US-01, FR-001 | ready |
| S-02 | pipe-fill-cargo-weight | Planner może wybrać wypełnienie rury i zobaczyć wagę cargo uwzględniającą fill | F-01, S-01 | US-01, FR-002, FR-003 | proposed |
| S-03 | cargo-weight-to-ratio | Planner może przekazać wagę cargo do wejść Appliance Ratio bez regresji wzoru i raportu | S-02 | US-01, FR-004, FR-005 | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme | Chain | Note |
|---|---|---|---|
| A | Katalog cargo | `S-01` → `S-02` → `S-03` | Must-have path — kolejność tylko tego, bez czego Primary Success nie zachodzi — pod `speed`; north star na czele. |
| B | Dane fill | `F-01` | Joins Stream A at `S-02` — parallel z `S-01` przy blokerze `time`. |

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
- **Status:** ready

### S-02: Pipe fill → cargo weight

- **Outcome:** Planner może wybrać, czym jest wypełniona rura, i zobaczyć wagę cargo = masa stali + masa fill z objętości wewnętrznej.
- **Change ID:** pipe-fill-cargo-weight
- **PRD refs:** US-01, FR-002, FR-003
- **Prerequisites:** F-01, S-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Zależy od listy mediów (F-01) i działającej listy cargo (S-01); bez obu Primary Success Criterion zostaje dziurawe.
- **Status:** proposed

### S-03: Cargo weight into Appliance Ratio

- **Outcome:** Planner może przekazać wyliczoną wagę cargo do wejść Appliance Ratio; wzór utilization / Appliance Ratio i generowanie raportu technicznego nie regresują; ręczne wpisanie wagi nadal działa.
- **Change ID:** cargo-weight-to-ratio
- **PRD refs:** US-01, FR-004, FR-005
- **Prerequisites:** S-02
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Domknięcie Primary Success Criterion; na końcu must-have path, żeby nie mieszać handoffu z nierozwiązanym fillem.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
|---|---|---|---|---|
| F-01 | verified-fill-media-v1 | Verified v1 fill-media densities for cargo weight | yes | Parallel with S-01 |
| S-01 | cargo-catalog-selection | Planner selects piping from catalog into cargo list | yes | North star — plan first |
| S-02 | pipe-fill-cargo-weight | Pipe fill choice updates cargo weight | no | Needs F-01 + S-01 |
| S-03 | cargo-weight-to-ratio | Feed cargo weight into Appliance Ratio without regression | no | Needs S-02 |

## Open Roadmap Questions

1. **What is the project name?** — Owner: user. Block: no (draft OK; frontmatter uses `appliance-ratio-calculator` from tech-stack until locked).
2. **Secondary success criterion** — nie wskazano during shaping. Owner: user. Block: no.
3. **Blast radius tej zmiany** — użytkownik: not sure. Owner: TBD. Block: surfaces in S-01 planning; not roadmap-wide halt.
4. **Operational constraints** (deploy/CI) — nie podano; assumed none. Owner: user. Block: no.
5. **Quality cross-check (warned):** User accepted finish with the above gaps during `/10x-shape`. Owner: user. Block: no.

## Parked

- **Auth / login** — Why parked: PRD §Non-Goals; open access preserved.
- **Full catalog of all fill media** — Why parked: PRD §Non-Goals; v1 = small verified list only (F-01).
- **Rewriting the Appliance Ratio formula** — Why parked: PRD §Non-Goals; guardrail is no regression.
- **Database / backend migration** — Why parked: PRD §Non-Goals; browser-local calculator remains.
- **Full UI redesign of the whole app** — Why parked: not required for this cargo-fill path; `main_goal: speed` + blocker `time` keep polish off the must-have path.

## Done

- **F-01: (foundation) mała, zweryfikowana lista mediów wypełnienia z gęstościami i źródłem jest gotowa do podpięcia pod masę fill.** — Archived 2026-07-18 → `context/archive/2026-07-17-verified-fill-media-v1/`. Lesson: —.
