# Cargo Weight to Ratio Implementation Plan

## Overview

Close roadmap S-03 (US-01, FR-004, FR-005): prove fill-aware cargo Te feeds Appliance Ratio on the legacy calculator, freeze golden utilization numbers so the formula cannot silently drift, and make the technical report honest when form Te is edited after Send — without rewriting the utilization formula, adding fill report columns, or migrating to Astro.

## Current State Analysis

- S-01 and S-02 are archived. Catalog → fill → list → **Send to Cargo Weight** already writes fill-aware Te into `#cargoWeight` and calls `recompute()` (`app.js:2197–2207`). S-02 handoff Notes state S-03 owns ratio/report regression guardrails and optional dedicated fill columns.
- Utilization formula (must not change): `E6 = (C3 + C2) * C4 * C5`, `E8 = E6 / C7` in `computeFromInputs()` (`app.js:293–312`). Defaults in `EXCEL_DEFAULTS` (`app.js:27–33`).
- Technical report: `getReportPayload()` / `generateTechnicalReport()` (`app.js:1125–1409`). Inputs/results come from live form via `computeFromInputs()`; cargo itemization comes from `cargoState.sentLog` / `sentSumKg` only. If the planner Sends then edits `#cargoWeight`, Inputs show the new Te while the cargo log still shows the last Send — a silent self-contradiction.
- Medium is already visible in pipe line `label` strings (S-02); no dedicated Fill column exists (and this plan will not add one).
- Host remains legacy (`index.html` / `app.js`). Astro `src/` has no calculator UI. Repo has no test runner.

## Desired End State

A planner can build a fill-aware cargo list, Send Te into Appliance Ratio inputs, see correct utilization/chart/alerts, and generate a technical report. Manual Te entry still works. If Te is edited after Send while a `sentLog` exists, the report cargo section explicitly discloses that the breakdown is from the last Send and may not match current Te. Frozen golden E6/E8 for `EXCEL_DEFAULTS` are recorded and verified. Primary Success Criterion for the cargo-fill path is demonstrably closed.

### Key Discoveries:

- FR-004 Send mechanics already ship; S-03 is close-out + thin polish, not a new handoff button (`app.js:2197–2207`, S-02 `change.md` Notes).
- Report mismatch is the only path-critical honesty gap left on this slice (`app.js:1212–1344`).
- Golden for defaults: E6 = **1.730925** Te, E8 = **0.576975** (57.6975%) from C2=0.07, C3=1.5, C4=C5=1.05, C7=3.
- Residual S-02 data risk (wt vs od/t divergence) stays documentation-only — do not “fix” catalog weights in S-03.

## What We're NOT Doing

- Rewriting or “improving” the Appliance Ratio / utilization formula or chart math
- Changing Send to live auto-sync (button-Send stays)
- Dedicated Fill column (or other report chrome) — medium stays in the label string
- Optional UX hints (e.g. “list ≠ Te” reminders on the main form) — first cut under `speed`
- Astro migration of the calculator
- Fill mass on fittings/flanges/valves; custom density; steel/fill breakdown UI
- Catalog wt/t reconciliation (future pass)
- Inventing a test runner
- Updating `roadmap.md` status as a required step of this change (archive / separate edit may do that later)
- Auth, DB, full UI redesign

## Implementation Approach

1. Write a golden-fixture artifact under the change folder with exact inputs and expected E6/E8; verify with a one-shot Node expression (or equivalent) matching `computeFromInputs` algebra — no test runner.
2. In report generation only, detect when `sentLog` is non-empty and form cargo Te differs from `sentSumKg/1000` beyond a small epsilon; disclose that in the cargo log section subtitle (do not clear `sentLog` on Te edit).
3. Run the human E2E smoke checklist (fill-aware Send → ratio → report, mismatch case, manual Te, Reset); record close-out Notes in `change.md`.

## Critical Implementation Details

**Formula freeze:** Do not edit the bodies of `computeFromInputs` / `recompute` except if a pre-existing bug blocking verification is found — and even then, stop and confirm with the human. Golden numbers encode the current algebra.

**Mismatch detection:** Compare `parseNumber(cargoWeight.value)` (or `payload.inputs.cargoWeightTe`) to `sentSumKg / 1000` only when `sentLog` has length > 0. Use an absolute Te epsilon on the order of `1e-6` (finer than the 6-decimal Send write) so formatting noise does not false-trigger. When mismatched, keep showing the table; change the cargo section subtitle to state that the breakdown is from the last Send and Te was edited afterward. When matched, keep today’s “sent to main form” copy. When no `sentLog`, keep today’s manual-entry copy.

