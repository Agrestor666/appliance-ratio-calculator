---
project: null
context_type: brownfield
created: 2026-07-17
updated: 2026-07-17
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  delivery_weeks: 3
  hard_deadline: null
  after_hours_only: false
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: context_type
      decision: brownfield — confirmed by user
    - topic: change category
      decision: significant feature + architectural/UX improvement (redesign + merytoryka)
    - topic: primary persona scope
      decision: same role across many orgs/projects (lifting plans / work procedures)
    - topic: must preserve
      decision: correctness of utilization / Appliance Ratio formula
    - topic: access control
      decision: no login; no auth changes planned — current model preserved
    - topic: mvp slice
      decision: cargo weight with pipe fill choice affecting weight; ~1–3 weeks
    - topic: FR-001 Socrates
      decision: kept — v1 only if catalog covers typical load; else manual weight entry remains
    - topic: FR-002 Socrates
      decision: kept — small verified media list in v1
    - topic: FR-003 Socrates
      decision: kept — final weight with fill; breakdown not required for MVP
    - topic: product_type
      decision: web-app — no change
    - topic: target_scale
      decision: medium (dozens–hundred); user base not expanding in this change
    - topic: non-goals
      decision: no auth; no full fill-media catalog; no ratio formula rewrite; no DB/backend migration
  frs_drafted: 5
  quality_check_status: warned
---

# Seed idea (verbatim)

mam aplikacje , wszystkie pliki w katalogu chce ja poprawic i rozwinac . wiekszosc dziala bez zarzutu ale jescze jest duzo pracy merytorycznej i szczegolnie programistycznej. chce aby wygladala jak aplikacja z 21 wieku. system design jest tragiczny jak rowniez layout

## Current System

Istniejąca aplikacja (pliki w katalogu projektu) wspierająca osoby tworzące **lifting plany** i **work procedury**.

Główna ścieżka: wyliczenie **Appliance Ratio**, które wymaga znanej **cargo weight** i **rigging weight**.

- **Cargo weight** — suma wag poszczególnych elementów ładunku, głównie komponentów orurowania. Źródła wag: specyfikacje ASME B16.5 i ASME B16.9 (PDF w `data/`).
- **Rigging weight** — dziś często wyszukiwane „w sieci”; w aplikacji ma być częścią całości.
- Użytkownik potwierdza, że wartość produktu to kalkulator **3-w-1**: Appliance Ratio + Cargo weight + Rigging weight — czego inne narzędzia nie łączą.

Stan: większość działa bez zarzutu, ale zostaje dużo pracy merytorycznej i programistycznej; system design i layout ocenione jako tragiczne — cel: wygląd i UX aplikacji z XXI wieku.

## Vision & Problem Statement

**Delta:** Rozwinąć i uporządkować istniejącą aplikację tak, by wyliczanie wagi cargo (największy ból dziś) oraz spójne 3-w-1 (ratio + cargo + rigging) było intuicyjne i kompletne — przy zachowaniu poprawności wzoru utilization / Appliance Ratio.

**Insight:** Status quo (Excel / PDF ASME / szukanie rigging w sieci) nie daje jednego narzędzia 3-w-1; ta aplikacja ma to łączyć.

**Change category:** significant feature (cargo/merytoryka) + architectural/UX improvement (layout, system design).

## User & Persona

**Primary:** Osoby tworzące lifting plany i work procedury — ta sama rola w wielu firmach / na wielu projektach (nie jedna konkretna organizacja).

Moment użycia: gdy trzeba policzyć Appliance Ratio i do tego potrzebna jest wiarygodna waga cargo (i rigging).

## Access Control

Obecnie: bez logowania, brak ról.

No changes planned — current model preserved.

## Success Criteria

### Primary
- Użytkownik może w kalkulatorze cargo wybrać, czym jest wypełniona rura; wybór wpływa na wyliczoną wagę cargo, a wynik da się użyć przy Appliance Ratio.

### Secondary
- # TODO: nie wskazano — see Open Questions

### Guardrails
- Poprawność wzoru utilization / Appliance Ratio nie regresuje.
- Generowanie raportu technicznego nadal działa.

## Functional Requirements

- FR-001: Planner can select piping elements for a cargo list. Priority: must-have. Change: modified
  > Socrates: Counter-argument considered: "katalog za wąski → frustracja większa niż ręczne wpisanie wagi." Resolution: kept; v1 tylko jeśli katalog pokrywa typowy ładunek — inaczej ręczne wpisanie wagi zostaje.
- FR-002: Planner can choose what a pipe is filled with. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "brak wiarygodnych gęstości/źródeł → złe wagi." Resolution: kept; mała lista zweryfikowanych mediów w v1.
- FR-003: Planner can see cargo weight that includes fill effect. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "wystarczy sama liczba końcowa bez breakdownu." Resolution: kept; MVP pokazuje końcową wagę z fillem, breakdown nie jest wymagany.
- FR-004: Planner can send that cargo weight into the Appliance Ratio inputs. Priority: must-have. Change: modified
  > Socrates: No counter-argument; it stands as written.
- FR-005: Planner can still compute Appliance Ratio with the existing formula. Priority: must-have. Change: preserved
  > Socrates: No counter-argument; it stands as written.

## User Stories

### US-01: Cargo weight with pipe fill

- **Given** planner buduje listę cargo z elementami orurowania
- **When** wybiera wypełnienie rury i zatwierdza listę
- **Then** widzi wagę cargo uwzględniającą wypełnienie i może przekazać ją do wyliczenia Appliance Ratio

## Business Logic

The system currently computes utilization as a function of cargo, rigging, contingency, DAF, and WLL.

This change adds: cargo weight = steel mass + fill mass derived from internal volume.

## Constraints & Preserved Behavior

- No integrations/data contracts that must be preserved beyond the product itself (user: nothing must stay as a hard external contract).
- Data migration: rather not / not expected.
- Backward compatibility: manual entry of data (including cargo weight) must remain available.
- Preserved behavior (from earlier): Appliance Ratio formula correctness; technical report generation still works.
- Existing-system operational constraints (deploy windows, CI, API consumers): not stated by user — treat as none unless clarified.

## Non-Functional Requirements

- App works locally in the browser without a server.
- After changing pipe fill, cargo weight updates with an immediate perceived response.
- No regression of Appliance Ratio calculation or technical report generation.

## Non-Goals

- Avoid: auth / login in this change — stay open access.
- Avoid: full catalog of all fill media — only a small verified list in v1.
- Avoid: changing or rewriting the Appliance Ratio formula.
- Avoid: database / backend migration.
- Note: full UI redesign of the whole app was NOT selected as a non-goal (seed still wants modern UX; not required in this cargo-fill slice).

## Open Questions

1. **Blast radius** tej zmiany — użytkownik: not sure. Owner: TBD. Resolve before implementation plan.
2. **Secondary success criterion** — nie wskazano. Owner: user. Resolve before /10x-prd if possible.
3. **Project name** — frontmatter `project` still null. Owner: user.
4. **Operational constraints** (deploy/CI) — nie podano; assumed none. Owner: user.

## Quality cross-check

User accepted finish with gaps (`quality_check_status: warned`). Gaps for `/10x-prd` Open Questions:

- **Secondary success criterion:** not captured — PRD Secondary will be weak/TODO.
- **Blast radius:** not sure — implementation risk unclear until planning.
- **Project name:** null — `/10x-prd` needs a name before lock.
- **Operational constraints:** assumed none — may need revisit if deploy/CI appears later.
