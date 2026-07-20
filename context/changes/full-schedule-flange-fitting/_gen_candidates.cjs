/**
 * Phase 1 generator: schedule-weight-candidates.md for full-schedule-flange-fitting.
 * Run: node context/changes/full-schedule-flange-fitting/_gen_candidates.cjs
 * Does not modify live catalogs.
 *
 * Fittings: chart-only proposals (omit when no cell).
 * Weld Neck: keep chart STD / Sch 40 / Sch 40S; calculate missing schedules via
 *   ΔV = (π/4)·L·(ID_STD² − ID_sch²), L = wn thk (mm), ρ = 7850 kg/m³,
 *   base = catalog STD mass.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "../../..");
const OUT = path.join(__dirname, "schedule-weight-candidates.md");
const SRC_CATALOG = path.join(ROOT, "src/lib/data/piping-catalog.js");
const FLANGES_DIR = path.join(ROOT, "flanges");

const RHO = 7850; // kg/m³
const WT_FLOOR = 0.01;
const WN_CLASSES = ["150", "300", "600", "900", "1500", "2500"];

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

const THIN_SKIP = [
  "Sch 5S",
  "Sch 5",
  "Sch 10S",
  "Sch 10",
  "Sch 20",
  "Sch 30",
  "Sch 60",
  "Sch 100",
  "Sch 120",
  "Sch 140",
];

/** Wermac pair label → catalog `large×small` */
function pairNps(s) {
  let t = String(s).replace(/(\d)\.(\d)\/(\d)/g, "$1-$2/$3");
  const m = t.match(/^(.+)-(.+)$/);
  if (!m) return t;
  return `${m[1]}x${m[2]}`;
}

function npsNum(nps) {
  const head = String(nps).includes("x")
    ? String(nps).split("x")[0]
    : String(nps);
  if (head.includes("-")) {
    const [a, b] = head.split("-");
    const [n, d] = b.split("/").map(Number);
    return Number(a) + n / d;
  }
  if (head.includes("/")) {
    const [n, d] = head.split("/").map(Number);
    return n / d;
  }
  return Number(head);
}

function npsOrderKey(nps) {
  if (String(nps).includes("x")) {
    const [L, S] = String(nps).split("x");
    return npsNum(L) * 1000 + npsNum(S);
  }
  return npsNum(nps);
}

function loadCatalog() {
  const src = fs.readFileSync(SRC_CATALOG, "utf8");
  const start = src.indexOf("export const PIPING_CATALOG =");
  const objStart = src.indexOf("{", start);
  const end = src.lastIndexOf("};");
  return vm.runInNewContext("(" + src.slice(objStart, end + 1) + ")");
}

/** CSV nb like `0+1/2` / `1+1/4` → catalog NPS `1/2` / `1-1/4` */
function csvNbToNps(nb) {
  const s = String(nb).trim();
  if (s.startsWith("0+")) return s.slice(2);
  return s.replace(/\+/g, "-");
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

/** Load wn thk (mm) by catalog NPS from flanges/FLG{class}.csv */
function loadWnThkByNps(cls) {
  const file = path.join(FLANGES_DIR, `FLG${cls}.csv`);
  if (!fs.existsSync(file)) return new Map();
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 3) return new Map();
  const header = parseCsvLine(lines[1]);
  const thkIdx = header.indexOf("wn thk");
  const nbIdx = header.indexOf("nb");
  if (thkIdx < 0 || nbIdx < 0) {
    throw new Error(`FLG${cls}.csv: missing wn thk or nb column`);
  }
  const map = new Map();
  for (let i = 2; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const nps = csvNbToNps(cols[nbIdx]);
    const raw = cols[thkIdx];
    if (raw == null || raw === "" || raw === "N/A") continue;
    const thk = Number(raw);
    if (!Number.isFinite(thk) || thk <= 0) continue;
    map.set(nps, thk);
  }
  return map;
}

function pipeRow(catalog, schedule, nps) {
  const rows = catalog.pipes[schedule];
  if (!rows) return null;
  return rows.find((r) => r.nps === nps) || null;
}

function hasNumericOdT(row) {
  if (!row) return false;
  const od = Number(row.od);
  const t = Number(row.t);
  return Number.isFinite(od) && od > 0 && Number.isFinite(t) && t > 0;
}

/**
 * WN Δm model (lengths in mm → metres for volume).
 * ID = OD − 2t; ΔV = (π/4)·L·(ID_STD² − ID_sch²); Δm = ρ·ΔV
 */
