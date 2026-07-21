# Calculator Help — Flow & Metric Definitions Implementation Plan

## Overview

Add an English help page at `/help` that explains the Appliance Ratio calculator flow and defines every input and computed indicator on that path (with the same formulas as the live math / technical report). Wire a **Help** link in the calculator header. Cargo-weight and rigging-weight internals (catalogs, fill, line items) stay out of scope — those weights are documented only as ratio inputs / totals.

## Current State Analysis

- Calculator lives at `/` as a React island (`src/pages/index.astro` → `CalculatorApp` / `CalculatorShell`). Header shows brand + “Workspace” badge; no secondary routes from the product chrome.
- `Layout.astro` is a document shell only (no global nav). Content pages (e.g. `dashboard.astro`) use Astro + Layout.
- No help/about/docs route exists.
- Ratio math is centralized in `src/lib/appliance-ratio.ts`: total weight `E6 = (cargo + rigging) × contingency × DAF`, utilization `E8 = E6 / WLL`, remaining `1 - E8`. UI shows Utilization / Appliance ratio / Used as the same value; thresholds, visual alerts, and capacity chart consume that utilization.
- Technical report already prints the same formulas (`TechnicalReportView.tsx` Calculations section) — help copy should stay algebraically aligned.
- UI strings are English; roadmap S-08 deferred delivery form and language to this plan (resolved below).

## Desired End State

A planner on `/` can open **Help**, land on `/help`, read (1) the end-to-end flow, (2) a glossary of every ratio input and output indicator, and (3) the explicit formulas — then return to the calculator. Cargo/rigging sheet internals are not documented. No legal disclaimer block.

### Key Discoveries:

- Header slot for Help: right side of `CalculatorShell` header currently holds only the Workspace badge (`CalculatorShell.tsx` ~174–188) — replace or accompany with a Help control without adding a second nav system.
- Formula source of truth: `computeFromInputs` in `src/lib/appliance-ratio.ts` (~178–185); report mirrors it in `TechnicalReportView.tsx` (~188–200).
- Content page pattern: Astro page + `Layout`, React only if interactivity is required — help needs none.
- Alias Utilization = Appliance ratio = Used must be stated in the glossary so the UI’s triple label is not confusing.

## What We're NOT Doing

- Documenting cargo catalog, pipe fill, NPS/schedule, or cargo line-item math
- Documenting rigging sheet catalogs / line-item math
- Modal or in-calculator overlay help
- Polish (or bilingual) help copy in v1
- Legal / liability disclaimer section
- Changing Appliance Ratio formulas, thresholds logic, report generation, or auth/dashboard starter pages
- Adding MDX/content collections infrastructure
- Global site Topbar revival for auth links

## Implementation Approach

1. Add a static Astro page at `src/pages/help.astro` under `Layout`, styled to feel part of the calculator product (same max-width / background language as the shell where practical), with three content blocks: **Flow**, **Definitions**, **Formulas**.
2. Author English copy that names every ratio-path indicator (inputs, outputs, thresholds/alerts/chart behavior) and spells the two core equations exactly as the report does; treat cargo weight and rigging weight as Te inputs/totals only.
3. Add a header **Help** link in `CalculatorShell` pointing to `/help`; on the help page, provide a clear **Back to calculator** (or equivalent) link to `/`.
4. Verify with lint/build and a short manual pass (open Help, scan sections, return to `/`).

## Phase 1: Help page (route + content)

### Overview

Ship `/help` with complete EN content: flow narrative, metric glossary, and explicit formulas aligned with `appliance-ratio.ts` / technical report.

### Changes Required:

#### 1. Help route page

**File**: `src/pages/help.astro` (new)

**Intent**: Create the help route as a server-rendered Astro page wrapped in `Layout` (`title` e.g. “Help · Appliance Ratio Calculator”), containing the full help document. Prefer Astro markup + existing design tokens / Tailwind utilities over a React island.

**Contract**:
- Route: `/help` (file-based).
- Page structure (heading order):
  1. **How the calculator flows** — cargo weight → rigging weight → contingency & DAF → total weight → WLL → utilization / Appliance Ratio → thresholds & alerts → capacity chart → technical report. Notification number may be mentioned as report metadata only (not a ratio input).
  2. **Definitions** — glossary covering at least:
     - Inputs: Cargo weight (Te), Rigging weight (Te), Contingency, DAF, WLL; Utilization thresholds (Warn, Critical, Enabled)
     - Outputs / displays: Total weight, Utilization, Appliance ratio, Used, Remaining; Visual alerts; Capacity chart (Used / Remaining / over-capacity behavior)
     - Explicit note that **Utilization**, **Appliance ratio**, and **Used** are the same ratio in the UI
     - Cargo weight / Rigging weight described as totals (or manually entered Te) feeding the formula — **no** catalog/fill/sheet internals
  3. **Formulas** — present algebra matching the report / `computeFromInputs`:
     - Total weight = (cargo weight + rigging weight) × contingency × DAF
     - Utilization = total weight ÷ WLL
     - Remaining = 1 − utilization (with note that the chart clamps remaining display when utilization > 100%)