**Cut line:** If time is tight, ship Phase 2 mismatch flag + Phase 1 golden + Phase 3 smoke; drop any extra main-form hint/copy polish.

---

## Phase 1: Golden Utilization Fixture

### Overview

Freeze expected Total Weight and Utilization for `EXCEL_DEFAULTS` so FR-005 “no formula regression” has a concrete check artifact.

### Changes Required:

#### 1. Golden fixture artifact

**File**: `context/changes/cargo-weight-to-ratio/golden-utilization.md`

**Intent**: Record the locked input set and expected E6/E8 so implementers and reviewers can spot silent formula drift without a test runner.

**Contract**: Markdown including: purpose; input table (C2–C5, C7 from `EXCEL_DEFAULTS`); formulas `E6=(C3+C2)*C4*C5`, `E8=E6/C7`; expected values **E6 = 1.730925**, **E8 = 0.576975**; how to re-verify (`node -e` algebra matching `computeFromInputs`, plus UI Reset → read Total Weight / Utilization); note that display rounding (`formatTe` / `formatPercent`) may truncate presentation but the algebraic values above are the SSOT. Do not modify `app.js` formula code in this phase.

### Success Criteria:

#### Automated Verification:

- `golden-utilization.md` exists under the change folder with the exact expected E6/E8 above
- One-shot Node (or equivalent) recomputes E6=1.730925 and E8=0.576975 from the documented inputs

#### Manual Verification:

- After Reset on the legacy calculator, on-screen Total Weight / Utilization are consistent with the golden values (allowing known display rounding)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Report Te / sentLog Mismatch Flag

### Overview

Make the technical report disclose when cargo Inputs Te no longer matches the last Send snapshot, without blocking manual Te or clearing the breakdown.

### Changes Required:

#### 1. Mismatch-aware cargo section copy

**File**: `app.js` (`getReportPayload` and/or `generateTechnicalReport` cargo-log block ~1212–1344)

**Intent**: When a Send snapshot exists and form cargo Te differs from that snapshot, the report must not imply the itemization still matches current Te.

**Contract**:
- Detect mismatch only when `cargoState.sentLog` (or payload equivalent) is non-empty and `|cargoTe − sentSumKg/1000| > epsilon` (epsilon ≈ `1e-6` Te).
- On mismatch: keep rendering `sentLog` rows; update the cargo section subtitle (the `.sub` under “Cargo calculator log”) to disclose last-Send breakdown vs edited Te (include both Te figures when practical).
- On match with non-empty log: preserve existing “sent to main form” behavior.
- On empty log: preserve existing “entered manually” behavior.
- Do not clear `sentLog` on `#cargoWeight` `input`/`change`. Do not add a Fill column. Do not change `computeFromInputs` algebra. Do not add main-form “list ≠ Te” hints in this phase (cut line).

### Success Criteria:

#### Automated Verification:

- `node --check app.js` passes
- Grep/spot-check: mismatch disclosure string (or clear equivalent) exists in the report HTML builder; `computeFromInputs` still uses `(C3+C2)*C4*C5` and `E6/C7`

#### Manual Verification:

- Send a non-empty cargo list → Generate report → cargo subtitle indicates sent/matched (no mismatch warning)
- After Send, edit `#cargoWeight` to a different Te → Generate report → Inputs show edited Te; cargo table still shows last Send; subtitle discloses the mismatch
- Never-Sent path still shows manual-entry copy; utilization still computes from typed Te

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 3: E2E Smoke + Close-Out

### Overview

Demonstrate Primary Success end-to-end and leave durable Notes that S-03 is closed under the agreed guardrails.

### Changes Required:

#### 1. Close-out Notes

**File**: `context/changes/cargo-weight-to-ratio/change.md`

**Intent**: Record what was verified and what remains explicitly out of scope so archive/handoff does not re-open S-03 scope.

**Contract**: Notes state: (1) fill-aware Send → `#cargoWeight` → `recompute()` verified; (2) golden fixture path + values; (3) report mismatch disclosure behavior; (4) formula unchanged; (5) out of scope remains: live sync, Fill column, Astro, catalog wt reconciliation, main-form sync hints.

