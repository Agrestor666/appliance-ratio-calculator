/** Pure rigging catalog helpers (legacy `app.js` parity). */

import { RIGGING_CATALOG } from "@/lib/data";
import type { RiggingCatalogRow } from "@/lib/data";
import { parseNumber } from "@/lib/appliance-ratio";
import { formatMeters, formatWllT } from "@/lib/format";

export interface RiggingSheetMeta {
  name: string;
  columns: string[];
  rows: RiggingCatalogRow[];
  baseWeightKgKey: string | null;
  perMeterKgKey: string | null;
  extraPerMeterKgKey: string | null;
  standardLiftMKey: string | null;
}

export interface RiggingSelection {
  qty: number;
  lengthM: number;
}

export interface RiggingLogEntry {
  ts: string;
  sheet: string;
  label: string;
  qty: number;
  lengthM: number;
  unitKg: number;
  subtotalKg: number;
}

export function normalizeKey(s: unknown): string {
  const raw = typeof s === "string" || typeof s === "number" ? String(s) : "";
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function firstKey(columns: { raw: string; norm: string }[], ...preds: ((n: string) => boolean)[]): string | null {
  for (const pred of preds) {
    const hit = columns.find((k) => pred(k.norm));
    if (hit) return hit.raw;
  }
  return null;
}

export function detectCatalogKeys(columns: string[]) {
  const keys = columns.map((c) => ({ raw: c, norm: normalizeKey(c) }));

  const baseWeightKgKey = firstKey(
    keys,
    (n) => /\bweight\b/.test(n) && /\bkg\b/.test(n) && !/\bkg\/m\b/.test(n) && !/\bper meter\b/.test(n),
    (n) => /\bweight\s*\(kg\)\b/.test(n),
    (n) => /\bweight\b/.test(n) && !/\bper\b/.test(n),
  );

  const perMeterKgKey = firstKey(
    keys,
    (n) => /\bkg\/m\b/.test(n),
    (n) => /\bper meter\b/.test(n) && /\bkg\b/.test(n),
  );

  const extraPerMeterKgKey = firstKey(
    keys,
    (n) => /\bextra\b/.test(n) && /\bper m\b/.test(n),
    (n) => /\bextra\b/.test(n) && /\bper meter\b/.test(n),
  );

  const standardLiftMKey = firstKey(
    keys,
    (n) => /\bstandard lift\b/.test(n) && /\bm\b/.test(n),
    (n) => /\blift\b/.test(n) && /\bm\b/.test(n),
  );

  return { baseWeightKgKey, perMeterKgKey, extraPerMeterKgKey, standardLiftMKey };
}

export function loadRiggingSheets(): RiggingSheetMeta[] {
  const sheets = RIGGING_CATALOG.sheets;
  if (!Array.isArray(sheets)) return [];
  return sheets.map((s) => {
    const rows = Array.isArray(s.rows) ? s.rows : [];
    const firstRow = rows.at(0);
    const columns = firstRow ? Object.keys(firstRow) : [];
    const keys = detectCatalogKeys(columns);
    return {
      name: s.name,
      columns,
      rows,
      ...keys,
    };
  });
}

export function selectionKey(sheetName: string, rowIndex: number): string {
  return `${sheetName}::${rowIndex}`;
}

export function getRowLabel(row: RiggingCatalogRow, columns: string[]): string {
  const normCols = columns.map((c) => ({ raw: c, norm: normalizeKey(c) }));
  const labelKey =
    firstKey(
      normCols,
      (n) => /\b(description|item|name|type)\b/.test(n),
      (n) => /\b(model|size|rating|wll)\b/.test(n),
    ) ?? columns[0];
  if (labelKey) {
    const a = row[labelKey];
    if (a != null && String(a).trim()) return String(a).trim();
  }
  const parts: string[] = [];
  for (const c of columns.slice(0, 2)) {
    const v = row[c];
    if (v != null && String(v).trim()) parts.push(String(v).trim());
  }
  return parts.length > 0 ? parts.join(" · ") : "Item";
}

export function unitKgForSelection(
  sheet: RiggingSheetMeta,
  row: RiggingCatalogRow,
  sel: RiggingSelection,
): number | null {
  const lengthM = Math.max(0, sel.lengthM);

  const baseKg = sheet.baseWeightKgKey ? parseNumber(row[sheet.baseWeightKgKey]) : null;
  const perM = sheet.perMeterKgKey ? parseNumber(row[sheet.perMeterKgKey]) : null;
  const extraPerM = sheet.extraPerMeterKgKey ? parseNumber(row[sheet.extraPerMeterKgKey]) : null;
  const stdLift = sheet.standardLiftMKey ? parseNumber(row[sheet.standardLiftMKey]) : null;

  if (perM != null) return perM * lengthM;
  if (baseKg != null && extraPerM != null && stdLift != null) {
    return Math.max(0, baseKg + (lengthM - stdLift) * extraPerM);
  }
  if (baseKg != null) return baseKg;
  return null;
}

export function computeSelectionSumKg(
  sheet: RiggingSheetMeta | null,
  selections: Map<string, RiggingSelection>,
): number | null {
  if (!sheet) return null;
  if (!sheet.baseWeightKgKey && !sheet.perMeterKgKey) return null;
  let sum = 0;
  let any = false;
  for (const [key, sel] of selections.entries()) {
    const [sheetName, rowIndexStr] = key.split("::");
    if (sheetName !== sheet.name) continue;
    const idx = Number(rowIndexStr);
    const row = sheet.rows.at(idx);
    if (row == null) continue;
    const unitKg = unitKgForSelection(sheet, row, sel);
    if (unitKg == null) continue;
    const qty = Math.max(1, Math.floor(sel.qty));
    sum += unitKg * qty;
    any = true;
  }
  return any ? sum : null;
}

export function sumRiggingLogKg(log: RiggingLogEntry[]): number | null {
  if (log.length === 0) return null;
  return log.reduce((s, e) => s + e.subtotalKg, 0);
}

export function confirmSelectionsToLog(
  sheet: RiggingSheetMeta,
  selections: Map<string, RiggingSelection>,
): RiggingLogEntry[] {
  const now = new Date();
  const ts = now.toISOString().replace("T", " ").replace("Z", "Z");
  const newEntries: RiggingLogEntry[] = [];
  const wllKey = sheet.columns.find((c) => /\bwll\b/i.test(c)) ?? "WLL (t)";

  for (const [key, sel] of selections.entries()) {
    const [sheetName, rowIndexStr] = key.split("::");
    if (sheetName !== sheet.name) continue;
    const idx = Number(rowIndexStr);
    const row = sheet.rows.at(idx);
    if (row == null) continue;
    const qty = Math.max(1, Math.floor(sel.qty));
    const lengthM = Math.max(0, sel.lengthM);
    const unitKg = unitKgForSelection(sheet, row, { qty, lengthM });
    if (unitKg == null) continue;

    const wllText = formatWllT(row[wllKey]);
    let labelMain: string;
    if (sheet.name === "Slings" || sheet.name === "Chain Blocks") {
      labelMain = `${wllText} ${formatMeters(lengthM)}`;
    } else if (sheet.name === "Shackles" || sheet.name === "Beam Clamps") {
      labelMain = wllText;
    } else {
      labelMain = getRowLabel(row, sheet.columns);
    }

    newEntries.push({
      ts,
      sheet: sheet.name,
      label: `${labelMain} (${sheet.name})`,
      qty,
      lengthM,
      unitKg,
      subtotalKg: unitKg * qty,
    });
  }

  return newEntries;
}

export function sheetNeedsLength(sheet: RiggingSheetMeta): boolean {
  return sheet.perMeterKgKey != null || (sheet.extraPerMeterKgKey != null && sheet.standardLiftMKey != null);
}

export function defaultLengthM(sheet: RiggingSheetMeta): number {
  if (sheet.perMeterKgKey != null || sheet.extraPerMeterKgKey != null) return 3;
  return 0;
}
