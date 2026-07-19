/** Frozen Appliance Ratio algebra — port of `computeFromInputs` from legacy `app.js`. */

export const EXCEL_DEFAULTS = {
  riggingWeight: 0.07,
  cargoWeight: 1.5,
  contingency: 1.05,
  daf: 1.05,
  wll: 3,
} as const;

/** Threshold defaults for Phase 4 alerts (warn 0.85 / crit 0.9). */
export const THRESHOLD_DEFAULTS = {
  warn: 0.85,
  crit: 0.9,
  enabled: true,
} as const;

export interface ThresholdState {
  warn: number;
  crit: number;
  enabled: boolean;
}

export type AlertSeverity = "none" | "warn" | "crit" | "input";

export interface AlertItem {
  level: "warn" | "crit" | "input";
  text: string;
}

/**
 * Chart percentages from utilization ratio.
 * When utilization > 1, Used shows the actual percent (may exceed 100) and
 * Remaining is 0 — overCapacity flags an explicit overload callout in the UI.
 */
export function chartPercentsFromUtilization(utilization: number | null): {
  usedPercent: number;
  remainingPercent: number;
  overCapacity: boolean;
} {
  if (utilization === null || !Number.isFinite(utilization)) {
    return { usedPercent: 0, remainingPercent: 100, overCapacity: false };
  }
  if (utilization > 1) {
    return {
      usedPercent: utilization * 100,
      remainingPercent: 0,
      overCapacity: true,
    };
  }
  const usedRatio = Math.max(0, utilization);
  return {
    usedPercent: usedRatio * 100,
    remainingPercent: (1 - usedRatio) * 100,
    overCapacity: false,
  };
}

/**
 * Visual alert evaluation — port of `updateAlerts` without audio/speech.
 * Invalid compute results surface as an INPUT item (legacy recompute path).
 */
export function evaluateAlerts(
  result: RatioResult,
  thresholds: ThresholdState,
): { severity: AlertSeverity; items: AlertItem[] } {
  if (!result.ok) {
    return { severity: "input", items: [{ level: "input", text: result.error }] };
  }

  if (!thresholds.enabled) {
    return { severity: "none", items: [] };
  }

  const utilRatio = result.utilization;
  const { warn, crit } = thresholds;

  if (Number.isFinite(crit) && utilRatio >= crit) {
    return {
      severity: "crit",
      items: [
        {
          level: "crit",
          text: `Utilization ${formatPercent(utilRatio)} ≥ ${formatPercent(crit)}. Reduce load or increase WLL before lifting.`,
        },
      ],
    };
  }

  if (Number.isFinite(warn) && utilRatio >= warn) {
    return {
      severity: "warn",
      items: [
        {
          level: "warn",
          text: `Utilization ${formatPercent(utilRatio)} ≥ ${formatPercent(warn)}. Approaching the limit.`,
        },
      ],
    };
  }

  return { severity: "none", items: [] };
}

export type ThresholdParseResult =
  | { ok: true; thresholds: ThresholdState }
  | { ok: false; error: string };

/** Form-string thresholds (UI) → numeric state for alert evaluation. */
export function parseThresholdForm(fields: {
  warn: string;
  crit: string;
  enabled: boolean;
}): ThresholdParseResult {
  const warn = parseNumber(fields.warn);
  const crit = parseNumber(fields.crit);
  if (warn === null || crit === null) {
    return { ok: false, error: "Enter valid warn and critical threshold ratios." };
  }
  if (!(warn < crit)) {
    return { ok: false, error: "Warn threshold must be less than critical threshold." };
  }
  return { ok: true, thresholds: { warn, crit, enabled: fields.enabled } };
}

export function defaultsAsThresholdFormStrings() {
  return {
    warn: String(THRESHOLD_DEFAULTS.warn),
    crit: String(THRESHOLD_DEFAULTS.crit),
    enabled: THRESHOLD_DEFAULTS.enabled,
  };
}

export interface RatioInputs {
  cargoTe: number;
  riggingTe: number;
  contingency: number;
  daf: number;
  wll: number;
}

export type RatioResult =
  | {
      ok: true;
      totalWeightTe: number;
      utilization: number;
      remaining: number;
    }
  | {
      ok: false;
      error: string;
    };

export function parseNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  // PL-friendly: "1 234,56" or "1234,56"
  const cleaned = s.replace(/\s+/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Pure utilization math. Algebra matches legacy `computeFromInputs`:
 * E6 = (cargo + rigging) * contingency * daf; E8 = E6 / wll.
 */
export function computeFromInputs(inputs: RatioInputs): RatioResult {
  const { cargoTe: C3, riggingTe: C2, contingency: C4, daf: C5, wll: C7 } = inputs;

  if ([C2, C3, C4, C5, C7].some((x) => !Number.isFinite(x))) {
    return { ok: false, error: "Please enter valid numbers in all inputs." };
  }
  if (C7 <= 0) return { ok: false, error: "WLL must be greater than 0." };
  if (C4 <= 0 || C5 <= 0) return { ok: false, error: "Factors must be greater than 0." };

  const E6 = (C3 + C2) * C4 * C5;
  const E8 = E6 / C7;

  return {
    ok: true,
    totalWeightTe: E6,
    utilization: E8,
    remaining: 1 - E8,
  };
}

/** Parse string form fields then compute (UI path). */
export function computeFromFormStrings(fields: {
  cargoTe: string;
  riggingTe: string;
  contingency: string;
  daf: string;
  wll: string;
}): RatioResult {
  const cargoTe = parseNumber(fields.cargoTe);
  const riggingTe = parseNumber(fields.riggingTe);
  const contingency = parseNumber(fields.contingency);
  const daf = parseNumber(fields.daf);
  const wll = parseNumber(fields.wll);

  if (cargoTe === null || riggingTe === null || contingency === null || daf === null || wll === null) {
    return { ok: false, error: "Please enter valid numbers in all inputs." };
  }

  return computeFromInputs({ cargoTe, riggingTe, contingency, daf, wll });
}

export function formatTe(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

export function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return (n * 100).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "%";
}

export function defaultsAsFormStrings() {
  return {
    cargoTe: String(EXCEL_DEFAULTS.cargoWeight),
    riggingTe: String(EXCEL_DEFAULTS.riggingWeight),
    contingency: String(EXCEL_DEFAULTS.contingency),
    daf: String(EXCEL_DEFAULTS.daf),
    wll: String(EXCEL_DEFAULTS.wll),
  };
}