function calcWnWt(wtStd, odMm, tStdMm, tSchMm, lMm) {
  const idStdM = (odMm - 2 * tStdMm) / 1000;
  const idSchM = (odMm - 2 * tSchMm) / 1000;
  const lM = lMm / 1000;
  const dV = (Math.PI / 4) * lM * (idStdM * idStdM - idSchM * idSchM);
  const dM = RHO * dV;
  const wt = Math.max(wtStd + dM, WT_FLOOR);
  return Math.round(wt * 10) / 10;
}

/**
 * Wermac Sch 160 / XXS reducer kg (Con & Ecc same).
 * Source: https://www.wermac.org/fittings/weights_bw_reducers_160.html
 *         https://www.wermac.org/fittings/weights_bw_reducers_xxs.html
 */
const REDUCER_160_RAW = [
  ["3/4-1/2", 0.13],
  ["3/4-3/8", 0.11],
  ["1-3/4", 0.23],
  ["1-1/2", 0.23],
  ["1.1/4-1", 0.29],
  ["1.1/4-3/4", 0.29],
  ["1.1/4-1/2", 0.27],
  ["1.1/2-1.1/4", 0.43],
  ["1.1/2-1", 0.36],
  ["1.1/2-3/4", 0.34],
  ["1.1/2-1/2", 0.33],
  ["2-1.1/2", 0.73],
  ["2-1.1/4", 0.68],
  ["2-1", 0.68],
  ["2-3/4", 0.66],
  ["2.1/2-2", 1.13],
  ["2.1/2-1.1/2", 1.02],
  ["2.1/2-1.1/4", 1.02],
  ["2.1/2-1", 1],
  ["3-2.1/2", 1.68],
  ["3-2", 1.54],
  ["3-1.1/2", 1.45],
  ["3-1.1/4", 1.41],
  ["4-3", 2.9],
  ["4-2.1/2", 2.49],
  ["4-2", 2.45],
  ["4-1.1/2", 2.38],
  ["5-4", 5.67],
  ["5-3", 4.99],
  ["5-2.1/2", 4.76],
  ["5-2", 4.54],
  ["6-5", 8.5],
  ["6-4", 7.48],
  ["6-3", 7.03],
  ["6-2.1/2", 6.8],
  ["8-6", 14.06],
  ["8-5", 12.34],
  ["8-4", 10.66],
  ["10-8", 26.08],
  ["10-6", 24.49],
  ["10-5", 23.59],
  ["10-4", 22.68],
  ["12-10", 43.54],
  ["12-8", 39.46],
  ["12-6", 37.65],
  ["12-5", 36.29],
];

const REDUCER_XXS_RAW = [
  ["1-3/4", 0.36],
  ["1-1/2", 0.34],
  ["1.1/4-1", 0.45],
  ["1.1/4-3/4", 0.45],
  ["1.1/4-1/2", 0.45],
  ["1.1/2-1.1/4", 0.68],
  ["1.1/2-1", 0.68],
  ["1.1/2-3/4", 0.63],
  ["1.1/2-1/2", 0.57],
  ["2-1.1/2", 1.08],
  ["2-1.1/4", 1.02],
  ["2-1", 0.98],
  ["2-3/4", 0.91],
  ["2.1/2-2", 1.81],
  ["2.1/2-1.1/2", 1.77],
  ["2.1/2-1.1/4", 1.63],
  ["2.1/2-1", 1.59],
  ["3-2.1/2", 2.72],
  ["3-2", 2.27],
  ["3-1.1/2", 2.22],
  ["3-1.1/4", 2.15],
  ["3.1/2-3", 3.63],
  ["3.1/2-2.1/2", 3.63],
  ["3.1/2-2", 3.18],
  ["3.1/2-1.1/2", 3.18],
  ["3.1/2-1.1/4", 3.18],
  ["4-3.1/2", 4.08],
  ["4-3", 4.08],
  ["4-2.1/2", 3.86],
  ["4-2", 3.74],
  ["4-1.1/2", 3.63],
  ["5-4", 7.26],
  ["5-3.1/2", 6.8],
  ["5-3", 6.58],
  ["5-2.1/2", 6.24],
  ["5-2", 6.35],
  ["6-5", 10.43],
  ["6-4", 9.98],
  ["6-3.1/2", 9.53],
  ["6-3", 9.07],
  ["6-2.1/2", 8.62],
  ["8-6", 16.33],
  ["8-5", 15.88],
  ["8-4", 14.97],
  ["8-3.1/2", 14.51],
];

function loadCatalogScheduleRows(catalog, type, schedule) {
  const block = catalog.fittings[type];
  if (!block || !block[schedule]) return [];
  return block[schedule];
}

function catalogPairSet(catalog, type) {
  const set = new Set();
  for (const sch of ["Sch 40", "STD", "Sch 80", "XS"]) {
    for (const row of loadCatalogScheduleRows(catalog, type, sch)) {
      set.add(row.nps);
    }
  }
  return set;
}

