/**
 * One-shot generator for flange-weight-candidates.md (Phase 1).
 * Run: node context/changes/b16-5-flange-catalog/_gen_candidates.cjs
 * Not runtime code — writes only the candidates artifact.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "../../..");
const OUT = path.join(__dirname, "flange-weight-candidates.md");

const PIPE_KEYS = [
  "Sch 5S",
  "Sch 5",
  "Sch 10S",
  "Sch 10",
  "Sch 20",
  "Sch 30",
  "Sch 40S",
  "Sch 40",
  "Sch 60",
  "Sch 80S",
  "Sch 80",
  "Sch 100",
  "Sch 120",
  "Sch 140",
  "Sch 160",
  "STD",
  "XS",
  "XXS",
];

const NPS_ORDER = [
  "1/2",
  "3/4",
  "1",
  "1-1/4",
  "1-1/2",
  "2",
  "2-1/2",
  "3",
  "3-1/2",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
];

/** Normalize Wermac/Texas NPS labels → catalog keys */
function normNps(s) {
  return String(s)
    .replace(/¼/g, "1/4")
    .replace(/½/g, "1/2")
    .replace(/¾/g, "3/4")
    .replace(/^1\s*1\/4$/, "1-1/4")
    .replace(/^1\s*1\/2$/, "1-1/2")
    .replace(/^2\s*1\/2$/, "2-1/2")
    .replace(/^3\s*1\/2$/, "3-1/2")
    .replace(/^11\/4$/, "1-1/4")
    .replace(/^11\/2$/, "1-1/2")
    .replace(/^21\/2$/, "2-1/2")
    .replace(/^31\/2$/, "3-1/2");
}

function npsRank(nps) {
  const i = NPS_ORDER.indexOf(nps);
  return i < 0 ? 999 : i;
}

/**
 * Wermac.org ASME B16.5 forged flange weight chart (kg, approx.).
 * Wermac attributes the tables to Texas Flange manufacturer data.
 * WN / SO / Blind only transcribed for this slice. "..." = not published.
 * Facing assumption: raised face (RF) carbon steel A105 — chart default.
 */
