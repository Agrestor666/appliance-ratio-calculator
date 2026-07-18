/** Pure cargo catalog queries + fill-aware pipe mass (legacy `app.js` parity). */

import { FILL_MEDIA_CATALOG, PIPING_CATALOG } from "@/lib/data";
import type { CatalogItem, FillMediaItem, FlangeClassValue } from "@/lib/data";
import { parseNumber } from "@/lib/appliance-ratio";

export type CargoCategoryId = "pipe" | "fitting" | "flange" | "valve";

export interface CargoCategory {
  id: CargoCategoryId;
  label: string;
  hasClass: boolean;
  hasLength: boolean;
}

export interface CargoLogEntry {
  id: string;
  label: string;
  qty: number;
  unitKg: number;
  totalKg: number;
  fillId?: string;
  fillLabel?: string;
}

export interface PipeMassResult {
  steelKg: number;
  fillKg: number;
  unitKg: number;
  geometryOk: boolean;
}

export const CARGO_CATEGORIES: CargoCategory[] = [
  { id: "pipe", label: "Pipe", hasClass: false, hasLength: true },
  { id: "fitting", label: "Butt-Weld Fitting", hasClass: true, hasLength: false },
  { id: "flange", label: "Flange", hasClass: true, hasLength: false },
  { id: "valve", label: "Valve", hasClass: true, hasLength: false },
];

export function getCargoCategory(id: CargoCategoryId): CargoCategory {
  const found = CARGO_CATEGORIES.find((c) => c.id === id);
  if (found) return found;
  return { id: "pipe", label: "Pipe", hasClass: false, hasLength: true };
}

export function getFillMediaItems(): FillMediaItem[] {
  return FILL_MEDIA_CATALOG.items;
}

export function findFillMedia(fillId: string): FillMediaItem | null {
  return getFillMediaItems().find((i) => i.id === fillId) ?? null;
}

/** Pipe steel + fill mass. Fill applies only when geometry (t, ID) is valid. */
export function pipeUnitMass(item: CatalogItem, lenM: number, densityKgPerM3: number): PipeMassResult {
  const steelKg = item.wt * lenM;
  const density = Number.isFinite(densityKgPerM3) ? densityKgPerM3 : 0;
  if (!(density > 0)) {
    return { steelKg, fillKg: 0, unitKg: steelKg, geometryOk: true };
  }
  const t = item.t;
  if (typeof t !== "number" || !(t > 0)) {
    return { steelKg, fillKg: 0, unitKg: steelKg, geometryOk: false };
  }
  const od = item.od;
  if (typeof od !== "number") {
    return { steelKg, fillKg: 0, unitKg: steelKg, geometryOk: false };
  }
  const idMm = od - 2 * t;
  if (!(idMm > 0)) {
    return { steelKg, fillKg: 0, unitKg: steelKg, geometryOk: false };
  }
  const V_m3 = Math.PI * (idMm / 2000) ** 2 * lenM;
  const fillKg = V_m3 * density;
  return { steelKg, fillKg, unitKg: steelKg + fillKg, geometryOk: true };
}

export function getTypeList(catId: CargoCategoryId): string[] {
  switch (catId) {
    case "pipe":
      return Object.keys(PIPING_CATALOG.pipes);
    case "fitting":
      return Object.keys(PIPING_CATALOG.fittings);
    case "flange": {
      const deferred = new Set(["Socket Weld", "Threaded", "Lap Joint"]);
      return Object.keys(PIPING_CATALOG.flanges).filter((t) => !deferred.has(t));
    }
    case "valve":
      return Object.keys(PIPING_CATALOG.valves);
  }
}

function lookup<T>(rec: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(rec, key) ? rec[key] : undefined;
}

export function getClassList(catId: CargoCategoryId, typeId: string): string[] {
  let group: Record<string, unknown> | undefined;
  switch (catId) {
    case "fitting":
      group = lookup(PIPING_CATALOG.fittings, typeId);
      break;
    case "flange":
      group = lookup(PIPING_CATALOG.flanges, typeId);
      break;
    case "valve":
      group = lookup(PIPING_CATALOG.valves, typeId);
      break;
    default:
      return [];
  }
  if (group == null) return [];
  return Object.keys(group);
}

/** True when flange class value is schedule → [{ nps, wt }] (Weld Neck nest). */
export function isFlangeScheduleNest(classVal: unknown): classVal is Record<string, CatalogItem[]> {
  if (!classVal || typeof classVal !== "object" || Array.isArray(classVal)) return false;
  const vals = Object.values(classVal as Record<string, unknown>);
  return vals.length > 0 && vals.every((v) => Array.isArray(v));
}

