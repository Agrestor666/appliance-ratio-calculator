/**
 * Phase 2: apply signed-off A+B rows from fitting-weight-candidates.md
 * into data/piping_catalog.js as nested fittings[type][schedule] = [{nps,wt}].
 *
 * Run: node context/changes/b16-9-fitting-catalog-schedule/_apply_p2.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const CANDIDATES = path.join(__dirname, "fitting-weight-candidates.md");
const CATALOG = path.join(ROOT, "data/piping_catalog.js");

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

const TYPE_ORDER = [
  "90° LR Elbow",
  "90° SR Elbow",
  "45° LR Elbow",
  "180° LR Return",
  "180° SR Return",
  "90° 3D Elbow",
  "45° 3D Elbow",
  "Equal Tee",
  "Cap",
  "Concentric Reducer",
  "Eccentric Reducer",
  "Lap Joint Stub End (Long)",
];

function npsOrderKey(nps) {
  const frac = (p) => {
    if (p.includes("-")) {
      const [a, b] = p.split("-");
      const [n, d] = b.split("/").map(Number);
      return Number(a) + n / d;
    }
    if (p.includes("/")) {
      const [n, d] = p.split("/").map(Number);
      return n / d;
    }
    return Number(p);
  };
  if (nps.includes("x")) {
    const [L, S] = nps.split("x");
    return frac(L) * 1000 + frac(S);
  }
  return frac(nps);
}

function sectionBlock(md, heading, endMarkers) {
  const start = md.indexOf(heading);
  if (start < 0) throw new Error(`Missing section ${heading}`);
  let end = md.length;
  for (const marker of endMarkers) {
    const i = md.indexOf(marker, start + heading.length);
    if (i >= 0 && i < end) end = i;
  }
  return md.slice(start, end);
}

function parseTableRows(block) {
  const rows = [];
  for (const line of block.split("\n")) {
    if (!line.startsWith("| ")) continue;
    if (line.includes("| type |") || line.includes("| ----")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 4) continue;
    const [type, schedule, nps, wtStr] = cells;
    const wt = Number(wtStr);
    if (!type || !schedule || !nps || !(wt > 0)) {
      throw new Error(`Bad row: ${line}`);
    }
    if (!PIPE_KEYS.includes(schedule)) {
      throw new Error(`Non-pipe schedule key: ${schedule}`);
    }
    rows.push({ type, schedule, nps, wt });
  }
  return rows;
}

function parseRows(md) {
  const a = sectionBlock(md, "### A. Recommended", ["### B. Needs review", "## Skipped"]);
  const b = sectionBlock(md, "### B. Needs review", ["## Skipped", "## Conflict policy"]);
  return [...parseTableRows(a), ...parseTableRows(b)];
}

function nest(rows) {
  /** @type {Record<string, Record<string, {nps:string,wt:number}[]>>} */
  const out = {};
  for (const r of rows) {
    out[r.type] ??= {};
    out[r.type][r.schedule] ??= [];
    out[r.type][r.schedule].push({ nps: r.nps, wt: r.wt });
  }
  // Deduplicate identical nps within a schedule (keep first)
  for (const type of Object.keys(out)) {
    for (const sch of Object.keys(out[type])) {
      const seen = new Set();
      out[type][sch] = out[type][sch]
        .filter((item) => {
          if (seen.has(item.nps)) return false;
          seen.add(item.nps);
          return true;
        })
        .sort((a, b) => npsOrderKey(a.nps) - npsOrderKey(b.nps));
    }
  }
  return out;
}

function formatItems(items) {
  const parts = items.map((i) => `{nps:"${i.nps}",wt:${i.wt}}`);
  const lines = [];
  for (let i = 0; i < parts.length; i += 4) {
    lines.push("  " + parts.slice(i, i + 4).join(",") + (i + 4 < parts.length ? "," : ""));
  }
  return lines.join("\n");
}

