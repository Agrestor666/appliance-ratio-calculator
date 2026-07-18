---
date: 2026-07-18T18:37:46+01:00
researcher: Cursor Agent
git_commit: c263f1a6146be2891435fa382fa0784e2f318749
branch: master
repository: Appliance Ratio Calculator
topic: "Zgodność katalogu BW fittings z ASME B16.9 (PDF vs piping_catalog + FITTING_SCH_FACTORS)"
tags: [research, codebase, asme-b16-9, butt-weld-fittings, piping_catalog, FITTING_SCH_FACTORS]
status: complete
last_updated: 2026-07-18
last_updated_by: Cursor Agent
---

# Research: Zgodność katalogu BW fittings z ASME B16.9

**Date**: 2026-07-18T18:37:46+01:00  
**Researcher**: Cursor Agent  
**Git Commit**: c263f1a6146be2891435fa382fa0784e2f318749  
**Branch**: master  
**Repository**: Appliance Ratio Calculator

## Research Question

Zbadaj jak obecny katalog BW fittings jest zgodny ze specyfikacją ASME — porównanie z `data/ASME B16.9.pdf` względem tego, co aplikacja ma dla butt-weld fittings.

## Summary

Katalog **deklaruje** ASME B16.9, ale **nie jest SSOT wymiarowym B16.9**, tylko bazą **wag Sch 40 equiv. (kg/pc)** skalowaną mnożnikami ścianki z **ASME B36.10M / B36.19M**. Sam standard B16.9-2024 **nie zawiera tabel mas** — więc „wagi zgodne z B16.9” nie da się zweryfikować względem PDF; B16.9 pokrywa wymiary, tolerancje, oznaczenia i ratingi. Największe luki względem B16.9 to: brak typów (returns, reducing tees/elbows, crosses, stub ends, 3D), NPS do 36 zamiast 48, schedule niezależny od listy NPS (te same wiersze Sch 40 × factor), oraz reducery zawsze na `_default` factor (compound NPS nigdy nie trafia w per-NPS klucze).

## Detailed Findings

### ASME B16.9 PDF (źródło referencyjne)

- Plik: `data/ASME B16.9.pdf` (~751 KB, 48 stron, tekst wyciągalny przez `pypdf`).
- Edycja: **ASME B16.9-2024** (rewizja 2018), Factory-Made Wrought Buttwelding Fittings; issuance Oct 2024.
- Scope (§1.1): *overall dimensions, tolerances, ratings, testing, and markings* dla NPS ½–48 — **bez mas**.
- Pełny extract: `weight` = 0, `mass` = 0 trafień; „kg” tylko incydentalnie.
- Typy w tabelach 6.1-1 … 6.1-11 m.in.: LR 90°/45°, reducing LR elbows, LR/SR 180° returns, SR elbows (głównie 90°), 3D elbows, straight/reducing tees & crosses, lap-joint stub ends, caps, concentric/eccentric reducers.
- Laterals: **poza** B16.9 (§1.3 — pipe fabrication).
- Schedule/wall: oznaczanie wg **ASME B36.10 / B36.19** (schedule / STD / XS / XXS / nominal wall); B16.9 nie reprintuje tabel ścianek ani wag.

### Model danych aplikacji — `data/piping_catalog.js`

- Nagłówek: `Fittings : ASME B16.9 butt-weld (Sch 40 equivalent)` ([`piping_catalog.js:4`](data/piping_catalog.js)).
- Sekcja fittings ([`piping_catalog.js:178–249`](data/piping_catalog.js)): tylko `{ nps, wt }` (kg/pc). **Brak** wymiarów B16.9 (A, B, H, E, OD at bevel, itd.).
- 7 typów: `90° LR Elbow`, `90° SR Elbow`, `45° LR Elbow`, `Equal Tee`, `Concentric Reducer`, `Eccentric Reducer`, `Cap`.
- Pokrycie NPS (przybliżone): LR elbows / tee / 45° LR → ½–36; SR elbow → ½–24; Cap → ½–36 z lukami (brak 22, 26, 28, 32, 34); reducery → compound `large×small` od `3/4x1/2` do `36x30` (31 wierszy).

### Runtime schedule / waga — `app.js`

- `FITTING_SCH_FACTORS` ([`app.js:1599–1703`](app.js)): mnożniki vs Sch 40; komentarz:  
  `factor = (t·(OD−t)) / (t40·(OD−t40))` per **B36.10M / B36.19M** — nie z B16.9.
- 19 kluczy schedule (jak rury: Sch 5S…XXS, STD, XS).
- `getNpsList` dla fitting **ignoruje** `classId` — ta sama lista Sch 40; schedule tylko mnoży wagę ([`app.js:1804`](app.js)).
- `calcUnitKg`: `item.wt * factor` ([`app.js:1821–1824`](app.js)).
- Reducery (`"8x6"` itd.): brak kluczy compound w tablicy czynników → zawsze `_default` (np. Sch 80 → 1.40), bez wyboru large-end NPS.

### Zgodność typów (katalog vs B16.9)

