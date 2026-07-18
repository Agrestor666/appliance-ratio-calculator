---
project: "# TODO: project — see Open Questions"
version: 1
status: draft
created: 2026-07-17
context_type: brownfield
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  delivery_weeks: 3
  hard_deadline: null
  after_hours_only: false
---

## Current System Overview

Istniejąca aplikacja (pliki w katalogu projektu) wspierająca osoby tworzące **lifting plany** i **work procedury**.

Główna ścieżka: wyliczenie **Appliance Ratio**, które wymaga znanej **cargo weight** i **rigging weight**.

- **Cargo weight** — suma wag poszczególnych elementów ładunku, głównie komponentów orurowania. Źródła wag: specyfikacje ASME B16.5 i ASME B16.9 (PDF w `data/`).
- **Rigging weight** — dziś często wyszukiwane „w sieci”; w aplikacji ma być częścią całości.
- Wartość produktu: kalkulator **3-w-1**: Appliance Ratio + Cargo weight + Rigging weight — czego inne narzędzia nie łączą.

Stan: większość działa bez zarzutu, ale zostaje dużo pracy merytorycznej i programistycznej; system design i layout ocenione jako tragiczne — cel: wygląd i UX aplikacji z XXI wieku.

User base: osoby tworzące lifting plany i work procedury — ta sama rola w wielu firmach / na wielu projektach; skala medium (dozens–hundred). Access: bez logowania, brak ról.

# TODO: detailed tech stack enumeration beyond “files in project directory” — see Open Questions (optional; not blocking for this delta).

## Problem Statement & Motivation

**Delta:** Rozwinąć i uporządkować istniejącą aplikację tak, by wyliczanie wagi cargo (największy ból dziś) oraz spójne 3-w-1 (ratio + cargo + rigging) było intuicyjne i kompletne — przy zachowaniu poprawności wzoru utilization / Appliance Ratio.

**Insight:** Status quo (Excel / PDF ASME / szukanie rigging w sieci) nie daje jednego narzędzia 3-w-1; ta aplikacja ma to łączyć.

**Change category:** significant feature (cargo/merytoryka) + architectural/UX improvement (layout, system design).

**MVP slice for this change:** obliczanie cargo — możliwość wyboru, czym jest wypełniona rura, co ma wpływ na wagę.

## User & Persona

**Primary:** Osoby tworzące lifting plany i work procedury — ta sama rola w wielu firmach / na wielu projektach (nie jedna konkretna organizacja).

Moment użycia: gdy trzeba policzyć Appliance Ratio i do tego potrzebna jest wiarygodna waga cargo (i rigging).

This change affects those existing users: cargo weight can include pipe fill; manual entry remains available. User base is not expanding as part of this change.

## Success Criteria

### Primary
- Użytkownik może w kalkulatorze cargo wybrać, czym jest wypełniona rura; wybór wpływa na wyliczoną wagę cargo, a wynik da się użyć przy Appliance Ratio.

### Secondary
- # TODO: nie wskazano — see Open Questions

### Guardrails
- Poprawność wzoru utilization / Appliance Ratio nie regresuje.
- Generowanie raportu technicznego nadal działa.

## User Stories

### US-01: Cargo weight with pipe fill

- **Given** planner buduje listę cargo z elementami orurowania
- **When** wybiera wypełnienie rury i zatwierdza listę
- **Then** widzi wagę cargo uwzględniającą wypełnienie i może przekazać ją do wyliczenia Appliance Ratio

**Before:** cargo weight did not account for pipe fill choice (or relied on workarounds outside the app). **After:** fill choice is part of the cargo calculation path and can feed Appliance Ratio.

## Scope of Change

- [modified] Planner can select piping elements for a cargo list. Priority: must-have. (FR-001)
  > Socrates: Counter-argument considered: "katalog za wąski → frustracja większa niż ręczne wpisanie wagi." Resolution: kept; v1 tylko jeśli katalog pokrywa typowy ładunek — inaczej ręczne wpisanie wagi zostaje.
- [new] Planner can choose what a pipe is filled with. Priority: must-have. (FR-002)
  > Socrates: Counter-argument considered: "brak wiarygodnych gęstości/źródeł → złe wagi." Resolution: kept; mała lista zweryfikowanych mediów w v1.
- [new] Planner can see cargo weight that includes fill effect. Priority: must-have. (FR-003)
  > Socrates: Counter-argument considered: "wystarczy sama liczba końcowa bez breakdownu." Resolution: kept; MVP pokazuje końcową wagę z fillem, breakdown nie jest wymagany.
- [modified] Planner can send that cargo weight into the Appliance Ratio inputs. Priority: must-have. (FR-004)
  > Socrates: No counter-argument; it stands as written.
- [preserved] Planner can still compute Appliance Ratio with the existing formula. Priority: must-have. (FR-005)
  > Socrates: No counter-argument; it stands as written.
- [preserved] Manual entry of data (including cargo weight) remains available.
- [preserved] Technical report generation still works.

## Constraints & Compatibility

- No integrations/data contracts that must be preserved beyond the product itself (user: nothing must stay as a hard external contract).
- Data migration: rather not / not expected.
- Backward compatibility: manual entry of data (including cargo weight) must remain available.
- Preserved behavior: Appliance Ratio formula correctness; technical report generation still works.
- Existing-system operational constraints (deploy windows, CI, API consumers): not stated by user — treat as none unless clarified.

Quality properties captured for this change (from shaping; no separate NFR section in brownfield PRD schema):

- App works locally in the browser without a server.
- After changing pipe fill, cargo weight updates with an immediate perceived response.
- No regression of Appliance Ratio calculation or technical report generation.

## Business Logic Changes

The system currently computes utilization as a function of cargo, rigging, contingency, DAF, and WLL.

This change adds: cargo weight = steel mass + fill mass derived from internal volume.

## Access Control Changes

No access control changes — current model preserved.

Obecnie: bez logowania, brak ról.

## Non-Goals

- Avoid: auth / login in this change — stay open access.
- Avoid: full catalog of all fill media — only a small verified list in v1.
- Avoid: changing or rewriting the Appliance Ratio formula.
- Avoid: database / backend migration.
- Note: full UI redesign of the whole app was NOT selected as a non-goal (seed still wants modern UX; not required in this cargo-fill slice).

## Open Questions

1. **What is the project name?** — Frontmatter `project` was null in shape-notes. Owner: user. Block: no (draft OK); resolve before lock.
2. **Secondary success criterion** — nie wskazano during shaping. Owner: user. Consequence: Secondary remains TODO until filled.
3. **Blast radius** tej zmiany — użytkownik: not sure. Owner: TBD. Resolve before implementation plan. Consequence: implementation risk unclear until planning.
4. **Operational constraints** (deploy/CI) — nie podano; assumed none. Owner: user. May need revisit if deploy/CI appears later.
5. **Quality cross-check (warned):** User accepted finish with the above gaps during `/10x-shape`.