- Visual: readable single-column content, `lang`-consistent with Layout (`en`); include a way back to `/` (may be minimal in this phase if Phase 2 owns chrome polish, but a plain link to `/` must exist before Phase 1 is done).

#### 2. Copy accuracy guardrail

**File**: content inside `src/pages/help.astro` (or a colocated content module only if it keeps the page clearer — default: inline in the Astro page)

**Intent**: Keep definitions and formulas consistent with live math so help cannot drift from the calculator.

**Contract**: Formulas and metric names must match `src/lib/appliance-ratio.ts` and the Calculations labels used in `TechnicalReportView.tsx`. Do not invent alternate names for WLL / DAF / contingency.

### Success Criteria:

#### Automated Verification:

- `src/pages/help.astro` exists and is reachable as `/help` after `npm run dev` / build
- `npm run lint` passes
- `npm run build` passes

#### Manual Verification:

- `/help` shows Flow, Definitions, and Formulas sections in English
- Glossary includes all ratio inputs/outputs listed in the Contract; cargo/rigging internals absent
- Formulas match the report algebra (spot-check against Live results / Generate technical report)
- A link back to `/` works

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Calculator entry point

### Overview

Make Help discoverable from the calculator header and ensure round-trip navigation feels intentional.

### Changes Required:

#### 1. Header Help control

**File**: `src/components/calculator/CalculatorShell.tsx`

**Intent**: Add a visible **Help** control in the calculator header that navigates to `/help`, without cluttering the chrome.

**Contract**:
- Placement: header row currently containing the Workspace badge (right side) — Help must be always visible on `/` at desktop and usable on mobile (e.g. text link or ghost/outline button; may sit beside or replace the badge if space is tight — prefer keeping Workspace unless it forces wrapping awkwardness).
- Navigation: standard link to `/help` (full navigation is fine; no SPA router requirement).
- Accessible name: “Help” (or `aria-label` if icon-only — prefer visible text “Help”).

#### 2. Help page chrome consistency

**File**: `src/pages/help.astro`

**Intent**: Align help page entry/exit with the product shell so the planner does not feel dropped into an orphan document.

**Contract**:
- Prominent **Back to calculator** (or equivalent) link/button to `/`
- Optional light header strip echoing product name is fine; do not rebuild the full live calculator chrome
- No disclaimer section

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- `npm run build` passes

#### Manual Verification:

- From `/`, Help in the header opens `/help`
- From `/help`, Back to calculator returns to `/` with calculator usable
- Help remains reachable after a hard refresh on `/help`
- No regression to Live results / inputs / report on `/`

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human before closing the change.

---

## Testing Strategy

### Unit Tests:

- None required for this change (repo has no established test runner for pages; do not invent one). Formula correctness is already owned by existing math code — help only documents it.

### Integration Tests:

- None automated; rely on build + manual route smoke.

### Manual Testing Steps:

1. Open `/` → click Help → confirm `/help` loads with three sections.
2. Skim Definitions: every Live results / Inputs metric has an entry; no piping catalog or rigging sheet how-to.
3. Open technical report on a sample calculation; confirm Total Weight / Utilization formulas match Help.
4. Use Back to calculator → confirm `/` still computes utilization.
5. Mobile width: Help link tappable; help page readable without horizontal scroll.

## Performance Considerations

Static Astro page; negligible. Avoid shipping a React island solely for help content.

## Migration Notes

N/A — additive route and header link only.

## References

- Roadmap: `context/foundation/roadmap.md` — S-08 `calculator-help-flow-metrics`
- Math: `src/lib/appliance-ratio.ts` (`computeFromInputs`)
- Report formulas: `src/components/calculator/report/TechnicalReportView.tsx` (Calculations)
- Shell header: `src/components/calculator/CalculatorShell.tsx`
- Layout: `src/layouts/Layout.astro`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Help page (route + content)

#### Automated

- [x] 1.1 `src/pages/help.astro` exists and is reachable as `/help` after `npm run dev` / build — 6bbbfa0
- [x] 1.2 `npm run lint` passes — 6bbbfa0
- [x] 1.3 `npm run build` passes — 6bbbfa0

#### Manual

- [x] 1.4 `/help` shows Flow, Definitions, and Formulas sections in English — 6bbbfa0
- [x] 1.5 Glossary includes all ratio inputs/outputs listed in the Contract; cargo/rigging internals absent — 6bbbfa0
- [x] 1.6 Formulas match the report algebra (spot-check against Live results / Generate technical report) — 6bbbfa0
- [x] 1.7 A link back to `/` works — 6bbbfa0

### Phase 2: Calculator entry point

#### Automated

- [x] 2.1 `npm run lint` passes — a6e39bd
- [x] 2.2 `npm run build` passes — a6e39bd

#### Manual

- [x] 2.3 From `/`, Help in the header opens `/help` — a6e39bd
- [x] 2.4 From `/help`, Back to calculator returns to `/` with calculator usable — a6e39bd
- [x] 2.5 Help remains reachable after a hard refresh on `/help` — a6e39bd
- [x] 2.6 No regression to Live results / inputs / report on `/` — a6e39bd