const WERMAC = {
  150: {
    "Slip-On": {
      "1/2": 0.5,
      "3/4": 0.9,
      1: 0.9,
      "1-1/4": 1.4,
      "1-1/2": 1.4,
      2: 2.3,
      "2-1/2": 3.6,
      3: 4.1,
      "3-1/2": 4.0,
      4: 5.9,
      5: 6.8,
      6: 8.6,
      8: 13.5,
      10: 19.4,
      12: 28.8,
      14: 40.5,
      16: 47.7,
      18: 58.5,
      20: 74.3,
      22: 83.3,
      24: 99.0,
    },
    Blind: {
      "1/2": 0.9,
      "3/4": 0.9,
      1: 0.9,
      "1-1/4": 1.4,
      "1-1/2": 1.8,
      2: 2.3,
      "2-1/2": 3.2,
      3: 4.1,
      "3-1/2": 5.9,
      4: 7.7,
      5: 9.0,
      6: 12.2,
      8: 21.2,
      10: 31.5,
      12: 55.4,
      14: 63.0,
      16: 81.0,
      18: 99.0,
      20: 128.3,
      22: 159.8,
      24: 193.5,
    },
    "Weld Neck": {
      "1/2": 0.9,
      "3/4": 0.9,
      1: 1.4,
      "1-1/4": 1.4,
      "1-1/2": 1.8,
      2: 2.7,
      "2-1/2": 4.5,
      3: 5.2,
      "3-1/2": 5.4,
      4: 7.4,
      5: 9.5,
      6: 11.7,
      8: 18.9,
      10: 24.3,
      12: 39.6,
      14: 51.3,
      16: 63.0,
      18: 74.3,
      20: 88.7,
      22: 101.3,
      24: 120.6,
    },
  },
  300: {
    "Slip-On": {
      "1/2": 0.9,
      "3/4": 1.4,
      1: 1.4,
      "1-1/4": 2.0,
      "1-1/2": 2.9,
      2: 3.2,
      "2-1/2": 4.5,
      3: 5.9,
      "3-1/2": 7.7,
      4: 10.6,
      5: 13.0,
      6: 17.6,
      8: 26.1,
      10: 36.5,
      12: 51.8,
      14: 74.3,
      16: 94.5,
      18: 113.9,
      20: 141.8,
      22: 166.5,
      24: 220.5,
    },
    Blind: {
      "1/2": 0.9,
      "3/4": 1.4,
      1: 1.8,
      "1-1/4": 2.7,
      "1-1/2": 3.2,
      2: 3.6,
      "2-1/2": 5.4,
      3: 7.2,
      "3-1/2": 9.5,
      4: 12.6,
      5: 16.7,
      6: 22.5,
      8: 36.5,
      10: 55.8,
      12: 83.3,
      14: 112.5,
      16: 141.8,
      18: 186.3,
      20: 231.8,
      22: 288.0,
      24: 360.0,
    },
    "Weld Neck": {
      "1/2": 0.9,
      "3/4": 1.4,
      1: 1.8,
      "1-1/4": 2.3,
      "1-1/2": 3.2,
      2: 4.1,
      "2-1/2": 5.4,
      3: 8.1,
      "3-1/2": 9.0,
      4: 11.9,
      5: 16.2,
      6: 20.3,
      8: 31.1,
      10: 45.0,
      12: 63.9,
      14: 92.7,
      16: 112.5,
      18: 144.0,
      20: 180.0,
      22: 209.3,
      24: 261.0,
    },
  },
  600: {
    "Slip-On": {
      "1/2": 0.9,
      "3/4": 1.4,
      1: 1.8,
      "1-1/4": 2.3,
      "1-1/2": 3.2,
      2: 4.1,
      "2-1/2": 5.9,
      3: 7.2,
      "3-1/2": 9.5,
      4: 16.7,
      5: 28.4,
      6: 36.0,
      8: 51.8,
      10: 79.7,
      12: 96.8,
      14: 116.6,
      16: 164.7,
      18: 214.2,
      20: 275.4,
      22: 265.5,
      24: 394.2,
    },
    Blind: {
      "1/2": 1.4,
      "3/4": 1.8,
      1: 1.8,
      "1-1/4": 2.7,
      "1-1/2": 3.6,
      2: 4.5,
      "2-1/2": 6.8,
      3: 9.0,
      "3-1/2": 13.0,
      4: 18.5,
      5: 30.6,
      6: 38.7,
      8: 63.0,
      10: 103.0,
      12: 132.8,
      14: 170.1,
      16: 237.2,
      18: 299.3,
      20: 384.8,
      22: 450.0,
      24: 562.5,
    },
    "Weld Neck": {
      "1/2": 1.4,
      "3/4": 1.8,
      1: 1.8,
      "1-1/4": 2.7,
      "1-1/2": 3.6,
      2: 5.4,
      "2-1/2": 8.1,
      3: 10.4,
      "3-1/2": 11.7,
      4: 18.9,
      5: 30.6,
      6: 36.5,
      8: 54.0,
      10: 85.5,
      12: 101.7,
      14: 156.2,
      16: 216.5,
      18: 249.8,
      20: 310.5,
      22: 324.0,
      24: 439.7,
    },
  },
  900: {
    "Slip-On": {
      "1/2": 2.7,
      "3/4": 2.7,
      1: 3.4,
      "1-1/4": 4.5,
      "1-1/2": 6.3,
      2: 9.9,
      "2-1/2": 13.9,
      3: 16.2,
      4: 23.9,
      5: 37.4,
      6: 49.5,
      8: 77.4,
      10: 110.3,
      12: 146.7,
      14: 180.0,
      16: 206.6,
      18: 291.2,
      20: 356.4,
      24: 666.0,
    },
    Blind: {
      "1/2": 1.8,
      "3/4": 2.7,
      1: 4.1,
      "1-1/4": 4.5,
      "1-1/2": 6.3,
      2: 11.3,
      "2-1/2": 14.4,
      3: 15.8,
      4: 24.3,
      5: 39.2,
      6: 51.8,
      8: 90.0,
      10: 130.5,
      12: 186.8,
      14: 234.0,
      16: 278.6,
      18: 396.0,
      20: 498.2,
      24: 944.6,
    },
    "Weld Neck": {
      "1/2": 3.2,
      "3/4": 3.2,
      1: 3.8,
      "1-1/4": 4.5,
      "1-1/2": 6.3,
      2: 10.8,
      "2-1/2": 13.9,
      3: 16.2,
      4: 23.9,
      5: 38.7,
      6: 49.5,
      8: 84.2,
      10: 120.6,
      12: 167.4,
      14: 252.9,
      16: 308.3,
      18: 415.8,
      20: 523.8,
      24: 948.2,
    },
  },
  1500: {
    "Slip-On": {
      "1/2": 2.7,
      "3/4": 2.7,
      1: 3.6,
      "1-1/4": 4.5,
      "1-1/2": 6.3,
      2: 11.3,
      "2-1/2": 16.2,
      3: 21.6,
      4: 32.9,
      5: 59.4,
      6: 74.3,
      8: 117.0,
      10: 196.2,
      12: 300.2,
      14: 423.0,
      16: 562.5,
      18: 731.3,
      20: 922.5,
      24: 1271.0,
    },
    Blind: {
      "1/2": 1.8,
      "3/4": 2.7,
      1: 4.1,
      "1-1/4": 4.5,
      "1-1/2": 6.3,
      2: 11.3,
      "2-1/2": 15.8,
      3: 21.6,
      4: 32.9,
      5: 63.0,
      6: 72.0,
      8: 135.9,
      10: 229.5,
      12: 348.8,
      14: 438.8,
      16: 585.0,
      18: 787.5,
      20: 1001.0,
      24: 1631.0,
    },
    "Weld Neck": {
      "1/2": 3.2,
      "3/4": 3.2,
      1: 4.1,
      "1-1/4": 4.5,
      "1-1/2": 6.3,
      2: 11.3,
      "2-1/2": 16.2,
      3: 21.6,
      4: 32.9,
      5: 59.4,
      6: 74.3,
      8: 123.8,
      10: 204.8,
      12: 310.5,
      14: 423.0,
      16: 562.5,
      18: 731.3,
      20: 922.5,
      24: 1496.0,
    },
  },
  2500: {
    // Slip-On not published on Wermac/Texas for Class 2500
    "Slip-On": {},
    Blind: {
      "1/2": 3.2,
      "3/4": 4.5,
      1: 5.4,
      "1-1/4": 8.1,
      "1-1/2": 11.3,
      2: 17.6,
      "2-1/2": 25.2,
      3: 38.7,
      4: 59.9,
      5: 100.4,
      6: 155.3,
      8: 239.8,
      10: 461.3,
      12: 658.8,
    },
    "Weld Neck": {
      "1/2": 3.6,
      "3/4": 4.1,
      1: 5.9,
      "1-1/4": 9.0,
      "1-1/2": 12.6,
      2: 18.9,
      "2-1/2": 23.4,
      3: 42.3,
      4: 65.7,
      5: 109.8,
      6: 170.1,
      8: 259.2,
      10: 480.6,
      12: 723.6,
    },
  },
};