function sortRows(a, b) {
  return (
    a.kind.localeCompare(b.kind) ||
    String(a.type || a.class).localeCompare(String(b.type || b.class)) ||
    PIPE_KEYS.indexOf(a.schedule) - PIPE_KEYS.indexOf(b.schedule) ||
    npsOrderKey(a.nps) - npsOrderKey(b.nps)
  );
}

function mdTable(headers, rows) {
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ];
  return lines.join("\n");
}

const catalog = loadCatalog();
const proposedA = [];
const proposedB = [];
const proposedWn = [];
const skipped = [];
const chartOnlySkipped = [];
const wnSkipCells = [];

// ── Gap inventory ──────────────────────────────────────────────────────────
const fitGap = [];
for (const type of Object.keys(catalog.fittings)) {
  const present = Object.keys(catalog.fittings[type]);
  const missing = PIPE_KEYS.filter((k) => !present.includes(k));
  const counts = Object.fromEntries(
    present.map((s) => [s, catalog.fittings[type][s].length]),
  );
  fitGap.push({ type, present, missing, counts });
}

const wnGap = [];
for (const cls of Object.keys(catalog.flanges["Weld Neck"])) {
  const node = catalog.flanges["Weld Neck"][cls];
  const present = Object.keys(node);
  const missing = PIPE_KEYS.filter((k) => !present.includes(k));
  const counts = Object.fromEntries(
    present.map((s) => [s, Array.isArray(node[s]) ? node[s].length : 0]),
  );
  wnGap.push({ class: cls, present, missing, counts });
}

// ── Proposed: reducer Sch 160 / XXS (chart cells ∩ catalog NPS pairs) ─────
for (const type of ["Concentric Reducer", "Eccentric Reducer"]) {
  const allowed = catalogPairSet(catalog, type);
  for (const [raw, wt] of REDUCER_160_RAW) {
    const nps = pairNps(raw);
    if (!allowed.has(nps)) {
      chartOnlySkipped.push({
        kind: "fitting",
        type,
        schedule: "Sch 160",
        nps,
        reason:
          "chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion)",
      });
      continue;
    }
    proposedA.push({
      kind: "fitting",
      type,
      schedule: "Sch 160",
      nps,
      wt,
      note: "chart Wermac/Hackney Ladish Sch 160 (con=ecc)",
    });
  }
  for (const [raw, wt] of REDUCER_XXS_RAW) {
    const nps = pairNps(raw);
    if (!allowed.has(nps)) {
      chartOnlySkipped.push({
        kind: "fitting",
        type,
        schedule: "XXS",
        nps,
        reason:
          "chart cell present but NPS pair not in current catalog matrix — omit (no Class/NPS expansion)",
      });
      continue;
    }
    proposedA.push({
      kind: "fitting",
      type,
      schedule: "XXS",
      nps,
      wt,
      note: "chart Wermac/Hackney Ladish XXS (con=ecc)",
    });
  }
}

// ── Proposed: Sch 40S / Sch 80S aliases for types that already have Sch 40/80 ─
const ALIAS_TYPES = [
  "180° LR Return",
  "180° SR Return",
  "90° 3D Elbow",
  "45° 3D Elbow",
  "Lap Joint Stub End (Long)",
];

for (const type of ALIAS_TYPES) {
  const sch40 = loadCatalogScheduleRows(catalog, type, "Sch 40");
  const sch80 = loadCatalogScheduleRows(catalog, type, "Sch 80");
  const has40S = !!catalog.fittings[type]["Sch 40S"];
  const has80S = !!catalog.fittings[type]["Sch 80S"];

  if (!has40S) {
    for (const row of sch40) {
      if (npsNum(row.nps) > 10) continue;
      proposedB.push({
        kind: "fitting",
        type,
        schedule: "Sch 40S",
        nps: row.nps,
        wt: row.wt,
        note: "chart alias of catalog Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″); carry-forward S-04 alias policy",
      });
    }
  }
  if (!has80S) {
    for (const row of sch80) {
      if (npsNum(row.nps) > 8) continue;
      proposedB.push({
        kind: "fitting",
        type,
        schedule: "Sch 80S",
        nps: row.nps,
        wt: row.wt,
        note: "chart alias of catalog Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″); carry-forward S-04 alias policy",
      });
    }
  }
}

// ── Skipped: thin/mid schedules for all in-catalog fittings (reconfirm S1) ──
for (const { type, missing } of fitGap) {
  for (const sch of missing) {
    if (THIN_SKIP.includes(sch)) {
      skipped.push({
        kind: "fitting",
        type,
        schedule: sch,
        reason:
          "chart-missing: S1 Wermac/Hackney Ladish still publishes only STD / XS / Sch 160 / XXS (type-dependent) — no cells for this schedule; Skip (no invent / no B36)",
      });
    }
  }
}

