# Golden Utilization Fixture (S-03)

Frozen expected Total Weight (E6) and Utilization / Appliance Ratio (E8) for the legacy calculator’s `EXCEL_DEFAULTS`. Use this to spot silent formula drift without a test runner.

**Source of truth for algebra:** `computeFromInputs()` in `app.js` — `E6 = (C3 + C2) * C4 * C5`, `E8 = E6 / C7`.

**Display note:** UI helpers `formatTe` / `formatPercent` may round what the user sees. The algebraic values below are the SSOT; on-screen values need only be consistent with them (known display rounding is OK).

## Inputs (`EXCEL_DEFAULTS`)

| Symbol | Field | Value |
|--------|--------|------:|
| C2 | Rigging Weight (`#riggingWeight`) | 0.07 Te |
| C3 | Cargo Weight (`#cargoWeight`) | 1.5 Te |
| C4 | Contingency (`#contingency`) | 1.05 |
| C5 | DAF (`#daf`) | 1.05 |
| C7 | Appliance WLL (`#wll`) | 3 Te |

## Formulas

```
E6 = (C3 + C2) * C4 * C5
E8 = E6 / C7
```

## Expected values (SSOT)

| Output | Symbol | Expected |
|--------|--------|---------:|
| Total Weight | E6 | **1.730925** Te |
| Utilization / Appliance Ratio | E8 | **0.576975** (57.6975%) |

Derived:

```
E6 = (1.5 + 0.07) * 1.05 * 1.05 = 1.730925
E8 = 1.730925 / 3 = 0.576975
```

## How to re-verify

### Node (algebra)

```bash
node -e "const C2=0.07,C3=1.5,C4=1.05,C5=1.05,C7=3; const E6=(C3+C2)*C4*C5; const E8=E6/C7; console.log({E6,E8});"
```

Expect `{ E6: 1.730925, E8: 0.576975 }`.

### UI

1. Open the legacy calculator (`index.html`).
2. Click **Reset** (restores `EXCEL_DEFAULTS`).
3. Confirm Total Weight / Utilization are consistent with E6 / E8 above (allowing display rounding).