export function getScheduleList(catId: CargoCategoryId, typeId: string, classId: string): string[] {
  if (catId !== "flange") return [];
  const typeGroup = lookup(PIPING_CATALOG.flanges, typeId);
  const classVal: FlangeClassValue | undefined = typeGroup ? lookup(typeGroup, classId) : undefined;
  if (!isFlangeScheduleNest(classVal)) return [];
  return Object.keys(classVal);
}

export function getNpsList(catId: CargoCategoryId, typeId: string, classId: string, scheduleId: string): CatalogItem[] {
  let items: CatalogItem[] | undefined;
  switch (catId) {
    case "pipe":
      items = lookup(PIPING_CATALOG.pipes, typeId);
      break;
    case "fitting": {
      const typeGroup = lookup(PIPING_CATALOG.fittings, typeId);
      items = typeGroup ? lookup(typeGroup, classId) : undefined;
      break;
    }
    case "flange": {
      const typeGroup = lookup(PIPING_CATALOG.flanges, typeId);
      const classVal = typeGroup ? lookup(typeGroup, classId) : undefined;
      if (isFlangeScheduleNest(classVal)) {
        items = scheduleId !== "" ? lookup(classVal, scheduleId) : undefined;
      } else if (Array.isArray(classVal)) {
        items = classVal;
      }
      break;
    }
    case "valve": {
      const typeGroup = lookup(PIPING_CATALOG.valves, typeId);
      items = typeGroup ? lookup(typeGroup, classId) : undefined;
      break;
    }
  }
  return Array.isArray(items) ? items : [];
}

export function findItem(
  catId: CargoCategoryId,
  typeId: string,
  classId: string,
  nps: string,
  scheduleId: string,
): CatalogItem | null {
  return getNpsList(catId, typeId, classId, scheduleId).find((i) => i.nps === nps) ?? null;
}

export function calcUnitKg(
  item: CatalogItem | null,
  catId: CargoCategoryId,
  lenM: number,
  fillId: string,
): number | null {
  if (!item) return null;
  if (catId === "pipe") {
    const fill = findFillMedia(fillId);
    const density = fill?.densityKgPerM3 ?? 0;
    return pipeUnitMass(item, lenM, density).unitKg;
  }
  return item.wt;
}

export function sumCargoLogKg(log: CargoLogEntry[]): number | null {
  if (log.length === 0) return null;
  return log.reduce((s, e) => s + e.totalKg, 0);
}

export function buildCargoLogEntry(params: {
  catId: CargoCategoryId;
  typeId: string;
  classId: string;
  scheduleId: string;
  nps: string;
  lenM: number;
  fillId: string;
  qty: number;
  classEnabled: boolean;
  lengthEnabled: boolean;
}): CargoLogEntry | null {
  const { catId, typeId, classId, scheduleId, nps, lenM, fillId, qty, classEnabled, lengthEnabled } = params;
  const item = findItem(catId, typeId, classId, nps, scheduleId);
  if (!item || qty < 1) return null;
  if (lengthEnabled && !(lenM > 0)) return null;

  const fill = findFillMedia(fillId);
  let unitKg: number;
  let pipeMass: PipeMassResult | null = null;
  if (catId === "pipe") {
    pipeMass = pipeUnitMass(item, lenM, fill?.densityKgPerM3 ?? 0);
    unitKg = pipeMass.unitKg;
  } else {
    const u = calcUnitKg(item, catId, lenM, fillId);
    if (u == null) return null;
    unitKg = u;
  }
  if (!Number.isFinite(unitKg)) return null;

  const catLabel = getCargoCategory(catId).label;
  let label = `${catLabel} | ${typeId}`;
  if (classId && classEnabled) label += ` | ${classId}`;
  if (scheduleId) label += ` | ${scheduleId}`;
  label += ` | NPS ${nps}"`;
  if (lengthEnabled) label += ` | ${lenM} m`;

  const entry: CargoLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    label,
    qty,
    unitKg,
    totalKg: unitKg * qty,
  };

  if (catId === "pipe" && pipeMass) {
    const fillLabel = fill?.label ?? "Empty";
    const density = fill?.densityKgPerM3 ?? 0;
    const displayFill = density > 0 && !pipeMass.geometryOk ? `${fillLabel} (geometry unavailable)` : fillLabel;
    entry.fillId = fill?.id ?? "empty";
    entry.fillLabel = displayFill;
    entry.label = `${label} | ${displayFill}`;
  }

  return entry;
}

export function parseLengthMeters(raw: string): number {
  return parseNumber(raw) ?? 1;
}