const HEAVY_NO_CHART = {
  "90° SR Elbow": ["Sch 160", "XXS"],
  "45° LR Elbow": ["Sch 160", "XXS"],
  "180° LR Return": ["Sch 160", "XXS"],
  "180° SR Return": ["Sch 160", "XXS"],
  "90° 3D Elbow": ["Sch 160", "XXS"],
  "45° 3D Elbow": ["Sch 160", "XXS"],
  "Lap Joint Stub End (Long)": ["Sch 160", "XXS"],
};

for (const [type, schs] of Object.entries(HEAVY_NO_CHART)) {
  const present = new Set(Object.keys(catalog.fittings[type] || {}));
  for (const sch of schs) {
    if (present.has(sch)) continue;
    skipped.push({
      kind: "fitting",
      type,
      schedule: sch,
      reason: `chart-missing: S1 has no ${sch} weight table for this type (only STD/XS published) — Skip`,
    });
  }
}

// ── Out of scope: Class 400 ────────────────────────────────────────────────
skipped.push({
  kind: "wn",
  class: "400",
  schedule: "(all)",
  reason:
    "out-of-scope: Class 400 not in current catalog classes (FLG400.csv exists but not applied this change)",
});

// ── WN calculated proposals ────────────────────────────────────────────────
const wnThkByClass = Object.fromEntries(
  WN_CLASSES.map((cls) => [cls, loadWnThkByNps(cls)]),
);

for (const cls of WN_CLASSES) {
  const node = catalog.flanges["Weld Neck"][cls];
  if (!node) {
    skipped.push({
      kind: "wn",
      class: cls,
      schedule: "(all)",
      reason: "no STD baseline: class missing from catalog Weld Neck nest",
    });
    continue;
  }
  const stdRows = Array.isArray(node.STD) ? node.STD : [];
  if (!stdRows.length) {
    skipped.push({
      kind: "wn",
      class: cls,
      schedule: "(all)",
      reason: "no STD baseline: class has no catalog STD rows",
    });
    continue;
  }

  const presentSchedules = new Set(Object.keys(node));
  const missingSchedules = PIPE_KEYS.filter((k) => !presentSchedules.has(k));
  const thkMap = wnThkByClass[cls];

  for (const sch of missingSchedules) {
    let proposedForSch = 0;
    for (const base of stdRows) {
      const { nps, wt: wtStd } = base;
      if (!Number.isFinite(Number(wtStd))) {
        wnSkipCells.push({
          kind: "wn",
          class: cls,
          schedule: sch,
          nps,
          reason: "no STD baseline: catalog STD wt not numeric",
        });
        continue;
      }

      const stdPipe = pipeRow(catalog, "STD", nps);
      if (!hasNumericOdT(stdPipe)) {
        wnSkipCells.push({
          kind: "wn",
          class: cls,
          schedule: sch,
          nps,
          reason: "missing pipe t/od for STD at this NPS",
        });
        continue;
      }

      const schPipe = pipeRow(catalog, sch, nps);
      if (!hasNumericOdT(schPipe)) {
        wnSkipCells.push({
          kind: "wn",
          class: cls,
          schedule: sch,
          nps,
          reason: `missing pipe t/od for ${sch} at this NPS`,
        });
        continue;
      }

      // OD must match (same NPS); prefer STD od, require agreement within 0.05 mm
      const odStd = Number(stdPipe.od);
      const odSch = Number(schPipe.od);
      if (Math.abs(odStd - odSch) > 0.05) {
        wnSkipCells.push({
          kind: "wn",
          class: cls,
          schedule: sch,
          nps,
          reason: `pipe OD mismatch STD (${odStd}) vs ${sch} (${odSch})`,
        });
        continue;
      }

      const lMm = thkMap.get(nps);
      if (lMm == null) {
        wnSkipCells.push({
          kind: "wn",
          class: cls,
          schedule: sch,
          nps,
          reason: `missing wn thk in flanges/FLG${cls}.csv for this NPS`,
        });
        continue;
      }

      const wt = calcWnWt(
        Number(wtStd),
        odStd,
        Number(stdPipe.t),
        Number(schPipe.t),
        lMm,
      );

      proposedWn.push({
        kind: "wn",
        class: cls,
        schedule: sch,
        nps,
        wt,
        note: "calculated (ρ=7850, L=wn thk)",
      });
      proposedForSch++;
    }

    if (proposedForSch === 0) {
      skipped.push({
        kind: "wn",
        class: cls,
        schedule: sch,
        reason:
          "no calculable NPS for this schedule (missing pipe t/od, wn thk, or STD baseline) — see per-NPS Skip cells",
      });
    }
  }
}