function emitFittingsBlock(nested) {
  const types = [
    ...TYPE_ORDER.filter((t) => nested[t]),
    ...Object.keys(nested)
      .filter((t) => !TYPE_ORDER.includes(t))
      .sort(),
  ];

  const chunks = [];
  chunks.push(
    `// ─── FITTINGS (ASME B16.9 BW product family) ────────────────────────────────\n` +
      `// Masses: manufacturer/industry charts cited in\n` +
      `// context/changes/b16-9-fitting-catalog-schedule/fitting-weight-candidates.md\n` +
      `// (Wermac/Hackney Ladish primary). Not from B16.9 PDF (dims only).\n` +
      `// Shape: fittings[type][schedule] = [{ nps, wt (kg/pc) }] — schedule keys ⊆ pipe keys.\n` +
      `fittings: {`
  );

  for (let ti = 0; ti < types.length; ti++) {
    const type = types[ti];
    const bySch = nested[type];
    const schedules = PIPE_KEYS.filter((k) => bySch[k]);
    chunks.push(`"${type}": {`);
    for (let si = 0; si < schedules.length; si++) {
      const sch = schedules[si];
      const comma = si < schedules.length - 1 ? "," : "";
      chunks.push(`"${sch}": [\n${formatItems(bySch[sch])}\n]${comma}`);
    }
    const typeComma = ti < types.length - 1 ? "," : "";
    chunks.push(`}${typeComma}`);
  }

  chunks.push(`},`);
  return chunks.join("\n");
}

function main() {
  const md = fs.readFileSync(CANDIDATES, "utf8");
  if (!md.includes("**Accept all**") || !md.includes("Accept all A+B")) {
    console.warn("Warning: Sign-off text not clearly Accept all A+B — proceeding on parse of A+B tables.");
  }

  const rows = parseRows(md);
  console.log(`Parsed rows: ${rows.length}`);
  if (rows.length !== 1160 + 771) {
    console.warn(`Expected 1931 rows (1160+771); got ${rows.length}`);
  }

  const nested = nest(rows);
  const types = Object.keys(nested);
  console.log(`Types: ${types.length} — ${types.join(", ")}`);
  for (const t of types) {
    const schs = PIPE_KEYS.filter((k) => nested[t][k]);
    const n = schs.reduce((acc, s) => acc + nested[t][s].length, 0);
    console.log(`  ${t}: schedules=[${schs.join(", ")}] rows=${n}`);
  }

  // Spot-checks
  const lr40 = nested["90° LR Elbow"]?.["Sch 40"]?.find((x) => x.nps === "6");
  if (!lr40 || !(lr40.wt > 0)) throw new Error("Spot-check failed: 90° LR Elbow Sch 40 NPS 6");
  if (!nested["180° LR Return"]?.["Sch 40"]) {
    throw new Error("Spot-check failed: missing new type 180° LR Return");
  }
  for (const t of types) {
    if (Array.isArray(nested[t])) throw new Error(`Top-level array for ${t}`);
  }

  const fittingsBlock = emitFittingsBlock(nested);
  let catalog = fs.readFileSync(CATALOG, "utf8");

  catalog = catalog.replace(
    /\/\/ Fittings : ASME B16\.9 butt-weld \(Sch 40 equivalent\)/,
    "// Fittings : ASME B16.9 BW product family; masses from manufacturer charts\n//              (see fitting-weight-candidates.md — not from B16.9 PDF)"
  );

  const startMark = "// ─── FITTINGS (ASME B16.9 BW – Sch 40 equiv.)";
  const endMark = "// ─── FLANGES (ASME B16.5)";
  const start = catalog.indexOf(startMark);
  const end = catalog.indexOf(endMark);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Could not locate fittings block to replace");
  }
  // Preserve file's newline style
  const nl = catalog.includes("\r\n") ? "\r\n" : "\n";
  const block = fittingsBlock.split("\n").join(nl) + nl + nl;
  catalog = catalog.slice(0, start) + block + catalog.slice(end);

  fs.writeFileSync(CATALOG, catalog, "utf8");
  console.log(`Wrote ${path.relative(ROOT, CATALOG)}`);
}

main();
