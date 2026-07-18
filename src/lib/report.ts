/** Technical report payload — parity with legacy `getReportPayload` + S-03 Te mismatch disclosure. */

import { computeFromFormStrings, parseNumber, type AlertSeverity, type ThresholdState } from "@/lib/appliance-ratio";
import type { CargoLogEntry } from "@/lib/cargo";
import type { RiggingLogEntry } from "@/lib/rigging";

/** Absolute Te epsilon finer than 6-decimal Send write (S-03). */
export const CARGO_TE_MISMATCH_EPS = 1e-6;

export type ReportSeverity = "OK" | "WARN" | "CRITICAL";

export interface ReportPayloadOk {
  ok: true;
  meta: {
    notificationNumber: string;
    generatedAt: string;
  };
  thresholds: {
    enabled: boolean;
    warnRatio: number;
    critRatio: number;
  };
  inputs: {
    riggingWeightTe: number;
    cargoWeightTe: number;
    contingencyFactor: number;
    dafFactor: number;
    wllTe: number;
  };
  outputs: {
    totalWeightTe: number;
    utilizationRatio: number;
    usedCapacityRatio: number;
    remainingCapacityRatio: number;
  };
  severity: ReportSeverity;
  chartPng: string | null;
  cargoLog: CargoLogEntry[];
  cargoSumKg: number;
  cargoTeMismatch: boolean;
  cargoSubtitle: string;
  riggingLog: RiggingLogEntry[];
}

export type ReportPayload =
  | ReportPayloadOk
  | {
      ok: false;
      error: string;
    };

export interface BuildReportParams {
  fields: {
    cargoTe: string;
    riggingTe: string;
    contingency: string;
    daf: string;
    wll: string;
  };
  thresholds: ThresholdState;
  alertSeverity: AlertSeverity;
  notificationNumber: string;
  cargoSentLog: CargoLogEntry[];
  cargoSentSumKg: number | null;
  riggingLog: RiggingLogEntry[];
  chartPng?: string | null;
  generatedAt?: Date;
}

export function reportSeverityFromAlert(severity: AlertSeverity): ReportSeverity {
  if (severity === "crit") return "CRITICAL";
  if (severity === "warn") return "WARN";
  return "OK";
}

/**
 * True when a Send snapshot exists and form cargo Te differs from last Send sum.
 * Does not clear `sentLog` — report discloses the mismatch instead.
 */
export function cargoTeMismatchesSent(
  cargoWeightTe: number,
  cargoSentLog: CargoLogEntry[],
  cargoSentSumKg: number | null,
): boolean {
  if (cargoSentLog.length === 0 || cargoSentSumKg == null || !Number.isFinite(cargoWeightTe)) {
    return false;
  }
  return Math.abs(cargoWeightTe - cargoSentSumKg / 1000) > CARGO_TE_MISMATCH_EPS;
}

export function cargoLogSubtitle(params: {
  cargoWeightTe: number;
  cargoSentLog: CargoLogEntry[];
  cargoSumKg: number;
  mismatch: boolean;
}): string {
  const { cargoWeightTe, cargoSentLog, cargoSumKg, mismatch } = params;
  const cargoTotalTe = cargoSumKg / 1000;

  if (cargoSentLog.length === 0) {
    return `No cargo log — cargo weight entered manually as ${formatTeExact(cargoWeightTe)} Te`;
  }

  if (mismatch) {
    return (
      `Breakdown from last Send: ${formatKgExact(cargoSumKg)} kg (${formatTeExact(cargoTotalTe)} Te). ` +
      `Current Cargo Weight is ${formatTeExact(cargoWeightTe)} Te — last-Send itemization may not match Te.`
    );
  }

  return `Total: ${formatKgExact(cargoSumKg)} kg (${formatTeExact(cargoTotalTe)} Te) — sent to main form`;
}

function formatTeExact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

function formatKgExact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

export function buildReportPayload(params: BuildReportParams): ReportPayload {
  const result = computeFromFormStrings(params.fields);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const cargoTe = parseNumber(params.fields.cargoTe);
  const riggingTe = parseNumber(params.fields.riggingTe);
  const contingency = parseNumber(params.fields.contingency);
  const daf = parseNumber(params.fields.daf);
  const wll = parseNumber(params.fields.wll);

  if (cargoTe === null || riggingTe === null || contingency === null || daf === null || wll === null) {
    return { ok: false, error: "Please enter valid numbers in all inputs." };
  }

  const cargoSentLog = Array.isArray(params.cargoSentLog) ? params.cargoSentLog : [];
  const cargoSumKg =
    params.cargoSentSumKg ?? cargoSentLog.reduce((a, e) => a + (Number.isFinite(e.totalKg) ? e.totalKg : 0), 0);
  const mismatch = cargoTeMismatchesSent(cargoTe, cargoSentLog, params.cargoSentSumKg);

  const usedRatio = result.utilization;
  const remainingRatio = result.remaining;
  const nn = (params.notificationNumber || "Input").trim() || "Input";
  const generatedAt = (params.generatedAt ?? new Date()).toISOString();

  return {
    ok: true,
    meta: {
      notificationNumber: nn,
      generatedAt,
    },
    thresholds: {
      enabled: params.thresholds.enabled,
      warnRatio: params.thresholds.warn,
      critRatio: params.thresholds.crit,
    },
    inputs: {
      riggingWeightTe: riggingTe,
      cargoWeightTe: cargoTe,
      contingencyFactor: contingency,
      dafFactor: daf,
      wllTe: wll,
    },
    outputs: {
      totalWeightTe: result.totalWeightTe,
      utilizationRatio: usedRatio,
      usedCapacityRatio: usedRatio,
      remainingCapacityRatio: remainingRatio,
    },
    severity: reportSeverityFromAlert(params.alertSeverity),
    chartPng: params.chartPng ?? null,
    cargoLog: cargoSentLog.map((e) => ({ ...e })),
    cargoSumKg,
    cargoTeMismatch: mismatch,
    cargoSubtitle: cargoLogSubtitle({
      cargoWeightTe: cargoTe,
      cargoSentLog,
      cargoSumKg,
      mismatch,
    }),
    riggingLog: Array.isArray(params.riggingLog) ? params.riggingLog.map((e) => ({ ...e })) : [],
  };
}