### Success Criteria:

#### Automated Verification:

- `change.md` Notes contain the close-out bullets above
- `golden-utilization.md` still present and consistent with Notes

#### Manual Verification:

- Multi-item list: ≥1 pipe with fill ≠ Empty + ≥1 non-pipe → Send → `#cargoWeight` Te matches list sum/1000 → utilization/chart update
- Generate technical report: Inputs/Results coherent; pipe medium visible via label; no dedicated Fill column required
- Mismatch path: edit Te after Send → report discloses mismatch
- Manual Te (never Send / after clear) still works; Reset clears cargo snapshot so report cannot show stale Send after reset
- Spot-check golden defaults after Reset

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Testing Strategy

### Unit Tests:

- No test runner — do not invent one. Use `node --check app.js` and the golden Node one-shot for E6/E8.

### Integration Tests:

- None automated. Rely on Phase 3 manual smoke.

### Manual Testing Steps:

1. Open legacy calculator → Reset → confirm Total Weight / Utilization vs `golden-utilization.md`.
2. Cargo calculator: pipe + Fresh water + fitting → Add → Send → confirm Te and utilization update.
3. Generate technical report → confirm cargo totals and medium-in-label; Calculations section still shows `(cargo+rigging)×contingency×DAF` and `total÷WLL`.
4. Edit Cargo Weight Te → Generate report again → mismatch disclosure visible; Results use edited Te.
5. Reset → cargo report snapshot cleared; type Te manually → ratio + report “manual” path work.

## Performance Considerations

Report generation remains a one-shot HTML string build. Mismatch check is O(1). No caching or chart changes required.

## Migration Notes

- Browser-local only; no data migration.
- Rollback: revert the report subtitle branch; golden markdown can remain as historical record.
- Send path and formula are unchanged — rollback risk is limited to report copy.

## References

- Roadmap S-03: `context/foundation/roadmap.md`
- PRD US-01, FR-004, FR-005: `context/foundation/prd.md`
- S-02 archive / handoff: `context/archive/2026-07-18-pipe-fill-cargo-weight/`
- Formula + report: `app.js` (`computeFromInputs` ~293–312, Send ~2197–2207, report ~1125–1409)
- Main form cargo field: `index.html` (`#cargoWeight`, `#cargoSendBtn`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Golden Utilization Fixture

#### Automated

- [x] 1.1 `golden-utilization.md` exists under the change folder with the exact expected E6/E8 above
- [x] 1.2 One-shot Node (or equivalent) recomputes E6=1.730925 and E8=0.576975 from the documented inputs

#### Manual

- [ ] 1.3 After Reset on the legacy calculator, on-screen Total Weight / Utilization are consistent with the golden values (allowing known display rounding)

### Phase 2: Report Te / sentLog Mismatch Flag

#### Automated

- [ ] 2.1 `node --check app.js` passes
- [ ] 2.2 Grep/spot-check: mismatch disclosure string (or clear equivalent) exists in the report HTML builder; `computeFromInputs` still uses `(C3+C2)*C4*C5` and `E6/C7`

#### Manual

- [ ] 2.3 Send a non-empty cargo list → Generate report → cargo subtitle indicates sent/matched (no mismatch warning)
- [ ] 2.4 After Send, edit `#cargoWeight` to a different Te → Generate report → Inputs show edited Te; cargo table still shows last Send; subtitle discloses the mismatch
- [ ] 2.5 Never-Sent path still shows manual-entry copy; utilization still computes from typed Te

### Phase 3: E2E Smoke + Close-Out

#### Automated

- [ ] 3.1 `change.md` Notes contain the close-out bullets above
- [ ] 3.2 `golden-utilization.md` still present and consistent with Notes

#### Manual

- [ ] 3.3 Multi-item list: ≥1 pipe with fill ≠ Empty + ≥1 non-pipe → Send → `#cargoWeight` Te matches list sum/1000 → utilization/chart update
- [ ] 3.4 Generate technical report: Inputs/Results coherent; pipe medium visible via label; no dedicated Fill column required
- [ ] 3.5 Mismatch path: edit Te after Send → report discloses mismatch
- [ ] 3.6 Manual Te (never Send / after clear) still works; Reset clears cargo snapshot so report cannot show stale Send after reset
- [ ] 3.7 Spot-check golden defaults after Reset
