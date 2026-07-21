# Calculator Help — Flow & Metric Definitions — Plan Brief

> Full plan: `context/changes/calculator-help-flow-metrics/plan.md`

## What & Why

Planners need a single place that explains the Appliance Ratio flow and what every on-screen indicator means. This change adds an English `/help` page (flow + glossary + formulas) so utilization, factors, and totals are unambiguous — without documenting cargo/rigging sheet internals.

## Starting Point

The calculator runs at `/` in Astro with a React shell; there is no help route and no term glossary. Formulas already live in `appliance-ratio.ts` and are printed in the technical report.

## Desired End State

From the calculator header, a planner opens Help, reads the flow and definitions (with explicit total-weight and utilization formulas), and returns to `/`. Cargo/rigging remain black-box Te inputs.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| -------- | ------ | ---------------- | ------ |
| Delivery form | Separate `/help` Astro page | Deep-linkable content page; matches Layout content pattern | Plan |
| Language | English | Matches calculator UI labels | Plan |
| Content depth | Flow + definitions + explicit formulas | Aligns with report algebra; closes “what does this mean?” | Plan |
| Entry point | Header “Help” link in CalculatorShell | Always visible on the product surface | Plan |
| Disclaimer | None in v1 | Keep page to definitions/flow only | Plan |
| Cargo/rigging detail | Out of scope | Per roadmap S-08 — treat as inputs/totals | Roadmap |

## Scope

**In scope:**
- `/help` with Flow, Definitions, Formulas (EN)
- Glossary of all ratio-path inputs/outputs (incl. thresholds, alerts, chart)
- Header Help link + back link to calculator

**Out of scope:**
- Cargo catalog / fill / line items; rigging sheet internals
- Modal help; PL/bilingual copy; legal disclaimer
- Formula or calculator behavior changes

## Architecture / Approach

Static Astro page under `Layout` for content; one navigation affordance in the existing React header. Copy must stay consistent with `computeFromInputs` and the report’s Calculations section (Utilization = Appliance ratio = Used).

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Help page | `/help` + full EN content | Copy drifts from live formulas |
| 2. Calculator entry | Header Help + round-trip UX | Header clutter on small screens |

**Prerequisites:** S-06 done (Astro calculator shell).  
**Estimated effort:** ~1 session across 2 phases.

## Open Risks & Assumptions

- Help is product documentation, not a substitute for lifting procedures — even without an on-page disclaimer.
- Notification number is report metadata, not a ratio input; mention lightly in Flow only.

## Success Criteria (Summary)

- Planner can open Help from `/` and understand the full ratio flow
- Every Live results / Inputs indicator has a definition; formulas match the report
- Cargo/rigging internals are not documented; calculator on `/` unchanged in behavior