| B16.9 (tabele) | W katalogu? |
|---|---|
| 90° / 45° LR elbows (6.1-1) | Tak (wagi, nie wymiary) |
| 90° SR elbows (6.1-4) | Tak (wagi); katalog zaczyna od NPS ½ — w B16.9 SR typowo od NPS 1 |
| Equal (straight) tee (6.1-7) | Tak |
| Conc. / ecc. reducers (6.1-11) | Tak (ograniczona lista par) |
| Caps (6.1-10) | Tak (niepełne NPS vs ½–48) |
| LR reducing elbows (6.1-2) | Nie |
| 180° returns LR/SR (6.1-3, 6.1-5) | Nie |
| 3D elbows (6.1-6) | Nie |
| Reducing tees / crosses (6.1-7/8) | Nie |
| Lap-joint stub ends (6.1-9) | Nie |
| Laterals | N/A (poza B16.9) |

### Zgodność wag i schedule (rdzeń ryzyka S-04)

| Aspekt | Stan |
|---|---|
| Źródło wag Sch 40 | Nieznane względem PDF — B16.9 ich nie podaje; prawdopodobnie manufacturer / industry charts |
| Schedule ≠ osobne wiersze B16.9 | Aplikacja nie ma per-schedule dimension/weight tables; tylko B36 wall-area ratio |
| „Zgodność z B16.9” dla kg/pc | **Niemożliwa do udowodnienia z samego PDF** — potrzebna polityka źródła mas (roadmap Open Q #6) |
| Dimensional compliance | **Nie sprawdzana** — katalog nie przechowuje wymiarów z Tables 6.1-* |

### UI

- Kategoria: **Butt-Weld Fitting**; class label: **Schedule** ([`app.js:1772`](app.js), [`app.js:1885`](app.js); HTML [`index.html`](index.html) ~cargo modal).
- Planner może wybrać schedule, ale SSOT pozostaje jedna baza Sch 40 × factor.

## Code References

- `data/piping_catalog.js:4` — deklaracja źródła fittings = B16.9 Sch 40 equiv.
- `data/piping_catalog.js:178-249` — siedem typów BW, `{nps, wt}`
- `app.js:1599-1703` — `FITTING_SCH_FACTORS` (B36-derived)
- `app.js:1788-1824` — class/NPS/calc dla fittings
- `data/ASME B16.9.pdf` — B16.9-2024 (wymiary/tolerancje; bez mas)
- `context/foundation/roadmap.md:116-128` — S-04 outcome i znane ryzyko Sch40+factors

## Architecture Insights

1. **Misaligned claim vs artifact**: komentarz „ASME B16.9” opisuje *rodzinę produktu* (BW wrought fittings), nie SSOT tabel B16.9.
2. **Two standards mixed**: identity/schedule language ↔ B36; dimensions (unused) ↔ B16.9; masses ↔ third-party / calculated.
3. **Schedule UX is weight-only**: wybór schedule nie filtruje NPS ani nie ładuje osobnych rekordów — to jest główny powód, dla którego S-04 mówi „nie opierać SSOT na Sch 40 + przybliżonych mnożnikach”.
4. **Reducer factor bug/limitation**: compound NPS nigdy nie dostaje per-size B36 factor — systematycznie `_default`.

## Historical Context (from prior changes)

- `context/archive/2026-07-18-cargo-catalog-selection/` — fittings nie były rozszerzane; brak alternate dump.
- `context/archive/2026-07-18-pipe-fill-cargo-weight/` — fill tylko dla pipes; fittings zostają na `calcUnitKg` steel-only; fittings/flanges/valves nietknięte.
- `context/foundation/prd.md` — źródła wag cargo: PDF B16.5 / B16.9 w `data/` (produktowo); research pokazuje, że B16.9 sam nie dostarcza kg/pc.
- `context/foundation/roadmap.md` Stream C / S-04 — już nazywa lukę Sch40 + `FITTING_SCH_FACTORS` vs PDF.

## Related Research

- Brak wcześniejszych `research.md` w `context/changes/**` ani `context/archive/**` dla B16.9 fittings.
- Powiązane artefakty: `context/archive/2026-07-18-pipe-fill-cargo-weight/wall-thickness-candidates.md` (B36 walls dla **pipes**, nie fittings).

## Open Questions

1. **Polityka źródła mas (kg/pc)** gdy B16.9 nie ma tabel — manufacturer charts vs geometry-from-B16.9-dims×density vs zachowanie Sch40+B36 factors z disclaimerem?
2. **Zakres v1 typów** — czy zostajemy przy 7 typach, czy dokładamy returns / reducing tees / stub ends?
3. **NPS×schedule matrix** — pełne per-schedule wiersze wag, czy tylko wybrane schedules (40/80/STD/XS)?
4. **Czy weryfikować wymiary** względem Tables 6.1-* (dziś niepotrzebne do masy cargo, ale to jedyna treść B16.9)?
5. **Reducery**: factor od large end, small end, czy osobne wagi per schedule×pair?
6. **SR Elbow NPS ½** — usunąć / oznaczyć jako poza B16.9 SR table?
)