/** Texas Flange Class 150 WN spot-check (lb → kg) for multi-source notes */
const TEXAS_LB_CL150_WN = {
  "1/2": 2,
  "3/4": 2,
  1: 3,
  "1-1/4": 3,
  "1-1/2": 4,
  2: 6,
  "2-1/2": 10,
  3: 11.5,
  "3-1/2": 12,
  4: 16.5,
  5: 21,
  6: 26,
  8: 42,
  10: 54,
  12: 88,
  14: 114,
  16: 140,
  18: 165,
  20: 197,
  22: 225,
  24: 268,
};

function loadCatalogFlanges() {
  const src = fs.readFileSync(path.join(ROOT, "data", "piping_catalog.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox);
  return sandbox.window.PIPING_CATALOG.flanges;
}

function relDiff(a, b) {
  if (!(a > 0)) return Infinity;
  return Math.abs(b - a) / a;
}

function pct(a, b) {
  if (!(a > 0)) return "n/a";
  return ((Math.abs(b - a) / a) * 100).toFixed(1) + "%";
}

/** Sch 40S wall equals STD/Sch 40 for NPS ≤ 10″ (B36.10/19 practice used in S-04). */
function sch40sAliasOk(nps) {
  const r = npsRank(nps);
  return r >= 0 && r <= NPS_ORDER.indexOf("10");
}

/** Sch 40 wall equals STD for NPS ≤ 10″; NPS ≥ 12 STD ≠ Sch 40 — chart is STD bore. */
function sch40AliasOk(nps) {
  return sch40sAliasOk(nps);
}

function classifyCell(currentWt, chartWt) {
  if (chartWt == null || !(chartWt > 0)) return null;
  if (currentWt == null) {
    return { bucket: "auto", reason: "new cell (no prior catalog row)" };
  }
  if (relDiff(currentWt, chartWt) > 0.05) {
    return {
      bucket: "conflict",
      reason: `catalog vs S1 >5% (Δ ${pct(currentWt, chartWt)})`,
    };
  }
  return { bucket: "auto", reason: "within 5% of catalog" };
}

function mdEscape(s) {
  return String(s).replace(/\|/g, "\\|");
}

function rowLine(cells) {
  return "| " + cells.map(mdEscape).join(" | ") + " |";
}

function main() {
  const flanges = loadCatalogFlanges();
  const coreTypes = ["Weld Neck", "Slip-On", "Blind"];
  const deferred = ["Socket Weld", "Threaded", "Lap Joint"];

  const auto = [];
  const conflict = [];
  const skipped = [];

  // Spot-check Texas lb vs Wermac kg for Class 150 WN (multi-source rule)
  let texasDisagree = 0;
  for (const [nps, lb] of Object.entries(TEXAS_LB_CL150_WN)) {
    const kg = +(lb * 0.45359237).toFixed(2);
    const w = WERMAC[150]["Weld Neck"][nps];
    if (w != null && relDiff(w, kg) > 0.05) texasDisagree++;
  }

  for (const type of coreTypes) {
    const byClass = flanges[type] || {};
    for (const classId of Object.keys(byClass).sort((a, b) => Number(a) - Number(b))) {
      const rows = byClass[classId];
      if (!Array.isArray(rows)) continue;
      const chartClass = WERMAC[classId];
      const chartType = chartClass && chartClass[type];

      for (const row of rows) {
        const nps = row.nps;
        const currentWt = row.wt;
        const chartWt = chartType ? chartType[nps] : undefined;

        if (chartWt == null) {
          skipped.push({
            type,
            class: classId,
            schedule: type === "Weld Neck" ? "—" : "—",
            nps,
            current_wt: currentWt,
            chart_wt: "—",
            reason:
              type === "Slip-On" && classId === "2500"
                ? "S1 does not publish Slip-On Class 2500"
                : "S1 chart cell missing for current matrix NPS",
          });
          continue;
        }

        if (type === "Weld Neck") {
          // Primary schedule: STD (chart bore assumption = STD / 40S wall)
          const primary = classifyCell(currentWt, chartWt);
          const base = {
            type,
            class: classId,
            nps,
            current_wt: currentWt,
            chart_wt: chartWt,
            source: "S1 Wermac/Texas RF CS",
          };
          const stdRow = {
            ...base,
            schedule: "STD",
            reason: primary.reason,
          };
          (primary.bucket === "conflict" ? conflict : auto).push(stdRow);

          // Aliases — new schedule×NPS cells (no prior catalog schedule); same chart wt
          const aliases = [];
          if (sch40AliasOk(nps)) aliases.push("Sch 40");
          if (sch40sAliasOk(nps)) aliases.push("Sch 40S");
          for (const sch of aliases) {
            auto.push({
              ...base,
              schedule: sch,
              current_wt: "—",
              reason: `alias of STD chart bore (new nest cell); same wt as STD`,
            });
          }

          // Note skipped non-STD schedules for this matrix cell
          for (const sch of PIPE_KEYS) {
            if (sch === "STD" || sch === "Sch 40" || sch === "Sch 40S") continue;
            // only record once per type×class in a summary later — per-cell would explode
          }
        } else {
          const c = classifyCell(currentWt, chartWt);
          const entry = {
            type,
            class: classId,
            schedule: "—",
            nps,
            current_wt: currentWt,
            chart_wt: chartWt,
            source: "S1 Wermac/Texas RF CS",
            reason: c.reason,
          };
          (c.bucket === "conflict" ? conflict : auto).push(entry);
        }
      }

      // Chart cells outside current matrix → Skipped (no coverage expansion)
      if (chartType) {
        const have = new Set(rows.map((r) => r.nps));
        for (const nps of Object.keys(chartType)) {
          if (!have.has(nps)) {
            skipped.push({
              type,
              class: classId,
              schedule: type === "Weld Neck" ? "STD" : "—",
              nps,
              current_wt: "—",
              chart_wt: chartType[nps],
              reason: "out-of-scope coverage expansion (not in current catalog matrix)",
            });
          }
        }
      }
    }
  }

  // Deferred types — leave unchanged
  for (const type of deferred) {
    const byClass = flanges[type] || {};
    let count = 0;
    for (const classId of Object.keys(byClass)) {
      count += (byClass[classId] || []).length;
    }
    skipped.push({
      type,
      class: "all",
      schedule: "—",
      nps: `(${count} rows)`,
      current_wt: "unchanged",
      chart_wt: "—",
      reason: "deferred this slice — leave catalog rows byte-stable",
    });
  }

  // Schedule keys with no chart WN weights
  const scheduleSkipped = PIPE_KEYS.filter(
    (k) => k !== "STD" && k !== "Sch 40" && k !== "Sch 40S",
  );

  const sortRows = (a, b) => {
    const t = a.type.localeCompare(b.type);
    if (t) return t;
    const c = Number(a.class) - Number(b.class);
    if (c) return c;
    const s = String(a.schedule).localeCompare(String(b.schedule));
    if (s) return s;
    return npsRank(a.nps) - npsRank(b.nps);
  };
  auto.sort(sortRows);
  conflict.sort(sortRows);

  const lines = [];
  lines.push("# Flange weight candidates");
  lines.push("");
  lines.push(
    "Approval artifact for `b16-5-flange-catalog` Phase 1. **Do not edit** `data/piping_catalog.js`, `app.js`, or `index.html` until this file’s `## Sign-off` (or equivalent chat confirmation) resolves Conflicts — Auto-apply rows may proceed after Sign-off records “no conflicts” or accepts/rejects Conflicts.",
  );
  lines.push("");
  lines.push(
    "Product family: ASME B16.5 forged flanges. **Masses are not from the B16.5 PDF** (dimensions/tolerances/markings/facing only). Proposed `wt` values are approximate manufacturer/industry chart kg/pc for **raised-face carbon steel (A105)** flanges.",
  );
  lines.push("");
  lines.push("## Sources");
  lines.push("");
  lines.push("| # | Source | What it provides | Units / material | URL or path |");
  lines.push("| - | ------ | ---------------- | ---------------- | ----------- |");
  lines.push(
    "| S1 | Wermac.org ASME B16.5 forged flange weight chart (compiled from **Texas Flange** manufacturer data) | Slip-On, Blind, Weld Neck (also Thd/SW/LJ tabulated — deferred) for Class 150–2500 | kg/pc (approx.), carbon steel RF | https://www.wermac.org/flanges/weightchart_asme_b16-5.html |",
  );
  lines.push(
    "| S2 | Texas Flange ANSI B16.5 weight tables | Same data family as S1 (lb); Class 150 WN spot-check converted to kg | lb → kg, carbon steel RF | https://www.texasflange.com/wp-content/uploads/2019/05/ANSI-B16.5-Weight-1.pdf |",
  );
  lines.push(
    "| S3 | Tesco Steel — Flange weight chart | Independent SO/WN/Blind kg tables Class 150–2500 — Sign-off spot-check only (often differs from S1) | kg/pc approx., A105 | https://www.tescoflanges.com/flange-weight-chart |",
  );
  lines.push(
    "| S4 | ASME B16.5 PDF (repo) | **Type inventory / dimensions only** — zero mass tables | n/a | `data/ASME B16.5.pdf` |",
  );
  lines.push("");
  lines.push("Notes:");
  lines.push("");
  lines.push(
    "- Chart publishers state weights are approximate; manufacturer-to-manufacturer variation is expected.",
  );
  lines.push(
    "- Primary proposed numbers use **S1 (Wermac / Texas Flange)**. S2 confirms the lb→kg lineage; S3 is corroboration for Sign-off spot-checks only (not used to auto-trigger multi-source Conflicts).",
  );
  lines.push(
    `- S2 Class 150 WN lb→kg vs S1: ${texasDisagree === 0 ? "all spot-check cells within 5% (S1 is Texas-derived)" : texasDisagree + " cell(s) >5% — review before Sign-off"}.`,
  );
  lines.push(
    "- Material / facing assumption: **carbon steel A105, raised face (RF)**. RTJ / FF splits are not proposed (would be Conflict type (c) if forced).",
  );
  lines.push(
    "- Weld Neck charts publish **one mass per class×NPS** assuming **STD / 40S bore**. Separate Sch 80 / XS / XXS flange masses are **not** published — those schedules are Skipped (no invent).",
  );
  lines.push("");
  lines.push("## Type inventory");
  lines.push("");
  lines.push("| Catalog type key | In/out | Notes |");
  lines.push("| ---------------- | ------ | ----- |");
  lines.push("| `Weld Neck` | **in (rewrite)** | Nest under schedule; chart STD bore + Sch 40 / Sch 40S aliases |");
  lines.push("| `Slip-On` | **in (rewrite)** | Keep `class → [{ nps, wt }]`; Class 2500 chart-missing → Skipped |");
  lines.push("| `Blind` | **in (rewrite)** | Keep `class → [{ nps, wt }]` |");
  lines.push("| `Socket Weld` | **deferred** | Leave unchanged this slice |");
  lines.push("| `Threaded` | **deferred** | Leave unchanged this slice |");
  lines.push("| `Lap Joint` | **deferred** | Leave unchanged this slice |");
  lines.push("");
  lines.push("## Schedule keys");
  lines.push("");
  lines.push(
    "Pipe catalog vocabulary (18 keys) — Weld Neck proposed schedules must use these strings only:",
  );
  lines.push("");
  lines.push("| Catalog key | Chart alias / proposal rule |");
  lines.push("| ----------- | --------------------------- |");
  for (const k of PIPE_KEYS) {
    let rule;
    if (k === "STD") rule = "Chart default WN bore (S1 / Texas notes: STD / 40S wall)";
    else if (k === "Sch 40")
      rule = "Alias of STD chart wt for NPS ≤ 10″ (B36 wall equality); NPS ≥ 12 → Skipped (STD ≠ Sch 40)";
    else if (k === "Sch 40S")
      rule = "Alias of STD chart wt for NPS ≤ 10″; larger NPS → Skipped";
    else rule = "No published WN schedule-specific mass → **Skipped**";
    lines.push(`| \`${k}\` | ${rule} |`);
  }
  lines.push("");
  lines.push(
    "Do **not** invent Sch 80 / XS weights from bore metal deltas. Alias notes stay in this artifact; runtime keys are only the proposed subset.",
  );
  lines.push("");
  lines.push("## Proposed rows");
  lines.push("");
  lines.push(
    "Proposed shapes after Phase 2: `flanges[\"Weld Neck\"][class][schedule] = [{ nps, wt }]`; `flanges[\"Slip-On\"|\"Blind\"][class] = [{ nps, wt }]`.",
  );
  lines.push("");
  lines.push("### Coverage summary");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("| ------ | ----- |");
  lines.push(`| Auto-apply | ${auto.length} |`);
  lines.push(`| Conflict | ${conflict.length} |`);
  lines.push(`| Skipped (listed) | ${skipped.length} |`);
  lines.push(
    `| WN schedules with proposed rows | STD, Sch 40 (≤10″), Sch 40S (≤10″) |`,
  );
  lines.push(
    `| WN schedules skipped (no chart) | ${scheduleSkipped.map((s) => "`" + s + "`").join(", ")} |`,
  );
  lines.push("");
  lines.push("### Auto-apply");
  lines.push("");
  lines.push(
    "Cells with a single clear S1 chart value and either no prior catalog row, or catalog `wt` within **5%** of chart. Includes new WN schedule nest aliases.",
  );
  lines.push("");
  lines.push(
    "| type | class | schedule | nps | current_wt | chart_wt | source note |",
  );
  lines.push(
    "| ---- | ----- | -------- | --- | ---------- | -------- | ----------- |",
  );
  for (const r of auto) {
    lines.push(
      rowLine([
        r.type,
        r.class,
        r.schedule,
        r.nps,
        r.current_wt,
        r.chart_wt,
        r.reason + "; " + r.source,
      ]),
    );
  }
  lines.push("");
  lines.push("### Conflict");
  lines.push("");
  lines.push(
    "Cells where existing catalog `wt` and S1 `chart_wt` differ by more than **5%** relative (`|chart − catalog| / catalog > 0.05`). Phase 2 must not write these until Sign-off accepts / rejects / edits them.",
  );
  lines.push("");
  lines.push(
    "| type | class | schedule | nps | current_wt | chart_wt | conflict reason |",
  );
  lines.push(
    "| ---- | ----- | -------- | --- | ---------- | -------- | --------------- |",
  );
  if (conflict.length === 0) {
    lines.push("| — | — | — | — | — | — | (empty) |");
  } else {
    for (const r of conflict) {
      lines.push(
        rowLine([
          r.type,
          r.class,
          r.schedule,
          r.nps,
          r.current_wt,
          r.chart_wt,
          r.reason,
        ]),
      );
    }
  }
  lines.push("");
  lines.push("## Skipped");
  lines.push("");
  lines.push("### Chart-missing / deferred / out-of-scope");
  lines.push("");
  lines.push(
    "| type | class | schedule | nps | current_wt | chart_wt | reason |",
  );
  lines.push(
    "| ---- | ----- | -------- | --- | ---------- | -------- | ------ |",
  );
  for (const r of skipped.sort(sortRows)) {
    lines.push(
      rowLine([
        r.type,
        r.class,
        r.schedule,
        r.nps,
        r.current_wt,
        r.chart_wt,
        r.reason,
      ]),
    );
  }
  lines.push("");
  lines.push("### WN non-STD schedules (all classes / NPS in current matrix)");
  lines.push("");
  lines.push(
    "Industry charts (S1/S2) do not publish separate Weld Neck kg/pc by bore schedule beyond the STD/40S assumption. The following pipe keys are **Skipped for all WN class×NPS** (no invent):",
  );
  lines.push("");
  for (const sch of scheduleSkipped) {
    lines.push(`- \`${sch}\``);
  }
  lines.push("");
  lines.push(
    "Planner UX after Phase 3: Schedule dropdown lists only keys present under the selected class (STD + aliases where proposed).",
  );
  lines.push("");
  lines.push("## Conflict policy");
  lines.push("");
  lines.push(
    "A proposed cell is a **Conflict** when any of: (a) existing catalog `wt` and chart `wt` differ by more than **5%** relative (`|chart − catalog| / catalog > 0.05`, catalog `wt > 0`); (b) two cited chart sources disagree by more than 5% on the same cell; (c) chart splits facing/material (e.g. RF vs RTJ) and the proposal must pick one without an existing catalog convention.",
  );
  lines.push("");
  lines.push(
    "All other proposed cells with a single clear chart value are **Auto-apply** (including new WN schedule×NPS cells with no prior catalog row).",
  );
  lines.push("");
  lines.push(
    "This artifact uses **S1 as the sole cited chart for numeric proposals**, so rule (b) is not auto-applied against S3. Facing is fixed to **RF CS** (rule (c) avoided). Phase 2 must not write Conflict rows until human Sign-off below — or the Conflict section is empty and Notes say so.",
  );
  lines.push("");
  lines.push("## Sign-off");
  lines.push("");
  lines.push(
    "_Pending human decision before Phase 2 applies Conflict rows._",
  );
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("| ----- | ----- |");
  lines.push(`| Conflict count | ${conflict.length} |`);
  lines.push("| Decision | _accept all / accept subset / reject / edit — fill in_ |");
  lines.push("| Accepted Conflict rows | _list or “all” / “none”_ |");
  lines.push("| Rejected Conflict rows | _list or “none”_ |");
  lines.push("| Edits (type/class/schedule/nps → wt) | _none_ |");
  lines.push(
    "| Notes | If Conflict is empty: record “no conflicts — Auto-apply proceeds”. Auto-apply rows do not require per-cell Sign-off. |",
  );
  lines.push("| Reviewer | |");
  lines.push("| Date | |");
  lines.push("");

  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log("Wrote", OUT);
  console.log("Auto-apply:", auto.length);
  console.log("Conflict:", conflict.length);
  console.log("Skipped listed:", skipped.length);
}

main();
