/** Shared numeric display helpers (legacy `app.js` parity). */

export function formatKg(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatNumber(n: number, maxFractionDigits = 6): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
}

export function formatWllT(v: unknown): string {
  if (typeof v === "number" && Number.isFinite(v)) {
    const txt = Number.isInteger(v) ? String(v) : formatNumber(v, 3);
    return `${txt}t`;
  }
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return "—";
    return /\bt\b/i.test(s) ? s : `${s}t`;
  }
  return "—";
}

export function formatMeters(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const txt = Number.isInteger(v) ? String(v) : formatNumber(v, 3);
  return `${txt}m`;
}
