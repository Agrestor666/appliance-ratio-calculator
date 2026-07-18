# Golden Utilization Fixture (S-06 / astro-migrate-ux-redesign)

Frozen expected Total Weight (E6) and Utilization / Appliance Ratio (E8) for `EXCEL_DEFAULTS`. Carried forward from S-03 so this change does not depend on archive paths alone.

**Source of truth for algebra:** `computeFromInputs()` in `src/lib/appliance-ratio.ts` — `E6 = (C3 + C2) * C4 * C5`, `E8 = E6 / C7` (same as legacy `app.js`).

**Display note:** UI helpers `formatTe` / `formatPercent` may round what the user sees. The algebraic values below are the SSOT; on-screen values need only be consistent with them (known display rounding is OK).

## Inputs (`EXCEL_DEFAULTS`)

| Symbol | Field          |   Value |
| ------ | -------------- | ------: |
| C2     | Rigging Weight | 0.07 Te |
| C3     | Cargo Weight   |  1.5 Te |
| C4     | Contingency    |    1.05 |
| C5     | DAF            |    1.05 |
| C7     | Appliance WLL  |    3 Te |

## Formulas

```
E6 = (C3 + C2) * C4 * C5
E8 = E6 / C7
```

## Expected values (SSOT)

| Output                        | Symbol |                Expected |
| ----------------------------- | ------ | ----------------------: |
| Total Weight                  | E6     |         **1.730925** Te |
| Utilization / Appliance Ratio | E8     | **0.576975** (57.6975%) |

Derived:

```
E6 = (1.5 + 0.07) * 1.05 * 1.05 = 1.730925
E8 = 1.730925 / 3 = 0.576975
```

## How to re-verify

### Node against `src/lib` (one-shot)

```bash
node --experimental-strip-types -e "import { computeFromInputs, EXCEL_DEFAULTS } from './src/lib/appliance-ratio.ts'; const r = computeFromInputs({ cargoTe: EXCEL_DEFAULTS.cargoWeight, riggingTe: EXCEL_DEFAULTS.riggingWeight, contingency: EXCEL_DEFAULTS.contingency, daf: EXCEL_DEFAULTS.daf, wll: EXCEL_DEFAULTS.wll }); console.log(r);"
```

Expect `ok: true`, `totalWeightTe: 1.730925`, `utilization: 0.576975`.

### UI

1. Open `/` on the Astro app (`npm run dev`).
2. Click **Reset to defaults** (or load fresh).
3. Confirm Total Weight / Utilization are consistent with E6 / E8 above (allowing display rounding).