proposedA.sort(sortRows);
proposedB.sort(sortRows);
proposedWn.sort(sortRows);

const skipKey = (r) =>
  [r.kind, r.type || "", r.class || "", r.schedule].join("|");
const skipMap = new Map();
for (const r of skipped) skipMap.set(skipKey(r), r);
const skippedDedup = [...skipMap.values()].sort(
  (a, b) =>
    a.kind.localeCompare(b.kind) ||
    String(a.type || a.class).localeCompare(String(b.type || b.class)) ||
    PIPE_KEYS.indexOf(a.schedule) - PIPE_KEYS.indexOf(b.schedule),
);

const allProposed = [...proposedA, ...proposedB, ...proposedWn];
for (const row of allProposed) {
  if (!PIPE_KEYS.includes(row.schedule)) {
    throw new Error(`Illegal schedule key: ${row.schedule}`);
  }
}

const lines = [];
lines.push("# Schedule weight candidates");
lines.push("");
lines.push(
  "Approval artifact for `full-schedule-flange-fitting` Phase 1. **Do not edit** `src/lib/data/piping-catalog.js` or `legacy/data/piping_catalog.js` until this file’s `## Sign-off` (or equivalent chat confirmation) accepts a set of rows.",
);
lines.push("");
lines.push(
  "Goal (roadmap S-07): expand Weld Neck flanges and in-catalog BW fittings toward the **18 pipe schedule keys**. **Fittings** stay manufacturer-chart only (omit when no cell). **Weld Neck** keeps chart masses for `STD` / `Sch 40` / `Sch 40S` and **calculates** missing schedule×NPS masses via the bore-metal Δm model below. Success is **max coverage under this dual policy + honest Skip list**, not a hard every-type×18 gate.",
);
lines.push("");
lines.push("## Sources");
lines.push("");
lines.push(
  mdTable(
    ["#", "Source", "What it provides", "Units / material", "URL or path"],
    [
      [
        "S1",
        "Wermac.org BW fitting weight tables (**Hackney Ladish, Inc.**)",
        "Elbows / returns / 3D / tees / caps / reducers — STD / XS / Sch 160 / XXS where published (chart)",
        "kg/pc (approx.), carbon steel BW",
        "https://www.wermac.org/fittings/weights_bw_elbows.html ; …/weights_bw_elbows_180.html ; …/weights_bw_elbows_3d.html ; …/weights_bw_tees.html ; …/dim_caps.html ; …/weights_bw_reducers.html ; …/weights_bw_reducers_xs.html ; …/weights_bw_reducers_160.html ; …/weights_bw_reducers_xxs.html",
      ],
      [
        "S2",
        "Catalog WN `STD` (from S-05 / Wermac–Texas chart)",
        "Weld Neck baseline mass per class×NPS — **not overwritten**; Δm baseline for calculated schedules",
        "kg/pc (approx.), RF carbon steel A105",
        "`src/lib/data/piping-catalog.js` → `flanges[\"Weld Neck\"][class].STD` ; original chart https://www.wermac.org/flanges/weightchart_asme_b16-5.html",
      ],
      [
        "S3",
        "`flanges/FLG{150,300,600,900,1500,2500}.csv`",
        "Per-NPS `wn thk` (mm) used as cylinder length L for WN Δm; CSV `wn kg` is **not** the mass baseline",
        "mm (geometry)",
        "`flanges/FLG150.csv` … `FLG2500.csv`",
      ],
      [
        "S4",
        "Catalog pipe `od` / `t`",
        "OD and wall for STD and target schedule at each NPS (ID = OD − 2t)",
        "mm",
        "`src/lib/data/piping-catalog.js` → `pipes[schedule]`",
      ],
      [
        "S5",
        "Archived S-04 / S-05 candidates + Sign-off",
        "Prior Accept of STD/XS/Sch40/80 aliases + Sch160/XXS for core types; WN Sch40/40S/STD nest (chart)",
        "n/a",
        "`context/archive/2026-07-18-b16-9-fitting-catalog-schedule/fitting-weight-candidates.md` ; `context/archive/2026-07-18-b16-5-flange-catalog/flange-weight-candidates.md`",
      ],
    ],
  ),
);
lines.push("");
lines.push("Notes:");
lines.push("");
lines.push(
  "- Fitting proposed numbers use **S1 (chart)**. WN baseline uses **S2 (catalog STD)**; WN non-baseline proposals use **calculated** masses from S2 + S3 + S4.",
);
lines.push(
  "- Material assumption: **carbon steel** BW fittings / **A105 RF** flanges — same as S-04/S-05.",
);
lines.push(
  "- Calculated WN kg/pc are a cylindrical bore-metal approximation — **not** claimed as ASME B16.5 manufacturer schedule-specific masses.",
);
lines.push(
  "- ASME B16.9 / B16.5 PDFs are **not** mass sources (dimensions/tolerances only).",
);
lines.push("");
lines.push("## Schedule keys");
lines.push("");
lines.push(
  "Pipe catalog vocabulary (18 keys) — proposed fitting/WN schedules must use these strings only:",
);
lines.push("");
lines.push(
  mdTable(
    ["Catalog key", "This change — proposal rule"],
    [
      [
        "`Sch 5S` … `Sch 30`, `Sch 60`, `Sch 100`–`Sch 140`",
        "Fittings: no S1 cells → **Skipped**. WN: **calculate** when pipe `od`/`t` + `wn thk` + STD baseline exist; else Skip",
      ],
      [
        "`Sch 40S`",
        "Fittings: propose alias copies for returns / 3D / long stub (≤10″) from catalog Sch 40. WN: already chart-present — keep",
      ],
      [
        "`Sch 40`",
        "Already in catalog (fitting + WN chart) — no rewrite",
      ],
      [
        "`Sch 80S`",
        "Fittings: propose alias copies for returns / 3D / long stub (≤8″) from catalog Sch 80. WN: **calculate** (missing from chart nest)",
      ],
      [
        "`Sch 80` / `XS` / `Sch 160` / `XXS`",
        "Fittings: chart where published (reducers Sch 160/XXS proposed). WN: **calculate** missing schedules",
      ],
      ["`STD`", "Already in catalog — WN Δm baseline; no rewrite"],
    ],
  ),
);
lines.push("");
lines.push(
  "Do **not** invent `Sch 20S`. Do not invent fitting masses. Do not invent pipe `t` or `wn thk`.",
);
lines.push("");
lines.push("## WN calc contract");
lines.push("");
lines.push(
  "Locked model for **Weld Neck** schedules that do **not** already have chart rows (`STD` / `Sch 40` / `Sch 40S` kept as-is):",
);
lines.push("");
lines.push("1. **Scope:** each catalog WN class × each NPS that has a catalog `STD` mass × each missing schedule among the 18 keys.");
lines.push(
  "2. **Inputs required:** pipe row with numeric `od` and `t` for both `STD` and target `sch` at that NPS; numeric `wn thk` (mm) from `flanges/FLG{class}.csv` for that NPS; numeric catalog `STD` `wt`.",
);
lines.push("3. **Geometry:** `ID = OD − 2t` (mm). Convert lengths to metres for volume.");
lines.push(
  "4. **Volume delta:** `ΔV = (π/4) · L · (ID_STD² − ID_sch²)` with `L = wn thk` (same OD for STD and sch).",
);
lines.push("5. **Mass delta:** `Δm = ρ · ΔV` with `ρ = 7850 kg/m³`.");
lines.push(
  "6. **Result:** `wt = max(wt_STD + Δm, 0.01)` then round to **1 decimal** kg (catalog presentation).",
);
lines.push(
  "7. **Source note:** `calculated (ρ=7850, L=wn thk)`.",
);
lines.push(
  "8. **Skip when:** missing pipe `t`/`od`, missing `wn thk`, no STD baseline, OD mismatch, or Class 400 (out of scope).",
);
lines.push(
  "9. **Do not** overwrite existing chart `STD` / `Sch 40` / `Sch 40S` rows. CSV `wn kg` is geometry context only — not the Δm base.",
);
lines.push("");
lines.push("## Gap inventory");
lines.push("");
lines.push("Snapshot from `src/lib/data/piping-catalog.js` (2026-07-19).");
lines.push("");
lines.push("### Fittings — present vs missing of 18");
lines.push("");
const fitRows = fitGap.map((g) => [
  g.type,
  g.present.join(", ") || "—",
  g.missing.join(", ") || "—",
]);
lines.push(mdTable(["type", "present schedules", "missing of 18"], fitRows));
lines.push("");
lines.push("### Weld Neck — present vs missing of 18 (per class)");
lines.push("");
const wnRows = wnGap.map((g) => [
  g.class,
  g.present.join(", ") || "—",
  g.missing.join(", ") || "—",
]);
lines.push(mdTable(["class", "present schedules", "missing of 18"], wnRows));
lines.push("");
lines.push("### Out of schedule-nest scope (unchanged)");
lines.push("");
lines.push(
  "- Slip-On / Blind remain class-only (no schedule nest) — deferred from this change by design.",
);
lines.push(
  "- Socket Weld / Threaded / Lap Joint flanges remain hidden / deferred (S-05).",
);
lines.push("- Class 400: out of scope (not in current catalog classes).");
lines.push("");
lines.push("## Proposed rows");
lines.push("");
lines.push(
  "Only **new** rows not already present as schedule keys in the live catalog. Nested shape after apply: `fittings[type][schedule] = [{ nps, wt }]`; `flanges[\"Weld Neck\"][class][schedule] = [{ nps, wt }]`.",
);
lines.push("");
lines.push("### Coverage summary");
lines.push("");
lines.push(
  mdTable(
    ["Metric", "Count"],
    [
      ["A. recommended (new fitting chart cells)", String(proposedA.length)],
      ["B. needs review (fitting alias extensions)", String(proposedB.length)],
      ["C. WN calculated (missing schedules)", String(proposedWn.length)],
      ["Skipped schedule×type/class combos (listed)", String(skippedDedup.length)],
      [
        "Chart cells omitted (NPS pair outside current matrix)",
        String(chartOnlySkipped.length),
      ],
      ["WN per-NPS Skip cells (input gaps)", String(wnSkipCells.length)],
      [
        "Schedules with new proposed rows",
        [...new Set(allProposed.map((r) => r.schedule))].join(", ") || "—",
      ],
    ],
  ),
);
lines.push("");
lines.push("### A. Recommended (fittings — chart)");
lines.push("");
lines.push(
  "Concentric + Eccentric reducer **Sch 160** and **XXS** from S1 (same wt for con/ecc). Intersected with NPS pairs already present under Sch 40/STD/Sch 80/XS so this change does not expand the reducer matrix.",
);
lines.push("");
if (proposedA.length) {
  lines.push(
    mdTable(
      ["kind", "type", "schedule", "nps", "wt", "source note"],
      proposedA.map((r) => [
        r.kind,
        r.type,
        r.schedule,
        r.nps,
        String(r.wt),
        r.note,
      ]),
    ),
  );
} else {
  lines.push("_None._");
}
lines.push("");
lines.push("### B. Needs review (fittings — alias)");
lines.push("");
lines.push(
  "Sch 40S / Sch 80S **alias** extensions for Bucket-B types that already have Sch 40/80 in catalog but never received the S-suffix aliases in S-04. Same B36.19 wall-equality limits as S-04 (≤10″ / ≤8″). Weights copied from existing catalog Sch 40 / Sch 80 rows (already signed).",
);
lines.push("");
if (proposedB.length) {
  lines.push(
    mdTable(
      ["kind", "type", "schedule", "nps", "wt", "source note"],
      proposedB.map((r) => [
        r.kind,
        r.type,
        r.schedule,
        r.nps,
        String(r.wt),
        r.note,
      ]),
    ),
  );
} else {
  lines.push("_None._");
}
lines.push("");
lines.push("### C. Weld Neck — calculated");
lines.push("");
lines.push(
  "Missing schedules per class×NPS where inputs exist. Chart `STD` / `Sch 40` / `Sch 40S` are **not** listed (kept as-is). Source note is always `calculated (ρ=7850, L=wn thk)`.",
);
lines.push("");
if (proposedWn.length) {
  lines.push(
    mdTable(
      ["kind", "class", "schedule", "nps", "wt", "source note"],
      proposedWn.map((r) => [
        r.kind,
        r.class,
        r.schedule,
        r.nps,
        String(r.wt),
        r.note,
      ]),
    ),
  );
} else {
  lines.push("_None._");
}
lines.push("");
lines.push("## Skipped");
lines.push("");
lines.push(
  "Schedule×type (fitting) or schedule×class (WN) combinations with **no** proposed numeric rows, plus WN per-NPS input gaps. Prefer an honest hole over inventing mass or geometry.",
);
lines.push("");
lines.push("### Fitting / WN schedule skips");
lines.push("");
lines.push(
  mdTable(
    ["kind", "type / class", "schedule", "reason"],
    skippedDedup.map((r) => [
      r.kind,
      r.type || `WN class ${r.class}`,
      r.schedule,
      r.reason,
    ]),
  ),
);
lines.push("");
lines.push("### WN per-NPS Skip cells (missing inputs)");
lines.push("");
lines.push(
  "Individual class×schedule×NPS cells that could not be calculated. Schedules with zero calculable NPS also appear in the summary table above.",
);
lines.push("");
if (wnSkipCells.length) {
  // Cap display if huge — still list all (Sign-off needs honesty); table may be long
  lines.push(
    mdTable(
      ["kind", "class", "schedule", "nps", "reason"],
      wnSkipCells
        .sort(
          (a, b) =>
            String(a.class).localeCompare(String(b.class)) ||
            PIPE_KEYS.indexOf(a.schedule) - PIPE_KEYS.indexOf(b.schedule) ||
            npsOrderKey(a.nps) - npsOrderKey(b.nps),
        )
        .map((r) => [r.kind, r.class, r.schedule, r.nps, r.reason]),
    ),
  );
} else {
  lines.push("_None._");
}
lines.push("");
lines.push("### Chart cells outside current NPS matrix (not proposed)");
lines.push("");
lines.push(
  "These S1 reducer cells exist on Wermac but the `large×small` pair is not in the current catalog — omitted under “no Class/NPS matrix growth”.",
);
lines.push("");
if (chartOnlySkipped.length) {
  lines.push(
    mdTable(
      ["kind", "type", "schedule", "nps", "reason"],
      chartOnlySkipped.map((r) => [
        r.kind,
        r.type,
        r.schedule,
        r.nps,
        r.reason,
      ]),
    ),
  );
} else {
  lines.push("_None._");
}
lines.push("");
lines.push("## Alias notes");
lines.push("");
lines.push(
  "Carry-forward from S-04 / S-05 — **no new invent** for fittings beyond the documented wall-equality aliases:",
);
lines.push("");
lines.push(
  "- Fitting chart **STD** ↔ catalog `STD` + `Sch 40` (same wt); chart **XS** ↔ `XS` + `Sch 80`.",
);
lines.push(
  "- Fitting `Sch 40S` = Sch 40 / STD wt for NPS ≤ 10″; `Sch 80S` = Sch 80 / XS wt for NPS ≤ 8″ (B36.19 wall equality). This change proposes those aliases for returns / 3D / long stub only.",
);
lines.push(
  "- WN chart STD bore ↔ catalog `STD`; `Sch 40` / `Sch 40S` aliases already Accepted in S-05 (typically NPS ≤ 10″). **No** new chart invent for WN Sch 80 / XS / XXS — those use the calc contract instead.",
);
lines.push(
  "- Concentric and eccentric reducers share one S1 weight table — propose identical `wt`.",
);
lines.push("");
lines.push("## Conflict / mass policy");
lines.push("");
lines.push(
  "1. **Fittings:** omit when the chart has no cell — do not invent `wt`, do not restore B36 wall-ratio multipliers.",
);
lines.push(
  "2. **WN:** keep chart `STD` / `Sch 40` / `Sch 40S`; **calculate** other missing schedules when inputs exist; Skip when `t`, `wn thk`, or STD baseline is missing.",
);
lines.push(
  "3. Do not rewrite existing Sch 40/80/STD chart rows unless Sign-off explicitly requests a re-sync (out of scope by default).",
);
lines.push(
  "4. Chart cells for NPS pairs outside the current reducer matrix are omitted (no matrix growth).",
);
lines.push(
  "5. Slip-On / Blind stay class-only; deferred flange types stay deferred; Class 400 stays out of scope.",
);
lines.push(
  "6. UI shows plain kg — no “calculated” badge; calc provenance lives in this artifact + catalog header (Phase 3).",
);
lines.push("");
lines.push("## Sign-off");
lines.push("");
lines.push("Record decision before Phase 3 edits either catalog file:");
lines.push("");
lines.push("- [ ] **Accept all** — load A + B + C as proposed");
lines.push(
  "- [ ] **Accept subset** — describe below (e.g. “A + B only”, “C for Class 150–600 only”, “drop XXS reducers”)",
);
lines.push("- [ ] **Reject** — leave catalog schedule coverage as-is");
lines.push("");
lines.push("**Decision:** _(empty — Phase 2)_");
lines.push("");
lines.push("**Accepted set:** _(empty — Phase 2)_");
lines.push("");
lines.push("**Notes / alternate sources:** _(empty — Phase 2)_");
lines.push("");
lines.push("**Signer / date:** _(empty — Phase 2)_");
lines.push("");

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log("Wrote", OUT);
console.log({
  proposedA: proposedA.length,
  proposedB: proposedB.length,
  proposedWn: proposedWn.length,
  skipped: skippedDedup.length,
  chartOnlySkipped: chartOnlySkipped.length,
  wnSkipCells: wnSkipCells.length,
});

// Spot sample for manual hand-check (Class 150, NPS 2, Sch 80)
const sample = proposedWn.find(
  (r) => r.class === "150" && r.nps === "2" && r.schedule === "Sch 80",
);
if (sample) {
  const stdPipe = pipeRow(catalog, "STD", "2");
  const schPipe = pipeRow(catalog, "Sch 80", "2");
  const l = wnThkByClass["150"].get("2");
  const stdWt = catalog.flanges["Weld Neck"]["150"].STD.find(
    (r) => r.nps === "2",
  ).wt;
  console.log("Hand-check sample Class 150 / NPS 2 / Sch 80:", {
    wtStd: stdWt,
    od: stdPipe.od,
    tStd: stdPipe.t,
    tSch: schPipe.t,
    wnThk: l,
    wtProposed: sample.wt,
  });
}
